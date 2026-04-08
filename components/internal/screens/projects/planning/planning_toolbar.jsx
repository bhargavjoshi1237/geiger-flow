"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Square,
  RectangleHorizontal,
  StickyNote,
  Diamond,
  Layers3,
  Copy,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";

export const NODE_TYPES = [
  {
    type: "custom",
    label: "Title",
    icon: Square,
    defaultData: { label: "New title" },
  },
  {
    type: "taskNode",
    label: "Task",
    icon: RectangleHorizontal,
    defaultData: { label: "Task", nodeType: "task", status: "todo" },
  },
  {
    type: "noteNode",
    label: "Note",
    icon: StickyNote,
    defaultData: { label: "", color: "#f59e0b" },
  },
  {
    type: "groupNode",
    label: "Group",
    icon: Diamond,
    defaultData: { label: "" },
  },
];

export function PlanningToolbar({
  onAddNode,
  onCreateFile,
  onDuplicateFile,
  onDeleteFile,
  canDeleteFile = false,
  onZoomIn,
  onZoomOut,
  onFitView,
  zoomLevel,
  activeFileName = "Planning file",
}) {
  return (
    <div className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-2xl border border-[#2a2a2a] bg-[#1b1b1b]/95 p-1.5 shadow-2xl shadow-black/20 backdrop-blur">
      <div className="hidden xl:flex items-center gap-2 border-r border-[#2a2a2a] px-3 pr-4">
        <div className="flex size-8 items-center justify-center rounded-xl border border-[#2a2a2a] bg-[#161616]">
          <Layers3 className="size-4 text-[#a3a3a3]" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#737373]">
            Active file
          </p>
          <p className="max-w-[220px] truncate text-sm font-medium text-[#ededed]">
            {activeFileName}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-0.5 px-1">
        {NODE_TYPES.map((nodeType) => {
          const Icon = nodeType.icon;

          return (
            <Button
              key={nodeType.type}
              variant="ghost"
              size="icon-sm"
              className="h-8 w-8 border border-transparent p-0 text-[#737373] hover:border-[#2f2f2f] hover:bg-[#242424] hover:text-[#ededed]"
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
          className="h-8 w-8 border border-transparent p-0 text-[#737373] hover:border-[#2f2f2f] hover:bg-[#242424] hover:text-[#ededed]"
          onClick={onCreateFile}
          title="Create new file"
        >
          <Plus className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="h-8 w-8 border border-transparent p-0 text-[#737373] hover:border-[#2f2f2f] hover:bg-[#242424] hover:text-[#ededed]"
          onClick={onDuplicateFile}
          title="Duplicate active file"
        >
          <Copy className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="h-8 w-8 border border-transparent p-0 text-[#737373] hover:border-[#2f2f2f] hover:bg-[#242424] hover:text-[#ededed] disabled:opacity-40"
          onClick={onDeleteFile}
          title="Delete active file"
          disabled={!canDeleteFile}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="flex items-center gap-0.5 border-l border-[#2a2a2a] px-1 pl-2">
        <Button
          variant="ghost"
          size="icon-sm"
          className="h-8 w-8 border border-transparent p-0 text-[#737373] hover:border-[#2f2f2f] hover:bg-[#242424] hover:text-[#ededed]"
          onClick={onZoomOut}
          title="Zoom out"
        >
          <ZoomOut className="size-4" />
        </Button>
        <span className="w-12 select-none text-center font-mono text-[11px] text-[#737373]">
          {Math.round(zoomLevel * 100)}%
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          className="h-8 w-8 border border-transparent p-0 text-[#737373] hover:border-[#2f2f2f] hover:bg-[#242424] hover:text-[#ededed]"
          onClick={onZoomIn}
          title="Zoom in"
        >
          <ZoomIn className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="h-8 w-8 border border-transparent p-0 text-[#737373] hover:border-[#2f2f2f] hover:bg-[#242424] hover:text-[#ededed]"
          onClick={onFitView}
          title="Fit to view"
        >
          <Maximize2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}
