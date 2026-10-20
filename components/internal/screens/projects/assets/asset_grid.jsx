"use client";

import React from "react";
import { ActionMenu } from "@geiger/ui";
import { cn } from "@/lib/utils";
import {
  formatAssetDate,
  formatBytes,
  mediaMeta,
} from "@/features/assets/constants";
import { AssetThumbnail } from "./asset_preview";

function AssetCard({ asset, onOpen, actions }) {
  const meta = mediaMeta(asset.mediaType);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Open ${asset.name}`}
      onClick={() => onOpen(asset)}
      onKeyDown={(event) => {
        // Ignore keys bubbling up from the action menu trigger.
        if (event.target !== event.currentTarget) {
          return;
        }
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(asset);
        }
      }}
      className="group flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-surface-subtle transition-colors duration-200 hover:border-border-strong focus-visible:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      <div className="relative aspect-[4/3] overflow-hidden border-b border-border bg-surface-card">
        <div className="h-full w-full transition-transform duration-300 ease-out group-hover:scale-[1.03]">
          <AssetThumbnail asset={asset} />
        </div>
        <span className="pointer-events-none absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-md border border-border bg-background/85 px-2 py-0.5 text-[11px] font-medium text-muted-foreground backdrop-blur-sm">
          <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
          {meta.label}
        </span>
      </div>

      <div className="flex items-center gap-2 py-2.5 pl-3.5 pr-1.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground" title={asset.name}>
            {asset.name}
          </p>
          <p className="mt-0.5 truncate text-xs text-text-secondary">
            {formatBytes(asset.sizeBytes)}
            <span className="px-1.5 text-text-tertiary">·</span>
            {formatAssetDate(asset.createdAt)}
          </p>
        </div>
        <ActionMenu label={`Actions for ${asset.name}`} items={actions(asset)} />
      </div>
    </div>
  );
}

// Responsive thumbnail grid; `actions(asset)` builds each card's ActionMenu items.
export function AssetGrid({ assets, onOpen, actions }) {
  return (
    <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {assets.map((asset) => (
        <AssetCard key={asset.id} asset={asset} onOpen={onOpen} actions={actions} />
      ))}
    </div>
  );
}
