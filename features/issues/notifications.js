// Client-side notification triggers for the Issues feature.
//
// These are fire-and-forget: they hand off to a server route that owns the suite
// email key and recipient resolution (see app/api/notifications/...). They never
// throw and never block the UI — a failed notification must not fail the edit.

// Email the newly-added assignees of an issue. `assigneeIds` should be only the
// ids that were just added (the screen diffs old vs new before calling).
export function notifyIssueAssigned(issueId, assigneeIds) {
  const ids = (assigneeIds || []).filter(Boolean);
  if (!issueId || ids.length === 0) {
    return;
  }

  try {
    // Prefix the configured basePath (production serves the app under /flow), so
    // a root-relative path doesn't escape it. Mirrors the collab API call.
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    fetch(`${basePath}/api/notifications/issue-assigned`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issueId, assigneeIds: ids }),
      keepalive: true,
    }).catch(() => {
      /* best-effort — delivery is logged server-side */
    });
  } catch {
    /* never let a notification break the calling action */
  }
}
