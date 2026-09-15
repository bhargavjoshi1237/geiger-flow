// Data-access layer for the Office feature (Recent / Folders / Shared).
//
// All reads/writes target the dedicated `flow` Postgres schema
// (flow.office_files, flow.office_folders, flow.office_file_shares) via
// `.schema("flow")`. RLS is demo-open; lists filter `deleted_at is null` and
// the file trash flag lives in `trashed` (reversible), while permanent
// removal is a soft delete (`deleted_at`) — never a hard `.delete()`.
//
// The DB stores snake_case columns; the UI works in camelCase, so this module
// adapts between the two (toRow / normalize*) and always returns view-model
// objects the screens can render directly. Pure data access: validate,
// console.error("[flow.office]") on failure, return null/false/[] — never
// throw, never toast.

import { createClient } from "@/lib/supabase/client";
import { flowClient } from "@/supabase/components/flow-client";
import { OFFICE_FILE_TYPES } from "@/lib/office/office-file-meta";

const FILES_TABLE = "office_files";
const FOLDERS_TABLE = "office_folders";
const SHARES_TABLE = "office_file_shares";

function validFileType(type) {
  return type && OFFICE_FILE_TYPES[type] ? type : "document";
}

// DB row (snake_case) -> UI view model (camelCase).
export function normalizeOfficeFile(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    projectId: row.project_id,
    userId: row.user_id ?? null,
    folderId: row.folder_id ?? null,
    type: row.type ?? "document",
    name: row.name ?? "",
    content: row.content ?? {},
    starred: row.starred === true,
    trashed: row.trashed === true,
    metadata: row.metadata ?? {},
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function normalizeOfficeFolder(row, fileCount = 0) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    projectId: row.project_id,
    userId: row.user_id ?? null,
    name: row.name ?? "",
    color: row.color ?? null,
    fileCount,
    metadata: row.metadata ?? {},
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Maps camelCase UI fields to DB columns. Only keys present in `input` are
// emitted, so the same helpers serve full creates and partial inline updates
// (e.g. { starred }, { name }, { folderId }).
function fileToRow(input) {
  const row = {};

  if ("type" in input) {
    row.type = validFileType(input.type);
  }
  if ("name" in input) {
    row.name = input.name?.trim();
  }
  if ("content" in input) {
    row.content = input.content && typeof input.content === "object" ? input.content : {};
  }
  if ("starred" in input) {
    row.starred = input.starred === true;
  }
  if ("trashed" in input) {
    row.trashed = input.trashed === true;
  }
  if ("folderId" in input) {
    row.folder_id = input.folderId || null;
  }

  return row;
}

function folderToRow(input) {
  const row = {};

  if ("name" in input) {
    row.name = input.name?.trim();
  }
  if ("color" in input) {
    row.color = input.color || null;
  }

  return row;
}

async function stampUser() {
  try {
    const {
      data: { user },
    } = await createClient().auth.getUser();
    return user?.id ?? null;
  } catch (error) {
    console.error("[flow.office] user lookup error:", error);
    return null;
  }
}

// --- Files ---------------------------------------------------------------

export async function listOfficeFiles(projectId, { type = "all", trashed = false } = {}) {
  if (!projectId) {
    return [];
  }

  try {
    let query = flowClient()
      .from(FILES_TABLE)
      .select("*")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .eq("trashed", trashed)
      .order("updated_at", { ascending: false });

    if (type !== "all") {
      query = query.eq("type", type);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[flow.office] files list error:", error);
      return [];
    }

    return (data ?? []).map(normalizeOfficeFile);
  } catch (error) {
    console.error("[flow.office] files list error:", error);
    return [];
  }
}

export async function listFolderFiles(projectId, folderId) {
  if (!projectId || !folderId) {
    return [];
  }

  try {
    const { data, error } = await flowClient()
      .from(FILES_TABLE)
      .select("*")
      .eq("project_id", projectId)
      .eq("folder_id", folderId)
      .is("deleted_at", null)
      .eq("trashed", false)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("[flow.office] folder files list error:", error);
      return [];
    }

    return (data ?? []).map(normalizeOfficeFile);
  } catch (error) {
    console.error("[flow.office] folder files list error:", error);
    return [];
  }
}

// Files not yet in the folder (for the add-to-folder picker).
export async function listFilesOutsideFolder(projectId, folderId, excludeIds = []) {
  if (!projectId) {
    return [];
  }

  try {
    const { data, error } = await flowClient()
      .from(FILES_TABLE)
      .select("id, type, name, folder_id")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .eq("trashed", false)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("[flow.office] files list error:", error);
      return [];
    }

    const excluded = new Set([...(excludeIds ?? []), folderId]);
    return (data ?? [])
      .map(normalizeOfficeFile)
      .filter((file) => !excluded.has(file.id) && file.folderId !== folderId);
  } catch (error) {
    console.error("[flow.office] files list error:", error);
    return [];
  }
}

export async function createOfficeFile(projectId, input) {
  if (!projectId || !validFileType(input?.type)) {
    return null;
  }

  try {
    const userId = await stampUser();
    const meta = OFFICE_FILE_TYPES[input.type];

    const payload = {
      ...fileToRow(input),
      type: validFileType(input.type),
      name: input.name?.trim() || meta.defaultName,
      content: input.content ?? {},
      project_id: projectId,
      user_id: userId,
      created_by: userId,
    };

    // Honor a caller-supplied id so an optimistic row and the inserted row
    // share a UUID.
    if (input.id) {
      payload.id = input.id;
    }

    const { data, error } = await flowClient()
      .from(FILES_TABLE)
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("[flow.office] file create error:", error);
      return null;
    }

    return normalizeOfficeFile(data);
  } catch (error) {
    console.error("[flow.office] file create error:", error);
    return null;
  }
}

export async function updateOfficeFile(id, patch) {
  if (!id || !patch) {
    return null;
  }

  const row = fileToRow(patch);
  if (Object.keys(row).length === 0) {
    return null;
  }

  try {
    const { data, error } = await flowClient()
      .from(FILES_TABLE)
      .update(row)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[flow.office] file update error:", error);
      return null;
    }

    return normalizeOfficeFile(data);
  } catch (error) {
    console.error("[flow.office] file update error:", error);
    return null;
  }
}

// Soft delete — preserves the row and lets list queries filter on deleted_at.
export async function softDeleteOfficeFile(id) {
  if (!id) {
    return false;
  }

  try {
    const { error } = await flowClient()
      .from(FILES_TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("[flow.office] file delete error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[flow.office] file delete error:", error);
    return false;
  }
}

// --- Folders --------------------------------------------------------------

export async function listOfficeFolders(projectId) {
  if (!projectId) {
    return [];
  }

  try {
    const { data, error } = await flowClient()
      .from(FOLDERS_TABLE)
      .select("*")
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("[flow.office] folders list error:", error);
      return [];
    }

    const folders = data ?? [];
    const counts = await countFolderFiles(
      folders.map((folder) => folder.id),
    );

    return folders.map((folder) =>
      normalizeOfficeFolder(folder, counts[folder.id] || 0),
    );
  } catch (error) {
    console.error("[flow.office] folders list error:", error);
    return [];
  }
}

async function countFolderFiles(folderIds) {
  const counts = {};
  if (folderIds.length === 0) {
    return counts;
  }

  try {
    const { data, error } = await flowClient()
      .from(FILES_TABLE)
      .select("folder_id")
      .in("folder_id", folderIds)
      .is("deleted_at", null)
      .eq("trashed", false);

    if (error) {
      console.error("[flow.office] folder counts error:", error);
      return counts;
    }

    for (const row of data ?? []) {
      counts[row.folder_id] = (counts[row.folder_id] || 0) + 1;
    }
  } catch (error) {
    console.error("[flow.office] folder counts error:", error);
  }

  return counts;
}

export async function createOfficeFolder(projectId, input) {
  if (!projectId || !input?.name?.trim()) {
    return null;
  }

  try {
    const userId = await stampUser();

    const payload = {
      ...folderToRow(input),
      name: input.name.trim(),
      project_id: projectId,
      user_id: userId,
      created_by: userId,
    };

    if (input.id) {
      payload.id = input.id;
    }

    const { data, error } = await flowClient()
      .from(FOLDERS_TABLE)
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("[flow.office] folder create error:", error);
      return null;
    }

    return normalizeOfficeFolder(data, 0);
  } catch (error) {
    console.error("[flow.office] folder create error:", error);
    return null;
  }
}

export async function updateOfficeFolder(id, patch) {
  if (!id || !patch) {
    return null;
  }

  const row = folderToRow(patch);
  if (Object.keys(row).length === 0) {
    return null;
  }

  try {
    const { data, error } = await flowClient()
      .from(FOLDERS_TABLE)
      .update(row)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[flow.office] folder update error:", error);
      return null;
    }

    return normalizeOfficeFolder(data);
  } catch (error) {
    console.error("[flow.office] folder update error:", error);
    return null;
  }
}

// Soft delete — files inside are kept (their folder_id is left intact).
export async function softDeleteOfficeFolder(id) {
  if (!id) {
    return false;
  }

  try {
    const { error } = await flowClient()
      .from(FOLDERS_TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("[flow.office] folder delete error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[flow.office] folder delete error:", error);
    return false;
  }
}

// --- Shares ---------------------------------------------------------------

// Files shared with the project, newest share first. Each entry is the file
// view model plus `_sharedAt` / `_sharedBy` presentation fields.
export async function listSharedOfficeFiles(projectId, { type = "all" } = {}) {
  if (!projectId) {
    return [];
  }

  try {
    const { data, error } = await flowClient()
      .from(SHARES_TABLE)
      .select(
        "id, shared_by, created_at, file:office_files!inner(id, type, name, starred, trashed, created_at, updated_at, user_id)",
      )
      .eq("project_id", projectId)
      .is("deleted_at", null)
      .eq("office_files.trashed", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[flow.office] shares list error:", error);
      return [];
    }

    return (data ?? [])
      .filter((row) => row.file)
      .map((row) => ({
        ...normalizeOfficeFile(row.file),
        _sharedAt: row.created_at,
        _sharedBy: row.shared_by,
      }))
      .filter((file) => type === "all" || file.type === type);
  } catch (error) {
    console.error("[flow.office] shares list error:", error);
    return [];
  }
}
