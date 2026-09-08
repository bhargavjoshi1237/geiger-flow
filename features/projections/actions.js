// Data-access layer for the Projections feature.
//
// All reads/writes target the dedicated `flow` Postgres schema
// (flow.projections) via `.schema("flow")`. RLS scopes every row to members of
// the projection's project (open-module model). A projection is a dated,
// project-scoped calendar event (milestone / release / review / deadline)
// with an optional multi-day span and a soft archive flag.
//
// The DB stores snake_case columns; the UI works in camelCase, so this module
// adapts between the two (toRow / normalizeProjection) and always returns
// view-model objects the screen can render directly.

import { createClient } from "@/lib/supabase/client";
import { flowClient } from "@/supabase/components/flow-client";
import {
  DEFAULT_PROJECTION_KIND,
  DEFAULT_PROJECTION_VISIBILITY,
  toDayKey,
} from "./constants";

const PROJECTIONS_TABLE = "projections";

// DB row (snake_case) -> UI view model (camelCase). The metadata bag's keys are
// spread onto the view model so the UI treats them like first-class fields.
export function normalizeProjection(row) {
  if (!row) {
    return null;
  }

  const metadata = row.metadata ?? {};

  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title ?? "",
    description: row.description ?? "",
    kind: row.kind ?? DEFAULT_PROJECTION_KIND,
    startsOn: row.starts_on ?? null,
    endsOn: row.ends_on ?? null,
    visibility: row.visibility ?? DEFAULT_PROJECTION_VISIBILITY,
    archivedAt: row.archived_at ?? null,
    owner: row.owner ?? "",
    metadata,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Maps the camelCase UI fields to DB columns. Only keys present in `input` are
// emitted, so the same helper serves full creates and partial inline updates
// (e.g. { archivedAt } to archive and { archivedAt: null } to restore).
function toRow(input) {
  const row = {};

  if ("title" in input) {
    row.title = input.title?.trim();
  }
  if ("description" in input) {
    row.description = input.description?.trim() || null;
  }
  if ("kind" in input) {
    row.kind = input.kind || DEFAULT_PROJECTION_KIND;
  }
  if ("startsOn" in input) {
    row.starts_on = input.startsOn || null;
  }
  if ("endsOn" in input) {
    row.ends_on = input.endsOn || null;
  }
  if ("visibility" in input) {
    row.visibility = input.visibility || DEFAULT_PROJECTION_VISIBILITY;
  }
  // Archive/restore rely on writing an explicit NULL — always emit when sent.
  if ("archivedAt" in input) {
    row.archived_at = input.archivedAt ?? null;
  }
  if ("owner" in input) {
    row.owner = input.owner?.trim() || null;
  }

  return row;
}

export async function listProjections(projectId) {
  if (!projectId) {
    return [];
  }

  const { data, error } = await flowClient()
    .from(PROJECTIONS_TABLE)
    .select("*")
    .eq("project_id", projectId)
    .is("deleted_at", null)
    .order("starts_on", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[flow.projections] list error:", error);
    return [];
  }

  return (data ?? []).map(normalizeProjection);
}

export async function createProjection(projectId, input) {
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
    kind: input.kind || DEFAULT_PROJECTION_KIND,
    starts_on: input.startsOn || toDayKey(),
    ends_on: input.endsOn || null,
    visibility: input.visibility || DEFAULT_PROJECTION_VISIBILITY,
    owner: input.owner?.trim() || null,
    metadata: {},
    project_id: projectId,
    created_by: user?.id ?? null,
  };

  // Honor a caller-supplied id so the optimistic row and the inserted row
  // share a UUID.
  if (input.id) {
    payload.id = input.id;
  }

  const { data, error } = await flowClient()
    .from(PROJECTIONS_TABLE)
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("[flow.projections] create error:", error);
    return null;
  }

  return normalizeProjection(data);
}

// Accepts a camelCase patch (full or partial) and maps it to DB columns.
// Also serves archive ({ archivedAt }) and restore ({ archivedAt: null }).
export async function updateProjection(id, patch) {
  if (!id || !patch) {
    return null;
  }

  const row = toRow(patch);
  if (Object.keys(row).length === 0) {
    return null;
  }

  const { data, error } = await flowClient()
    .from(PROJECTIONS_TABLE)
    .update(row)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[flow.projections] update error:", error);
    return null;
  }

  return normalizeProjection(data);
}

// Soft delete — preserves the row and lets list queries filter on deleted_at.
export async function softDeleteProjection(id) {
  if (!id) {
    return false;
  }

  const { error } = await flowClient()
    .from(PROJECTIONS_TABLE)
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("[flow.projections] delete error:", error);
    return false;
  }

  return true;
}
