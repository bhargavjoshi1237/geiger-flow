// Data-access layer for the Goals feature.
//
// All reads/writes target the dedicated `flow` Postgres schema (flow.goals) via
// `.schema("flow")`. RLS scopes every row to members of the goal's project
// (open-module model). A goal is project-scoped and may optionally belong to an
// objective (objectiveId) — the Objectives kanban filters by objective, the
// Goals screen lists top-level goals (objectiveId === null).
//
// The DB stores snake_case columns; the UI works in camelCase, so this module
// adapts between the two (toRow / normalizeGoal) and always returns view-model
// objects the screen can render directly.

import { createClient } from "@/lib/supabase/client";
import { flowClient } from "@/supabase/components/flow-client";
import { DEFAULT_GOAL_STATUS } from "./constants";

const GOALS_TABLE = "goals";

// Attributes stored in the `metadata` jsonb expansion bag rather than dedicated
// columns. Surfaced as first-class fields on the view model and folded back on
// write (see MODULE_CONVENTIONS.md -> metadata column).
const METADATA_FIELDS = [
  "keyResults",
  "progressSource",
  "trackMetric",
  "target",
  "targetValue",
];

function normalizeKeyResults(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((kr) => ({
    label: kr?.label ?? "",
    progress: Number(kr?.progress) || 0,
    done: Boolean(kr?.done),
  }));
}

// DB row (snake_case) -> UI view model (camelCase). The metadata bag's keys are
// spread onto the view model so the UI treats them like first-class fields.
export function normalizeGoal(row) {
  if (!row) {
    return null;
  }

  const metadata = row.metadata ?? {};

  return {
    id: row.id,
    projectId: row.project_id,
    objectiveId: row.objective_id ?? null,
    title: row.title,
    description: row.description ?? "",
    status: row.status,
    owner: row.owner ?? "",
    progress: Number(row.progress) || 0,
    targetDate: row.target_date,
    position: Number(row.position) || 0,
    keyResults: normalizeKeyResults(metadata.keyResults),
    progressSource: metadata.progressSource ?? "tasks_lists",
    trackMetric: metadata.trackMetric ?? "tasks_count",
    target: metadata.target ?? "dynamic",
    targetValue: metadata.targetValue ?? "",
    metadata,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function buildMetadata(input) {
  return {
    keyResults: normalizeKeyResults(input.keyResults),
    progressSource: input.progressSource ?? "tasks_lists",
    trackMetric: input.trackMetric ?? "tasks_count",
    target: input.target ?? "dynamic",
    targetValue: input.targetValue ?? "",
  };
}

// Maps the camelCase UI fields to DB columns. Only keys present in `input` are
// emitted, so the same helper serves full creates and partial inline updates
// (e.g. { status } from a kanban drag, or { position }).
function toRow(input) {
  const row = {};

  if ("title" in input) {
    row.title = input.title?.trim();
  }
  if ("description" in input) {
    row.description = input.description?.trim() || null;
  }
  if ("status" in input) {
    row.status = input.status || DEFAULT_GOAL_STATUS;
  }
  if ("owner" in input) {
    row.owner = input.owner?.trim() || null;
  }
  if ("progress" in input) {
    row.progress = Math.min(100, Math.max(0, Number(input.progress) || 0));
  }
  if ("targetDate" in input) {
    row.target_date = input.targetDate || null;
  }
  if ("position" in input) {
    row.position = Number(input.position) || 0;
  }
  if ("objectiveId" in input) {
    row.objective_id = input.objectiveId || null;
  }

  // The goal dialog always sends the full metadata set together, so building a
  // fresh bag is safe; inline column edits omit these keys and leave it untouched.
  if (METADATA_FIELDS.some((key) => key in input)) {
    row.metadata = buildMetadata(input);
  }

  return row;
}

// objectiveId: pass a uuid to list one objective's goals, `null` to list
// top-level goals (the Goals screen), or omit to list every project goal.
export async function listGoals(projectId, { objectiveId } = {}) {
  if (!projectId) {
    return [];
  }

  let query = flowClient()
    .from(GOALS_TABLE)
    .select("*")
    .eq("project_id", projectId)
    .is("deleted_at", null);

  if (objectiveId === null) {
    query = query.is("objective_id", null);
  } else if (objectiveId !== undefined) {
    query = query.eq("objective_id", objectiveId);
  }

  const { data, error } = await query
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[flow.goals] list error:", error);
    return [];
  }

  return (data ?? []).map(normalizeGoal);
}

export async function createGoal(projectId, input) {
  if (!projectId || !input?.title?.trim()) {
    return null;
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const payload = {
    title: input.title.trim(),
    description: input.description?.trim() || null,
    status: input.status || DEFAULT_GOAL_STATUS,
    owner: input.owner?.trim() || null,
    progress: Math.min(100, Math.max(0, Number(input.progress) || 0)),
    target_date: input.targetDate || null,
    position: Number(input.position) || 0,
    objective_id: input.objectiveId || null,
    metadata: buildMetadata(input),
    project_id: projectId,
    created_by: user?.id ?? null,
  };

  const { data, error } = await flowClient()
    .from(GOALS_TABLE)
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("[flow.goals] create error:", error);
    return null;
  }

  return normalizeGoal(data);
}

// Accepts a camelCase patch (full or partial) and maps it to DB columns.
export async function updateGoal(id, patch) {
  if (!id || !patch) {
    return null;
  }

  const row = toRow(patch);
  if (Object.keys(row).length === 0) {
    return null;
  }

  const { data, error } = await flowClient()
    .from(GOALS_TABLE)
    .update(row)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[flow.goals] update error:", error);
    return null;
  }

  return normalizeGoal(data);
}

// Soft delete — preserves the row and lets list queries filter on deleted_at.
export async function softDeleteGoal(id) {
  if (!id) {
    return false;
  }

  const { error } = await flowClient()
    .from(GOALS_TABLE)
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("[flow.goals] delete error:", error);
    return false;
  }

  return true;
}
