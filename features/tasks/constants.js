// Shared option/label/meta maps for the Tasks feature.
// Status, priority, stage, type mirror the `flow.tasks` columns.

export const TASK_STATUSES = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "blocked", label: "Blocked" },
  { value: "done", label: "Done" },
];

export const TASK_PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

export const TASK_TYPES = [
  { value: "task", label: "Task" },
  { value: "issue", label: "Issue" },
  { value: "bug", label: "Bug" },
  { value: "feature", label: "Feature" },
  { value: "improvement", label: "Improvement" },
];

// Flattened stage list (the dialog uses a richer grouped picker; the detail
// sheet uses this plain list).
export const TASK_STAGES = [
  { value: "backlog", label: "Backlog" },
  { value: "planning", label: "Planning" },
  { value: "execution", label: "Execution" },
  { value: "testing", label: "Testing" },
  { value: "review", label: "Review" },
  { value: "deployment:pending", label: "Deploy · Pending" },
  { value: "deployment:running", label: "Deploy · Running" },
  { value: "merge:pending", label: "Merge · Pending" },
  { value: "merge:done", label: "Merge · Done" },
  { value: "completed", label: "Completed" },
];

export const DEFAULT_TASK_STATUS = "todo";
export const DEFAULT_TASK_PRIORITY = "medium";
export const DEFAULT_TASK_TYPE = "task";

export const statusLabels = Object.fromEntries(
  TASK_STATUSES.map((status) => [status.value, status.label]),
);

export const priorityLabels = Object.fromEntries(
  TASK_PRIORITIES.map((priority) => [priority.value, priority.label]),
);

export const typeLabels = Object.fromEntries(
  TASK_TYPES.map((type) => [type.value, type.label]),
);

export const stageLabels = Object.fromEntries(
  TASK_STAGES.map((stage) => [stage.value, stage.label]),
);

// Badge color classes (tailwind utilities at /10 bg + /20 border).
export const statusMeta = {
  todo: { label: "To Do", className: "bg-zinc-500/10 text-zinc-300 border-zinc-500/20" },
  in_progress: { label: "In Progress", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  blocked: { label: "Blocked", className: "bg-red-500/10 text-red-400 border-red-500/20" },
  done: { label: "Done", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
};

export const priorityMeta = {
  low: { label: "Low", className: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  medium: { label: "Medium", className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  high: { label: "High", className: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  critical: { label: "Critical", className: "bg-red-500/10 text-red-400 border-red-500/20" },
};

export const typeMeta = {
  task: { label: "Task", className: "bg-zinc-500/10 text-zinc-300 border-zinc-500/20" },
  issue: { label: "Issue", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  bug: { label: "Bug", className: "bg-red-500/10 text-red-400 border-red-500/20" },
  feature: { label: "Feature", className: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  improvement: { label: "Improvement", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
};

// Numeric weight for sorting by priority (critical first).
export const priorityWeight = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export const TASK_SORTS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "priority", label: "Priority" },
  { value: "due", label: "Due date" },
  { value: "progress", label: "Progress" },
];

export const DEFAULT_TASK_SORT = "newest";
