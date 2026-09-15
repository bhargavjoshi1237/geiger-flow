"use client";

import { flowClient } from "@/supabase/components/flow-client";

// The chat workspace behind the Grounding screen lives in the `flow` schema as
// the flow.chat_* tables, so data access goes through the shared flowClient().
// NOTE: the schema-scoped client is data-only — for Realtime (.channel) and
// Storage (.storage) use the base createClient() and pass `schema: "flow"` in
// the realtime filter.
export function chatDb() {
  return isSupabaseConfigured() ? flowClient() : null;
}

// Shared config guard for the chat data layer. Imported by every
// features/grounding/chat_*.js module so a missing env degrades to "no DB" (the
// call returns null/[]/false and the screen renders an empty state) rather than
// crashing. There is no static sample-data fallback.
export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

// Whole-minutes-ago from a timestamp — the unit the chat UI renders with
// (fromNow / clockTime). Clamped at 0.
export function minsAgo(ts) {
  if (!ts) return 0;
  const ms = Date.now() - new Date(ts).getTime();
  return Math.max(0, Math.round(ms / 60000));
}
