"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Square,
  MessageSquare,
  Link,
  LayoutDashboard,
  FileText,
  Image,
  Upload,
  Calendar,
  Copy,
  Trash2,
} from "lucide-react";

export const NODE_TYPES = [
  {
    type: "custom",
    label: "Note",
    icon: Square,
    defaultData: { label: "", backgroundColor: "#333333" },
  },
  {
    type: "comment",
    label: "Comment",
    icon: MessageSquare,
    defaultData: { label: "Comment", backgroundColor: "#2a2a2a" },
  },
  {
    type: "link",
    label: "Link",
    icon: Link,
    defaultData: { label: "Link", url: "", backgroundColor: "#1e1e1e" },
  },
  {
    type: "board",
    label: "Board",
    icon: LayoutDashboard,
    defaultData: { label: "Untitled Board", name: "Untitled Board" },
  },
  {
    type: "document",
    label: "Document",
    icon: FileText,
    defaultData: { label: "Untitled Document", documentId: null },
  },
  {
    type: "image",
    label: "Image",
    icon: Image,
    defaultData: { label: "Image" },
  },
  {
    type: "file",
    label: "File",
    icon: Upload,
    defaultData: { label: "File", fileName: "No file selected" },
  },
  {
    type: "calendar",
    label: "Calendar",
    icon: Calendar,
    defaultData: { calendarTheme: "light", calendarStyle: "default", backgroundColor: "#2a2a2a" },
  },
];

export function PlanningToolbar({
  onAddNode,
  onCreateFile,
  onDuplicateFile,
  onDeleteFile,
  canDeleteFile = false,
}) {
  return (
    <div className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-xl border border-[#2a2a2a]/70 bg-[#1b1b1b]/80 p-1 shadow-xl shadow-black/20 backdrop-blur-md">
      <div className="flex items-center gap-0.5 px-1">
        {NODE_TYPES.map((nodeType) => {
          const Icon = nodeType.icon;

          return (
            <Button
              key={nodeType.type}
              variant="ghost"
              size="icon-sm"
              className="h-8 w-8 rounded-md border border-transparent p-0 text-[#737373] hover:border-[#2f2f2f] hover:bg-[#242424] hover:text-[#ededed]"
              onClick={() => onAddNode(nodeType)}
              title={`Add ${nodeType.label}`}
            >
              <Icon className="size-4" />
            </Button>
          );
        })}
      </div>

      <div className="flex items-center gap-0.5 border-l border-[#2a2a2a] px-1 pl-2">
        <Button
          variant="ghost"
          size="icon-sm"
          className="h-8 w-8 rounded-md border border-transparent p-0 text-[#737373] hover:border-[#2f2f2f] hover:bg-[#242424] hover:text-[#ededed]"
          onClick={onCreateFile}
          title="Create new file"
        >
          <Plus className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="h-8 w-8 rounded-md border border-transparent p-0 text-[#737373] hover:border-[#2f2f2f] hover:bg-[#242424] hover:text-[#ededed]"
          onClick={onDuplicateFile}
          title="Duplicate active file"
        >
          <Copy className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="h-8 w-8 rounded-md border border-transparent p-0 text-[#737373] hover:border-[#2f2f2f] hover:bg-[#242424] hover:text-[#ededed] disabled:opacity-40"
          onClick={onDeleteFile}
          title="Delete active file"
          disabled={!canDeleteFile}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}
