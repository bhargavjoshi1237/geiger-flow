"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// The tracker's whole location lives in the query string — `?view=my-issues`,
// `?view=cycle&cycle=<id>`, `?issue=<id>` — so a refresh or a shared link lands
// on exactly the same surface. Nothing here pushes a new route.
export function useItUrl() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const view = params.get("view") || "all-issues";
  const issueId = params.get("issue");
  const cycleId = params.get("cycle");
  const projectId = params.get("project");
  const teamTab = params.get("tab");

  const setParams = useCallback(
    (patch) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === undefined || value === "") {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      }
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  // Switching view clears the entity params the previous view owned.
  const goToView = useCallback(
    (nextView, extra = {}) => {
      setParams({
        view: nextView === "all-issues" ? null : nextView,
        issue: null,
        cycle: null,
        project: null,
        tab: null,
        ...extra,
      });
    },
    [setParams],
  );

  const openIssue = useCallback((id) => setParams({ issue: id }), [setParams]);
  const closeIssue = useCallback(() => setParams({ issue: null }), [setParams]);

  return useMemo(
    () => ({
      view,
      issueId,
      cycleId,
      projectId,
      teamTab,
      setParams,
      goToView,
      openIssue,
      closeIssue,
    }),
    [view, issueId, cycleId, projectId, teamTab, setParams, goToView, openIssue, closeIssue],
  );
}
