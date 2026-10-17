// The session store behind the demo client.
//
// Rows are keyed "<schema>.<table>" so one lookup serves both the `flow` schema
// and the shared `public` tables (projects, profiles, roles) the app also reads.
//
// The fixtures are copied into memory on first use and every write lands on that
// copy, so a visitor's edits last for the page session and a reload starts fresh.
// Nothing is written to localStorage, cookies or the network.
//
// A table with no fixtures resolves to an empty array — that is a legitimate
// "no rows" for a screen the demo doesn't cover yet. But a *typo'd* or forgotten
// table looks identical, so each one is reported once, which turns the console
// into a to-do list for fixtures rather than a silent blank screen.

import { fixtures } from "./fixtures.js";
import { warnDemoGap } from "./demo-mode.js";

const reported = new Set();
let tables = null;

function sessionTables() {
  if (!tables) tables = new Map(Object.entries(structuredClone(fixtures)));
  return tables;
}

// Reads report an unknown table once; writes create it, since a screen saving
// into a table the fixtures don't seed is the start of real session data.
export function listRows(schema, table, { create = false } = {}) {
  const key = `${schema}.${table}`;
  const store = sessionTables();

  if (!store.has(key)) {
    if (!create) {
      if (!reported.has(key)) {
        reported.add(key);
        warnDemoGap("no fixtures for table", key);
      }
      return [];
    }
    store.set(key, []);
  }

  return store.get(key);
}

export function replaceRows(schema, table, rows) {
  sessionTables().set(`${schema}.${table}`, rows);
}

// Drops every session edit; the next query re-copies the fixtures.
export function resetDemoStore() {
  tables = null;
}

// The rpcs the playground reaches, answered against the session store the way
// their SQL bodies would. Anything else returns undefined → "not available".
export function rpcResult(schema, name, args = {}) {
  if (name === "next_issue_number") {
    const peak = listRows(schema, "issues", { create: true })
      .filter((row) => row.project_id === args.p_project_id)
      .reduce((max, row) => Math.max(max, Number(row.number) || 0), 0);
    return peak + 1;
  }

  if (name === "project_merge_settings") {
    const rows = listRows(schema, "project_settings", { create: true });
    const now = new Date().toISOString();
    let row = rows.find((item) => item.project_id === args.p_project_id);
    if (!row) {
      row = { id: crypto.randomUUID(), project_id: args.p_project_id, metadata: {}, created_at: now };
      rows.push(row);
    }
    row.metadata = { ...(row.metadata || {}), ...(args.p_patch || {}) };
    row.updated_at = now;
    return { ...row };
  }

  return undefined;
}

// The reader the demo acts as. Shapes match parseSession() in lib/supabase/user
// and the `user` object features/*/actions.js read off auth.getUser().
export const DEMO_USER = {
  id: "a9e0f1c2-0000-4000-8000-000000000101",
  email: "ada@geiger.studio",
  user_metadata: { full_name: "Ada Whitfield", avatar_url: null },
};

export const DEMO_SESSION = {
  access_token: "demo",
  token_type: "bearer",
  user: DEMO_USER,
};

export { DEMO_PROJECT, DEMO_ORGANIZATION_ID } from "./fixtures.js";
