// Data-access layer for the Vault feature.
//
// Reads/writes target flow.vault_items via the shared flowClient helper. RLS
// scopes every row to members of the item's project (open-module model). The
// secret value and its accessSetup live in the metadata bag; the DB stores
// snake_case columns, the UI works in camelCase.

import { createClient } from "@/lib/supabase/client";
import { flowClient } from "@/supabase/components/flow-client";
import { logActivity } from "@/features/activity_logs/actions";
import { formatUpdateMessage } from "@/features/activity_logs/constants";

const VAULT_ITEMS_TABLE = "vault_items";

// Readable labels for the activity-log change summary.
const VAULT_FIELD_LABELS = {
  name: "name",
  type: "type",
  username: "username",
  url: "url",
  notes: "notes",
  secret: "secret",
  accessSetup: "access setup",
};

const METADATA_FIELDS = ["secret", "accessSetup"];

export function normalizeVaultItem(row) {
  if (!row) {
    return null;
  }

  const metadata = row.metadata ?? {};

  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    type: row.type ?? "other",
    username: row.username ?? "",
    url: row.url ?? "",
    notes: row.notes ?? "",
    secret: metadata.secret ?? "",
    accessSetup: metadata.accessSetup ?? null,
    metadata,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(input) {
  const row = {};

  if ("name" in input) {
    row.name = input.name?.trim();
  }
  if ("type" in input) {
    row.type = input.type || "other";
  }
  if ("username" in input) {
    row.username = input.username?.trim() || null;
  }
  if ("url" in input) {
    row.url = input.url?.trim() || null;
  }
  if ("notes" in input) {
    row.notes = input.notes?.trim() || null;
  }

  if (METADATA_FIELDS.some((key) => key in input)) {
    const metadata = {};
    if ("secret" in input) {
      metadata.secret = input.secret;
    }
    if ("accessSetup" in input) {
      metadata.accessSetup = input.accessSetup;
    }
    row.metadata = metadata;
  }

  return row;
}

export async function listVaultItems(projectId) {
  if (!projectId) {
    return [];
  }

  try {
    const { data, error } = await flowClient()
      .from(VAULT_ITEMS_TABLE)
      .select("*")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("[flow.vault_items] list error:", error);
      return null;
    }

    return (data ?? []).map(normalizeVaultItem);
  } catch (error) {
    console.error("[flow.vault_items] list error:", error);
    return null;
  }
}

// Honors a caller-supplied `id` so the optimistic card and the stored row share
// a UUID.
export async function createVaultItem(projectId, input) {
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
      .from(VAULT_ITEMS_TABLE)
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("[flow.vault_items] create error:", error);
      return null;
    }

    void logActivity(projectId, {
      source: "vault",
      message: `Created vault item "${data.name}"`,
      // Never log the secret itself.
      detail: { id: data.id, type: data.type },
    }).catch(() => {});

    return normalizeVaultItem(data);
  } catch (error) {
    console.error("[flow.vault_items] create error:", error);
    return null;
  }
}

export async function updateVaultItem(id, patch) {
  if (!id || !patch) {
    return null;
  }

  const row = toRow(patch);
  if (Object.keys(row).length === 0) {
    return null;
  }

  try {
    const { data, error } = await flowClient()
      .from(VAULT_ITEMS_TABLE)
      .update(row)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[flow.vault_items] update error:", error);
      return null;
    }

    void logActivity(data.project_id, {
      source: "vault",
      message: formatUpdateMessage({
        entity: "vault item",
        title: data.name,
        patch,
        fields: VAULT_FIELD_LABELS,
        // Redact sensitive values from the change summary.
        values: {
          secret: () => "(updated)",
          accessSetup: () => "(updated)",
        },
      }),
      // Never log the secret itself.
      detail: { id, keys: Object.keys(patch).filter((key) => key !== "secret") },
    }).catch(() => {});

    return normalizeVaultItem(data);
  } catch (error) {
    console.error("[flow.vault_items] update error:", error);
    return null;
  }
}

// Soft delete — preserves the row and lets list queries filter on deleted_at.
export async function softDeleteVaultItem(id) {
  if (!id) {
    return false;
  }

  try {
    const { data, error } = await flowClient()
      .from(VAULT_ITEMS_TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .select("project_id, name")
      .maybeSingle();

    if (error) {
      console.error("[flow.vault_items] delete error:", error);
      return false;
    }

    if (data?.project_id) {
      void logActivity(data.project_id, {
        source: "vault",
        level: "warning",
        message: `Deleted vault item "${data.name}"`,
        detail: { id },
      }).catch(() => {});
    }

    return true;
  } catch (error) {
    console.error("[flow.vault_items] delete error:", error);
    return false;
  }
}
