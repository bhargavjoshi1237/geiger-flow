"use client";

import React, { memo } from "react";
import { Handle, Position, NodeResizer } from "@xyflow/react";
import { cn } from "@/lib/utils";

function GroupNode({ data, selected }) {
  const label = data.label || "";

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={300}
        minHeight={200}
        lineStyle={{
          borderColor: "#333",
          borderWidth: 1,
          borderStyle: "dashed",
        }}
        handleStyle={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: "#333",
          border: "2px solid var(--background)",
        }}
      />
      <div
        className={cn(
          "bg-background/50 border-2 border-dashed border-border rounded-xl min-w-[300px] min-h-[200px] transition-colors duration-200",
          selected && "border-border-strong"
        )}
      >
        {label && (
          <div className="px-4 py-2 border-b border-dashed border-border">
            <span className="text-[11px] uppercase tracking-widest text-text-tertiary font-medium">
              {label}
            </span>
          </div>
        )}
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-2 !h-2 !bg-surface-strong !border-background !border-2 !-bottom-1 !rounded-full"
        />
        <Handle
          type="target"
          position={Position.Top}
          className="!w-2 !h-2 !bg-surface-strong !border-background !border-2 !-top-1 !rounded-full"
        />
      </div>
    </>
  );
}

export default memo(GroupNode);
