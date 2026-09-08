// Data-access layer for the Assets feature.
//
// All reads/writes target the dedicated `flow` Postgres schema (flow.assets)
// via `.schema("flow")`. Binary content lives in the public `homeboard`
// storage bucket under `project-assets/<project_id>/`; rows persist the
// PUBLIC url (rendered by the UI) plus storage_path (used to clean the
// object up on delete). RLS scopes every row to members of the asset's
// project via the assets.* abilities.
//
// The DB stores snake_case columns; the UI works in camelCase, so this module
// adapts between the two (toRow / normalizeAsset) and always returns view-model
// objects the screen can render directly. Pure data access: validate,
// console.error("[flow.assets]") on failure, return null/false/[] — never
// throw, never toast.

import { createClient } from "@/lib/supabase/client";
import { flowClient } from "@/supabase/components/flow-client";
import {
  DEFAULT_MEDIA_TYPE,
  MEDIA_TYPE_MAP,
  mediaTypeFromName,
} from "./constants";

const ASSETS_TABLE = "assets";
const STORAGE_BUCKET = "homeboard";
const ASSETS_PREFIX = "project-assets";
// Sane client-side guard — uploads above this are rejected before they start.
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

// DB row (snake_case) -> UI view model (camelCase). The metadata bag's keys
// are spread onto the view model so the UI treats them like first-class fields.
export function normalizeAsset(row) {
  if (!row) {
    return null;
  }

  const metadata = row.metadata ?? {};

  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name ?? "",
    mediaType: MEDIA_TYPE_MAP[row.media_type] ? row.media_type : DEFAULT_MEDIA_TYPE,
    sizeBytes: Number(row.size_bytes ?? 0),
    url: row.url ?? "",
    storagePath: row.storage_path ?? null,
    tags: Array.isArray(row.tags) ? row.tags : [],
    owner: row.owner ?? "",
    metadata,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Maps camelCase UI fields to DB columns. Only keys present in `input` are
// emitted, so the same helper serves full creates and partial inline updates
// (e.g. { name } from a rename, { tags } from a tag edit).
function toRow(input) {
  const row = {};

  if ("name" in input) {
    row.name = input.name?.trim();
  }
  if ("mediaType" in input) {
    row.media_type = MEDIA_TYPE_MAP[input.mediaType] ? input.mediaType : DEFAULT_MEDIA_TYPE;
  }
  if ("sizeBytes" in input) {
    row.size_bytes = Number(input.sizeBytes) || 0;
  }
  if ("url" in input) {
    row.url = input.url || null;
  }
  if ("storagePath" in input) {
    row.storage_path = input.storagePath || null;
  }
  if ("tags" in input) {
    row.tags = Array.isArray(input.tags) ? input.tags : [];
  }
  if ("owner" in input) {
    row.owner = input.owner || null;
  }

  return row;
}

export async function listAssets(projectId) {
  if (!projectId) {
    return [];
  }

  try {
    const { data, error } = await flowClient()
      .from(ASSETS_TABLE)
      .select("*")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[flow.assets] list error:", error);
      return [];
    }

    return (data ?? []).map(normalizeAsset);
  } catch (e) {
    console.error("[flow.assets] list error:", e);
    return [];
  }
}

// Honors a caller-supplied id (`input.id`) so an optimistic row and the
// inserted DB row share a UUID — uploadAsset mints the same UUID into both the
// storage path and the row.
export async function createAsset(projectId, input) {
  if (!projectId || !input?.name?.trim()) {
    return null;
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("[flow.assets] user lookup error:", userError);
    }

    const payload = {
      ...toRow(input),
      name: input.name.trim(),
      media_type: MEDIA_TYPE_MAP[input.mediaType] ? input.mediaType : DEFAULT_MEDIA_TYPE,
      size_bytes: Number(input.sizeBytes) || 0,
      tags: Array.isArray(input.tags) ? input.tags : [],
      project_id: projectId,
      created_by: user?.id ?? null,
      owner: input.owner ?? user?.email ?? null,
    };

    const { data, error } = await flowClient()
      .from(ASSETS_TABLE)
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("[flow.assets] create error:", error);
      return null;
    }

    return normalizeAsset(data);
  } catch (e) {
    console.error("[flow.assets] create error:", e);
    return null;
  }
}

// Accepts a camelCase patch (full or partial) and maps it to DB columns.
export async function updateAsset(id, patch) {
  if (!id || !patch) {
    return null;
  }

  const row = toRow(patch);
  if (Object.keys(row).length === 0) {
    return null;
  }

  try {
    const { data, error } = await flowClient()
      .from(ASSETS_TABLE)
      .update(row)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[flow.assets] update error:", error);
      return null;
    }

    return normalizeAsset(data);
  } catch (e) {
    console.error("[flow.assets] update error:", e);
    return null;
  }
}

// Soft delete — preserves the row and lets list queries filter on deleted_at.
export async function softDeleteAsset(id) {
  if (!id) {
    return false;
  }

  try {
    const { error } = await flowClient()
      .from(ASSETS_TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("[flow.assets] delete error:", error);
      return false;
    }

    return true;
  } catch (e) {
    console.error("[flow.assets] delete error:", e);
    return false;
  }
}

// Removes the backing storage object (best effort — missing-object errors are
// expected when the bucket was already cleaned up) then soft-deletes the row.
export async function deleteAsset(id) {
  if (!id) {
    return false;
  }

  try {
    const { data, error } = await flowClient()
      .from(ASSETS_TABLE)
      .select("storage_path")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("[flow.assets] delete lookup error:", error);
    } else if (data?.storage_path) {
      const { error: removeError } = await createClient()
        .storage.from(STORAGE_BUCKET)
        .remove([data.storage_path]);
      // Best effort only: a missing object must not block deleting the row.
      if (removeError) {
        console.warn("[flow.assets] storage cleanup skipped:", removeError.message);
      }
    }
  } catch (e) {
    console.warn("[flow.assets] storage cleanup skipped:", e);
  }

  return softDeleteAsset(id);
}

// Browser-side upload to the shared public bucket, mirroring the
// FileSettingsSidebar pattern (auth check -> upload -> getPublicUrl), then
// persists a flow.assets row with the PUBLIC url. Returns the normalized asset
// or null; per-file progress is reported through opts.onProgress (0-100).
export async function uploadAsset(projectId, file, opts = {}) {
  const onProgress = typeof opts.onProgress === "function" ? opts.onProgress : () => {};

  if (!projectId || !file || file.size <= 0) {
    return null;
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    console.error("[flow.assets] upload rejected (too large):", file.name);
    return null;
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error(userError?.message || "You must be logged in to upload files.");
    }

    // Same UUID names both the storage object and the row id.
    const id = crypto.randomUUID();
    const safeName = file.name.replace(/[^a-zA-Z0-9._ -]+/g, "_").slice(-120) || "file";
    const filePath = `${ASSETS_PREFIX}/${projectId}/${id}-${safeName}`;

    onProgress(10);

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        contentType: file.type || undefined,
      });

    if (uploadError) {
      throw uploadError;
    }

    onProgress(70);

    const {
      data: { publicUrl },
    } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);

    const mimeType = file.type || "";
    const mimeMatch = Object.entries({
      image: "image/",
      video: "video/",
      audio: "audio/",
    }).find(([, prefix]) => mimeType.startsWith(prefix));
    const mediaType = mimeMatch ? mimeMatch[0] : mediaTypeFromName(file.name);

    const created = await createAsset(projectId, {
      id,
      name: file.name,
      mediaType,
      sizeBytes: file.size,
      url: publicUrl,
      storagePath: filePath,
      tags: [],
      owner: user.email ?? null,
    });

    if (!created) {
      // Row write failed — don't leave the object orphaned in the bucket.
      await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
      return null;
    }

    onProgress(100);
    return created;
  } catch (e) {
    console.error("[flow.assets] upload error:", e);
    return null;
  }
}
