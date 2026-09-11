// A PostgREST-shaped stand-in for the Supabase client, used by the landing
// playground.
//
// It implements only the slice of the query builder the app actually uses, so a
// screen can keep calling listIssues()/listGoals()/… unchanged and get fixture
// rows back. Reads resolve from the demo store; writes resolve to an error,
// because the playground is strictly read-only.
//
// Anything unimplemented calls warnDemoGap() rather than returning an empty
// list: a missing fixture should be loud, not indistinguishable from "no rows".

import { notifyDemoWrite, warnDemoGap } from "./demo-mode.js";
import { listRows, rpcResult, DEMO_USER, DEMO_SESSION } from "./demo-store.js";

const READ_ONLY_ERROR = {
  message: "This is a read-only demo.",
  code: "demo_read_only",
  details: null,
  hint: null,
};

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

  switch (type) {
    case "eq":
      return actual === value;
    case "in":
      return Array.isArray(value) && value.includes(actual);
    case "is":
      // Fixtures set soft-delete columns to an explicit null, but treat a
      // missing key as null too so a leaner fixture row still filters right.
      return value === null ? actual === null || actual === undefined : actual === value;
    default:
      warnDemoGap("filter operator", { type, column });
      return true;
  }
}

// PostgREST's `or` string: "a.eq.1,b.eq.2" — a row matches when ANY branch does.
// The grouped `and(...)` form only appears on write paths, which never run here.
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
    this.resultShape = "many";
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
    this.payload = Array.isArray(payload) ? payload[0] : payload;
    return this;
  }

  update(payload) {
    this.op = "update";
    this.payload = payload;
    return this;
  }

  upsert(payload) {
    this.op = "upsert";
    this.payload = Array.isArray(payload) ? payload[0] : payload;
    return this;
  }

  delete() {
    this.op = "delete";
    return this;
  }

  eq(column, value) {
    this.filters.push({ column, type: "eq", value });
    return this;
  }

  in(column, value) {
    this.filters.push({ column, type: "in", value });
    return this;
  }

  is(column, value) {
    this.filters.push({ column, type: "is", value });
    return this;
  }

  filter(column, operator, value) {
    this.filters.push({ column, type: operator, value });
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

  single() {
    this.resultShape = "single";
    return this;
  }

  maybeSingle() {
    this.resultShape = "maybeSingle";
    return this;
  }

  // Resolving a query is synchronous over an in-memory array, but the builder
  // has to be awaitable to stand in for the real one.
  run() {
    if (this.op !== "select") {
      notifyDemoWrite();
      return Promise.resolve({ data: null, error: READ_ONLY_ERROR });
    }

    let rows = listRows(this.schema, this.table).filter((row) =>
      this.filters.every((filter) => matchesFilter(row, filter)),
    );

    for (const branches of this.orBranches) {
      if (!branches) continue;
      rows = rows.filter((row) => branches.some((branch) => matchesFilter(row, branch)));
    }

    if (this.orders.length > 0) {
      rows = rows
        .map((row, index) => ({ row, index }))
        .sort((a, b) => {
          for (const order of this.orders) {
            const verdict = compareValues(a.row[order.column], b.row[order.column], order);
            if (verdict !== 0) return verdict;
          }
          return a.index - b.index; // keep equal rows in fixture order
        })
        .map(({ row }) => row);
    }

    if (this.maxRows !== null) {
      rows = rows.slice(0, this.maxRows);
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
      return Promise.resolve({ data: rows[0], error: null });
    }

    if (this.resultShape === "maybeSingle") {
      return Promise.resolve({ data: rows[0] ?? null, error: null });
    }

    return Promise.resolve({ data: rows, error: null });
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

const demoStorage = {
  from: (bucket) => ({
    getPublicUrl: (path) => ({
      data: { publicUrl: `/demo-assets/${bucket}/${path ?? ""}` },
    }),
    // Uploads and deletes are writes; the demo has no bucket behind them. Both
    // notify so a visitor gets the same read-only message a rejected row write
    // produces, rather than a failure they can't see.
    upload: async () => {
      notifyDemoWrite();
      return { data: null, error: READ_ONLY_ERROR };
    },
    remove: async () => {
      notifyDemoWrite();
      return { data: null, error: READ_ONLY_ERROR };
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

  rpc(name) {
    // The only rpc in the app (next_issue_number) is part of a write path, so
    // it is read-only like the rest. rpcResult() stays for the day that changes.
    notifyDemoWrite();
    return Promise.resolve({ data: rpcResult(name), error: READ_ONLY_ERROR });
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
