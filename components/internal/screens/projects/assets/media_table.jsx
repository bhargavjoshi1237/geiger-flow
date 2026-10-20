"use client";

import React from "react";
import { ActionMenu, Badge } from "@geiger/ui";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/internal/shared/screen_kit";
import {
  fileExtension,
  formatAssetDate,
  formatBytes,
  mediaMeta,
} from "@/features/assets/constants";
import { AssetChip } from "./asset_preview";

// List view: one row per asset; row click opens the detail sheet.
export function MediaTable({ assets, onOpen, actions }) {
  const columns = [
    {
      key: "name",
      header: "Name",
      render: (asset) => (
        <div className="flex min-w-0 max-w-[420px] items-center gap-3">
          <AssetChip asset={asset} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground" title={asset.name}>
              {asset.name}
            </p>
            <p className="truncate text-xs text-text-secondary">
              {asset.owner || "Unknown owner"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (asset) => {
        const meta = mediaMeta(asset.mediaType);
        return (
          <Badge className={cn("border", meta.className)}>
            {fileExtension(asset.name) || meta.label}
          </Badge>
        );
      },
    },
    {
      key: "size",
      header: "Size",
      headClassName: "hidden sm:table-cell",
      className: "hidden sm:table-cell",
      render: (asset) => (
        <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">
          {formatBytes(asset.sizeBytes)}
        </span>
      ),
    },
    {
      key: "uploaded",
      header: "Uploaded",
      headClassName: "hidden md:table-cell",
      className: "hidden md:table-cell",
      render: (asset) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {formatAssetDate(asset.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (asset) => (
        <div className="flex justify-end">
          <ActionMenu label={`Actions for ${asset.name}`} items={actions(asset)} />
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={assets}
      getRowKey={(asset) => asset.id}
      onRowClick={onOpen}
    />
  );
}
