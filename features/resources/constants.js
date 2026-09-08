// Shared option/label/meta maps for the Resource Allocation feature.
// Statuses mirror the `flow.resource_allocations` / `flow.resource_requests`
// columns. No row data lives here — see features/resources/actions.js.

export const ALLOCATION_STATUSES = [
  { value: "active", label: "Active" },
  { value: "planned", label: "Planned" },
  { value: "completed", label: "Completed" },
];

export const REQUEST_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "denied", label: "Denied" },
];

export const DEFAULT_ALLOCATION_STATUS = "active";
export const DEFAULT_REQUEST_STATUS = "pending";

// Members allocated above this percent count as overloaded for the KPI chip.
export const HIGH_ALLOCATION_THRESHOLD = 80;

export const allocationStatusLabels = Object.fromEntries(
  ALLOCATION_STATUSES.map((status) => [status.value, status.label]),
);

export const requestStatusLabels = Object.fromEntries(
  REQUEST_STATUSES.map((status) => [status.value, status.label]),
);

// Badge color classes (tailwind color utilities at /15 bg + /30 border,
// matching the screen's existing badge palette).
export const allocationStatusMeta = {
  active: {
    label: "Active",
    className: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  },
  planned: {
    label: "Planned",
    className: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
};

export const requestStatusMeta = {
  pending: {
    label: "Pending",
    className: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  approved: {
    label: "Approved",
    className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
  denied: {
    label: "Denied",
    className: "bg-red-500/15 text-red-400 border-red-500/20",
  },
};

export const ALLOCATION_FILTER_OPTIONS = [
  { id: "all", label: "All" },
  ...ALLOCATION_STATUSES.map((status) => ({ id: status.value, label: status.label })),
];

// StatusPill-compatible maps (`{ label, variant }` fed to
// `<StatusPill status map />`).
export const allocationStatusPillMap = {
  active: { label: "Active", variant: "info" },
  planned: { label: "Planned", variant: "purple" },
  completed: { label: "Completed", variant: "success" },
};

export const requestStatusPillMap = {
  pending: { label: "Pending", variant: "warning" },
  approved: { label: "Approved", variant: "success" },
  denied: { label: "Denied", variant: "danger" },
};

// FilterDropdown-shaped options (`{ value, label }`) for the list toolbar.
export const ALLOCATION_STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All Statuses" },
  ...ALLOCATION_STATUSES.map((status) => ({ value: status.value, label: status.label })),
];

export const REQUEST_STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All Statuses" },
  ...REQUEST_STATUSES.map((status) => ({ value: status.value, label: status.label })),
];

// `value` is a plain date string (YYYY-MM-DD) from a date column.
export function formatDateLabel(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
