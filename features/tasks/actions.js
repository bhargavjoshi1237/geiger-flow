// Data-access layer for the Tasks feature.
//
// Reads/writes target the dedicated `flow` schema (flow.tasks, flow.task_comments)
// via the shared flowClient helper. RLS scopes every row to members of the task's
// project organization. The DB stores snake_case columns; the UI works in
// camelCase, so this module adapts between the two (toRow / normalizeTask) and
// always returns view-model objects the screen can render directly.

import { createClient } from "@/lib/supabase/client";
import { flowClient } from "@/supabase/components/flow-client";
import {
  DEFAULT_TASK_PRIORITY,
  DEFAULT_TASK_STATUS,
  DEFAULT_TASK_TYPE,
} from "./constants";

const TASKS_TABLE = "tasks";
const COMMENTS_TABLE = "task_comments";

// DB row (snake_case) -> UI view model (camelCase).
export function normalizeTask(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    description: row.description ?? "",
    status: row.status,
    priority: row.priority,
    stage: row.stage ?? "",
    type: row.type,
    progress: Number(row.progress) || 0,
    labels: row.labels ?? [],
    assignees: row.assignee_ids ?? [],
    parentLink: row.parent_link ?? "",
    dueDate: row.due_date,
    startDate: row.start_date,
    deadlineTracking: row.deadline_tracking,
    metadata: row.metadata ?? {},
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function normalizeComment(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    taskId: row.task_id,
    authorId: row.author_id,
    body: row.body,
    attachments: row.attachments ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// UI form payload (camelCase) -> DB columns (snake_case). Only keys present in
// `input` are emitted, so the same helper serves full creates and partial inline
// updates (e.g. { status } from a quick status change).
function toRow(input) {
  const row = {};

  if ("title" in input) {
    row.title = input.title?.trim();
  }
  if ("description" in input) {
    row.description = input.description?.trim() || null;
  }
  if ("status" in input) {
    row.status = input.status || DEFAULT_TASK_STATUS;
  }
  if ("priority" in input) {
    row.priority = input.priority || DEFAULT_TASK_PRIORITY;
  }
  if ("stage" in input) {
    row.stage = input.stage || null;
  }
  if ("type" in input) {
    row.type = input.type || DEFAULT_TASK_TYPE;
  }
  if ("progress" in input) {
    row.progress = typeof input.progress === "number" ? input.progress : 0;
  }
  if ("labels" in input) {
    row.labels = Array.isArray(input.labels) ? input.labels : [];
  }
  if ("assignees" in input) {
    row.assignee_ids = Array.isArray(input.assignees) ? input.assignees : [];
  }
  if ("parentLink" in input) {
    row.parent_link = input.parentLink || null;
  }
  if ("startDate" in input) {
    row.start_date = input.startDate || null;
  }
  if ("dueDate" in input) {
    row.due_date = input.dueDate || null;
  }

  return row;
}

export async function listTasks(projectId) {
  if (!projectId) {
    return [];
  }

  const { data, error } = await flowClient()
    .from(TASKS_TABLE)
    .select("*")
    .eq("project_id", projectId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[flow.tasks] list error:", error);
    return [];
  }

  return (data ?? []).map(normalizeTask);
}

export async function createTask(projectId, input) {
  if (!projectId || !input?.title?.trim()) {
    return null;
  }

  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("[flow.tasks] user lookup error:", userError);
  }

  const payload = {
    ...toRow(input),
    status: input.status || DEFAULT_TASK_STATUS,
    priority: input.priority || DEFAULT_TASK_PRIORITY,
    type: input.type || DEFAULT_TASK_TYPE,
    project_id: projectId,
    created_by: user?.id ?? null,
  };

  const { data, error } = await flowClient()
    .from(TASKS_TABLE)
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("[flow.tasks] create error:", error);
    return null;
  }

  return normalizeTask(data);
}

// Accepts a camelCase patch (full or partial) and maps it to DB columns.
export async function updateTask(id, patch) {
  if (!id || !patch) {
    return null;
  }

  const row = toRow(patch);
  if (Object.keys(row).length === 0) {
    return null;
  }

  const { data, error } = await flowClient()
    .from(TASKS_TABLE)
    .update(row)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[flow.tasks] update error:", error);
    return null;
  }

  return normalizeTask(data);
}

// Soft delete — preserves the row and lets list queries filter on deleted_at.
export async function softDeleteTask(id) {
  if (!id) {
    return false;
  }

  const { error } = await flowClient()
    .from(TASKS_TABLE)
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("[flow.tasks] delete error:", error);
    return false;
  }

  return true;
}

export async function listTaskComments(taskId) {
  if (!taskId) {
    return [];
  }

  const { data, error } = await flowClient()
    .from(COMMENTS_TABLE)
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[flow.task_comments] list error:", error);
    return [];
  }

  return (data ?? []).map(normalizeComment);
}

export async function addTaskComment(taskId, body) {
  if (!taskId || !body?.trim()) {
    return null;
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const payload = {
    task_id: taskId,
    author_id: user?.id ?? null,
    body: body.trim(),
  };

  const { data, error } = await flowClient()
    .from(COMMENTS_TABLE)
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("[flow.task_comments] create error:", error);
    return null;
  }

  return normalizeComment(data);
}

export async function updateTaskComment(id, body) {
  if (!id || !body?.trim()) {
    return null;
  }

  const { data, error } = await flowClient()
    .from(COMMENTS_TABLE)
    .update({ body: body.trim() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[flow.task_comments] update error:", error);
    return null;
  }

  return normalizeComment(data);
}

// Hard delete — task_comments has no deleted_at column.
export async function deleteTaskComment(id) {
  if (!id) {
    return false;
  }

  const { error } = await flowClient()
    .from(COMMENTS_TABLE)
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[flow.task_comments] delete error:", error);
    return false;
  }

  return true;
}
