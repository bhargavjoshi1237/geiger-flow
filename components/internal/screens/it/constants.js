// Linear-shaped workflow model for the /it tracker.
//
// `flow.issues.status` / `.priority` are free-text columns, so the tracker
// persists Linear's own vocabulary directly. Legacy rows written before this
// screen existed (open/resolved/critical) are folded onto the nearest Linear
// state on read — see toLinearStatus / toLinearPriority.

// Workflow states, in Linear's canonical board order. `group` drives the
// backlog/active/completed roll-ups the sidebar and cycle graphs use.
export const WORKFLOW_STATES = [
  { value: "backlog", label: "Backlog", group: "backlog", color: "var(--lnr-backlog)" },
  { value: "todo", label: "Todo", group: "unstarted", color: "var(--lnr-todo)" },
  { value: "in_progress", label: "In Progress", group: "started", color: "var(--lnr-started)" },
  { value: "in_review", label: "In Review", group: "started", color: "var(--lnr-review)" },
  { value: "done", label: "Done", group: "completed", color: "var(--lnr-done)" },
  { value: "canceled", label: "Canceled", group: "canceled", color: "var(--lnr-canceled)" },
  { value: "duplicate", label: "Duplicate", group: "canceled", color: "var(--lnr-canceled)" },
];

export const WORKFLOW_STATE_MAP = Object.fromEntries(
  WORKFLOW_STATES.map((state) => [state.value, state]),
);

export const STATE_ORDER = WORKFLOW_STATES.map((state) => state.value);

// Statuses that close an issue.
export const COMPLETED_STATES = ["done", "canceled", "duplicate"];
export const STARTED_STATES = ["in_progress", "in_review"];

// Legacy status -> Linear state.
const LEGACY_STATUS_MAP = {
  open: "todo",
  resolved: "done",
};

export function toLinearStatus(value) {
  const raw = String(value || "").trim();
  if (!raw) return "backlog";
  if (WORKFLOW_STATE_MAP[raw]) return raw;
  return LEGACY_STATUS_MAP[raw] ?? "backlog";
}

export function isCompleted(status) {
  return COMPLETED_STATES.includes(toLinearStatus(status));
}

export function isStarted(status) {
  return STARTED_STATES.includes(toLinearStatus(status));
}

// Priority, highest first — Linear sorts "No priority" last, not first.
export const PRIORITIES = [
  { value: "urgent", label: "Urgent", rank: 1 },
  { value: "high", label: "High", rank: 2 },
  { value: "medium", label: "Medium", rank: 3 },
  { value: "low", label: "Low", rank: 4 },
  { value: "none", label: "No priority", rank: 5 },
];

export const PRIORITY_MAP = Object.fromEntries(
  PRIORITIES.map((priority) => [priority.value, priority]),
);

const LEGACY_PRIORITY_MAP = { critical: "urgent" };

export function toLinearPriority(value) {
  const raw = String(value || "").trim();
  if (!raw) return "none";
  if (PRIORITY_MAP[raw]) return raw;
  return LEGACY_PRIORITY_MAP[raw] ?? "none";
}

export function priorityRank(value) {
  return PRIORITY_MAP[toLinearPriority(value)]?.rank ?? 5;
}

// Display options — the popover behind the "Display" button.
export const GROUPING_OPTIONS = [
  { value: "status", label: "Status" },
  { value: "assignee", label: "Assignee" },
  { value: "priority", label: "Priority" },
  { value: "project", label: "Project" },
  { value: "cycle", label: "Cycle" },
  { value: "label", label: "Label" },
  { value: "none", label: "No grouping" },
];

export const ORDERING_OPTIONS = [
  { value: "status", label: "Status" },
  { value: "priority", label: "Priority" },
  { value: "created", label: "Last created" },
  { value: "updated", label: "Last updated" },
  { value: "due", label: "Due date" },
  { value: "title", label: "Title" },
];

// Row properties the Display popover can toggle. `id` matches the key the row
// renderer checks, so adding one here is enough to make it switchable.
export const ROW_PROPERTIES = [
  { id: "priority", label: "Priority" },
  { id: "identifier", label: "ID" },
  { id: "status", label: "Status" },
  { id: "labels", label: "Labels" },
  { id: "project", label: "Project" },
  { id: "cycle", label: "Cycle" },
  { id: "dueDate", label: "Due date" },
  { id: "estimate", label: "Estimate" },
  { id: "links", label: "Links" },
  { id: "created", label: "Created" },
  { id: "assignee", label: "Assignee" },
];

export const DEFAULT_DISPLAY = {
  layout: "list",
  grouping: "status",
  ordering: "priority",
  showSubIssues: true,
  showCompleted: true,
  properties: {
    priority: true,
    identifier: true,
    status: true,
    labels: true,
    project: true,
    cycle: false,
    dueDate: true,
    estimate: false,
    links: true,
    created: false,
    assignee: true,
  },
};

// Deterministic label colours — Linear assigns a hue per label, we hash the
// name so the same label is the same colour everywhere without a labels table.
const LABEL_COLORS = [
  "#5e6ad2", "#26b5ce", "#4cb782", "#f2c94c", "#fc7840",
  "#eb5757", "#bb87fc", "#95a2b3", "#d4a27f", "#68cc58",
];

export function labelColor(name) {
  const text = String(name || "");
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return LABEL_COLORS[hash % LABEL_COLORS.length];
}

// "Aug 14", "Aug 14, 2025" once it leaves the current year — Linear's format.
export function formatShortDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

// Relative age used by the activity feed and inbox rows.
export function formatRelative(value) {
  if (!value) return "";
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "";
  const seconds = Math.round((Date.now() - then) / 1000);
  if (seconds < 60) return "now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks}w`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo`;
  return `${Math.round(days / 365)}y`;
}

export function isOverdue(issue) {
  if (!issue?.dueDate || isCompleted(issue.status)) return false;
  const due = new Date(issue.dueDate);
  if (Number.isNaN(due.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}
