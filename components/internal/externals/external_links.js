"use client";

import {
  BookOpen,
  CircleHelp,
  Database,
  ExternalLink,
  FileText,
  Gauge,
  Github,
  Link,
  MessageCircle,
} from "lucide-react";

export const EXTERNAL_LINKS_STORAGE_KEY = "flow.external.links";

export function getProjectExternalLinksStorageKey(projectId) {
  return `${EXTERNAL_LINKS_STORAGE_KEY}.project.${projectId || "unknown"}`;
}

export const EXTERNAL_ICON_OPTIONS = [
  { value: "ExternalLink", label: "External link" },
  { value: "Link", label: "Link" },
  { value: "BookOpen", label: "Docs" },
  { value: "Gauge", label: "Status" },
  { value: "MessageCircle", label: "Support" },
  { value: "FileText", label: "File" },
  { value: "Github", label: "GitHub" },
  { value: "Database", label: "Database" },
  { value: "CircleHelp", label: "Help" },
];

export function ExternalLinkIcon({ iconName, ...props }) {
  switch (iconName) {
    case "Link":
      return <Link {...props} />;
    case "BookOpen":
      return <BookOpen {...props} />;
    case "Gauge":
      return <Gauge {...props} />;
    case "MessageCircle":
      return <MessageCircle {...props} />;
    case "FileText":
      return <FileText {...props} />;
    case "Github":
      return <Github {...props} />;
    case "Database":
      return <Database {...props} />;
    case "CircleHelp":
      return <CircleHelp {...props} />;
    default:
      return <ExternalLink {...props} />;
  }
}

export function normalizeExternalUrl(url) {
  const value = String(url || "").trim();

  if (!value) {
    return "";
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `https://${value}`;
}
