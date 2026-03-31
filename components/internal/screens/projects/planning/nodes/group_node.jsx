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
          border: "2px solid #161616",
        }}
      />
      <div
        className={cn(
          "bg-[#161616]/50 border-2 border-dashed border-[#2a2a2a] rounded-xl min-w-[300px] min-h-[200px] transition-colors duration-200",
          selected && "border-[#474747]"
        )}
      >
        {label && (
          <div className="px-4 py-2 border-b border-dashed border-[#2a2a2a]">
            <span className="text-[11px] uppercase tracking-widest text-[#525252] font-medium">
              {label}
            </span>
          </div>
        )}
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-2 !h-2 !bg-[#333] !border-[#161616] !border-2 !-bottom-1 !rounded-full"
        />
        <Handle
          type="target"
          position={Position.Top}
          className="!w-2 !h-2 !bg-[#333] !border-[#161616] !border-2 !-top-1 !rounded-full"
        />
      </div>
    </>
  );
}

export default memo(GroupNode);
