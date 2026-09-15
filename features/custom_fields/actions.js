// Data-access layer for the Custom Fields feature.
//
// Reads/writes target flow.custom_fields via the shared flowClient helper.
// The DB stores snake_case columns; the UI works in camelCase, so this module
// adapts between the two (toRow / normalizeCustomField) and always returns
// view-model objects the screen can render directly. Pure data access:
// validate, console.error("[flow.custom_fields]") on failure, return
// null/false/[] — never throw, never toast.

import { createClient } from "@/lib/supabase/client";
import { flowClient } from "@/supabase/components/flow-client";
import {
  DEFAULT_CUSTOM_FIELD_SCOPE,
  DEFAULT_CUSTOM_FIELD_TYPE,
  isValidFieldScope,
  isValidFieldType,
} from "./constants";

const CUSTOM_FIELDS_TABLE = "custom_fields";

// DB row (snake_case) -> UI view model (camelCase).
export function normalizeCustomField(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name ?? "",
    type: row.type ?? DEFAULT_CUSTOM_FIELD_TYPE,
    scope: row.scope ?? DEFAULT_CUSTOM_FIELD_SCOPE,
    required: row.required === true,
    options: Array.isArray(row.options) ? row.options : [],
    metadata: row.metadata ?? {},
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// UI form payload (camelCase) -> DB columns (snake_case). Only keys present in
// `input` are emitted, so the same helper serves full creates and partial
// inline updates (e.g. { required } from a quick toggle).
function toRow(input) {
  const row = {};

  if ("name" in input) {
    row.name = input.name?.trim();
  }
  if ("type" in input) {
    row.type = isValidFieldType(input.type) ? input.type : DEFAULT_CUSTOM_FIELD_TYPE;
  }
  if ("scope" in input) {
    row.scope = isValidFieldScope(input.scope) ? input.scope : DEFAULT_CUSTOM_FIELD_SCOPE;
  }
  if ("required" in input) {
    row.required = Boolean(input.required);
  }
  if ("options" in input) {
    row.options = Array.isArray(input.options)
      ? input.options.map((option) => String(option).trim()).filter(Boolean)
      : [];
  }

  return row;
}

export async function listCustomFields(projectId) {
  if (!projectId) {
    return [];
  }

  try {
    const { data, error } = await flowClient()
      .from(CUSTOM_FIELDS_TABLE)
      .select("*")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[flow.custom_fields] list error:", error);
      return null;
    }

    return (data ?? []).map(normalizeCustomField);
  } catch (error) {
    console.error("[flow.custom_fields] list error:", error);
    return null;
  }
}

// Honors a caller-supplied `id` so the optimistic field and the stored row
// share a UUID.
export async function createCustomField(projectId, input) {
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
      .from(CUSTOM_FIELDS_TABLE)
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("[flow.custom_fields] create error:", error);
      return null;
    }

    return normalizeCustomField(data);
  } catch (error) {
    console.error("[flow.custom_fields] create error:", error);
    return null;
  }
}

export async function updateCustomField(id, patch) {
  if (!id || !patch) {
    return null;
  }

  const row = toRow(patch);
  if (Object.keys(row).length === 0) {
    return null;
  }

  try {
    const { data, error } = await flowClient()
      .from(CUSTOM_FIELDS_TABLE)
      .update(row)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[flow.custom_fields] update error:", error);
      return null;
    }

    return normalizeCustomField(data);
  } catch (error) {
    console.error("[flow.custom_fields] update error:", error);
    return null;
  }
}

// Soft delete — preserves the row and lets list queries filter on deleted_at.
export async function softDeleteCustomField(id) {
  if (!id) {
    return false;
  }

  try {
    const { error } = await flowClient()
      .from(CUSTOM_FIELDS_TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("[flow.custom_fields] delete error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[flow.custom_fields] delete error:", error);
    return false;
  }
}
