import { FileText, Presentation, Sheet } from "lucide-react";

// Presentation config for office file types. Colors are tailwind utility classes
// on the shared palette — never raw hex, so the suite's theming stays in one place.
export const OFFICE_FILE_TYPES = {
  document: {
    type: "document",
    label: "Document",
    defaultName: "Untitled document",
    icon: FileText,
    iconClass: "text-sky-400",
    tintClass: "bg-sky-400/10",
    dotClass: "bg-sky-400",
    variant: "info",
  },
  spreadsheet: {
    type: "spreadsheet",
    label: "Spreadsheet",
    defaultName: "Untitled spreadsheet",
    icon: Sheet,
    iconClass: "text-emerald-400",
    tintClass: "bg-emerald-400/10",
    dotClass: "bg-emerald-400",
    variant: "success",
  },
  presentation: {
    type: "presentation",
    label: "Presentation",
    defaultName: "Untitled presentation",
    icon: Presentation,
    iconClass: "text-amber-400",
    tintClass: "bg-amber-400/10",
    dotClass: "bg-amber-400",
    variant: "warning",
  },
};

export const OFFICE_FILE_TYPE_LIST = Object.values(OFFICE_FILE_TYPES);

// StatusPill lookup for the type column — one shared map instead of a copy per screen.
export const OFFICE_FILE_TYPE_MAP = Object.fromEntries(
  OFFICE_FILE_TYPE_LIST.map((t) => [
    t.type,
    { label: t.label, variant: t.variant, dotClass: t.dotClass },
  ]),
);

// Filter options with the conventional "all" sentinel first.
export const OFFICE_TYPE_FILTER_OPTIONS = [
  { value: "all", label: "All Types" },
  ...OFFICE_FILE_TYPE_LIST.map((t) => ({ value: t.type, label: t.label })),
];

export function getOfficeFileType(type) {
  return OFFICE_FILE_TYPES[type] ?? OFFICE_FILE_TYPES.document;
}

export const FOLDER_COLORS = [
  "#4285f4",
  "#0f9d58",
  "#f4b400",
  "#ea4335",
  "#ab47bc",
  "#00acc1",
  "#ff7043",
  "#8d6e63",
];

export function timeAgo(dateInput) {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (Number.isNaN(seconds)) return "";
  if (seconds < 45) return "Just now";

  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, secs] of units) {
    const value = Math.floor(seconds / secs);
    if (value >= 1) return `${value} ${unit}${value > 1 ? "s" : ""} ago`;
  }
  return "Just now";
}
