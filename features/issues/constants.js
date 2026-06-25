// Shared option/label/meta maps for the Issues feature.
// Status & priority mirror the `flow.issues` columns. Type / estimate / start
// date live in the `flow.issues.metadata` jsonb bag (see 0005_issues_metadata)
// and are surfaced as first-class fields by the data layer.

export const ISSUE_STATUSES = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

// Priority doubles as the UI "severity" used by IssueItem / IssueSeverityBadge.
export const ISSUE_PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

export const ISSUE_TYPES = [
  { value: "task", label: "Task" },
  { value: "bug", label: "Bug" },
  { value: "feature", label: "Feature" },
  { value: "improvement", label: "Improvement" },
  { value: "chore", label: "Chore" },
];

// Fibonacci-ish story-point estimates ("" = unestimated).
export const ISSUE_ESTIMATES = [
  { value: "", label: "No Estimate" },
  { value: "1", label: "1 PT" },
  { value: "2", label: "2 PTS" },
  { value: "3", label: "3 PTS" },
  { value: "5", label: "5 PTS" },
  { value: "8", label: "8 PTS" },
  { value: "13", label: "13 PTS" },
];

export const DEFAULT_ISSUE_STATUS = "open";
export const DEFAULT_ISSUE_PRIORITY = "medium";
export const DEFAULT_ISSUE_TYPE = "task";

export const statusLabels = Object.fromEntries(
  ISSUE_STATUSES.map((status) => [status.value, status.label]),
);

export const priorityLabels = Object.fromEntries(
  ISSUE_PRIORITIES.map((priority) => [priority.value, priority.label]),
);

export const typeLabels = Object.fromEntries(
  ISSUE_TYPES.map((type) => [type.value, type.label]),
);

// Badge color classes (semantic tokens / tailwind color utilities at /10 bg +
// /20 border, matching IssueItem's severity palette).
export const statusMeta = {
  open: {
    label: "Open",
    className: "bg-red-500/10 text-red-400 border-red-500/20",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  resolved: {
    label: "Resolved",
    className: "bg-green-500/10 text-green-400 border-green-500/20",
  },
};

export const priorityMeta = {
  low: { label: "Low", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  medium: { label: "Medium", className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  high: { label: "High", className: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  critical: { label: "Critical", className: "bg-red-500/10 text-red-400 border-red-500/20" },
};

export const typeMeta = {
  task: { label: "Task", className: "bg-zinc-500/10 text-zinc-300 border-zinc-500/20" },
  bug: { label: "Bug", className: "bg-red-500/10 text-red-400 border-red-500/20" },
  feature: { label: "Feature", className: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  improvement: { label: "Improvement", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  chore: { label: "Chore", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
};

// Numeric weight for sorting by priority (critical first).
export const priorityWeight = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export const ISSUE_SORTS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "priority", label: "Priority" },
  { value: "due", label: "Due date" },
];

export const DEFAULT_ISSUE_SORT = "newest";
