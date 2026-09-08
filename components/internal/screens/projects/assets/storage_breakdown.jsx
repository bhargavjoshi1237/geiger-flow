"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@geiger/ui";
import { Progress } from "@geiger/ui";
import { HardDrive } from "lucide-react";

// breakdown: [{ type, label, color (dot class), used (formatted), percentage }]
// derived in assets_screen by summing size_bytes grouped by media type.
export function StorageBreakdownCard({ breakdown = [] }) {
  const withBytes = breakdown.filter((item) => item.bytes > 0);

  return (
    <Card className="bg-surface-subtle border-border text-foreground hover:border-border-strong transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base text-muted-foreground">Storage Breakdown</CardTitle>
            <CardDescription className="text-text-tertiary text-xs mt-1">
              {withBytes.length > 0
                ? `${withBytes[0].label} files use the most space`
                : "No storage used yet"}
            </CardDescription>
          </div>
          <HardDrive className="w-4 h-4 text-text-tertiary" />
        </div>
      </CardHeader>
      <CardContent className="flex h-full flex-col justify-between gap-6">
        {withBytes.length > 0 ? (
          <div className="space-y-4">
            {breakdown.map((item) => (
              <div key={item.type}>
                <div className="flex items-center justify-between gap-4 mb-1.5">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className={"w-2 h-2 shrink-0 rounded-full " + item.color} />
                    <span className="truncate text-sm text-muted-foreground">{item.label}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm text-foreground">{item.used}</span>
                    <span className="w-8 text-right text-xs text-text-tertiary">{item.percentage}%</span>
                  </div>
                </div>
                <Progress value={item.percentage} className="h-1.5 bg-surface-active text-muted-foreground" />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-border p-4 text-center">
            <p className="text-sm text-muted-foreground">Upload assets to see usage by type.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
