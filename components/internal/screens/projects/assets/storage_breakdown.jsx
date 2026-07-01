"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@geiger/ui";
import { Progress } from "@geiger/ui";
import { HardDrive, Zap } from "lucide-react";
import { storageBreakdown } from "./data";

export function StorageBreakdownCard() {
  return (
    <Card className="bg-surface-subtle border-border text-foreground hover:border-border-strong transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base text-muted-foreground">Storage Breakdown</CardTitle>
            <CardDescription className="text-text-tertiary text-xs mt-1">
              6.83 GB of 10 GB used
            </CardDescription>
          </div>
          <HardDrive className="w-4 h-4 text-text-tertiary" />
        </div>
      </CardHeader>
      <CardContent className="flex h-full flex-col justify-between gap-6">
        <div className="space-y-4">
          <Progress value={68} className="h-2 text-muted-foreground" />
          <div className="space-y-3">
            {storageBreakdown.map((item) => (
              <div key={item.type} className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-2">
                  <div className={"w-2 h-2 shrink-0 rounded-full " + item.color} />
                  <span className="truncate text-sm text-muted-foreground">{item.type}</span>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm text-foreground">{item.used}</span>
                  <span className="w-8 text-right text-xs text-text-tertiary">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex-col items-start justify-between gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-text-tertiary" />
                <span className="text-xs text-text-tertiary">Monthly Bandwidth</span>
              </div>
              <span className="text-xs text-foreground font-medium">42.6 GB / 100 GB</span>
            </div>
            <Progress value={43} className="h-1.5 mt-2 bg-surface-active text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
