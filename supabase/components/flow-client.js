// Reusable Supabase helpers for the Geiger Flow product schema.
//
// One-time, reusable functions meant to be imported directly wherever they are
// needed (e.g. `import { flowClient } from "@/supabase/components/flow-client"`).
// Keep this folder for small, shared helpers — not feature-specific data access.

import { createClient } from "@/lib/supabase/client";

// Browser Supabase client scoped to the dedicated `flow` Postgres schema.
// Use for every read/write against flow.* tables (e.g. flow.issues).
//
// Note: `.schema(...)` returns a data-only client (no `.auth`); when you also
// need the current user, create a base client via `createClient()` for auth and
// use `flowClient()` for the table operation.
export function flowClient() {
  return createClient().schema("flow");
}
