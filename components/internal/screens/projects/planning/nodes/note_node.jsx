"use client";

import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";

function NoteNode({ data, selected }) {
  const color = data.color || "#f59e0b";

  return (
    <div
      className={cn(
        "bg-surface-dialog border border-border rounded-lg shadow-md min-w-[160px] min-h-[80px] transition-colors duration-200 overflow-hidden",
        selected && "border-border-strong shadow-lg shadow-black/20"
      )}
    >
      <div
        className="h-1 rounded-t-lg"
        style={{ backgroundColor: color }}
      />
      <div className="px-3 py-2.5">
        {data.label && (
          <div className="text-foreground text-sm leading-relaxed whitespace-pre-wrap break-words">
            {data.label}
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
  );
}

export default memo(NoteNode);
