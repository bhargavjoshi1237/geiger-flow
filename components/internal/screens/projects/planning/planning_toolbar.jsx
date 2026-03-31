"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Square,
  RectangleHorizontal,
  StickyNote,
  Diamond,
  Triangle,
  Circle,
  ZoomIn,
  ZoomOut,
  Maximize,
  Undo2,
  Redo2,
} from "lucide-react";

const NODE_TYPES = [
  {
    type: "custom",
    label: "Node",
    icon: Square,
    defaultData: { label: "New Node" },
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
  onZoomIn,
  onZoomOut,
  onFitView,
  zoomLevel,
}) {
  return (
    <div className="flex items-center gap-1 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg p-1">
      <div className="flex items-center gap-0.5 px-1 border-r border-[#2a2a2a]">
        {NODE_TYPES.map((nodeType) => {
          const Icon = nodeType.icon;
          return (
            <Button
              key={nodeType.type}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-[#737373] hover:text-[#e7e7e7] hover:bg-[#2a2a2a]"
              onClick={() => onAddNode(nodeType)}
              title={`Add ${nodeType.label}`}
            >
              <Icon className="w-4 h-4" />
            </Button>
          );
        })}
      </div>

      <div className="flex items-center gap-0.5 px-1 border-r border-[#2a2a2a]">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-[#737373] hover:text-[#e7e7e7] hover:bg-[#2a2a2a]"
          onClick={onZoomOut}
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <span className="text-[11px] text-[#525252] w-12 text-center font-mono select-none">
          {Math.round(zoomLevel * 100)}%
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-[#737373] hover:text-[#e7e7e7] hover:bg-[#2a2a2a]"
          onClick={onZoomIn}
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-0.5 px-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-[#737373] hover:text-[#e7e7e7] hover:bg-[#2a2a2a]"
          onClick={onFitView}
          title="Fit View"
        >
          <Maximize className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
