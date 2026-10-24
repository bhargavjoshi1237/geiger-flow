// Data-access layer for the Vault feature.
//
// Item rows (name, type, notes, how they're opened and who may open them) live in flow.vault_items. Secret values
// and PIN/password hashes never come through these reads: they sit in Supabase Vault and flow.vault_item_secrets,
// reachable only through the flow.vault_* functions (migration 20261024145712_vault_secure_storage). Passkey opens
// go through app/api/vault/reveal (see ./passkeys.js). The DB is snake_case, the UI camelCase.

import { createClient } from "@/lib/supabase/client";
import { flowClient } from "@/supabase/components/flow-client";
import { logActivity } from "@/features/activity_logs/actions";
import { formatUpdateMessage } from "@/features/activity_logs/constants";
import { normalizeEmails } from "./constants";

const VAULT_ITEMS_TABLE = "vault_items";
const ACCESS_EVENTS_TABLE = "vault_access_events";

// Readable labels for the activity-log change summary.
const VAULT_FIELD_LABELS = {
  name: "name",
  type: "type",
  username: "username",
  url: "url",
  notes: "notes",
  secret: "secret",
  code: "PIN or password",
  accessMethod: "unlock method",
  accessMode: "access",
  allowedEmails: "allowed people",
};

const SECRET_FIELDS = ["secret", "code"];

export function normalizeVaultItem(row, permissions = null) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    type: row.type ?? "other",
    username: row.username ?? "",
    url: row.url ?? "",
    notes: row.notes ?? "",
    accessMethod: row.access_method ?? "pin",
    accessMode: row.access_mode ?? "project",
    allowedEmails: row.allowed_emails ?? [],
    canOpen: permissions?.can_open ?? false,
    canManage: permissions?.can_manage ?? false,
    hasSecret: permissions?.has_secret ?? false,
    hasCode: permissions?.has_code ?? false,
    metadata: row.metadata ?? {},
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
  if ("accessMethod" in input) {
    row.access_method = input.accessMethod || "pin";
  }
  if ("accessMode" in input) {
    row.access_mode = input.accessMode || "project";
  }
  if ("allowedEmails" in input) {
    row.allowed_emails = normalizeEmails(input.allowedEmails);
  }

  return row;
}

// What the signed-in person can do with each item, keyed by item id.
async function listPermissions(projectId) {
  const { data, error } = await flowClient().rpc("vault_item_permissions", { p_project_id: projectId });
  if (error) {
    console.error("[flow.vault_items] permissions error:", error);
    return null;
  }
  return Object.fromEntries((data ?? []).map((entry) => [entry.item_id, entry]));
}

async function permissionsFor(projectId, id) {
  const permissions = await listPermissions(projectId);
  return permissions?.[id] ?? null;
}

// Sets the secret value, the unlock method and/or the PIN or password in one atomic call. Empty values keep what's
// stored, and a missing code for a new method changes nothing.
async function saveSecret(id, { secret, code, accessMethod }) {
  const { error } = await flowClient().rpc("vault_save_secret", {
    p_item_id: id,
    p_secret: secret || null,
    p_code: code || null,
    p_method: accessMethod || null,
  });
  if (error) {
    console.error("[flow.vault_items] save secret error:", error);
    return false;
  }
  return true;
}

export async function listVaultItems(projectId) {
  if (!projectId) {
    return [];
  }

  try {
    const [{ data, error }, permissions] = await Promise.all([
      flowClient()
        .from(VAULT_ITEMS_TABLE)
        .select("*")
        .eq("project_id", projectId)
        .is("deleted_at", null)
        .order("updated_at", { ascending: false }),
      listPermissions(projectId),
    ]);

    if (error || !permissions) {
      console.error("[flow.vault_items] list error:", error);
      return null;
    }

    return (data ?? []).map((row) => normalizeVaultItem(row, permissions[row.id]));
  } catch (error) {
    console.error("[flow.vault_items] list error:", error);
    return null;
  }
}

// Honors a caller-supplied `id` so the optimistic card and the stored row share a UUID. The row and its secret are
// written in two steps, so a failed secret save removes the row again.
export async function createVaultItem(projectId, input) {
  if (!projectId || !input?.name?.trim() || !input?.secret) {
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

    if (!(await saveSecret(data.id, input))) {
      await softDeleteVaultItem(data.id, { silent: true });
      return null;
    }

    void logActivity(projectId, {
      source: "vault",
      message: `Created vault item "${data.name}"`,
      // Never log the secret itself.
      detail: { id: data.id, type: data.type, method: data.access_method },
    }).catch(() => {});

    return normalizeVaultItem(data, await permissionsFor(projectId, data.id));
  } catch (error) {
    console.error("[flow.vault_items] create error:", error);
    return null;
  }
}

// Saves the secret, method and code first (one atomic call, so a rejected code changes nothing), then the other fields.
export async function updateVaultItem(id, patch) {
  if (!id || !patch) {
    return null;
  }

  // The unlock method only changes through vault_save_secret, together with its code.
  const { access_method: _method, ...row } = toRow(patch);
  const hasRowChanges = Object.keys(row).length > 0;
  const touchesSecret = SECRET_FIELDS.some((key) => patch[key]) || "accessMethod" in patch;
  if (!hasRowChanges && !touchesSecret) {
    return null;
  }

  try {
    if (touchesSecret && !(await saveSecret(id, patch))) {
      return null;
    }

    const { data, error } = hasRowChanges
      ? await flowClient().from(VAULT_ITEMS_TABLE).update(row).eq("id", id).select().single()
      : await flowClient().from(VAULT_ITEMS_TABLE).select("*").eq("id", id).single();

    if (error) {
      console.error("[flow.vault_items] update error:", error);
      return null;
    }

    // Only fields that actually change; an empty secret or code means "keep the current one".
    const logged = Object.fromEntries(
      Object.entries(patch).filter(([key, value]) => !SECRET_FIELDS.includes(key) || value),
    );
    void logActivity(data.project_id, {
      source: "vault",
      message: formatUpdateMessage({
        entity: "vault item",
        title: data.name,
        patch: logged,
        fields: VAULT_FIELD_LABELS,
        // Redact sensitive values from the change summary.
        values: {
          secret: () => "(updated)",
          code: () => "(updated)",
          allowedEmails: (emails) => `${(emails ?? []).length} people`,
        },
      }),
      // Never log the secret or code itself.
      detail: { id, keys: Object.keys(logged) },
    }).catch(() => {});

    return normalizeVaultItem(data, await permissionsFor(data.project_id, id));
  } catch (error) {
    console.error("[flow.vault_items] update error:", error);
    return null;
  }
}

// Creates `newId` as a copy of `source`, with the same secret and code copied server-side.
export async function duplicateVaultItem(projectId, source, newId) {
  if (!projectId || !source?.id || !newId) {
    return null;
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  try {
    const { data, error } = await flowClient()
      .from(VAULT_ITEMS_TABLE)
      .insert([
        {
          ...toRow({
            name: `${source.name} (Copy)`,
            type: source.type,
            url: source.url,
            notes: source.notes,
            accessMethod: source.accessMethod,
            accessMode: source.accessMode,
            allowedEmails: source.allowedEmails,
          }),
          id: newId,
          project_id: projectId,
          created_by: user?.id ?? null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("[flow.vault_items] duplicate error:", error);
      return null;
    }

    const { error: copyError } = await flowClient().rpc("vault_duplicate_secret", {
      p_source_id: source.id,
      p_target_id: newId,
    });
    if (copyError) {
      console.error("[flow.vault_items] duplicate secret error:", copyError);
      await softDeleteVaultItem(newId, { silent: true });
      return null;
    }

    void logActivity(projectId, {
      source: "vault",
      message: `Duplicated vault item "${source.name}"`,
      detail: { id: newId, source: source.id },
    }).catch(() => {});

    return normalizeVaultItem(data, await permissionsFor(projectId, newId));
  } catch (error) {
    console.error("[flow.vault_items] duplicate error:", error);
    return null;
  }
}

// Opens a PIN or password item. Returns { ok, secret } or { ok: false, error, attemptsLeft | lockedUntil }; null when
// the call itself fails.
export async function revealVaultSecret(id, code) {
  if (!id) {
    return null;
  }

  try {
    const { data, error } = await flowClient().rpc("vault_reveal", { p_item_id: id, p_code: code ?? "" });
    if (error) {
      console.error("[flow.vault_items] reveal error:", error);
      return null;
    }
    return data;
  } catch (error) {
    console.error("[flow.vault_items] reveal error:", error);
    return null;
  }
}

// An item's access history, newest first. Readable only by the item's managers (RLS); others get [].
export async function listVaultAccessEvents(id) {
  if (!id) {
    return [];
  }

  try {
    const { data, error } = await flowClient()
      .from(ACCESS_EVENTS_TABLE)
      .select("id, user_email, method, outcome, created_at")
      .eq("item_id", id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("[flow.vault_access_events] list error:", error);
      return [];
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      email: row.user_email ?? "",
      method: row.method,
      outcome: row.outcome,
      createdAt: row.created_at,
    }));
  } catch (error) {
    console.error("[flow.vault_access_events] list error:", error);
    return [];
  }
}

// Soft delete. The database destroys the secret, its code and any lockouts at the same time.
export async function softDeleteVaultItem(id, { silent = false } = {}) {
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

    if (error || !data) {
      console.error("[flow.vault_items] delete error:", error);
      return false;
    }

    if (!silent) {
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
