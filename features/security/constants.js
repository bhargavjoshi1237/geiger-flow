// Shared option/label/meta maps for the Security feature.
// Values mirror the flow.security_policies / flow.security_vulnerabilities /
// flow.security_access_events / flow.api_keys columns (see migration
// 20260826122614_security.sql). Badge classes use tailwind color utilities at
// /10 bg + /20 border, matching the rest of the suite.

export const SEVERITIES = ["critical", "high", "medium", "low"];
export const DEFAULT_SEVERITY = "medium";

export const SEVERITY_MAP = {
  critical: {
    label: "Critical",
    className: "bg-red-500/10 text-red-400 border-red-500/20",
  },
  high: {
    label: "High",
    className: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  },
  medium: {
    label: "Medium",
    className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  },
  low: {
    label: "Low",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
};

// Numeric weight for sorting by severity (critical first).
export const severityWeight = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export const VULNERABILITY_STATUSES = ["open", "triaged", "resolved"];
export const DEFAULT_VULNERABILITY_STATUS = "open";

export const VULNERABILITY_STATUS_MAP = {
  open: {
    label: "Open",
    className: "bg-red-500/10 text-red-400 border-red-500/20",
  },
  triaged: {
    label: "Triaged",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  resolved: {
    label: "Resolved",
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
};

export const RESULTS = ["allowed", "denied"];
export const DEFAULT_RESULT = "allowed";

export const RESULT_MAP = {
  allowed: {
    label: "Allowed",
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  denied: {
    label: "Denied",
    className: "bg-red-500/10 text-red-400 border-red-500/20",
  },
};

export const ENFORCEMENTS = ["monitor", "enforce"];
export const DEFAULT_ENFORCEMENT = "monitor";

export const ENFORCEMENT_MAP = {
  monitor: {
    label: "Monitor",
    className: "bg-zinc-500/10 text-muted-foreground border-zinc-500/20",
  },
  enforce: {
    label: "Enforce",
    className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
};

// Suggested scopes offered by the create-key dialog (free-form values are
// still accepted and stored).
export const API_KEY_SCOPE_OPTIONS = ["read", "write", "deploy", "admin"];

// StatusPill maps (config-only): { [key]: { label, variant } } fed to
// <StatusPill status map /> from the shared screen kit.
export const SEVERITY_PILL_MAP = {
  critical: { label: "Critical", variant: "danger" },
  high: { label: "High", variant: "warning" },
  medium: { label: "Medium", variant: "warning" },
  low: { label: "Low", variant: "info" },
};

export const VULNERABILITY_STATUS_PILL_MAP = {
  open: { label: "Open", variant: "danger" },
  triaged: { label: "Triaged", variant: "info" },
  resolved: { label: "Resolved", variant: "success" },
};

export const ACCESS_RESULT_PILL_MAP = {
  allowed: { label: "Allowed", variant: "success" },
  denied: { label: "Denied", variant: "danger" },
};

export const API_KEY_STATUS_PILL_MAP = {
  active: { label: "Active", variant: "success" },
  revoked: { label: "Revoked", variant: "neutral" },
};

export const SEVERITY_FILTER_OPTIONS = [
  { value: "all", label: "All severities" },
  ...SEVERITIES.map((severity) => ({
    value: severity,
    label: SEVERITY_MAP[severity].label,
  })),
];

export const VULNERABILITY_STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All statuses" },
  ...VULNERABILITY_STATUSES.map((status) => ({
    value: status,
    label: VULNERABILITY_STATUS_MAP[status].label,
  })),
];

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function formatWith(formatter, value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : formatter.format(date);
}

export function formatDate(value) {
  return formatWith(dateFormatter, value);
}

export function formatDateTime(value) {
  return formatWith(dateTimeFormatter, value);
}

export function severityLabel(severity) {
  return SEVERITY_MAP[severity]?.label || severity;
}

export function vulnerabilityStatusLabel(status) {
  return VULNERABILITY_STATUS_MAP[status]?.label || status;
}

export function resultLabel(result) {
  return RESULT_MAP[result]?.label || result;
}

export function enforcementLabel(enforcement) {
  return ENFORCEMENT_MAP[enforcement]?.label || enforcement;
}
