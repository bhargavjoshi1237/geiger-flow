"use client";

import React, { memo } from "react";
import { Handle, Position, NodeResizer } from "@xyflow/react";
import { cn } from "@/lib/utils";

// Status accents as utility classes on the shared palette — never raw hex.
const STATUS_CLASSES = {
  todo: { text: "text-text-tertiary", dot: "bg-text-tertiary" },
  progress: { text: "text-amber-400", dot: "bg-amber-400" },
  done: { text: "text-emerald-400", dot: "bg-emerald-400" },
  blocked: { text: "text-red-400", dot: "bg-red-400" },
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
  const statusClass = STATUS_CLASSES[status] || STATUS_CLASSES.todo;
  const typeIcon = TYPE_ICONS[nodeType] || TYPE_ICONS.task;

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={220}
        minHeight={80}
        lineStyle={{
          borderColor: "var(--border-strong)",
          borderWidth: 1,
        }}
        handleStyle={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: "var(--border-strong)",
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
          <span className={cn("text-xs", statusClass.text)}>{typeIcon}</span>
          <span className="text-[10px] uppercase tracking-wider text-text-secondary font-medium">
            {nodeType}
          </span>
          <div className="flex-1" />
          <div className={cn("w-2 h-2 rounded-full", statusClass.dot)} />
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
