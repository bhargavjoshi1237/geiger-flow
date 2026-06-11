"use client";

import React, { memo } from "react";
import { Handle, Position, NodeResizer } from "@xyflow/react";
import { cn } from "@/lib/utils";

const STATUS_COLORS = {
  todo: "#525252",
  progress: "#f59e0b",
  done: "#10b981",
  blocked: "#ef4444",
};

const TYPE_ICONS = {
  milestone: "\u25C6",
  goal: "\u25B2",
  task: "\u25A0",
  issue: "\u25CF",
};

function TaskNode({ data, selected }) {
  const status = data.status || "todo";
  const nodeType = data.nodeType || "task";
  const statusColor = STATUS_COLORS[status] || STATUS_COLORS.todo;
  const typeIcon = TYPE_ICONS[nodeType] || TYPE_ICONS.task;

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={220}
        minHeight={80}
        lineStyle={{
          borderColor: "#474747",
          borderWidth: 1,
        }}
        handleStyle={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: "#474747",
          border: "2px solid var(--background)",
        }}
      />
      <div
        className={cn(
          "bg-surface-dialog border border-border rounded-lg shadow-md min-w-[220px] transition-colors duration-200 overflow-hidden",
          selected && "border-border-strong shadow-lg shadow-black/20"
        )}
      >
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border bg-surface-subtle">
          <span className="text-xs" style={{ color: statusColor }}>
            {typeIcon}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-text-secondary font-medium">
            {nodeType}
          </span>
          <div className="flex-1" />
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: statusColor }}
          />
        </div>
        <div className="px-3 py-2.5">
          <div className="text-foreground text-sm leading-relaxed whitespace-pre-wrap break-words">
            {data.label}
          </div>
          {data.assignee && (
            <div className="mt-2 flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-surface-hover border border-border flex items-center justify-center text-[8px] text-muted-foreground">
                {data.assignee.charAt(0)}
              </div>
              <span className="text-[10px] text-text-secondary">{data.assignee}</span>
            </div>
          )}
        </div>
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-2 !h-2 !bg-border-strong !border-background !border-2 !-bottom-1 !rounded-full"
        />
        <Handle
          type="target"
          position={Position.Top}
          className="!w-2 !h-2 !bg-border-strong !border-background !border-2 !-top-1 !rounded-full"
        />
      </div>
    </>
  );
}

export default memo(TaskNode);
