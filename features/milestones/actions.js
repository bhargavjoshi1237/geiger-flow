// Data-access layer for the Milestones feature.
//
// All reads/writes target the dedicated `flow` Postgres schema (flow.milestones)
// via `.schema("flow")`. RLS scopes every row to members of the milestone's
// project (open-module model). A milestone's tasks[] live in the metadata bag;
// status and completion are derived in the UI (see getMilestoneMetrics).
//
// The DB stores snake_case columns; the UI works in camelCase, so this module
// adapts between the two (toRow / normalizeMilestone) and always returns
// view-model objects the screen can render directly.

import { createClient } from "@/lib/supabase/client";
import { flowClient } from "@/supabase/components/flow-client";

const MILESTONES_TABLE = "milestones";

// Attributes stored in the `metadata` jsonb expansion bag rather than dedicated
// columns (see MODULE_CONVENTIONS.md -> metadata column).
const METADATA_FIELDS = ["tasks"];

function normalizeTasks(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((task, index) => ({
    id: task?.id || `mt_${index}`,
    title: task?.title ?? "",
    status: task?.status ?? "todo",
    assignee: task?.assignee ?? "",
  }));
}

// DB row (snake_case) -> UI view model (camelCase). The metadata bag's keys are
// spread onto the view model so the UI treats them like first-class fields.
export function normalizeMilestone(row) {
  if (!row) {
    return null;
  }

  const metadata = row.metadata ?? {};

  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    description: row.description ?? "",
    owner: row.owner ?? "",
    targetDate: row.target_date,
    tasks: normalizeTasks(metadata.tasks),
    metadata,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Maps the camelCase UI fields to DB columns. Only keys present in `input` are
// emitted, so the same helper serves full creates and partial inline updates
// (e.g. { tasks } from a task toggle).
function toRow(input) {
  const row = {};

  if ("title" in input) {
    row.title = input.title?.trim();
  }
  if ("description" in input) {
    row.description = input.description?.trim() || null;
  }
  if ("owner" in input) {
    row.owner = input.owner?.trim() || null;
  }
  if ("targetDate" in input) {
    row.target_date = input.targetDate || null;
  }

  if (METADATA_FIELDS.some((key) => key in input)) {
    row.metadata = { tasks: normalizeTasks(input.tasks) };
  }

  return row;
}

export async function listMilestones(projectId) {
  if (!projectId) {
    return [];
  }

  const { data, error } = await flowClient()
    .from(MILESTONES_TABLE)
    .select("*")
    .eq("project_id", projectId)
    .is("deleted_at", null)
    .order("target_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[flow.milestones] list error:", error);
    return [];
  }

  return (data ?? []).map(normalizeMilestone);
}

export async function createMilestone(projectId, input) {
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
    owner: input.owner?.trim() || null,
    target_date: input.targetDate || null,
    metadata: { tasks: normalizeTasks(input.tasks) },
    project_id: projectId,
    created_by: user?.id ?? null,
  };

  const { data, error } = await flowClient()
    .from(MILESTONES_TABLE)
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("[flow.milestones] create error:", error);
    return null;
  }

  return normalizeMilestone(data);
}

// Accepts a camelCase patch (full or partial) and maps it to DB columns.
export async function updateMilestone(id, patch) {
  if (!id || !patch) {
    return null;
  }

  const row = toRow(patch);
  if (Object.keys(row).length === 0) {
    return null;
  }

  const { data, error } = await flowClient()
    .from(MILESTONES_TABLE)
    .update(row)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[flow.milestones] update error:", error);
    return null;
  }

  return normalizeMilestone(data);
}

// Soft delete — preserves the row and lets list queries filter on deleted_at.
export async function softDeleteMilestone(id) {
  if (!id) {
    return false;
  }

  const { error } = await flowClient()
    .from(MILESTONES_TABLE)
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("[flow.milestones] delete error:", error);
    return false;
  }

  return true;
}
