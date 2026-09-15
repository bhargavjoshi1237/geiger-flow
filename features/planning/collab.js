// Data-access layer for Planning collaboration sessions.
//
// The single place that talks to the legacy `collab` table — the dialog only
// ever calls these helpers. Pure data access: validate, console.error on
// failure, return null/false/[] — never throw, never toast.

import { createClient } from "@/lib/supabase/client";

const COLLAB_TABLE = "collab";

// Sessions hosted by a user, newest first. Returns [] when none / on failure.
export async function listHostedSessions(hostId) {
  if (!hostId) {
    return [];
  }

  try {
    const { data, error } = await createClient()
      .from(COLLAB_TABLE)
      .select("*")
      .eq("host", hostId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[flow.collab] list error:", error);
      return [];
    }

    return data ?? [];
  } catch (error) {
    console.error("[flow.collab] list error:", error);
    return [];
  }
}

// Stashes a rollback snapshot on a session before a merge. Returns true on
// success, false when the write failed.
export async function saveCollabRollback(sessionId, rollbackState) {
  if (!sessionId || !rollbackState) {
    return false;
  }

  try {
    const { error } = await createClient()
      .from(COLLAB_TABLE)
      .update({ rollback: rollbackState })
      .eq("id", sessionId);

    if (error) {
      console.error("[flow.collab] rollback save error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[flow.collab] rollback save error:", error);
    return false;
  }
}

// Clears a session's rollback snapshot after a rollback. Returns true on
// success, false when the write failed.
export async function clearCollabRollback(sessionId) {
  if (!sessionId) {
    return false;
  }

  try {
    const { error } = await createClient()
      .from(COLLAB_TABLE)
      .update({ rollback: null })
      .eq("id", sessionId);

    if (error) {
      console.error("[flow.collab] rollback clear error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[flow.collab] rollback clear error:", error);
    return false;
  }
}
