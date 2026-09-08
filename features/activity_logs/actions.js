// Data-access layer for the Activity Logs feature.
//
// Reads/writes target flow.activity_logs via the shared flowClient helper. RLS
// scopes every row to members of the log's project (activity.view / .create /
// .delete). Logs are append-only from the app's perspective — deleteLog is a
// hard delete. The DB stores snake_case columns; the UI works in camelCase.
//
// logActivity is the best-effort instrumentation entry point used by the other
// feature modules: it never throws and never blocks a mutation on failure.

import { createClient } from "@/lib/supabase/client";
import { flowClient } from "@/supabase/components/flow-client";
import { DEFAULT_ACTIVITY_LEVEL } from "./constants";

const ACTIVITY_LOGS_TABLE = "activity_logs";

// DB row (snake_case) -> UI view model (camelCase).
export function normalizeActivityLog(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    projectId: row.project_id,
    level: row.level ?? DEFAULT_ACTIVITY_LEVEL,
    source: row.source ?? "app",
    actor: row.actor ?? null,
    message: row.message ?? "",
    detail: row.detail ?? null,
    occurredAt: row.occurred_at,
    metadata: row.metadata ?? {},
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// UI input (camelCase) -> DB columns (snake_case). Only keys present in `input`
// are emitted, so the same helper serves full creates and bare audit writes.
function toRow(input) {
  const row = {};

  if ("level" in input) {
    row.level = input.level || DEFAULT_ACTIVITY_LEVEL;
  }
  if ("source" in input) {
    row.source = input.source || "app";
  }
  if ("message" in input) {
    row.message = input.message;
  }
  if ("detail" in input) {
    row.detail = input.detail ?? null;
  }

  return row;
}

// Newest first; filtering (level / free text) happens client-side.
export async function listActivityLogs(projectId) {
  if (!projectId) {
    return [];
  }

  try {
    const { data, error } = await flowClient()
      .from(ACTIVITY_LOGS_TABLE)
      .select("*")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .order("occurred_at", { ascending: false });

    if (error) {
      console.error("[flow.activity_logs] list error:", error);
      return [];
    }

    return (data ?? []).map(normalizeActivityLog);
  } catch (error) {
    console.error("[flow.activity_logs] list error:", error);
    return [];
  }
}

// Honors a caller-supplied `id` so an optimistic entry and the stored row share
// a UUID.
export async function createActivityLog(projectId, input) {
  if (!projectId || !input?.message?.trim()) {
    return null;
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const payload = {
    ...toRow(input),
    project_id: projectId,
    created_by: user?.id ?? null,
  };

  try {
    const { data, error } = await flowClient()
      .from(ACTIVITY_LOGS_TABLE)
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("[flow.activity_logs] create error:", error);
      return null;
    }

    return normalizeActivityLog(data);
  } catch (error) {
    console.error("[flow.activity_logs] create error:", error);
    return null;
  }
}

// Hard delete — logs have no soft-delete surface in the UI.
export async function deleteLog(id) {
  if (!id) {
    return false;
  }

  try {
    const { error } = await flowClient()
      .from(ACTIVITY_LOGS_TABLE)
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[flow.activity_logs] delete error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[flow.activity_logs] delete error:", error);
    return false;
  }
}

// Best-effort audit write for feature modules. Resolves the signed-in user to
// stamp actor (user id or email) + created_by, inserts one row, and returns
// true/false. Never throws — callers fire-and-forget it after a successful
// mutation:
//
//   logActivity(projectId, { source: "tasks", message: 'Created task "x"' })
//     .catch(() => {});
export async function logActivity(projectId, input) {
  try {
    if (!projectId || !input?.message) {
      return false;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const payload = {
      ...toRow(input),
      level: input.level || DEFAULT_ACTIVITY_LEVEL,
      project_id: projectId,
      actor: input.actor || user?.id || user?.email || null,
      created_by: user?.id ?? null,
    };

    const { error } = await flowClient()
      .from(ACTIVITY_LOGS_TABLE)
      .insert([payload]);

    if (error) {
      console.error("[flow.activity_logs] insert error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[flow.activity_logs] insert error:", error);
    return false;
  }
}
