// Data-access layer for the Planning board.
//
// Persists the react-flow planning canvas so it survives reloads. All
// reads/writes target `flow.planning_boards` via `.schema("flow")`; a partial
// unique index guarantees one live board per project, so this module reads and
// upserts that single row. RLS scopes access to project members with the
// planning.view / planning.update abilities.
//
// The DB stores snake_case columns; the UI works in camelCase, so this module
// adapts between the two (normalizePlanningBoard) and always returns a
// view-model object the screen can hydrate directly. JSONB columns parse
// straight into arrays/objects.

import { createClient } from "@/lib/supabase/client";
import { flowClient } from "@/supabase/components/flow-client";

const PLANNING_BOARDS_TABLE = "planning_boards";

// DB row (snake_case) -> UI view model (camelCase). The metadata bag's keys are
// kept under `metadata` — the screen folds them back on save.
export function normalizePlanningBoard(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    projectId: row.project_id,
    nodes: Array.isArray(row.nodes) ? row.nodes : [],
    edges: Array.isArray(row.edges) ? row.edges : [],
    viewport:
      row.viewport && typeof row.viewport === "object" ? row.viewport : null,
    metadata: row.metadata ?? {},
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Returns the project's live board, or null when none exists / the DB is
// unconfigured / the read failed. Never throws.
export async function getPlanningBoard(projectId) {
  if (!projectId) {
    return null;
  }

  try {
    const { data, error } = await flowClient()
      .from(PLANNING_BOARDS_TABLE)
      .select("*")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("[flow.planning] get error:", error);
      return null;
    }

    return normalizePlanningBoard(data);
  } catch (error) {
    console.error("[flow.planning] get error:", error);
    return null;
  }
}

// Upserts the live board for the project: updates the existing row when one is
// present, otherwise inserts it with `created_by` stamped from the signed-in
// user. Honors a caller-supplied `id` on the insert path. Accepts
// { nodes, edges, viewport, metadata, id }; keys that are absent stay
// untouched on update. Returns the normalized board, or null when the DB is
// unconfigured or the write failed. Never throws.
export async function savePlanningBoard(projectId, input = {}) {
  if (!projectId) {
    return null;
  }

  try {
    const client = flowClient();

    const payload = {};
    if (Array.isArray(input.nodes)) {
      payload.nodes = input.nodes;
    }
    if (Array.isArray(input.edges)) {
      payload.edges = input.edges;
    }
    if ("viewport" in input) {
      payload.viewport = input.viewport ?? null;
    }
    if (input.metadata && typeof input.metadata === "object") {
      payload.metadata = input.metadata;
    }

    // One live row per project (partial unique index) — find it, then branch.
    const { data: existing, error: selectError } = await client
      .from(PLANNING_BOARDS_TABLE)
      .select("id")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (selectError) {
      console.error("[flow.planning] save lookup error:", selectError);
      return null;
    }

    if (existing?.id) {
      const { data, error } = await client
        .from(PLANNING_BOARDS_TABLE)
        .update(payload)
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        console.error("[flow.planning] save error:", error);
        return null;
      }

      return normalizePlanningBoard(data);
    }

    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("[flow.planning] user lookup error:", userError);
    }

    payload.project_id = projectId;
    payload.created_by = user?.id ?? null;
    if (input.id) {
      payload.id = input.id; // honor caller-supplied UUID
    }

    const { data, error } = await client
      .from(PLANNING_BOARDS_TABLE)
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("[flow.planning] create error:", error);
      return null;
    }

    return normalizePlanningBoard(data);
  } catch (error) {
    console.error("[flow.planning] save error:", error);
    return null;
  }
}
