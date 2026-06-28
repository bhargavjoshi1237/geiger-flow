// Shared option/label/meta maps for the Goals feature.
// Status mirrors the `flow.goals.status` column. Key results and the tracking
// configuration (progressSource / trackMetric / target / targetValue) live in
// the `flow.goals.metadata` jsonb bag (see 0009_goals.sql) and are surfaced as
// first-class fields by the data layer.

export const GOAL_STATUSES = [
  { value: "not_started", label: "Not Started" },
  { value: "on_track", label: "On Track" },
  { value: "at_risk", label: "At Risk" },
  { value: "completed", label: "Completed" },
];

export const DEFAULT_GOAL_STATUS = "not_started";

export const PROGRESS_SOURCE_OPTIONS = [
  { value: "tasks_lists", label: "Tasks and Lists" },
  { value: "tasks_custom_field", label: "Tasks with Custom Field" },
  { value: "tasks_tag", label: "Tasks with Tag" },
  { value: "tasks_user_tag", label: "Tasks with User Tag" },
  { value: "tasks_assignee", label: "Tasks with Assignee" },
];

export const TRACK_METRIC_OPTIONS = [
  { value: "tasks_count", label: "Tasks count" },
  { value: "tracked_time", label: "Tracked time" },
  { value: "story_points", label: "Story points" },
  { value: "custom_field_value", label: "Custom Field value" },
];

export const TARGET_OPTIONS = [
  { value: "dynamic", label: "Dynamic", description: "Updates as tasks are added to the goal" },
  { value: "static", label: "Static", description: "Fixed goal value" },
];

// Badge color classes (semantic tokens / tailwind color utilities at /10 bg +
// /20 border).
export const goalStatusMeta = {
  not_started: {
    label: "Not Started",
    className: "bg-zinc-500/10 text-muted-foreground border-zinc-500/20",
  },
  on_track: {
    label: "On Track",
    className: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  },
  at_risk: {
    label: "At Risk",
    className: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  },
  completed: {
    label: "Completed",
    className: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  },
};
