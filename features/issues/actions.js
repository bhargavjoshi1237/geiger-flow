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
import { logActivity } from "@/features/activity_logs/actions";
import { formatUpdateMessage } from "@/features/activity_logs/constants";
import {
  DEFAULT_ISSUE_PRIORITY,
  DEFAULT_ISSUE_STATUS,
  DEFAULT_ISSUE_TYPE,
  normalizeIssueStatus,
  priorityLabels,
  statusLabels,
  typeLabels,
} from "./constants";

const ISSUES_TABLE = "issues";
const COMMENTS_TABLE = "issue_comments";

// Readable labels for the activity-log change summary.
const ISSUE_FIELD_LABELS = {
  title: "title",
  description: "description",
  status: "status",
  priority: "priority",
  assignees: "assignees",
  dueDate: "due date",
  archived: "archive state",
};

const ISSUE_VALUE_LABELS = {
  status: (value) => statusLabels[value] ?? value,
  priority: (value) => priorityLabels[value] ?? value,
};

// Attributes stored in the `metadata` jsonb expansion bag rather than dedicated
// columns. Surfaced as first-class fields on the view model and folded back on
// write (see MODULE_CONVENTIONS.md → metadata column). `watchers` (uuid[]),
// `archived`/`archivedAt`, and `attachments` ([{url,name,size,path}]) live here
// so the detail experience grows without a migration.
const METADATA_FIELDS = [
  "type",
  "estimate",
  "startDate",
  "watchers",
  "archived",
  "archivedAt",
  "attachments",
  // Cycle (flow.milestones) and project (flow.objectives) an issue belongs to.
  "cycleId",
  "objectiveId",
];

// Storage for issue attachments: the shared public `homeboard` bucket (same
// auth-check -> upload -> getPublicUrl pattern as flow.assets), namespaced per
// issue. Rows persist only the PUBLIC url (+ name/size/path) inside the
// metadata.attachments bag — no new table or column needed.
const ISSUE_STORAGE_BUCKET = "homeboard";
const ISSUE_ATTACH_PREFIX = "issue-attachments";
// Client-side guard — uploads above this are rejected before they start.
export const MAX_ISSUE_ATTACHMENT_BYTES = 10 * 1024 * 1024;

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
    number: row.number ?? null,
    title: row.title,
    description: row.description ?? "",
    // Legacy rows (open/resolved) predate the workflow migration and are
    // mapped to the current set here (see LEGACY_STATUS_MAP).
    status: normalizeIssueStatus(row.status),
    priority: row.priority,
    labels: row.labels ?? [],
    assignees: row.assignee_ids ?? [],
    dueDate: row.due_date,
    parentId: row.parent_id ?? null,
    type: metadata.type ?? DEFAULT_ISSUE_TYPE,
    estimate: metadata.estimate ?? "",
    startDate: metadata.startDate ?? null,
    watchers: Array.isArray(metadata.watchers) ? metadata.watchers : [],
    archived: metadata.archived === true,
    archivedAt: metadata.archivedAt ?? null,
    cycleId: metadata.cycleId ?? null,
    objectiveId: metadata.objectiveId ?? null,
    attachments: Array.isArray(metadata.attachments)
      ? metadata.attachments
      : [],
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
// `baseMeta` is the row's current metadata bag (read by updateIssue before
// writing): metadata-bag fields absent from `input` are carried over so a
// single-field edit never clobbers watchers/attachments written by another tab.
function toRow(input, baseMeta = {}) {
  const row = {};

  if ("number" in input) {
    if (Number.isInteger(input.number) && input.number > 0) {
      row.number = input.number;
    }
  }
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
  if ("parentId" in input) {
    row.parent_id = input.parentId || null;
  }

  // Fold metadata-bag fields back into the jsonb column. Fields present in
  // `input` win; the rest carry over from `baseMeta` so a partial patch (e.g.
  // { status }) leaves watchers/archived/attachments untouched.
  if (METADATA_FIELDS.some((key) => key in input)) {
    const pick = (key, fallback) =>
      key in input ? (input[key] ?? fallback) : (baseMeta?.[key] ?? fallback);
    const asArray = (value) => (Array.isArray(value) ? value : []);
    row.metadata = {
      type: input.type || baseMeta?.type || DEFAULT_ISSUE_TYPE,
      estimate: pick("estimate", ""),
      startDate: pick("startDate", null),
      watchers: asArray(pick("watchers", [])),
      archived: pick("archived", false) === true,
      archivedAt: pick("archivedAt", null),
      attachments: asArray(pick("attachments", [])),
      cycleId: pick("cycleId", null),
      objectiveId: pick("objectiveId", null),
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
    parent_id: input.parentId || null,
    metadata: {
      type: input.type || DEFAULT_ISSUE_TYPE,
      estimate: input.estimate || "",
      startDate: input.startDate || null,
      watchers: Array.isArray(input.watchers) ? input.watchers : [],
      archived: false,
      archivedAt: null,
      attachments: Array.isArray(input.attachments) ? input.attachments : [],
      cycleId: input.cycleId ?? null,
      objectiveId: input.objectiveId ?? null,
    },
    project_id: projectId,
    created_by: user?.id ?? null,
  };

  // Number assignment: prefer the atomic per-project counter RPC, fall back to
  // MAX(number)+1 when the migration hasn't landed, and retry on a unique
  // conflict if two clients raced for the same number.
  for (let attempt = 0; attempt < 3; attempt++) {
    const number = await allocateIssueNumber(projectId);
    const { data, error } = await flowClient()
      .from(ISSUES_TABLE)
      .insert([{ ...payload, number }])
      .select()
      .single();

    if (!error) {
      void logActivity(projectId, {
        source: "issues",
        message: `Created issue "${data.title}"`,
        detail: {
          id: data.id,
          number: data.number ?? null,
          status: data.status,
          priority: data.priority,
        },
      }).catch(() => {});
      return normalizeIssue(data);
    }

    // Unique conflict on (project_id, number) — retry with a fresh number.
    if (error?.code === "23505" && attempt < 2) {
      continue;
    }

    // The `number` column predates this client (migration not applied yet):
    // retry once without it so creation still works.
    if (error?.code === "42703") {
      const retry = await flowClient()
        .from(ISSUES_TABLE)
        .insert([payload])
        .select()
        .single();
      if (retry.error) {
        console.error("[flow.issues] create error:", retry.error);
        return null;
      }
      void logActivity(projectId, {
        source: "issues",
        message: `Created issue "${retry.data.title}"`,
        detail: {
          id: retry.data.id,
          status: retry.data.status,
          priority: retry.data.priority,
        },
      }).catch(() => {});
      return normalizeIssue(retry.data);
    }

    console.error("[flow.issues] create error:", error);
    return null;
  }

  console.error("[flow.issues] create error: number conflict retries exhausted");
  return null;
}

// Reserves the next per-project issue number via the atomic
// flow.next_issue_number() RPC, falling back to MAX(number)+1 when the
// migration hasn't been applied yet.
async function allocateIssueNumber(projectId) {
  const client = flowClient();

  const { data, error } = await client.rpc("next_issue_number", {
    p_project_id: projectId,
  });
  if (!error && Number.isInteger(data) && data > 0) {
    return data;
  }
  if (error) {
    console.error("[flow.issues] next_issue_number rpc error:", error);
  }

  const { data: peak, error: peakError } = await client
    .from(ISSUES_TABLE)
    .select("number")
    .eq("project_id", projectId)
    .order("number", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (peakError) {
    console.error("[flow.issues] number fallback error:", peakError);
  }
  const max = peak?.number;
  return (Number.isInteger(max) ? max : 0) + 1;
}

export async function getIssueByNumber(projectId, number) {
  const numeric = typeof number === "string" ? Number.parseInt(number, 10) : number;
  if (!projectId || !Number.isInteger(numeric) || numeric <= 0) {
    return null;
  }

  const { data, error } = await flowClient()
    .from(ISSUES_TABLE)
    .select("*")
    .eq("project_id", projectId)
    .eq("number", numeric)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error("[flow.issues] get by number error:", error);
    return null;
  }

  return normalizeIssue(data);
}

// Copies an issue under a fresh id and a newly assigned per-project number.
// The copy re-enters triage as `todo`; the source row is left untouched.
export async function duplicateIssue(id) {
  if (!id) {
    return null;
  }

  const { data: source, error: readError } = await flowClient()
    .from(ISSUES_TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (readError) {
    console.error("[flow.issues] duplicate read error:", readError);
    return null;
  }
  if (!source) {
    return null;
  }

  const copy = normalizeIssue(source);
  if (!copy) {
    return null;
  }

  return createIssue(copy.projectId, {
    title: `${copy.title} (copy)`,
    description: copy.description,
    status: DEFAULT_ISSUE_STATUS,
    priority: copy.priority,
    labels: copy.labels,
    assignees: copy.assignees,
    dueDate: copy.dueDate,
    parentId: copy.parentId,
    type: copy.type,
    estimate: copy.estimate,
    startDate: copy.startDate,
    watchers: [],
    attachments: copy.attachments,
  });
}

// Accepts a camelCase patch (full or partial) and maps it to DB columns.
// Reads the row's current metadata bag first so a partial patch merges into it
// instead of resetting watchers/archived/attachments to defaults.
export async function updateIssue(id, patch) {
  if (!id || !patch) {
    return null;
  }

  let baseMeta = {};
  try {
    const { data: current } = await flowClient()
      .from(ISSUES_TABLE)
      .select("metadata")
      .eq("id", id)
      .maybeSingle();
    if (current?.metadata && typeof current.metadata === "object") {
      baseMeta = current.metadata;
    }
  } catch {
    // Best effort — a missed read just means missing keys fall back to defaults.
  }

  const row = toRow(patch, baseMeta);
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

  void logActivity(data.project_id, {
    source: "issues",
    message: formatUpdateMessage({
      entity: "issue",
      title: data.title,
      patch,
      fields: ISSUE_FIELD_LABELS,
      values: {
        ...ISSUE_VALUE_LABELS,
        assignees: (value) =>
          Array.isArray(value) ? `${value.length} assignee(s)` : String(value ?? ""),
        dueDate: (value) => (value ? value : "none"),
      },
    }),
    detail: { id, patch },
  }).catch(() => {});

  return normalizeIssue(data);
}

// Soft delete — preserves the row and lets list queries filter on deleted_at.
export async function softDeleteIssue(id) {
  if (!id) {
    return false;
  }

  const { data, error } = await flowClient()
    .from(ISSUES_TABLE)
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .select("project_id, title")
    .maybeSingle();

  if (error) {
    console.error("[flow.issues] delete error:", error);
    return false;
  }

  if (data?.project_id) {
    void logActivity(data.project_id, {
      source: "issues",
      level: "warning",
      message: `Deleted issue "${data.title}"`,
      detail: { id },
    }).catch(() => {});
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

// Browser-side upload of one issue attachment to the shared public bucket
// (mirrors the flow.assets auth-check -> upload -> getPublicUrl pattern).
// Returns a pure descriptor { url, name, size, path } the screen persists via
// updateIssue metadata.attachments, or null on failure. Rejects files over
// MAX_ISSUE_ATTACHMENT_BYTES before they start. Never throws, never toasts.
export async function uploadIssueAttachment(issueId, file, opts = {}) {
  const onProgress =
    typeof opts.onProgress === "function" ? opts.onProgress : () => {};

  if (!issueId || !file || file.size <= 0) {
    return null;
  }

  if (file.size > MAX_ISSUE_ATTACHMENT_BYTES) {
    console.error("[flow.issues] attachment rejected (too large):", file.name);
    return null;
  }

  try {
    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error(
        "[flow.issues] attachment upload requires a signed-in user",
      );
      return null;
    }

    const safeName =
      file.name.replace(/[^a-zA-Z0-9._ -]+/g, "_").slice(-120) || "file";
    const filePath = `${ISSUE_ATTACH_PREFIX}/${issueId}/${crypto.randomUUID()}-${safeName}`;

    onProgress(10);

    const { error: uploadError } = await supabase.storage
      .from(ISSUE_STORAGE_BUCKET)
      .upload(filePath, file, { contentType: file.type || undefined });

    if (uploadError) {
      console.error("[flow.issues] attachment upload error:", uploadError);
      return null;
    }

    onProgress(70);

    const {
      data: { publicUrl },
    } = supabase.storage.from(ISSUE_STORAGE_BUCKET).getPublicUrl(filePath);

    onProgress(100);
    return { url: publicUrl, name: file.name, size: file.size, path: filePath };
  } catch (e) {
    console.error("[flow.issues] attachment upload error:", e);
    return null;
  }
}

// Best-effort removal of one attachment object. A missing object must not block
// the metadata update, so failures only warn and still resolve true when the
// path is empty.
export async function removeIssueAttachment(path) {
  if (!path) {
    return true;
  }

  try {
    const { error } = await createClient()
      .storage.from(ISSUE_STORAGE_BUCKET)
      .remove([path]);
    if (error) {
      console.warn("[flow.issues] attachment cleanup skipped:", error.message);
    }
    return true;
  } catch (e) {
    console.warn("[flow.issues] attachment cleanup skipped:", e);
    return true;
  }
}
