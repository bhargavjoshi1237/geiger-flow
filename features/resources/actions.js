// Data-access layer for the Resource Allocation feature.
//
// All reads/writes target the dedicated `flow` Postgres schema
// (flow.resource_allocations, flow.resource_requests) via `.schema("flow")`.
// RLS scopes every row to members of the row's project with the matching
// resources.* ability, so no extra filtering is required here.
//
// The DB stores snake_case columns; the UI works in camelCase, so this module
// adapts between the two (toRow / normalize*) and always returns view-model
// objects the screen can render directly.

import { createClient } from "@/lib/supabase/client";
import { flowClient } from "@/supabase/components/flow-client";
import {
  DEFAULT_ALLOCATION_STATUS,
  DEFAULT_REQUEST_STATUS,
} from "./constants";

const ALLOCATIONS_TABLE = "resource_allocations";
const REQUESTS_TABLE = "resource_requests";

// DB row (snake_case) -> UI view model (camelCase). The metadata bag's keys are
// spread onto the view model so the UI treats them like first-class fields.
export function normalizeAllocation(row) {
  if (!row) {
    return null;
  }

  const metadata = row.metadata ?? {};

  return {
    id: row.id,
    projectId: row.project_id,
    member: row.member,
    role: row.role ?? "",
    allocation: Number(row.allocation) || 0,
    status: row.status,
    startsOn: row.starts_on,
    endsOn: row.ends_on,
    notes: row.notes ?? "",
    metadata,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function normalizeRequest(row) {
  if (!row) {
    return null;
  }

  const metadata = row.metadata ?? {};

  return {
    id: row.id,
    projectId: row.project_id,
    requester: row.requester,
    request: row.request,
    target: row.target ?? "",
    status: row.status,
    requestedOn: row.requested_on,
    resolvedAt: row.resolved_at ?? null,
    note: row.note ?? "",
    metadata,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Maps the camelCase UI fields to DB columns. Only keys present in `input` are
// emitted, so the same helper serves full creates and partial inline updates
// (e.g. { status } from an approve/deny action).
function toAllocationRow(input) {
  const row = {};

  if ("member" in input) {
    row.member = input.member?.trim();
  }
  if ("role" in input) {
    row.role = input.role?.trim() || null;
  }
  if ("allocation" in input) {
    row.allocation = Math.min(100, Math.max(0, Math.round(Number(input.allocation) || 0)));
  }
  if ("status" in input) {
    row.status = input.status || DEFAULT_ALLOCATION_STATUS;
  }
  if ("startsOn" in input) {
    row.starts_on = input.startsOn || null;
  }
  if ("endsOn" in input) {
    row.ends_on = input.endsOn || null;
  }
  if ("notes" in input) {
    row.notes = input.notes?.trim() || null;
  }

  return row;
}

function toRequestRow(input) {
  const row = {};

  if ("requester" in input) {
    row.requester = input.requester?.trim();
  }
  if ("request" in input) {
    row.request = input.request?.trim();
  }
  if ("target" in input) {
    row.target = input.target?.trim() || null;
  }
  if ("status" in input) {
    row.status = input.status || DEFAULT_REQUEST_STATUS;
  }
  if ("requestedOn" in input) {
    row.requested_on = input.requestedOn || null;
  }
  if ("resolvedAt" in input) {
    row.resolved_at = input.resolvedAt || null;
  }
  if ("note" in input) {
    row.note = input.note?.trim() || null;
  }

  return row;
}

export async function listAllocations(projectId) {
  if (!projectId) {
    return [];
  }

  const { data, error } = await flowClient()
    .from(ALLOCATIONS_TABLE)
    .select("*")
    .eq("project_id", projectId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[flow.resources] allocation list error:", error);
    return [];
  }

  return (data ?? []).map(normalizeAllocation);
}

export async function createAllocation(projectId, input, { id } = {}) {
  if (!projectId || !input?.member?.trim()) {
    return null;
  }

  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("[flow.resources] user lookup error:", userError);
  }

  const payload = {
    ...toAllocationRow(input),
    status: input.status || DEFAULT_ALLOCATION_STATUS,
    allocation: Math.min(100, Math.max(0, Math.round(Number(input.allocation) || 0))),
    starts_on: input.startsOn || new Date().toISOString().slice(0, 10),
    project_id: projectId,
    created_by: user?.id ?? null,
  };

  // Honor the caller's optimistic UUID so the row and the list entry share an id.
  if (id || input.id) {
    payload.id = id || input.id;
  }

  const { data, error } = await flowClient()
    .from(ALLOCATIONS_TABLE)
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("[flow.resources] allocation create error:", error);
    return null;
  }

  return normalizeAllocation(data);
}

// Accepts a camelCase patch (full or partial) and maps it to DB columns.
export async function updateAllocation(id, patch) {
  if (!id || !patch) {
    return null;
  }

  const row = toAllocationRow(patch);
  if (Object.keys(row).length === 0) {
    return null;
  }

  const { data, error } = await flowClient()
    .from(ALLOCATIONS_TABLE)
    .update(row)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[flow.resources] allocation update error:", error);
    return null;
  }

  return normalizeAllocation(data);
}

// Soft delete — preserves the row and lets list queries filter on deleted_at.
export async function softDeleteAllocation(id) {
  if (!id) {
    return false;
  }

  const { error } = await flowClient()
    .from(ALLOCATIONS_TABLE)
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("[flow.resources] allocation delete error:", error);
    return false;
  }

  return true;
}

export async function listRequests(projectId) {
  if (!projectId) {
    return [];
  }

  const { data, error } = await flowClient()
    .from(REQUESTS_TABLE)
    .select("*")
    .eq("project_id", projectId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[flow.resources] request list error:", error);
    return [];
  }

  return (data ?? []).map(normalizeRequest);
}

export async function createRequest(projectId, input, { id } = {}) {
  if (!projectId || !input?.requester?.trim() || !input?.request?.trim()) {
    return null;
  }

  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("[flow.resources] user lookup error:", userError);
  }

  const payload = {
    ...toRequestRow(input),
    status: input.status || DEFAULT_REQUEST_STATUS,
    requested_on: input.requestedOn || new Date().toISOString().slice(0, 10),
    project_id: projectId,
    created_by: user?.id ?? null,
  };

  // Honor the caller's optimistic UUID so the row and the list entry share an id.
  if (id || input.id) {
    payload.id = id || input.id;
  }

  const { data, error } = await flowClient()
    .from(REQUESTS_TABLE)
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("[flow.resources] request create error:", error);
    return null;
  }

  return normalizeRequest(data);
}

// Accepts a camelCase patch. Approve/deny ({ status: "approved" | "denied" })
// stamps resolved_at automatically unless the patch supplies it explicitly;
// moving back to pending clears it.
export async function updateRequest(id, patch) {
  if (!id || !patch) {
    return null;
  }

  const row = toRequestRow(patch);

  if ("status" in patch && !("resolvedAt" in patch)) {
    if (patch.status === DEFAULT_REQUEST_STATUS || !patch.status) {
      row.resolved_at = null;
    } else {
      row.resolved_at = new Date().toISOString();
    }
  }

  if (Object.keys(row).length === 0) {
    return null;
  }

  const { data, error } = await flowClient()
    .from(REQUESTS_TABLE)
    .update(row)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[flow.resources] request update error:", error);
    return null;
  }

  return normalizeRequest(data);
}

// Soft delete — preserves the row and lets list queries filter on deleted_at.
export async function softDeleteRequest(id) {
  if (!id) {
    return false;
  }

  const { error } = await flowClient()
    .from(REQUESTS_TABLE)
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("[flow.resources] request delete error:", error);
    return false;
  }

  return true;
}
