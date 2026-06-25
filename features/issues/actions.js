// Data-access layer for the Issues feature.
//
// All reads/writes target the dedicated `flow` Postgres schema
// (flow.issues, flow.issue_comments) via `.schema("flow")`. The schema must be
// added to Settings -> API -> Exposed schemas in Supabase for these calls to
// resolve. RLS scopes every row to members of the issue's project organization,
// so no extra filtering is required here.
//
// The DB stores snake_case columns; the UI works in camelCase, so this module
// adapts between the two (toRow / normalizeIssue) and always returns view-model
// objects the screen can render directly.

import { createClient } from "@/lib/supabase/client";
import { flowClient } from "@/supabase/components/flow-client";
import {
  DEFAULT_ISSUE_PRIORITY,
  DEFAULT_ISSUE_STATUS,
  DEFAULT_ISSUE_TYPE,
} from "./constants";

const ISSUES_TABLE = "issues";
const COMMENTS_TABLE = "issue_comments";

// Attributes stored in the `metadata` jsonb expansion bag rather than dedicated
// columns. Surfaced as first-class fields on the view model and folded back on
// write (see MODULE_CONVENTIONS.md → metadata column).
const METADATA_FIELDS = ["type", "estimate", "startDate"];

// DB row (snake_case) -> UI view model (camelCase). The metadata bag's keys are
// spread onto the view model so the UI treats them like first-class fields.
export function normalizeIssue(row) {
  if (!row) {
    return null;
  }

  const metadata = row.metadata ?? {};

  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    description: row.description ?? "",
    status: row.status,
    priority: row.priority,
    labels: row.labels ?? [],
    assignees: row.assignee_ids ?? [],
    dueDate: row.due_date,
    type: metadata.type ?? DEFAULT_ISSUE_TYPE,
    estimate: metadata.estimate ?? "",
    startDate: metadata.startDate ?? null,
    metadata,
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
    issueId: row.issue_id,
    authorId: row.author_id,
    body: row.body,
    attachments: row.attachments ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Maps the camelCase UI fields the issue forms collect to DB columns. Only keys
// present in `input` are emitted, so the same helper serves full creates and
// partial inline updates (e.g. { status } from a quick status change).
function toRow(input) {
  const row = {};

  if ("title" in input) {
    row.title = input.title?.trim();
  }
  if ("description" in input) {
    row.description = input.description?.trim() || null;
  }
  if ("status" in input) {
    row.status = input.status || DEFAULT_ISSUE_STATUS;
  }
  if ("priority" in input) {
    row.priority = input.priority || DEFAULT_ISSUE_PRIORITY;
  }
  if ("labels" in input) {
    row.labels = Array.isArray(input.labels) ? input.labels : [];
  }
  if ("assignees" in input) {
    row.assignee_ids = Array.isArray(input.assignees) ? input.assignees : [];
  }
  if ("dueDate" in input) {
    row.due_date = input.dueDate || null;
  }

  // Fold metadata-bag fields back into the jsonb column. The issue dialog always
  // sends the full set together, so building a fresh object is safe; inline
  // column edits omit these keys and leave the bag untouched.
  if (METADATA_FIELDS.some((key) => key in input)) {
    row.metadata = {
      type: input.type || DEFAULT_ISSUE_TYPE,
      estimate: input.estimate || "",
      startDate: input.startDate || null,
    };
  }

  return row;
}

export async function listIssues(projectId) {
  if (!projectId) {
    return [];
  }

  const { data, error } = await flowClient()
    .from(ISSUES_TABLE)
    .select("*")
    .eq("project_id", projectId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[flow.issues] list error:", error);
    return [];
  }

  return (data ?? []).map(normalizeIssue);
}

export async function createIssue(projectId, input) {
  if (!projectId || !input?.title?.trim()) {
    return null;
  }

  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("[flow.issues] user lookup error:", userError);
  }

  const payload = {
    title: input.title.trim(),
    description: input.description?.trim() || null,
    status: input.status || DEFAULT_ISSUE_STATUS,
    priority: input.priority || DEFAULT_ISSUE_PRIORITY,
    labels: Array.isArray(input.labels) ? input.labels : [],
    assignee_ids: Array.isArray(input.assignees) ? input.assignees : [],
    due_date: input.dueDate || null,
    metadata: {
      type: input.type || DEFAULT_ISSUE_TYPE,
      estimate: input.estimate || "",
      startDate: input.startDate || null,
    },
    project_id: projectId,
    created_by: user?.id ?? null,
  };

  const { data, error } = await flowClient()
    .from(ISSUES_TABLE)
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("[flow.issues] create error:", error);
    return null;
  }

  return normalizeIssue(data);
}

// Accepts a camelCase patch (full or partial) and maps it to DB columns.
export async function updateIssue(id, patch) {
  if (!id || !patch) {
    return null;
  }

  const row = toRow(patch);
  if (Object.keys(row).length === 0) {
    return null;
  }

  const { data, error } = await flowClient()
    .from(ISSUES_TABLE)
    .update(row)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[flow.issues] update error:", error);
    return null;
  }

  return normalizeIssue(data);
}

// Soft delete — preserves the row and lets list queries filter on deleted_at.
export async function softDeleteIssue(id) {
  if (!id) {
    return false;
  }

  const { error } = await flowClient()
    .from(ISSUES_TABLE)
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("[flow.issues] delete error:", error);
    return false;
  }

  return true;
}

export async function listIssueComments(issueId) {
  if (!issueId) {
    return [];
  }

  const { data, error } = await flowClient()
    .from(COMMENTS_TABLE)
    .select("*")
    .eq("issue_id", issueId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[flow.issue_comments] list error:", error);
    return [];
  }

  return (data ?? []).map(normalizeComment);
}

export async function addIssueComment(issueId, body) {
  if (!issueId || !body?.trim()) {
    return null;
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const payload = {
    issue_id: issueId,
    author_id: user?.id ?? null,
    body: body.trim(),
  };

  const { data, error } = await flowClient()
    .from(COMMENTS_TABLE)
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("[flow.issue_comments] create error:", error);
    return null;
  }

  return normalizeComment(data);
}

export async function updateIssueComment(id, body) {
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
    console.error("[flow.issue_comments] update error:", error);
    return null;
  }

  return normalizeComment(data);
}

// Hard delete — issue_comments has no deleted_at column.
export async function deleteIssueComment(id) {
  if (!id) {
    return false;
  }

  const { error } = await flowClient()
    .from(COMMENTS_TABLE)
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[flow.issue_comments] delete error:", error);
    return false;
  }

  return true;
}
