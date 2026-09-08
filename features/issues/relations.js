// Data-access layer for issue hierarchy (parent_id) + directed issue links.
//
// Reads/writes target `flow.issues.parent_id` and `flow.issue_links` via the
// shared flowClient() helper (see supabase/components/flow-client.js). RLS
// scopes every row to members of the link's project, so no extra filtering is
// required here. The DB stores snake_case columns; the UI works in camelCase.
//
// Link model (directed):
//   blocks    — source blocks target (target's "blocked by" list is derived)
//   related   — symmetric association (stored once, read in both directions)
//   duplicate — source is a duplicate of target
// The UI-facing "blocked_by" kind is normalized here: adding a "blocked_by"
// link from A to B stores a "blocks" link from B to A.
//
// Pure data access: validate, `console.error` on failure, return
// `null`/`false`/`[]`. Never throw, never toast — the screen owns UX.

import { createClient } from "@/lib/supabase/client";
import { flowClient } from "@/supabase/components/flow-client";
import { logActivity } from "@/features/activity_logs/actions";
import { normalizeIssue } from "./actions";

const ISSUES_TABLE = "issues";
const LINKS_TABLE = "issue_links";

// Ancestor-walk cap for the parent cycle guard.
const MAX_ANCESTOR_DEPTH = 20;

export const ISSUE_LINK_KINDS = ["blocks", "related", "duplicate"];

// Symmetric kinds read the same in both directions.
const SYMMETRIC_KINDS = new Set(["related", "duplicate"]);

// DB row (snake_case) -> UI view model (camelCase).
export function normalizeIssueLink(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    projectId: row.project_id,
    sourceId: row.source_id,
    targetId: row.target_id,
    kind: row.kind ?? "related",
    createdBy: row.created_by ?? null,
    createdAt: row.created_at,
  };
}

// Normalize a UI-supplied kind. "blocked_by" from A to B is the same edge as
// "blocks" from B to A, so callers pass (sourceId, targetId, kind) through
// here and use the returned directed triple for the write.
function directLink(sourceId, targetId, kind) {
  if (kind === "blocked_by") {
    return { sourceId: targetId, targetId: sourceId, kind: "blocks" };
  }
  return { sourceId, targetId, kind };
}

// Fetch a live (non-deleted) issue's identity columns for guards + logging.
async function getLiveIssue(id) {
  const { data, error } = await flowClient()
    .from(ISSUES_TABLE)
    .select("id, project_id, parent_id, title")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error("[flow.issues] hierarchy lookup error:", error);
    return null;
  }

  return data;
}

// Walk the ancestor chain of `startParentId`. Returns the ancestor id list, or
// `null` when the walk itself fails. Used by setParent for cycle detection.
async function listAncestorIds(startParentId) {
  const ancestors = [];
  let cursor = startParentId;

  for (let depth = 0; depth < MAX_ANCESTOR_DEPTH && cursor; depth += 1) {
    ancestors.push(cursor);

    const { data, error } = await flowClient()
      .from(ISSUES_TABLE)
      .select("parent_id")
      .eq("id", cursor)
      .is("deleted_at", null)
      .maybeSingle();

    if (error || !data) {
      if (error) {
        console.error("[flow.issues] ancestor walk error:", error);
      }
      break;
    }

    cursor = data.parent_id;
  }

  return ancestors;
}

// Live sub-issues of a parent, newest last (stable creation order).
export async function listSubIssues(parentId) {
  if (!parentId) {
    return [];
  }

  const { data, error } = await flowClient()
    .from(ISSUES_TABLE)
    .select("*")
    .eq("parent_id", parentId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[flow.issues] list sub-issues error:", error);
    return [];
  }

  return (data ?? []).map(normalizeIssue);
}

// Set (or clear, with null) an issue's parent. Rejects self-parenting and
// cycles — assigning a descendant as the parent returns null and writes
// nothing. Cross-project parenting is rejected as well.
export async function setParent(id, parentId) {
  if (!id) {
    return null;
  }

  const nextParentId = parentId || null;

  const current = await getLiveIssue(id);
  if (!current) {
    return null;
  }

  if (nextParentId) {
    if (nextParentId === id) {
      console.error("[flow.issues] setParent rejected: issue cannot parent itself");
      return null;
    }

    const parent = await getLiveIssue(nextParentId);
    if (!parent) {
      return null;
    }

    if (parent.project_id !== current.project_id) {
      console.error("[flow.issues] setParent rejected: cross-project parent");
      return null;
    }

    const ancestors = await listAncestorIds(nextParentId);
    if (ancestors.includes(id)) {
      console.error("[flow.issues] setParent rejected: cycle detected");
      return null;
    }
  }

  const { data, error } = await flowClient()
    .from(ISSUES_TABLE)
    .update({ parent_id: nextParentId })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[flow.issues] setParent error:", error);
    return null;
  }

  void logActivity(data.project_id, {
    source: "issues",
    message: nextParentId
      ? `Set parent of issue "${data.title}"`
      : `Removed parent of issue "${data.title}"`,
    detail: { id, parentId: nextParentId },
  }).catch(() => {});

  return normalizeIssue(data);
}

// Every link touching an issue, either as source or as target.
export async function listIssueLinks(issueId) {
  if (!issueId) {
    return [];
  }

  const { data, error } = await flowClient()
    .from(LINKS_TABLE)
    .select("*")
    .or(`source_id.eq.${issueId},target_id.eq.${issueId}`)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[flow.issue_links] list error:", error);
    return [];
  }

  return (data ?? []).map(normalizeIssueLink);
}

// Every link in a project — one query for list-level badges (e.g. "blocked").
export async function listProjectIssueLinks(projectId) {
  if (!projectId) {
    return [];
  }

  const { data, error } = await flowClient()
    .from(LINKS_TABLE)
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[flow.issue_links] list project error:", error);
    return [];
  }

  return (data ?? []).map(normalizeIssueLink);
}

// Create a directed link. `kind` accepts blocks/blocked_by/related/duplicate.
// Self-links and duplicates are rejected (null, no write).
export async function addIssueLink(sourceId, targetId, kind) {
  const directed = directLink(sourceId, targetId, kind);

  if (!directed.sourceId || !directed.targetId) {
    return null;
  }

  if (!ISSUE_LINK_KINDS.includes(directed.kind)) {
    console.error(`[flow.issue_links] add rejected: unknown kind "${kind}"`);
    return null;
  }

  if (directed.sourceId === directed.targetId) {
    console.error("[flow.issue_links] add rejected: self-link");
    return null;
  }

  const source = await getLiveIssue(directed.sourceId);
  const target = await getLiveIssue(directed.targetId);
  if (!source || !target) {
    return null;
  }

  if (source.project_id !== target.project_id) {
    console.error("[flow.issue_links] add rejected: cross-project link");
    return null;
  }

  // Duplicate guard: exact (source, target, kind) always rejected; symmetric
  // kinds also reject the reversed pair so related/duplicate store once.
  let existingQuery = flowClient()
    .from(LINKS_TABLE)
    .select("id, source_id, target_id, kind")
    .eq("kind", directed.kind);

  if (SYMMETRIC_KINDS.has(directed.kind)) {
    existingQuery = existingQuery.or(
      `and(source_id.eq.${directed.sourceId},target_id.eq.${directed.targetId}),and(source_id.eq.${directed.targetId},target_id.eq.${directed.sourceId})`,
    );
  } else {
    existingQuery = existingQuery
      .eq("source_id", directed.sourceId)
      .eq("target_id", directed.targetId);
  }

  const { data: existing, error: existingError } = await existingQuery.limit(1);

  if (existingError) {
    console.error("[flow.issue_links] duplicate check error:", existingError);
    return null;
  }

  if (existing && existing.length > 0) {
    console.error("[flow.issue_links] add rejected: duplicate link");
    return null;
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await flowClient()
    .from(LINKS_TABLE)
    .insert([
      {
        project_id: source.project_id,
        source_id: directed.sourceId,
        target_id: directed.targetId,
        kind: directed.kind,
        created_by: user?.id ?? null,
      },
    ])
    .select()
    .single();

  if (error) {
    // Unique-index race: a concurrent insert won — treat as a duplicate.
    if (error.code === "23505") {
      console.error("[flow.issue_links] add rejected: duplicate link");
      return null;
    }
    console.error("[flow.issue_links] add error:", error);
    return null;
  }

  void logActivity(source.project_id, {
    source: "issues",
    message:
      directed.kind === "blocks"
        ? `Marked "${source.title}" as blocking "${target.title}"`
        : directed.kind === "duplicate"
          ? `Marked "${source.title}" as a duplicate of "${target.title}"`
          : `Linked "${source.title}" to "${target.title}"`,
    detail: {
      sourceId: directed.sourceId,
      targetId: directed.targetId,
      kind: directed.kind,
    },
  }).catch(() => {});

  return normalizeIssueLink(data);
}

// Hard delete — issue_links has no deleted_at column.
export async function removeIssueLink(linkId) {
  if (!linkId) {
    return false;
  }

  const { data: existing, error: lookupError } = await flowClient()
    .from(LINKS_TABLE)
    .select("project_id, source_id, target_id, kind")
    .eq("id", linkId)
    .maybeSingle();

  if (lookupError) {
    console.error("[flow.issue_links] remove lookup error:", lookupError);
    return false;
  }

  if (!existing) {
    return false;
  }

  const { error } = await flowClient()
    .from(LINKS_TABLE)
    .delete()
    .eq("id", linkId);

  if (error) {
    console.error("[flow.issue_links] remove error:", error);
    return false;
  }

  void logActivity(existing.project_id, {
    source: "issues",
    message: "Removed an issue link",
    detail: {
      linkId,
      sourceId: existing.source_id,
      targetId: existing.target_id,
      kind: existing.kind,
    },
  }).catch(() => {});

  return true;
}
