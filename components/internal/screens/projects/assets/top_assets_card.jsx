"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { mediaItems, typeIcons, typeColors } from "./data";

export function TopAssetsCard() {
  const sorted = [...mediaItems].sort((a, b) => b.usageCount - a.usageCount).slice(0, 5);

  return (
    <Card className="bg-[#1a1a1a] border-[#2a2a2a] text-[#e7e7e7] hover:border-[#474747] transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Top Used Assets</CardTitle>
          <TrendingUp className="w-4 h-4 text-[#525252]" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sorted.map((item, i) => {
            const IconComp = typeIcons[item.type];
            return (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-[#2a2a2a] last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#525252] w-4">{i + 1}</span>
                  <IconComp className={"w-4 h-4 " + typeColors[item.type]} />
                  <span className="text-sm text-[#e7e7e7]">{item.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-[#525252]">{item.type}</span>
                  <span className="text-sm font-medium text-[#a3a3a3]">{item.usageCount} Use</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
