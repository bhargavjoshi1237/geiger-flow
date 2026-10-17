// A PostgREST-shaped stand-in for the Supabase client, used by the landing
// playground.
//
// It implements only the slice of the query builder the app actually uses, so a
// screen can keep calling listIssues()/createIssue()/… unchanged. Reads and
// writes both run against the in-memory session store (demo-store.js): a
// visitor's edits stick for the page session and vanish on reload.
//
// Anything unimplemented calls warnDemoGap() rather than returning an empty
// list: a missing fixture should be loud, not indistinguishable from "no rows".

import { notifyDemoWrite, warnDemoGap } from "./demo-mode.js";
import { listRows, replaceRows, rpcResult, DEMO_USER, DEMO_SESSION } from "./demo-store.js";

const UNAVAILABLE_ERROR = {
  message: "This isn't available in the playground.",
  code: "demo_unavailable",
  details: null,
  hint: null,
};

const toList = (payload) => (Array.isArray(payload) ? payload : [payload]);
const copy = (row) => (row && typeof row === "object" ? { ...row } : row);

// Postgres orders NULLs last on ASC and first on DESC unless told otherwise.
function compareValues(a, b, { ascending, nullsFirst }) {
  const aNull = a === null || a === undefined;
  const bNull = b === null || b === undefined;

  if (aNull || bNull) {
    if (aNull && bNull) return 0;
    const nulls = nullsFirst ?? !ascending;
    const ranked = aNull ? -1 : 1;
    return nulls ? ranked : -ranked;
  }

  if (a === b) return 0;
  const ranked = a > b ? 1 : -1;
  return ascending ? ranked : -ranked;
}

function matchesFilter(row, { column, type, value }) {
  const actual = row[column];
  const isNull = actual === null || actual === undefined;

  switch (type) {
    case "eq":
      return actual === value;
    case "neq":
      return actual !== value;
    case "gt":
      return !isNull && actual > value;
    case "gte":
      return !isNull && actual >= value;
    case "lt":
      return !isNull && actual < value;
    case "lte":
      return !isNull && actual <= value;
    case "in":
      return Array.isArray(value) && value.includes(actual);
    case "is":
      // Fixtures set soft-delete columns to an explicit null, but treat a
      // missing key as null too so a leaner fixture row still filters right.
      return value === null ? isNull : actual === value;
    default:
      warnDemoGap("filter operator", { type, column });
      return true;
  }
}

// PostgREST's `or` string: "a.eq.1,b.eq.2" — a row matches when ANY branch does.
function parseOrExpression(expression) {
  if (expression.includes("and(")) {
    warnDemoGap("grouped or() expression", expression);
    return null;
  }

  const branches = expression.split(",").map((branch) => {
    const [column, type, ...rest] = branch.split(".");
    const raw = rest.join(".");
    const value = raw === "null" ? null : raw;
    return { column, type, value };
  });

  return branches.length > 0 ? branches : null;
}

// Columns every row gets from its table defaults when an insert leaves them out.
function withDefaults(input, now) {
  return {
    metadata: {},
    ...input,
    id: input.id ?? crypto.randomUUID(),
    created_at: input.created_at ?? now,
    updated_at: input.updated_at ?? now,
  };
}

class DemoQuery {
  constructor(schema, table) {
    this.schema = schema;
    this.table = table;

    this.op = "select";
    this.payload = null;
    this.returning = false;
    this.filters = [];
    this.orBranches = [];
    this.orders = [];
    this.maxRows = null;
    this.offset = 0;
    this.resultShape = "many";
    this.onConflict = ["id"];
    this.ignoreDuplicates = false;
  }

  select(projection) {
    // Called first on a read (projection of columns) and last on a write
    // (request the written row back). Both are the same call to us.
    this.returning = true;
    this.projection = projection ?? "*";
    return this;
  }

  insert(payload) {
    this.op = "insert";
    this.payload = payload;
    return this;
  }

  update(payload) {
    this.op = "update";
    this.payload = payload;
    return this;
  }

  upsert(payload, options = {}) {
    this.op = "upsert";
    this.payload = payload;
    if (options.onConflict) {
      this.onConflict = options.onConflict.split(",").map((column) => column.trim());
    }
    this.ignoreDuplicates = Boolean(options.ignoreDuplicates);
    return this;
  }

  delete() {
    this.op = "delete";
    return this;
  }

  filter(column, operator, value) {
    this.filters.push({ column, type: operator, value });
    return this;
  }

  eq(column, value) {
    return this.filter(column, "eq", value);
  }

  neq(column, value) {
    return this.filter(column, "neq", value);
  }

  gt(column, value) {
    return this.filter(column, "gt", value);
  }

  gte(column, value) {
    return this.filter(column, "gte", value);
  }

  lt(column, value) {
    return this.filter(column, "lt", value);
  }

  lte(column, value) {
    return this.filter(column, "lte", value);
  }

  in(column, value) {
    return this.filter(column, "in", value);
  }

  is(column, value) {
    return this.filter(column, "is", value);
  }

  not(column, operator, value) {
    this.filters.push({ column, type: operator, value, negate: true });
    return this;
  }

  match(query) {
    for (const [column, value] of Object.entries(query)) this.eq(column, value);
    return this;
  }

  or(expression) {
    this.orBranches.push(parseOrExpression(expression));
    return this;
  }

  order(column, options = {}) {
    this.orders.push({
      column,
      ascending: options.ascending ?? true,
      nullsFirst: options.nullsFirst,
    });
    return this;
  }

  limit(count) {
    this.maxRows = count;
    return this;
  }

  range(from, to) {
    this.offset = from;
    this.maxRows = to - from + 1;
    return this;
  }

  single() {
    this.resultShape = "single";
    return this;
  }

  maybeSingle() {
    this.resultShape = "maybeSingle";
    return this;
  }

  // The rows the filters select, in store order — the target set of a write.
  matching(rows) {
    let hit = rows.filter((row) =>
      this.filters.every((filter) => matchesFilter(row, filter) !== Boolean(filter.negate)),
    );

    for (const branches of this.orBranches) {
      if (!branches) continue;
      hit = hit.filter((row) => branches.some((branch) => matchesFilter(row, branch)));
    }

    return hit;
  }

  read() {
    let rows = this.matching(listRows(this.schema, this.table));

    if (this.orders.length > 0) {
      rows = rows
        .map((row, index) => ({ row, index }))
        .sort((a, b) => {
          for (const order of this.orders) {
            const verdict = compareValues(a.row[order.column], b.row[order.column], order);
            if (verdict !== 0) return verdict;
          }
          return a.index - b.index; // keep equal rows in store order
        })
        .map(({ row }) => row);
    }

    if (this.offset || this.maxRows !== null) {
      rows = rows.slice(this.offset, this.maxRows === null ? undefined : this.offset + this.maxRows);
    }

    return rows;
  }

  write() {
    const rows = listRows(this.schema, this.table, { create: true });
    const now = new Date().toISOString();

    if (this.op === "insert") {
      const added = toList(this.payload).map((input) => withDefaults(input, now));
      rows.push(...added);
      return added;
    }

    if (this.op === "update") {
      const hit = this.matching(rows);
      for (const row of hit) Object.assign(row, this.payload, { updated_at: now });
      return hit;
    }

    if (this.op === "delete") {
      const hit = this.matching(rows);
      const gone = new Set(hit);
      replaceRows(this.schema, this.table, rows.filter((row) => !gone.has(row)));
      return hit;
    }

    // upsert: merge into the row that shares the onConflict columns, else insert.
    const written = [];
    for (const input of toList(this.payload)) {
      const existing = rows.find((row) =>
        this.onConflict.every((column) => row[column] === input[column]),
      );
      if (!existing) {
        const row = withDefaults(input, now);
        rows.push(row);
        written.push(row);
      } else if (!this.ignoreDuplicates) {
        Object.assign(existing, input, { updated_at: now });
        written.push(existing);
      }
    }
    return written;
  }

  // Resolving a query is synchronous over an in-memory array, but the builder
  // has to be awaitable to stand in for the real one. Rows are copied out so a
  // caller mutating a result can't reach into the store.
  run() {
    const isRead = this.op === "select";
    const rows = isRead ? this.read() : this.write();

    if (!isRead && !this.returning) {
      return Promise.resolve({ data: null, error: null });
    }

    if (this.resultShape === "single") {
      if (rows.length !== 1) {
        return Promise.resolve({
          data: null,
          error: {
            message: `Expected a single row from ${this.table}, got ${rows.length}`,
            code: "demo_single_mismatch",
            details: null,
            hint: null,
          },
        });
      }
      return Promise.resolve({ data: copy(rows[0]), error: null });
    }

    if (this.resultShape === "maybeSingle") {
      return Promise.resolve({ data: copy(rows[0] ?? null), error: null });
    }

    return Promise.resolve({ data: rows.map(copy), error: null });
  }

  then(resolve, reject) {
    return this.run().then(resolve, reject);
  }
}

const demoAuth = {
  getUser: async () => ({ data: { user: DEMO_USER }, error: null }),
  getSession: async () => ({ data: { session: DEMO_SESSION }, error: null }),
  signOut: async () => ({ error: null }),
  // Realtime and auth events are inert here; returning the subscription shape
  // keeps callers that unsubscribe on teardown from throwing.
  onAuthStateChange: () => ({
    data: { subscription: { unsubscribe() {}, id: "demo", callback() {} } },
  }),
};

// Realtime is never wired up in the playground, so a subscribed channel simply
// never emits. Grounding already guards its subscription, and this keeps it safe.
const demoChannel = {
  on() {
    return this;
  },
  subscribe() {
    return this;
  },
  unsubscribe: async () => "ok",
};

// Uploaded files stay in the tab as object URLs keyed "<bucket>/<path>", so an
// uploaded image previews like a real one without a byte leaving the browser.
const objects = new Map();

function revoke(key) {
  const url = objects.get(key)?.url;
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
  objects.delete(key);
}

const demoStorage = {
  from: (bucket) => ({
    getPublicUrl: (path) => ({
      data: { publicUrl: objects.get(`${bucket}/${path}`)?.url ?? `/demo-assets/${bucket}/${path ?? ""}` },
    }),
    upload: async (path, file) => {
      const key = `${bucket}/${path}`;
      revoke(key);
      const url = typeof Blob !== "undefined" && file instanceof Blob ? URL.createObjectURL(file) : `/demo-assets/${key}`;
      objects.set(key, { url, size: file?.size ?? 0, type: file?.type ?? "" });
      return { data: { id: crypto.randomUUID(), path, fullPath: key }, error: null };
    },
    remove: async (paths = []) => {
      const removed = paths.filter((path) => objects.has(`${bucket}/${path}`));
      for (const path of removed) revoke(`${bucket}/${path}`);
      return { data: removed.map((name) => ({ name })), error: null };
    },
    list: async (prefix = "") => {
      const base = prefix ? `${bucket}/${prefix.replace(/\/$/, "")}/` : `${bucket}/`;
      const data = [...objects.entries()]
        .filter(([key]) => key.startsWith(base) && !key.slice(base.length).includes("/"))
        .map(([key, item]) => ({
          id: key,
          name: key.slice(base.length),
          metadata: { size: item.size, mimetype: item.type },
        }));
      return { data, error: null };
    },
  }),
};

class DemoClient {
  constructor(schema = "public") {
    this.schemaName = schema;
  }

  schema(name) {
    return new DemoClient(name);
  }

  from(table) {
    return new DemoQuery(this.schemaName, table);
  }

  rpc(name, args) {
    const data = rpcResult(this.schemaName, name, args);
    if (data === undefined) {
      notifyDemoWrite();
      return Promise.resolve({ data: null, error: UNAVAILABLE_ERROR });
    }
    return Promise.resolve({ data, error: null });
  }

  get auth() {
    return demoAuth;
  }

  get storage() {
    return demoStorage;
  }

  channel() {
    return demoChannel;
  }

  removeChannel() {
    return Promise.resolve("ok");
  }
}

export function createDemoClient() {
  return new DemoClient("public");
}
