require("dotenv").config();
const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const STRING_URI = process.env.STRING_URI;

if (!STRING_URI) {
  console.error("ERROR: STRING_URI environment variable is not set.");
  process.exit(1);
}

const MIGRATIONS_DIR = "supabase/migrations";

// Migrations run sequentially, ordered by filename (e.g. 0001_*, 0002_*).
// Drop a new numbered .sql file into the migrations folder to add a feature.
function getMigrationFiles() {
  const dir = path.join(process.cwd(), MIGRATIONS_DIR);
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".sql"))
    .sort()
    .map((file) => `${MIGRATIONS_DIR}/${file}`);
}

const SQL_FILES = getMigrationFiles();

function extractTableName(stmt) {
  const match = stmt.match(
    /create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?(\w+)/i
  );
  return match ? match[1] : null;
}

function extractIndexName(stmt) {
  const match = stmt.match(
    /create\s+(?:unique\s+)?index\s+(?:if\s+not\s+exists\s+)?(\w+)/i
  );
  return match ? match[1] : null;
}

function addIfNotExists(stmt) {
  if (/^create\s+table\s+/i.test(stmt) && !/if\s+not\s+exists/i.test(stmt)) {
    return stmt.replace(
      /create\s+table\s+/i,
      "create table if not exists "
    );
  }
  if (
    /^create\s+(?:unique\s+)?index\s+/i.test(stmt) &&
    !/if\s+not\s+exists/i.test(stmt)
  ) {
    return stmt.replace(
      /create\s+(?:unique\s+)?index\s+/i,
      "$&if not exists "
    );
  }
  return stmt;
}

function stripLeadingComments(stmt) {
  const lines = stmt.split("\n");
  let i = 0;
  while (
    i < lines.length &&
    (lines[i].trim() === "" || lines[i].trim().startsWith("--"))
  ) {
    i++;
  }
  return lines.slice(i).join("\n").trim();
}

function splitStatements(sql) {
  const statements = [];
  let current = "";
  let inDollarQuote = false;
  let dollarTag = "";
  let i = 0;

  while (i < sql.length) {
    if (sql[i] === "$") {
      const tagMatch = sql.slice(i).match(/^\$([a-zA-Z_]*)\$/);
      if (tagMatch) {
        const tag = tagMatch[0];
        if (!inDollarQuote) {
          inDollarQuote = true;
          dollarTag = tag;
          current += tag;
          i += tag.length;
          continue;
        } else if (tag === dollarTag) {
          inDollarQuote = false;
          current += tag;
          i += tag.length;
          dollarTag = "";
          continue;
        }
      }
    }

    if (sql[i] === ";" && !inDollarQuote) {
      current += ";";
      const code = stripLeadingComments(current);
      if (code) {
        statements.push(code);
      }
      current = "";
      i++;
      continue;
    }

    if (sql[i] === "-" && sql[i + 1] === "-" && !inDollarQuote) {
      const lineEnd = sql.indexOf("\n", i);
      if (lineEnd === -1) {
        current += sql.slice(i);
        break;
      }
      current += sql.slice(i, lineEnd + 1);
      i = lineEnd + 1;
      continue;
    }

    current += sql[i];
    i++;
  }

  const code = stripLeadingComments(current);
  if (code) {
    statements.push(code);
  }

  return statements;
}

async function tableExists(client, tableName) {
  const res = await client.query(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.tables
       WHERE table_schema = 'public' AND table_name = $1
     ) AS exists`,
    [tableName]
  );
  return res.rows[0].exists;
}

async function indexExists(client, indexName) {
  const res = await client.query(
    `SELECT EXISTS (
       SELECT 1 FROM pg_indexes
       WHERE schemaname = 'public' AND indexname = $1
     ) AS exists`,
    [indexName]
  );
  return res.rows[0].exists;
}

console.log("STRING_URI =", process.env.STRING_URI);

async function run() {
  const client = new Client({
    connectionString: STRING_URI,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Connected to database.\n");

    if (process.argv.includes("--clean")) {
      console.log("Dropping all existing flow_* tables...");
      const tables = await client.query(
        `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'flow_%'`
      );
      for (const row of tables.rows) {
        await client.query(`DROP TABLE IF EXISTS public.${row.tablename} CASCADE`);
        console.log(`  Dropped: ${row.tablename}`);
      }
      const funcs = await client.query(
        `SELECT routine_name, routine_schema FROM information_schema.routines
         WHERE routine_schema IN ('public','flow_private') AND routine_name LIKE 'flow_%'`
      );
      for (const row of funcs.rows) {
        await client.query(`DROP FUNCTION IF EXISTS ${row.routine_schema}.${row.routine_name} CASCADE`);
        console.log(`  Dropped function: ${row.routine_schema}.${row.routine_name}`);
      }
      console.log("Clean complete.\n");
    }

    for (const file of SQL_FILES) {
      const filePath = path.join(process.cwd(), file);
      if (!fs.existsSync(filePath)) {
        console.log(`SKIP (not found): ${file}`);
        continue;
      }

      console.log(`\n========== ${file} ==========`);
      const sql = fs.readFileSync(filePath, "utf-8");
      const statements = splitStatements(sql);

      for (const rawStmt of statements) {
        const stmt = addIfNotExists(rawStmt);
        const tableName = extractTableName(stmt);
        const indexName = extractIndexName(stmt);

        if (
          tableName &&
          /^create\s+table\s+/i.test(stmt) &&
          (await tableExists(client, tableName))
        ) {
          console.log(`  SKIP (exists): table ${tableName}`);
          continue;
        }

        if (
          indexName &&
          /^create\s+(?:unique\s+)?index\s+/i.test(stmt) &&
          (await indexExists(client, indexName))
        ) {
          console.log(`  SKIP (exists): index ${indexName}`);
          continue;
        }

        try {
          await client.query(stmt);
          const label =
            tableName
              ? `table ${tableName}`
              : indexName
              ? `index ${indexName}`
              : stmt.slice(0, 80).replace(/\n/g, " ");
          console.log(`  OK: ${label}`);
        } catch (err) {
          console.error("Statement error:");
          console.error(err);
        }
      }
    }

    console.log("\nDone.");
  } catch (err) {
  console.error("Fatal error:");
  console.error(err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
