// The fixture store behind the demo client.
//
// Rows are keyed "<schema>.<table>" so one lookup serves both the `flow` schema
// and the shared `public` tables (projects, profiles, roles) the app also reads.
//
// A table with no fixtures resolves to an empty array — that is a legitimate
// "no rows" for a screen the demo doesn't cover yet. But a *typo'd* or forgotten
// table looks identical, so each one is reported once, which turns the console
// into a to-do list for fixtures rather than a silent blank screen.

import { fixtures } from "./fixtures.js";
import { warnDemoGap } from "./demo-mode.js";

const EMPTY = [];
const reported = new Set();

export function listRows(schema, table) {
  const key = `${schema}.${table}`;
  const rows = fixtures[key];

  if (!rows) {
    if (!reported.has(key)) {
      reported.add(key);
      warnDemoGap("no fixtures for table", key);
    }
    return EMPTY;
  }

  return rows;
}

// The app's only rpc is next_issue_number, which belongs to a write path the
// read-only demo never reaches. Kept so the surface stays honest if that changes.
export function rpcResult() {
  return null;
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
