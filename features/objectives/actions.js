// Data-access layer for the Objectives feature.
//
// All reads/writes target the dedicated `flow` Postgres schema
// (flow.objectives) via `.schema("flow")`. RLS scopes every row to members of
// the objective's project (open-module model), so no extra filtering is needed.
//
// The DB stores snake_case columns; the UI works in camelCase, so this module
// adapts between the two (toRow / normalizeObjective) and always returns
// view-model objects the screen can render directly.

import { createClient } from "@/lib/supabase/client";
import { flowClient } from "@/supabase/components/flow-client";
import {
  DEFAULT_OBJECTIVE_STATUS,
  DEFAULT_OBJECTIVE_COLUMNS,
} from "./constants";

const OBJECTIVES_TABLE = "objectives";

// Attributes stored in the `metadata` jsonb expansion bag rather than dedicated
// columns. Surfaced as first-class fields on the view model and folded back on
// write (see MODULE_CONVENTIONS.md -> metadata column).
const METADATA_FIELDS = ["keyResults", "columns"];

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
export function normalizeObjective(row) {
  if (!row) {
    return null;
  }

  const metadata = row.metadata ?? {};

  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    description: row.description ?? "",
    status: row.status,
    owner: row.owner ?? "",
    progress: Number(row.progress) || 0,
    startDate: row.start_date,
    targetDate: row.target_date,
    keyResults: normalizeKeyResults(metadata.keyResults),
    columns: Array.isArray(metadata.columns) ? metadata.columns : DEFAULT_OBJECTIVE_COLUMNS,
    metadata,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Maps the camelCase UI fields to DB columns. Only keys present in `input` are
// emitted, so the same helper serves full creates and partial inline updates.
function toRow(input) {
  const row = {};

  if ("title" in input) {
    row.title = input.title?.trim();
  }
  if ("description" in input) {
    row.description = input.description?.trim() || null;
  }
  if ("status" in input) {
    row.status = input.status || DEFAULT_OBJECTIVE_STATUS;
  }
  if ("owner" in input) {
    row.owner = input.owner?.trim() || null;
  }
  if ("progress" in input) {
    row.progress = Math.min(100, Math.max(0, Number(input.progress) || 0));
  }
  if ("startDate" in input) {
    row.start_date = input.startDate || null;
  }
  if ("targetDate" in input) {
    row.target_date = input.targetDate || null;
  }

  // Fold metadata-bag fields back into the jsonb column whenever any bag key is
  // present. Each key is written only if supplied so partial patches (e.g. just
  // `columns`) don't clobber the rest of the bag.
  if (METADATA_FIELDS.some((key) => key in input)) {
    const metadata = {};
    if ("keyResults" in input) {
      metadata.keyResults = normalizeKeyResults(input.keyResults);
    }
    if ("columns" in input) {
      metadata.columns = Array.isArray(input.columns) ? input.columns : [];
    }
    row.metadata = metadata;
  }

  return row;
}

export async function listObjectives(projectId) {
  if (!projectId) {
    return [];
  }

  const { data, error } = await flowClient()
    .from(OBJECTIVES_TABLE)
    .select("*")
    .eq("project_id", projectId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[flow.objectives] list error:", error);
    return [];
  }

  return (data ?? []).map(normalizeObjective);
}

export async function createObjective(projectId, input) {
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
    status: input.status || DEFAULT_OBJECTIVE_STATUS,
    owner: input.owner?.trim() || null,
    progress: Math.min(100, Math.max(0, Number(input.progress) || 0)),
    start_date: input.startDate || null,
    target_date: input.targetDate || null,
    metadata: {
      keyResults: normalizeKeyResults(input.keyResults),
      columns: Array.isArray(input.columns) ? input.columns : DEFAULT_OBJECTIVE_COLUMNS,
    },
    project_id: projectId,
    created_by: user?.id ?? null,
  };

  const { data, error } = await flowClient()
    .from(OBJECTIVES_TABLE)
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("[flow.objectives] create error:", error);
    return null;
  }

  return normalizeObjective(data);
}

// Accepts a camelCase patch (full or partial) and maps it to DB columns.
export async function updateObjective(id, patch) {
  if (!id || !patch) {
    return null;
  }

  const row = toRow(patch);
  if (Object.keys(row).length === 0) {
    return null;
  }

  const { data, error } = await flowClient()
    .from(OBJECTIVES_TABLE)
    .update(row)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[flow.objectives] update error:", error);
    return null;
  }

  return normalizeObjective(data);
}

// Soft delete — preserves the row and lets list queries filter on deleted_at.
export async function softDeleteObjective(id) {
  if (!id) {
    return false;
  }

  const { error } = await flowClient()
    .from(OBJECTIVES_TABLE)
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("[flow.objectives] delete error:", error);
    return false;
  }

  return true;
}
