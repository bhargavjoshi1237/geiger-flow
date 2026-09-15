// Shared option/label maps for the Credited Resources addon.
// Pools live in flow.credit_pools, allocations in flow.credit_allocations.

export const CREDIT_STATUSES = [
  { value: "on_track", label: "On Track" },
  { value: "watch", label: "Watch" },
  { value: "draft", label: "Planned" },
];

export const CREDIT_TARGET_TYPES = [
  { value: "User", label: "Users" },
  { value: "Task", label: "Tasks" },
  { value: "Goal", label: "Goals" },
  { value: "Milestone", label: "Milestones" },
  { value: "Module", label: "Modules" },
];

export const DEFAULT_CREDIT_STATUS = "draft";
export const DEFAULT_POOL_STATUS = "on_track";
export const DEFAULT_TARGET_TYPE = "Task";

export const statusLabels = Object.fromEntries(
  CREDIT_STATUSES.map((status) => [status.value, status.label]),
);
