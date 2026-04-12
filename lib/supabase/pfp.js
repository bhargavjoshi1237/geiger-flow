import { createClient } from "./client";
import { getUserCached } from "./user";

/**
 * Build a deterministic public URL for a user's latest pfp.
 * No API call — just constructs the URL from the known storage structure:
 *   bucket: pfp
 *   folder:  {userId}/
 *   latest file is the one with the highest lexicographic filename.
 * For most cases the *highest* ISO-timestamp filename is the latest.
 *
 * @param {string} userId
 * @param {object} [opts]
 * @param {number} [opts.width]
 * @param {number} [opts.height]
 * @returns {string|null}
 */
export function buildPfpUrl(userId, opts = {}) {
  if (!userId) return null;
  const supabase = createClient();
  const url = supabase.storage.from("pfp").getPublicUrl(`${userId}/`);
  const base = url.data?.publicUrl ?? url.data?.url ?? null;
  if (!base) return null;
  const SEP = base.endsWith("/") ? "" : "/";
  const transform = [];
  if (opts.width) transform.push(`width=${opts.width}`);
  if (opts.height) transform.push(`height=${opts.height}`);
  const qs = transform.length ? `?${transform.join("&")}` : "";
  // Caller appends the latest filename; this returns the folder URL.
  return `${base}${qs}`;
}

export async function getPfp(options = {}) {
  const supabase = createClient();

  let userId = options.userId;
  if (!userId) {
    const cached = getUserCached();
    if (!cached) return null;
    userId = cached.id;
  }

  const folder = `${userId}/`;
  const bucketId = "pfp";

  const { data, error } = await supabase.storage
    .from(bucketId)
    .list(userId, {
      sortBy: { column: "name", order: "desc" },
      limit: 1,
    });

  if (error || !data || data.length === 0) return null;

  // Pick the latest file (first after descending sort)
  const latestFile = data[0];
  const filePath = `${folder}${latestFile.name}`;

  // Build image transformations if requested
  const transform = {};
  if (options.width) transform.width = options.width;
  if (options.height) transform.height = options.height;

  const { data: urlData } = supabase.storage
    .from(bucketId)
    .getPublicUrl(filePath, options.width ? { transform } : undefined);

  // getPublicUrl returns { publicUrl } in v2
  return urlData?.publicUrl ?? urlData?.url ?? null;
}

/**
 * Upload a new profile picture for the current user.
 *
 * @param {File|string} file          File object or raw data URI / Blob.
 * @param {object}      [options]
 * @param {string}      [options.userId]   Override the current user's UUID.
 * @param {string}      [options.contentType]  MIME type (e.g. "image/png").
 * @returns {Promise<{ path: string } | null>}
 */
export async function uploadPfp(file, options = {}) {
  const supabase = createClient();

  let userId = options.userId;
  if (!userId) {
    const cached = getUserCached();
    if (!cached) return null;
    userId = cached.id;
  }

  // Derive a unique filename from the current timestamp
  const ext = options.contentType?.split("/")[1] || "png";
  const timestamp = new Date().toISOString().replace(/[.:]/g, "-");
  const fileName = `${timestamp}.${ext}`;
  const filePath = `${userId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from("pfp")
    .upload(filePath, file, {
      cacheControl: "0",
      upsert: false,
      contentType: options.contentType,
    });

  if (error) return null;
  return data;
}

/**
 * Delete a specific profile picture (or all pictures) for a user.
 *
 * @param {string[]}   paths        Array of full storage paths, e.g. ["uuid/file.png"].
 * @returns {Promise<boolean>}  Whether deletion succeeded.
 */
export async function deletePfps(paths) {
  const supabase = createClient();
  const { error } = await supabase.storage.from("pfp").remove(paths);
  return !error;
}
