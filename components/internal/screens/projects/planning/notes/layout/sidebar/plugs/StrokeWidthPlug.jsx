"use client";

import React from "react";
import { AlignJustify } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { SidebarButton } from "../SidebarPrimitives";

const STROKE_WIDTHS = [
  { label: "Thin", value: 1 },
  { label: "Medium", value: 2 },
  { label: "Thick", value: 4 },
];

export const StrokeWidthPlug = ({ value, onChange }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <SidebarButton icon={AlignJustify} label="Stroke Weight" />
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={8}
        className="w-40 bg-[#1e1e1e] border-zinc-800 p-1 shadow-xl rounded-xl"
      >
        <div className="flex flex-col gap-0.5">
          <Label className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
            Thickness
          </Label>
          {STROKE_WIDTHS.map((sw) => (
            <button
              key={sw.label}
              onClick={() => onChange(sw.value)}
              className={`flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors
                ${value === sw.value ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"}
            `}
            >
              <div
                className="w-12 bg-current rounded-full transition-all"
                style={{ height: sw.value }}
              />
              <span className="text-xs">{sw.label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
