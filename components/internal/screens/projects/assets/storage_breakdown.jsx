"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { MEDIA_TYPES, formatBytes, mediaMeta } from "@/features/assets/constants";

// Storage split by media type: a segmented bar plus a legend that doubles as the type filter.
export function StorageBreakdown({ assets, activeType, onSelectType }) {
  const { segments, totalBytes } = useMemo(() => {
    const byType = new Map();
    assets.forEach((asset) => {
      const entry = byType.get(asset.mediaType) ?? { count: 0, bytes: 0 };
      byType.set(asset.mediaType, { count: entry.count + 1, bytes: entry.bytes + asset.sizeBytes });
    });
    return {
      totalBytes: assets.reduce((sum, asset) => sum + asset.sizeBytes, 0),
      segments: MEDIA_TYPES.filter((type) => byType.has(type))
        .map((type) => ({ type, ...byType.get(type) }))
        .sort((a, b) => b.bytes - a.bytes),
    };
  }, [assets]);

  if (segments.length === 0) {
    return null;
  }

  const filtering = activeType !== "all";

  return (
    <div className="rounded-xl border border-border bg-surface-subtle p-4">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[11px] font-medium uppercase tracking-wider text-text-secondary">
          Storage by type
        </span>
        <span className="text-xs tabular-nums text-text-tertiary">
          {formatBytes(totalBytes)} total
        </span>
      </div>

      <div className="mt-3 flex h-2 w-full gap-0.5 overflow-hidden rounded-full bg-surface-card">
        {segments.map((segment) => (
          <div
            key={segment.type}
            title={`${mediaMeta(segment.type).label}: ${formatBytes(segment.bytes)}`}
            className={cn(
              "h-full min-w-1.5 transition-opacity duration-200",
              mediaMeta(segment.type).dot,
              filtering && activeType !== segment.type && "opacity-25",
            )}
            // Zero-byte libraries fall back to splitting by file count.
            style={{ flexGrow: totalBytes > 0 ? segment.bytes : segment.count, flexBasis: 0 }}
          />
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-1 gap-y-1">
        {segments.map((segment) => {
          const meta = mediaMeta(segment.type);
          const active = activeType === segment.type;
          return (
            <button
              key={segment.type}
              type="button"
              aria-pressed={active}
              onClick={() => onSelectType(active ? "all" : segment.type)}
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors",
                active
                  ? "bg-surface-hover text-foreground"
                  : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
                filtering && !active && "opacity-60 hover:opacity-100",
              )}
            >
              <span className={cn("h-2 w-2 rounded-full", meta.dot)} />
              <span className="font-medium">{meta.label}</span>
              <span className="tabular-nums text-text-tertiary">
                {segment.count} · {formatBytes(segment.bytes)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
