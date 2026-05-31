"use client";

import React from "react";
import { Handle, Position } from "@xyflow/react";
import { architectureIconMap } from "../data/node_catalogue";
import { IconifyLogo } from "../icons/iconify_logo";
import { cn } from "@/lib/utils";

const handleClass =
  "!h-2.5 !w-2.5 !border !border-[#525252] !bg-[#161616] transition-colors";

export function ArchitectureNode({ data, selected }) {
  const Icon = architectureIconMap[data.icon] || architectureIconMap.boxes;
  const accent = data.accent || "#38bdf8";

  return (
    <div
      className={cn(
        "group relative w-[230px] rounded-lg border bg-[#202020] p-3 text-[#ededed] shadow-2xl transition-colors",
        selected ? "border-[#474747]" : "border-[#2a2a2a] hover:border-[#333333]",
      )}
      style={{ boxShadow: selected ? `0 0 0 1px ${accent}55, 0 18px 40px #0008` : undefined }}
    >
      <Handle type="target" position={Position.Top} className={handleClass} />
      <Handle type="source" position={Position.Bottom} className={handleClass} />
      <Handle type="target" position={Position.Left} className={handleClass} />
      <Handle type="source" position={Position.Right} className={handleClass} />

      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border"
          style={{
            backgroundColor: `${accent}16`,
            borderColor: `${accent}44`,
            color: accent,
          }}
        >
          {data.iconifyName ? (
            <IconifyLogo name={data.iconifyName} className="h-6 w-6" />
          ) : (
            <Icon className="h-5 w-5" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold leading-5 text-white">
              {data.label || "Architecture Node"}
            </p>
          </div>
          <p className="mt-0.5 truncate text-[11px] font-medium uppercase tracking-[0.08em] text-[#737373]">
            {data.category || "System"}
          </p>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-xs leading-5 text-[#a3a3a3]">
        {data.description || "Describe this system component."}
      </p>

      {data.meta ? (
        <div className="mt-3 flex items-center justify-between border-t border-[#2a2a2a] pt-2 text-[11px] text-[#737373]">
          <span className="truncate">{data.meta}</span>
          <span className="ml-2 shrink-0 text-[#a3a3a3]">
            {data.expenseEnabled === false || !data.monthlyCost
              ? "No cost"
              : `$${Number(data.monthlyCost).toLocaleString()}/mo`}
          </span>
        </div>
      ) : null}
    </div>
  );
}
