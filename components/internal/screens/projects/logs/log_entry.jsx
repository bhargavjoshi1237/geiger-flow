"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Info,
  AlertTriangle,
  AlertCircle,
  Bug,
  Terminal,
  Clock,
  User,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LEVEL_CONFIG = {
  info: {
    label: "Info",
    icon: Info,
    className: "bg-zinc-500/10 border-zinc-500/20 text-muted-foreground",
  },
  warning: {
    label: "Warning",
    icon: AlertTriangle,
    className: "bg-zinc-500/10 border-zinc-500/20 text-muted-foreground",
  },
  error: {
    label: "Error",
    icon: AlertCircle,
    className: "bg-zinc-500/10 border-zinc-500/20 text-muted-foreground",
  },
  debug: {
    label: "Debug",
    icon: Bug,
    className: "bg-zinc-500/10 border-zinc-500/20 text-muted-foreground",
  },
  system: {
    label: "System",
    icon: Terminal,
    className: "bg-zinc-500/10 border-zinc-500/20 text-muted-foreground",
  },
};

function formatRelativeTime(timestamp) {
  try {
    const date = new Date(timestamp);
    return isNaN(date.getTime())
      ? String(timestamp)
      : formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return String(timestamp);
  }
}

export function formatExactTime(timestamp) {
  try {
    const date = new Date(timestamp);
    return isNaN(date.getTime())
      ? String(timestamp)
      : date.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });
  } catch {
    return String(timestamp);
  }
}

export function LevelBadge({ level }) {
  const config = LEVEL_CONFIG[level] || LEVEL_CONFIG.info;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-semibold uppercase tracking-wider",
        config.className,
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

export function LogEntry({ log, onClick }) {
  const config = LEVEL_CONFIG[log.level] || LEVEL_CONFIG.info;
  const Icon = config.icon;

  return (
    <div
      onClick={() => onClick(log)}
      className={cn(
        "group flex items-start gap-4 px-4 py-3 rounded-xl border transition-all duration-200 cursor-pointer",
        "bg-surface-subtle border-border hover:border-border-strong hover:bg-surface-card",
      )}
    >
      <div className="flex-shrink-0 mt-0.5">
        <div
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-lg border",
            config.className,
          )}
        >
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3 mb-1">
          <h3 className="text-[13px] font-medium text-foreground truncate group-hover:text-foreground transition-colors">
            {log.title}
          </h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[11px] text-text-secondary whitespace-nowrap">
              {formatExactTime(log.timestamp)}  ({formatRelativeTime(log.timestamp)})
            </span></div>
        </div>

        <p className="text-[12px] text-text-secondary leading-relaxed line-clamp-2 mb-2.5">
          {log.message}
        </p>
      </div>
    </div>
  );
}

export { LEVEL_CONFIG };
