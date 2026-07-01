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
import { Button } from "@geiger/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@geiger/ui";

export function ProjectItem({ id, name, provider, region, status, tags = [] }) {
  const isPaused = status?.toLowerCase() === "paused";

  return (
    <div className="bg-surface-card border border-border rounded-sm p-6 relative group hover:border-border-strong transition-all duration-300 flex flex-col h-full min-h-[180px] text-foreground">
      <div className="absolute top-4 right-4 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-surface-hover transition-colors focus:outline-none shrink-0 cursor-pointer">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[180px] bg-surface-card border-border text-foreground p-1"
          >
            <DropdownMenuItem className="cursor-pointer focus:bg-surface-strong focus:text-foreground flex items-center gap-2 px-2 py-2">
              <Copy className="w-3 h-3 text-foreground" />
              <span className="text-xs text-foreground">Copy Project Id</span>
            </DropdownMenuItem>

            <DropdownMenuItem className="cursor-pointer focus:bg-surface-strong focus:text-foreground flex items-center gap-2 px-2 py-2">
              <Settings className="w-3 h-3 text-foreground" />
              <span className="text-xs text-foreground">Settings</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Link href={`/project/${id}`} className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-foreground text-lg font-semibold tracking-tight leading-none mb-2 group-hover:text-foreground">
              {name}
            </h3>
            <p className="text-muted-foreground text-xs  ">
              {provider} | <span className="opacity-80">{region}</span>
            </p>
          </div>
        </div>

        <div className="mt-4 mb-auto">
          <span
            className={cn(
              "text-[10px] font-bold tracking-[0.1em] px-2 py-1 rounded-md uppercase border",
              isPaused
                ? "bg-surface-subtle text-text-secondary border-border"
                : "bg-green-500/10 text-green-400 border-green-500/20",
            )}
          >
            {status}
          </span>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <div className="flex items-center justify-center w-5 h-5 rounded-full border border-border bg-surface-subtle">
            {isPaused ? (
              <Power className="w-3 h-3 text-text-secondary" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] animate-pulse" />
            )}
          </div>
          <span className="text-xs text-text-secondary   ">
            Project is {status.toLowerCase()}
          </span>
        </div>

        {tags.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="text-[9px] font-bold text-muted-foreground bg-surface-hover px-2 py-0.5 rounded uppercase tracking-wider"
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
