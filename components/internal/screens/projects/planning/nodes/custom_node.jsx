"use client";

import React, { memo } from "react";
import { Handle, Position, NodeResizer } from "@xyflow/react";
import { cn } from "@/lib/utils";

function CustomNode({ data, selected, id }) {
  const textAlign = data.textAlign || "left";
  const bold = data.bold || false;
  const italic = data.italic || false;

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={180}
        minHeight={50}
        lineStyle={{
          borderColor: "#474747",
          borderWidth: 1,
        }}
        handleStyle={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: "#474747",
          border: "2px solid #161616",
        }}
      />
      <div
        className={cn(
          "bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg shadow-md min-w-[180px] min-h-[40px] transition-colors duration-200 overflow-hidden",
          selected && "border-[#474747] shadow-lg shadow-black/20"
        )}
      >
        <div className="px-4 py-3">
          <div
            className={cn(
              "text-[#e7e7e7] text-sm leading-relaxed whitespace-pre-wrap break-words",
              textAlign === "center" && "text-center",
              textAlign === "right" && "text-right",
              bold && "font-semibold",
              italic && "italic"
            )}
          >
            {data.label}
          </div>
        </div>
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-2 !h-2 !bg-[#474747] !border-[#161616] !border-2 !-bottom-1 !rounded-full"
        />
        <Handle
          type="target"
          position={Position.Top}
          className="!w-2 !h-2 !bg-[#474747] !border-[#161616] !border-2 !-top-1 !rounded-full"
        />
      </div>
    </>
  );
}

export default memo(CustomNode);
