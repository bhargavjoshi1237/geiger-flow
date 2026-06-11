import { FileText, Presentation, Sheet } from "lucide-react";

export const OFFICE_FILE_TYPES = {
  document: {
    type: "document",
    label: "Document",
    defaultName: "Untitled document",
    icon: FileText,
    accent: "#4285f4",
  },
  spreadsheet: {
    type: "spreadsheet",
    label: "Spreadsheet",
    defaultName: "Untitled spreadsheet",
    icon: Sheet,
    accent: "#0f9d58",
  },
  presentation: {
    type: "presentation",
    label: "Presentation",
    defaultName: "Untitled presentation",
    icon: Presentation,
    accent: "#f4b400",
  },
};

export const OFFICE_FILE_TYPE_LIST = Object.values(OFFICE_FILE_TYPES);

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
