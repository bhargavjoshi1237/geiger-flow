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

// Terminal states that close an issue (no overdue, excluded from open counts).
export const DONE_STATUSES = ["resolved", "done", "canceled", "duplicate"];

// Map a raw status to the current set (unknown values pass through untouched
// so nothing is ever misrepresented).
export function normalizeIssueStatus(value) {
  if (!value) {
    return DEFAULT_ISSUE_STATUS;
  }
  return value;
}

export function isDoneStatus(status) {
  return DONE_STATUSES.includes(normalizeIssueStatus(status));
}

// Derive a Linear-style project key: explicit key/code wins, otherwise the
// first 4 alphanumeric chars of the name uppercased, else an id slice.
export function projectKeyFor(project) {
  const explicit = String(project?.key ?? project?.code ?? "")
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase();
  if (explicit) {
    return explicit.slice(0, 8);
  }
  const fromName = String(project?.name ?? "")
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase();
  if (fromName.length >= 2) {
    return fromName.slice(0, 4);
  }
  if (project?.id) {
    return String(project.id).replace(/-/g, "").slice(0, 4).toUpperCase();
  }
  return "FLOW";
}

// Human-readable identifier (e.g. FLOW-123). Falls back to a short-id badge
// for rows that predate numbering.
export function issueIdentifier(issue, project) {
  if (issue?.number != null) {
    return `${projectKeyFor(project)}-${issue.number}`;
  }
  return `#${String(issue?.id ?? "").slice(0, 8)}`;
}

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
  backlog: {
    label: "Backlog",
    className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  },
  todo: {
    label: "Todo",
    className: "bg-zinc-500/10 text-zinc-300 border-zinc-500/20",
  },
  open: {
    label: "Open",
    className: "bg-red-500/10 text-red-400 border-red-500/20",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  in_review: {
    label: "In Review",
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  resolved: {
    label: "Resolved",
    className: "bg-green-500/10 text-green-400 border-green-500/20",
  },
  done: {
    label: "Done",
    className: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  },
  canceled: {
    label: "Canceled",
    className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  },
  duplicate: {
    label: "Duplicate",
    className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  },
};

export const priorityMeta = {
  none: { label: "No priority", className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" },
  urgent: { label: "Urgent", className: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
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
  urgent: 5,
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

// StatusPill maps (config-only): { [key]: { label, variant } } fed to
// <StatusPill status map /> from the shared screen kit.
export const ISSUE_STATUS_PILL_MAP = {
  open: { label: "Open", variant: "danger" },
  in_progress: { label: "In Progress", variant: "info" },
  resolved: { label: "Resolved", variant: "success" },
  backlog: { label: "Backlog", variant: "neutral" },
  todo: { label: "Todo", variant: "info" },
  done: { label: "Done", variant: "success" },
  canceled: { label: "Canceled", variant: "neutral" },
  duplicate: { label: "Duplicate", variant: "purple" },
};

export const ISSUE_PRIORITY_PILL_MAP = {
  low: { label: "Low", variant: "info" },
  medium: { label: "Medium", variant: "warning" },
  high: { label: "High", variant: "warning" },
  critical: { label: "Critical", variant: "danger" },
};

export const ISSUE_TYPE_PILL_MAP = {
  task: { label: "Task", variant: "neutral" },
  bug: { label: "Bug", variant: "danger" },
  feature: { label: "Feature", variant: "purple" },
  improvement: { label: "Improvement", variant: "success" },
  chore: { label: "Chore", variant: "warning" },
};

export const ISSUE_STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All statuses" },
  ...ISSUE_STATUSES.map((status) => ({
    value: status.value,
    label: status.label,
  })),
];

export const ISSUE_PRIORITY_FILTER_OPTIONS = [
  { value: "all", label: "All priorities" },
  ...ISSUE_PRIORITIES.map((priority) => ({
    value: priority.value,
    label: priority.label,
  })),
];

export const ISSUE_TYPE_FILTER_OPTIONS = [
  { value: "all", label: "All types" },
  ...ISSUE_TYPES.map((type) => ({ value: type.value, label: type.label })),
];
