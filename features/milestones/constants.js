// Shared option/label/meta maps for the Milestones feature.
// A milestone's `status` and completion are derived in the UI from its tasks.
// The tasks[] array lives in the `flow.milestones.metadata` jsonb bag (see
// 0010_milestones.sql) and is surfaced as a first-class field by the data layer.

export const MILESTONE_STATUS_META = {
  not_started: {
    label: "Not Started",
    className: "bg-zinc-500/10 text-muted-foreground border-zinc-500/20",
    progressClass: "[&_[data-slot=progress-indicator]]:bg-primary",
  },
  on_track: {
    label: "On Track",
    className: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    progressClass: "[&_[data-slot=progress-indicator]]:bg-primary",
  },
  at_risk: {
    label: "At Risk",
    className: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    progressClass: "[&_[data-slot=progress-indicator]]:bg-primary",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    progressClass: "[&_[data-slot=progress-indicator]]:bg-primary",
  },
};

export const TASK_STATUS_META = {
  todo: {
    label: "To Do",
    className: "bg-zinc-500/10 text-foreground border-zinc-500/20",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  },
  blocked: {
    label: "Blocked",
    className: "bg-red-500/10 text-red-300 border-red-500/20",
  },
  done: {
    label: "Done",
    className: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  },
};

export const MILESTONE_TASK_STATUSES = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "blocked", label: "Blocked" },
  { value: "done", label: "Done" },
];

export const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "not_started", label: "Not Started" },
  { id: "on_track", label: "On Track" },
  { id: "at_risk", label: "At Risk" },
  { id: "completed", label: "Completed" },
];

// Derives a milestone's completion metrics + status from its tasks.
export function getMilestoneMetrics(milestone) {
  const tasks = Array.isArray(milestone.tasks) ? milestone.tasks : [];
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((task) => task.status === "done").length;
  const blockedTasks = tasks.filter((task) => task.status === "blocked").length;
  const inProgressTasks = tasks.filter((task) => task.status === "in_progress").length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  let status = "not_started";
  if (doneTasks === totalTasks && totalTasks > 0) {
    status = "completed";
  } else if (blockedTasks > 0) {
    status = "at_risk";
  } else if (inProgressTasks > 0 || doneTasks > 0) {
    status = "on_track";
  }

  const dueDate = new Date(milestone.targetDate);
  const overdue =
    !Number.isNaN(dueDate.getTime()) &&
    dueDate.getTime() < Date.now() &&
    status !== "completed";

  return { totalTasks, doneTasks, blockedTasks, inProgressTasks, progress, status, overdue };
}
