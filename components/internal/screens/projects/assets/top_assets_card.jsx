"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@geiger/ui";
import { TrendingUp } from "lucide-react";
import { MEDIA_TYPE_MAP, formatBytes } from "@/features/assets/constants";
import { typeIcons, typeColors } from "./data";

// assets: the largest rows first (sorted + sliced in assets_screen).
export function TopAssetsCard({ assets = [] }) {
  return (
    <Card className="bg-surface-subtle border-border text-foreground hover:border-border-strong transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Largest Assets</CardTitle>
            <CardDescription className="text-xs text-text-tertiary mt-1">
              Biggest files in this project
            </CardDescription>
          </div>
          <TrendingUp className="w-4 h-4 text-text-tertiary" />
        </div>
      </CardHeader>
      <CardContent>
        {assets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No assets uploaded yet.</p>
        ) : (
          <div className="space-y-3">
            {assets.map((item, i) => {
              const IconComp = typeIcons[item.mediaType];
              return (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="text-xs text-text-tertiary w-4">{i + 1}</span>
                    <IconComp className={"w-4 h-4 shrink-0 " + typeColors[item.mediaType]} />
                    <span className="truncate text-sm text-foreground">{item.name}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-4 pl-3">
                    <span className="text-xs text-text-tertiary">{MEDIA_TYPE_MAP[item.mediaType]?.label ?? item.mediaType}</span>
                    <span className="text-sm font-medium text-muted-foreground">{formatBytes(item.sizeBytes)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
