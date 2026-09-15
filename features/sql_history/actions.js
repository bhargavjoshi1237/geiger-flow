// Data-access layer for the SQL Explorer history.
//
// Reads/writes target flow.sql_history via the shared flowClient helper. Only
// the query summary is persisted (query text, status, row count, duration,
// column names) — never arbitrary result blobs. Query execution itself is NOT
// an RPC: there is no execute_sql function (arbitrary SQL from the anon key
// would bypass RLS), so the screens read through whitelisted
// .from(table).select() calls in SQL_EXPLORER_TABLES.

import { createClient } from "@/lib/supabase/client";
import { flowClient } from "@/supabase/components/flow-client";
import { SQL_HISTORY_LIMIT } from "./constants";

const TABLE = "sql_history";

export function normalizeHistoryEntry(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    projectId: row.project_id,
    query: row.query_text ?? "",
    timestamp: row.created_at,
    result:
      row.status === "error"
        ? { status: "error", message: row.message ?? "Query failed" }
        : {
            status: "success",
            columns: Array.isArray(row.columns) ? row.columns : [],
            rows: [],
            rowCount: Number(row.row_count) || 0,
            duration: Number(row.duration_ms) || 0,
          },
    metadata: row.metadata ?? {},
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

function toRow(input) {
  const row = {};

  if ("query" in input) {
    row.query_text = input.query;
  }
  if ("queryText" in input) {
    row.query_text = input.queryText;
  }
  if ("status" in input) {
    row.status = input.status || "success";
  }
  if ("message" in input) {
    row.message = input.message || null;
  }
  if ("rowCount" in input) {
    row.row_count = Math.max(0, Number(input.rowCount) || 0);
  }
  if ("duration" in input) {
    row.duration_ms = Math.max(0, Number(input.duration) || 0);
  }
  if ("durationMs" in input) {
    row.duration_ms = Math.max(0, Number(input.durationMs) || 0);
  }
  if ("columns" in input) {
    row.columns = Array.isArray(input.columns) ? input.columns : [];
  }

  return row;
}

export async function listSqlHistory(projectId, limit = SQL_HISTORY_LIMIT) {
  if (!projectId) {
    return [];
  }

  try {
    const { data, error } = await flowClient()
      .from(TABLE)
      .select("*")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[flow.sql_history] list error:", error);
      return [];
    }

    return (data ?? []).map(normalizeHistoryEntry);
  } catch (error) {
    console.error("[flow.sql_history] list error:", error);
    return [];
  }
}

export async function createSqlHistoryEntry(projectId, input) {
  if (!projectId || !input?.query?.trim()) {
    return null;
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const payload = {
    ...toRow(input),
    query_text: input.query.trim(),
    project_id: projectId,
    created_by: user?.id ?? null,
  };

  if (input.id) {
    payload.id = input.id;
  }

  try {
    const { data, error } = await flowClient()
      .from(TABLE)
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("[flow.sql_history] create error:", error);
      return null;
    }

    return normalizeHistoryEntry(data);
  } catch (error) {
    console.error("[flow.sql_history] create error:", error);
    return null;
  }
}

export async function clearSqlHistory(projectId) {
  if (!projectId) {
    return false;
  }

  try {
    const { error } = await flowClient()
      .from(TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .eq("project_id", projectId)
      .is("deleted_at", null);

    if (error) {
      console.error("[flow.sql_history] clear error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[flow.sql_history] clear error:", error);
    return false;
  }
}
