// Shared option/label/meta maps for the Objectives feature.
// Status mirrors the `flow.objectives.status` column. Key results and the kanban
// column config live in the `flow.objectives.metadata` jsonb bag (see
// 0008_objectives.sql) and are surfaced as first-class fields by the data layer.

export const OBJECTIVE_STATUSES = [
  { value: "not_started", label: "Not Started" },
  { value: "on_track", label: "On Track" },
  { value: "at_risk", label: "At Risk" },
  { value: "completed", label: "Completed" },
];

export const DEFAULT_OBJECTIVE_STATUS = "not_started";

// Badge color classes (semantic tokens / tailwind color utilities at /10 bg +
// /20 border).
export const objectiveStatusMeta = {
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

// Default kanban columns for an objective's goals (one per status). Persisted in
// the objective's metadata bag once the user adds custom columns.
export const DEFAULT_OBJECTIVE_COLUMNS = [
  { key: "not_started", label: "Not Started", color: "zinc" },
  { key: "on_track", label: "On Track", color: "emerald" },
  { key: "at_risk", label: "At Risk", color: "amber" },
  { key: "completed", label: "Completed", color: "blue" },
];
