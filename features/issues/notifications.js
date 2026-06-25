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
    fetch("/api/notifications/issue-assigned", {
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
