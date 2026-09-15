// Storage helpers for Planning node uploads (image / file nodes).
//
// The single place that touches the shared public `homeboard` bucket for the
// planning canvas — screens and sidebars must use these instead of raw
// `storage.from(...)` calls. Mirrors the flow.assets pattern (auth check ->
// upload -> getPublicUrl) and persists nothing itself: callers write the
// returned PUBLIC url into the node's data, which the board persists via
// savePlanningBoard. Pure storage access: validate, console.error on failure,
// return null/true — never throw, never toast.

import { createClient } from "@/lib/supabase/client";

const PLANNING_STORAGE_BUCKET = "homeboard";
const PLANNING_PREFIX = "planning";

// Node-scoped object prefix. User-scoped (like flow.assets) so storage RLS
// keeps writes creator-only.
function nodePrefix(userId, nodeId) {
  return `${PLANNING_PREFIX}/${userId}/${nodeId}`;
}

function safeName(name, fallback = "file") {
  const cleaned = String(name ?? "")
    .replace(/[^a-zA-Z0-9._ -]+/g, "_")
    .slice(-120);
  return cleaned || fallback;
}

export function planningPublicUrl(path) {
  if (!path) {
    return null;
  }

  try {
    const {
      data: { publicUrl },
    } = createClient().storage.from(PLANNING_STORAGE_BUCKET).getPublicUrl(path);
    return publicUrl ?? null;
  } catch (error) {
    console.error("[flow.planning] public url error:", error);
    return null;
  }
}

// Removes every object previously uploaded for a node (best effort — a
// missing object must not block the replacement upload).
export async function removePlanningNodeFiles(nodeId) {
  if (!nodeId) {
    return true;
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return true;
    }

    const prefix = nodePrefix(user.id, nodeId);
    const { data: existing } = await supabase.storage
      .from(PLANNING_STORAGE_BUCKET)
      .list(prefix);

    if (existing && existing.length > 0) {
      const { error } = await supabase.storage
        .from(PLANNING_STORAGE_BUCKET)
        .remove(existing.map((file) => `${prefix}/${file.name}`));
      if (error) {
        console.warn("[flow.planning] storage cleanup skipped:", error.message);
      }
    }

    return true;
  } catch (error) {
    console.warn("[flow.planning] storage cleanup skipped:", error);
    return true;
  }
}

// Uploads one File/Blob for a node and returns the cache-busted PUBLIC url,
// or null on failure. Clears the node's previous objects first so a replace
// never orphans files in the bucket.
export async function uploadPlanningNodeFile(nodeId, file, opts = {}) {
  if (!nodeId || !file || file.size <= 0) {
    return null;
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("[flow.planning] upload requires a signed-in user");
      return null;
    }

    await removePlanningNodeFiles(nodeId);

    const name =
      file instanceof File ? file.name : (opts.name ?? "upload");
    const filePath = `${nodePrefix(user.id, nodeId)}/${safeName(name)}`;

    const { error: uploadError } = await supabase.storage
      .from(PLANNING_STORAGE_BUCKET)
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type || opts.contentType || undefined,
      });

    if (uploadError) {
      console.error("[flow.planning] upload error:", uploadError);
      return null;
    }

    const publicUrl = planningPublicUrl(filePath);
    return publicUrl ? `${publicUrl}?t=${Date.now()}` : null;
  } catch (error) {
    console.error("[flow.planning] upload error:", error);
    return null;
  }
}

// Uploads one Blob to an exact path under the node's prefix (e.g. the
// high-res / thumbnail pair an image node keeps) and returns the PUBLIC url,
// or null on failure.
export async function uploadPlanningNodeBlob(nodeId, path, blob, contentType) {
  if (!nodeId || !path || !blob) {
    return null;
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("[flow.planning] upload requires a signed-in user");
      return null;
    }

    const filePath = `${nodePrefix(user.id, nodeId)}/${path}`;

    const { error: uploadError } = await supabase.storage
      .from(PLANNING_STORAGE_BUCKET)
      .upload(filePath, blob, {
        upsert: true,
        contentType: contentType || blob.type || undefined,
      });

    if (uploadError) {
      console.error("[flow.planning] upload error:", uploadError);
      return null;
    }

    return planningPublicUrl(filePath);
  } catch (error) {
    console.error("[flow.planning] upload error:", error);
    return null;
  }
}
