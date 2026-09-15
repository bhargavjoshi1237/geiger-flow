"use client";

// Project roster for the chat workspace.
//
// Chat needs one thing from the surrounding scope: who legitimately belongs to
// it, so a conversation partner can be flagged as "external". In geiger-chat
// that came from the organization roster; here it is the project's member list,
// which Flow already owns in features/team.
//
// This module is the seam. It adapts flow.project_members into the shape the
// chat tree expects ({ userId }) so nothing downstream knows the difference.
// Pure: console.error on failure, return null/[]. Never throws, never toasts.

import { listMembers } from "@/features/team/actions";

// Members of a project, as chat identities. Returns null on failure so the
// caller can leave the roster unknown rather than treating everyone external.
export async function listProjectMembers(projectId) {
  if (!projectId) return null;
  try {
    const rows = await listMembers(projectId);
    if (!rows) return null;
    return rows
      .map((m) => ({
        userId: m.userId ?? null,
        projectId: m.projectId ?? projectId,
        role: m.role ?? "Member",
        name: m.name ?? "",
        email: m.email ?? "",
      }))
      .filter((m) => m.userId);
  } catch (e) {
    console.error("[chat_scope.listProjectMembers]", e);
    return null;
  }
}
