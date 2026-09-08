// Shared media-type config + formatters for the Assets feature.
//
// The `media_type` column on flow.assets is constrained to the values in
// MEDIA_TYPES ('image' | 'video' | 'document' | 'audio' | 'archive' |
// 'other'). This file holds CONFIG only (labels / icons / colors) — no row
// data. Colors follow the badge convention: tailwind utilities at /10 bg +
// /20 border.

import {
  Image,
  Film,
  FileText,
  Music,
  Archive,
  FileQuestion,
} from "lucide-react";

export const MEDIA_TYPES = [
  "image",
  "video",
  "document",
  "audio",
  "archive",
  "other",
];

export const DEFAULT_MEDIA_TYPE = "other";

export const MEDIA_TYPE_MAP = {
  image: {
    label: "Image",
    icon: Image,
    iconColor: "text-sky-400",
    className: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    dot: "bg-sky-400",
  },
  video: {
    label: "Video",
    icon: Film,
    iconColor: "text-violet-400",
    className: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    dot: "bg-violet-400",
  },
  document: {
    label: "Document",
    icon: FileText,
    iconColor: "text-amber-400",
    className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    dot: "bg-amber-400",
  },
  audio: {
    label: "Audio",
    icon: Music,
    iconColor: "text-emerald-400",
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    dot: "bg-emerald-400",
  },
  archive: {
    label: "Archive",
    icon: Archive,
    iconColor: "text-orange-400",
    className: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    dot: "bg-orange-400",
  },
  other: {
    label: "Other",
    icon: FileQuestion,
    iconColor: "text-zinc-300",
    className: "bg-zinc-500/10 text-zinc-300 border-zinc-500/20",
    dot: "bg-zinc-400",
  },
};

// Filter chips for the assets toolbar ("All" first).
export const MEDIA_TYPE_FILTERS = [
  { value: "all", label: "All" },
  ...MEDIA_TYPES.map((type) => ({ value: type, label: MEDIA_TYPE_MAP[type].label })),
];

// Sort options for the assets table.
export const ASSET_SORTS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "largest", label: "Largest" },
  { value: "name", label: "Name" },
];

export const DEFAULT_ASSET_SORT = "newest";

const EXTENSION_TYPE_MAP = {
  png: "image", jpg: "image", jpeg: "image", gif: "image", svg: "image",
  webp: "image", bmp: "image", ico: "image",
  mp4: "video", mov: "video", avi: "video", mkv: "video", webm: "video",
  pdf: "document", doc: "document", docx: "document", xls: "document",
  xlsx: "document", ppt: "document", pptx: "document", txt: "document",
  csv: "document", md: "document",
  mp3: "audio", wav: "audio", ogg: "audio", flac: "audio", aac: "audio",
  zip: "archive", rar: "archive", "7z": "archive", tar: "archive", gz: "archive",
};

// Maps a filename's extension to a media type (defaults to DEFAULT_MEDIA_TYPE).
export function mediaTypeFromName(name) {
  if (!name) {
    return DEFAULT_MEDIA_TYPE;
  }

  const ext = name.split(".").pop()?.toLowerCase();
  return EXTENSION_TYPE_MAP[ext] ?? DEFAULT_MEDIA_TYPE;
}

// Human-readable byte size ("1.5 MB"). Used by every asset size display.
export function formatBytes(bytes) {
  const value = Number(bytes) || 0;
  if (value <= 0) {
    return "0 B";
  }

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(value) / Math.log(k)), sizes.length - 1);
  return `${parseFloat((value / k ** i).toFixed(1))} ${sizes[i]}`;
}
