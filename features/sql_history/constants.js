// Shared labels for the SQL Explorer addon history.
// History rows live in flow.sql_history (query text + result summary only).

export const SQL_HISTORY_STATUSES = [
  { value: "success", label: "Success" },
  { value: "error", label: "Error" },
];

// Whitelisted flow.* tables the explorer may read via the query builder.
// There is deliberately no execute_sql RPC: arbitrary SQL from the anon key
// would bypass RLS. Reads go through supabase .from(table).select() so RLS
// still applies, and only these known tables are offered.
export const SQL_EXPLORER_TABLES = [
  "tasks",
  "issues",
  "goals",
  "milestones",
  "risks",
  "decisions",
  "forms",
  "form_questions",
  "credit_pools",
  "credit_allocations",
  "architecture_diagrams",
  "activity_logs",
  "assets",
  "planning_boards",
  "resource_allocations",
  "resource_requests",
  "sql_history",
];

export const SQL_HISTORY_LIMIT = 50;
