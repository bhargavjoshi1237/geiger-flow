"use client";

import React from "react";
import { Card, CardContent } from "@geiger/ui";
import { FolderOpen, HardDrive, Layers, File } from "lucide-react";

export function StatsCard({ icon: Icon, label, value }) {
  return (
    <Card className="gap-0 rounded-lg border-border bg-surface-subtle p-3 text-foreground shadow-none transition-all duration-300 hover:border-border-strong">
      <CardContent className="flex items-center gap-3 p-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-surface-card">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="truncate text-xs font-medium text-muted-foreground">{label}</span>
          <div className="mt-1 text-lg font-semibold leading-none text-foreground">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// stats: { total, storageUsed, typeCount, largest } — all derived from the
// fetched rows in assets_screen (see useMemo there).
export function StatsRow({ stats }) {
  const { total = 0, storageUsed = "0 B", typeCount = 0, largest = "0 B" } = stats ?? {};

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard icon={FolderOpen} label="Total Assets" value={String(total)} />
      <StatsCard icon={HardDrive} label="Storage Used" value={storageUsed} />
      <StatsCard icon={Layers} label="Asset Types" value={String(typeCount)} />
      <StatsCard icon={File} label="Largest Asset" value={largest} />
    </div>
  );
}
