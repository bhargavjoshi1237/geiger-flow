"use client";

import React from "react";
import {
  MoreVertical,
  Layers,
  Power,
  Radio,
  Pencil,
  Play,
  Pause,
  Trash2,
  Copy,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ProjectItem({ id, name, provider, region, status, tags = [] }) {
  const isPaused = status?.toLowerCase() === "paused";

  return (
    <div className="bg-[#202020] border border-[#2a2a2a] rounded-sm p-6 relative group hover:border-[#474747] transition-all duration-300 flex flex-col h-full min-h-[180px] text-[#e7e7e7]">
      <div className="absolute top-4 right-4 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-[#a3a3a3] hover:text-[#e7e7e7] p-1 rounded-md hover:bg-[#2a2a2a] transition-colors focus:outline-none shrink-0 cursor-pointer">
              <MoreVertical className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[180px] bg-[#212121] border-[#2a2a2a] text-[#e7e7e7] p-1"
          >
            <DropdownMenuItem className="cursor-pointer focus:bg-[#323232] focus:text-[#e7e7e7] flex items-center gap-2 px-2 py-2">
              <Copy className="w-3 h-3 text-[#e7e7e7]" />
              <span className="text-xs text-[#e7e7e7]">Copy Project Id</span>
            </DropdownMenuItem>

            <DropdownMenuItem className="cursor-pointer focus:bg-[#323232] focus:text-[#e7e7e7] flex items-center gap-2 px-2 py-2">
              <Settings className="w-3 h-3 text-[#e7e7e7]" />
              <span className="text-xs text-[#e7e7e7]">Settings</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Link href={`/project/${id}`} className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-[#e7e7e7] text-lg font-semibold tracking-tight leading-none mb-2 group-hover:text-white">
              {name}
            </h3>
            <p className="text-[#a3a3a3] text-xs  ">
              {provider} | <span className="opacity-80">{region}</span>
            </p>
          </div>
        </div>

        <div className="mt-4 mb-auto">
          <span
            className={cn(
              "text-[10px] font-bold tracking-[0.1em] px-2 py-1 rounded-md uppercase border",
              isPaused
                ? "bg-[#1a1a1a] text-[#737373] border-[#2a2a2a]"
                : "bg-green-500/10 text-green-400 border-green-500/20",
            )}
          >
            {status}
          </span>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <div className="flex items-center justify-center w-5 h-5 rounded-full border border-[#2a2a2a] bg-[#1a1a1a]">
            {isPaused ? (
              <Power className="w-3 h-3 text-[#737373]" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] animate-pulse" />
            )}
          </div>
          <span className="text-xs text-[#737373]   ">
            Project is {status.toLowerCase()}
          </span>
        </div>

        {tags.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#2a2a2a] flex items-center gap-2">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="text-[9px] font-bold text-[#a3a3a3] bg-[#2a2a2a] px-2 py-0.5 rounded uppercase tracking-wider"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </Link>
    </div>
  );
}
