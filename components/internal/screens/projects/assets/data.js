import {
  Image,
  Film,
  FileText,
  Music,
  Archive,
  Folder,
  Upload,
  Eye,
  Download,
} from "lucide-react";

export const assetFolders = [];

export const mediaItems = [];

export const typeIcons = { Folder, Image, Video: Film, Document: FileText, Audio: Music, Archive };

export const typeColors = {
  Folder: "text-zinc-200",
  Image: "text-zinc-200",
  Video: "text-zinc-200",
  Document: "text-zinc-200",
  Audio: "text-zinc-200",
  Archive: "text-zinc-200",
};

export const storageBreakdown = [];

export const recentActivities = [];

export const damFeatures = [];

export function getFileTypeFromName(name) {
  const ext = name.split(".").pop()?.toLowerCase();
  if (!ext) return "Document";
  const map = {
    png: "Image", jpg: "Image", jpeg: "Image", gif: "Image", svg: "Image",
    webp: "Image", bmp: "Image", ico: "Image",
    mp4: "Video", mov: "Video", avi: "Video", mkv: "Video", webm: "Video",
    pdf: "Document", doc: "Document", docx: "Document", xls: "Document",
    xlsx: "Document", ppt: "Document", pptx: "Document", txt: "Document", csv: "Document",
    mp3: "Audio", wav: "Audio", ogg: "Audio", flac: "Audio", aac: "Audio",
    zip: "Archive", rar: "Archive", "7z": "Archive", tar: "Archive", gz: "Archive",
  };
  return map[ext] || "Document";
}

export function formatFileSize(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
