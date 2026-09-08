// Shared option/label/meta maps + formatters for the Activity Logs feature.
// Level mirrors the `flow.activity_logs.level` column. No row data lives here.

export const ACTIVITY_LEVELS = [
  { value: "info", label: "Info" },
  { value: "warning", label: "Warning" },
  { value: "error", label: "Error" },
  { value: "debug", label: "Debug" },
];

export const DEFAULT_ACTIVITY_LEVEL = "info";

export const ACTIVITY_LEVEL_FILTER_OPTIONS = [
  { value: "all", label: "All levels" },
  ...ACTIVITY_LEVELS,
];

export const DEFAULT_LEVEL_FILTER = "all";

// Badge/icon classes per level — mirrors LEVEL_CONFIG in log_entry.jsx (plus
// 'system' for rows written without a known level).
export const LEVEL_META = {
  info: {
    label: "Info",
    icon: "info",
    className: "bg-zinc-500/10 border-zinc-500/20 text-muted-foreground",
  },
  warning: {
    label: "Warning",
    icon: "warning",
    className: "bg-zinc-500/10 border-zinc-500/20 text-muted-foreground",
  },
  error: {
    label: "Error",
    icon: "error",
    className: "bg-zinc-500/10 border-zinc-500/20 text-muted-foreground",
  },
  debug: {
    label: "Debug",
    icon: "debug",
    className: "bg-zinc-500/10 border-zinc-500/20 text-muted-foreground",
  },
  system: {
    label: "System",
    icon: "terminal",
    className: "bg-zinc-500/10 border-zinc-500/20 text-muted-foreground",
  },
};

export function levelMeta(level) {
  return LEVEL_META[level] ?? LEVEL_META.info;
}

// StatusPill map (config-only): { [level]: { label, variant } } fed to
// <StatusPill status map /> from the shared screen kit.
export const LOG_LEVEL_PILL_MAP = {
  info: { label: "Info", variant: "neutral" },
  warning: { label: "Warning", variant: "warning" },
  error: { label: "Error", variant: "danger" },
  debug: { label: "Debug", variant: "info" },
  system: { label: "System", variant: "purple" },
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

// YYYY-MM-DD for the CSV export filename.
export function formatExportDate(date) {
  return dateFormatter.format(date);
}

// Builds a past-tense update message from a mutation patch, e.g.
//   { entity: "issue", patch: { status: "in_progress" }, values: {...} }
//   -> "Updated issue status → In Progress"
//
// `fields` maps a camelCase patch key to a readable field name; `values` maps a
// key to a formatter for its raw value. Falls back to the key itself / its
// string form, so every module can call it without exhaustive maps.
export function formatUpdateMessage({ entity, title, patch, fields = {}, values = {} }) {
  const keys = Object.keys(patch ?? {});

  if (keys.length === 0) {
    return `Updated ${entity}${title ? ` "${title}"` : ""}`;
  }

  const changes = keys.map((key) => {
    const field = fields[key] ?? key;
    const raw = patch[key];
    const value = values[key] ? String(values[key](raw)) : String(raw ?? "");
    return `${field} → ${value}`;
  });

  if (keys.length === 1) {
    return `Updated ${entity} ${changes[0]}`;
  }

  return `Updated ${entity}${title ? ` "${title}"` : ""} (${changes.join(", ")})`;
}
