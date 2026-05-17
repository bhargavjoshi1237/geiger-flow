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

export const assetFolders = [
  {
    id: "brand",
    name: "Brand Library",
    description: "Guidelines, icon systems, and approved visuals",
    updatedAt: "Mar 28, 2026",
  },
  {
    id: "campaigns",
    name: "Campaign Media",
    description: "Launch videos, hero imagery, and delivery packs",
    updatedAt: "Mar 26, 2026",
  },
  {
    id: "audio",
    name: "Audio Beds",
    description: "Loops, effects, and approved sound assets",
    updatedAt: "Mar 22, 2026",
  },
  {
    id: "releases",
    name: "Release Archives",
    description: "Bundles, exports, and archived deliverables",
    updatedAt: "Mar 18, 2026",
  },
];

export const mediaItems = [
  {
    id: 1,
    folderId: "campaigns",
    name: "hero-banner-v3.png",
    type: "Image",
    format: "PNG",
    size: "4.2 MB",
    dimensions: "1920 x 1080",
    uploadedBy: "Sarah Chen",
    uploadedAt: "Mar 28, 2026",
    status: "Active",
    usageCount: 12,
    tags: ["Homepage", "Approved", "Q2"],
  },
  {
    id: 2,
    folderId: "campaigns",
    name: "product-demo-final.mp4",
    type: "Video",
    format: "MP4",
    size: "284.6 MB",
    dimensions: "3840 x 2160",
    uploadedBy: "James Wilson",
    uploadedAt: "Mar 26, 2026",
    status: "Active",
    usageCount: 5,
    tags: ["Launch", "Final"],
  },
  {
    id: 3,
    folderId: "brand",
    name: "brand-guidelines-q2.pdf",
    type: "Document",
    format: "PDF",
    size: "18.3 MB",
    dimensions: "--",
    uploadedBy: "Emily Davis",
    uploadedAt: "Mar 25, 2026",
    status: "Active",
    usageCount: 22,
    tags: ["Brand", "Required"],
  },
  {
    id: 4,
    folderId: "audio",
    name: "ambient-loop.wav",
    type: "Audio",
    format: "WAV",
    size: "52.1 MB",
    dimensions: "--",
    uploadedBy: "Alex Rivera",
    uploadedAt: "Mar 22, 2026",
    status: "Draft",
    usageCount: 0,
    tags: ["Loop", "Draft"],
  },
  {
    id: 5,
    folderId: "brand",
    name: "icon-set-v2.svg",
    type: "Image",
    format: "SVG",
    size: "340 KB",
    dimensions: "Scalable",
    uploadedBy: "Sarah Chen",
    uploadedAt: "Mar 20, 2026",
    status: "Active",
    usageCount: 38,
    tags: ["Icons", "Approved"],
  },
  {
    id: 6,
    folderId: "releases",
    name: "release-bundle-v4.zip",
    type: "Archive",
    format: "ZIP",
    size: "1.1 GB",
    dimensions: "--",
    uploadedBy: "DevOps Bot",
    uploadedAt: "Mar 18, 2026",
    status: "Archived",
    usageCount: 3,
    tags: ["Release", "Archive"],
  },
];

export const typeIcons = { Folder, Image, Video: Film, Document: FileText, Audio: Music, Archive };

export const typeColors = {
  Folder: "text-zinc-200",
  Image: "text-zinc-200",
  Video: "text-zinc-200",
  Document: "text-zinc-200",
  Audio: "text-zinc-200",
  Archive: "text-zinc-200",
};

export const storageBreakdown = [
  { type: "Images", used: "2.4 GB", percentage: 35, color: "bg-blue-500" },
  { type: "Videos", used: "3.1 GB", percentage: 45, color: "bg-purple-500" },
  { type: "Documents", used: "800 MB", percentage: 12, color: "bg-orange-500" },
  { type: "Audio", used: "350 MB", percentage: 5, color: "bg-pink-500" },
  { type: "Archives", used: "180 MB", percentage: 3, color: "bg-yellow-500" },
];

export const recentActivities = [
  { action: "Uploaded", file: "hero-banner-v3.png", user: "Sarah Chen", time: "2 hours ago", icon: Upload },
  { action: "Viewed", file: "brand-guidelines-q2.pdf", user: "James Wilson", time: "5 hours ago", icon: Eye },
  { action: "Downloaded", file: "release-bundle-v4.zip", user: "Emily Davis", time: "1 day ago", icon: Download },
  { action: "Archived", file: "legacy-assets-pack.zip", user: "Alex Rivera", time: "2 days ago", icon: Archive },
];

export const damFeatures = [
  { iconKey: "Layers", label: "Version History" },
  { iconKey: "File", label: "Metadata & Tags" },
  { iconKey: "Eye", label: "Preview & Compare" },
  { iconKey: "HardDrive", label: "Bulk Operations" },
];

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
