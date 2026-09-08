// Filtering, ordering and grouping for every issue surface in the tracker.
// Pure functions over the decorated issue view models — no React, no fetching.

import {
  PRIORITIES,
  STATE_ORDER,
  WORKFLOW_STATE_MAP,
  formatShortDate,
  isCompleted,
  priorityRank,
} from "./constants";

export function filterIssues(issues, { filters = {}, search = "", display = {} }) {
  const needle = search.trim().toLowerCase();

  return issues.filter((issue) => {
    if (!display.showCompleted && isCompleted(issue.status)) return false;
    if (!display.showSubIssues && issue.parentId) return false;

    if (needle) {
      const haystack = [
        issue.title,
        issue.description,
        ...(issue.labels ?? []),
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(needle)) return false;
    }

    if (filters.status?.length && !filters.status.includes(issue.status)) return false;
    if (filters.priority?.length && !filters.priority.includes(issue.priority)) return false;
    if (filters.label?.length) {
      if (!(issue.labels ?? []).some((label) => filters.label.includes(label))) return false;
    }
    if (filters.project?.length && !filters.project.includes(issue.objectiveId)) return false;
    if (filters.cycle?.length && !filters.cycle.includes(issue.cycleId)) return false;
    if (filters.assignee?.length) {
      const assignees = issue.assignees ?? [];
      const wantsUnassigned = filters.assignee.includes("unassigned");
      const matchesPerson = assignees.some((id) => filters.assignee.includes(id));
      if (!(matchesPerson || (wantsUnassigned && assignees.length === 0))) return false;
    }

    return true;
  });
}

const COMPARATORS = {
  status: (a, b) => STATE_ORDER.indexOf(a.status) - STATE_ORDER.indexOf(b.status),
  priority: (a, b) => priorityRank(a.priority) - priorityRank(b.priority),
  created: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  updated: (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
  title: (a, b) => String(a.title).localeCompare(String(b.title)),
  // Undated issues sort last rather than first.
  due: (a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  },
};

export function sortIssues(issues, ordering) {
  const compare = COMPARATORS[ordering] ?? COMPARATORS.priority;
  // Ties fall back to priority then recency so ordering is always stable.
  return [...issues].sort(
    (a, b) =>
      compare(a, b) ||
      priorityRank(a.priority) - priorityRank(b.priority) ||
      new Date(b.createdAt) - new Date(a.createdAt),
  );
}

// Group the sorted list into the sections the list and board both render.
// Each section is { key, label, color, icon, issues } — `icon` names the glyph
// the renderer should draw (status/priority/none) so grouping stays data-only.
export function groupIssues(issues, grouping, context) {
  const { peopleById = {}, projects = [], cycles = [] } = context ?? {};

  if (grouping === "none") {
    return [{ key: "all", label: "All issues", icon: "none", issues }];
  }

  if (grouping === "status") {
    return STATE_ORDER.map((state) => ({
      key: state,
      label: WORKFLOW_STATE_MAP[state].label,
      color: WORKFLOW_STATE_MAP[state].color,
      icon: "status",
      issues: issues.filter((issue) => issue.status === state),
    })).filter((group) => group.issues.length > 0);
  }

  if (grouping === "priority") {
    return PRIORITIES.map((priority) => ({
      key: priority.value,
      label: priority.label,
      icon: "priority",
      issues: issues.filter((issue) => issue.priority === priority.value),
    })).filter((group) => group.issues.length > 0);
  }

  if (grouping === "assignee") {
    const buckets = new Map();
    for (const issue of issues) {
      const ids = issue.assignees?.length ? issue.assignees : ["__none__"];
      for (const id of ids) {
        if (!buckets.has(id)) buckets.set(id, []);
        buckets.get(id).push(issue);
      }
    }
    return [...buckets.entries()]
      .map(([id, bucket]) => ({
        key: id,
        label: id === "__none__" ? "No assignee" : peopleById[id]?.name || "Unknown",
        avatar: id === "__none__" ? null : peopleById[id],
        icon: "avatar",
        issues: bucket,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  if (grouping === "project" || grouping === "cycle") {
    const source = grouping === "project" ? projects : cycles;
    const field = grouping === "project" ? "objectiveId" : "cycleId";
    const groups = source.map((entry) => ({
      key: entry.id,
      label: entry.title,
      icon: "none",
      issues: issues.filter((issue) => issue[field] === entry.id),
    }));
    const orphans = issues.filter(
      (issue) => !source.some((entry) => entry.id === issue[field]),
    );
    if (orphans.length) {
      groups.push({
        key: "__none__",
        label: grouping === "project" ? "No project" : "No cycle",
        icon: "none",
        issues: orphans,
      });
    }
    return groups.filter((group) => group.issues.length > 0);
  }

  if (grouping === "label") {
    const buckets = new Map();
    for (const issue of issues) {
      const labels = issue.labels?.length ? issue.labels : ["__none__"];
      for (const label of labels) {
        if (!buckets.has(label)) buckets.set(label, []);
        buckets.get(label).push(issue);
      }
    }
    return [...buckets.entries()]
      .map(([label, bucket]) => ({
        key: label,
        label: label === "__none__" ? "No label" : label,
        icon: "label",
        issues: bucket,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  return [{ key: "all", label: "All issues", icon: "none", issues }];
}

// The patch that "dropping" an issue into a group implies — used by the board's
// drag/drop and by the group header's inline create.
export function groupPatch(grouping, key) {
  switch (grouping) {
    case "status":
      return { status: key };
    case "priority":
      return { priority: key };
    case "assignee":
      return { assignees: key === "__none__" ? [] : [key] };
    case "project":
      return { objectiveId: key === "__none__" ? null : key };
    case "cycle":
      return { cycleId: key === "__none__" ? null : key };
    case "label":
      return key === "__none__" ? { labels: [] } : { labels: [key] };
    default:
      return {};
  }
}

// A cycle's window and completion, derived from the issues assigned to it.
export function cycleStats(cycle, issues) {
  const scoped = issues.filter((issue) => issue.cycleId === cycle.id);
  const completed = scoped.filter((issue) => isCompleted(issue.status));
  const started = scoped.filter(
    (issue) => issue.status === "in_progress" || issue.status === "in_review",
  );
  return {
    total: scoped.length,
    completed: completed.length,
    started: started.length,
    scope: scoped.reduce((sum, issue) => sum + (Number(issue.estimate) || 0), 0),
    progress: scoped.length ? Math.round((completed.length / scoped.length) * 100) : 0,
    issues: scoped,
    window: cycle.targetDate ? `Ends ${formatShortDate(cycle.targetDate)}` : "No target date",
  };
}
