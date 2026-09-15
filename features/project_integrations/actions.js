// Data-access layer for the Project Integrations feature.
//
// Reads/writes target flow.project_integrations via the shared flowClient
// helper. This is the single persistence behind Settings -> Connections (the
// orphan connectivity_screen.jsx was a duplicate and is deleted). The DB
// stores snake_case columns; the UI works in camelCase, so this module adapts
// between the two (toRow / normalizeIntegration). Pure data access: validate,
// console.error("[flow.project_integrations]") on failure, return null/false
// — never throw, never toast.

import { createClient } from "@/lib/supabase/client";
import { flowClient } from "@/supabase/components/flow-client";
import {
  DEFAULT_INTEGRATION_PROVIDER,
  DEFAULT_INTEGRATION_STATUS,
} from "./constants";

const INTEGRATIONS_TABLE = "project_integrations";

// DB row (snake_case) -> UI view model (camelCase).
export function normalizeIntegration(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    projectId: row.project_id,
    provider: row.provider ?? DEFAULT_INTEGRATION_PROVIDER,
    name: row.name ?? "",
    url: row.url ?? "",
    status: row.status ?? DEFAULT_INTEGRATION_STATUS,
    events: Array.isArray(row.events) ? row.events : [],
    metadata: row.metadata ?? {},
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// UI form payload (camelCase) -> DB columns (snake_case). Only keys present in
// `input` are emitted, so the same helper serves full creates and partial
// inline updates (e.g. { status } from a pause/resume toggle).
function toRow(input) {
  const row = {};

  if ("provider" in input) {
    row.provider = input.provider?.trim() || DEFAULT_INTEGRATION_PROVIDER;
  }
  if ("name" in input) {
    row.name = input.name?.trim();
  }
  if ("url" in input) {
    row.url = input.url?.trim() || null;
  }
  if ("status" in input) {
    row.status = input.status || DEFAULT_INTEGRATION_STATUS;
  }
  if ("events" in input) {
    row.events = Array.isArray(input.events) ? input.events : [];
  }

  return row;
}

export async function listProjectIntegrations(projectId) {
  if (!projectId) {
    return [];
  }

  try {
    const { data, error } = await flowClient()
      .from(INTEGRATIONS_TABLE)
      .select("*")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[flow.project_integrations] list error:", error);
      return null;
    }

    return (data ?? []).map(normalizeIntegration);
  } catch (error) {
    console.error("[flow.project_integrations] list error:", error);
    return null;
  }
}

// Honors a caller-supplied `id` so the optimistic row and the stored row share
// a UUID.
export async function createProjectIntegration(projectId, input) {
  if (!projectId || !input?.name?.trim()) {
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
  if (input.id) {
    payload.id = input.id;
  }

  try {
    const { data, error } = await flowClient()
      .from(INTEGRATIONS_TABLE)
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("[flow.project_integrations] create error:", error);
      return null;
    }

    return normalizeIntegration(data);
  } catch (error) {
    console.error("[flow.project_integrations] create error:", error);
    return null;
  }
}

export async function updateProjectIntegration(id, patch) {
  if (!id || !patch) {
    return null;
  }

  const row = toRow(patch);
  if (Object.keys(row).length === 0) {
    return null;
  }

  try {
    const { data, error } = await flowClient()
      .from(INTEGRATIONS_TABLE)
      .update(row)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[flow.project_integrations] update error:", error);
      return null;
    }

    return normalizeIntegration(data);
  } catch (error) {
    console.error("[flow.project_integrations] update error:", error);
    return null;
  }
}

// Soft delete — preserves the row and lets list queries filter on deleted_at.
export async function softDeleteProjectIntegration(id) {
  if (!id) {
    return false;
  }

  try {
    const { error } = await flowClient()
      .from(INTEGRATIONS_TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("[flow.project_integrations] delete error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[flow.project_integrations] delete error:", error);
    return false;
  }
}
