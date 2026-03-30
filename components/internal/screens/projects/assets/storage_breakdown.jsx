"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  HardDrive, ShieldCheck, Zap, Calendar, BarChart3, Info,
} from "lucide-react";
import { storageBreakdown } from "./data";

export function StorageBreakdownCard() {
  return (
    <Card className="bg-[#1a1a1a] border-[#2a2a2a] text-[#e7e7e7] hover:border-[#474747] transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Storage Breakdown</CardTitle>
            <CardDescription className="text-[#525252] text-xs mt-1">
              6.83 GB of 10 GB used
            </CardDescription>
          </div>
          <HardDrive className="w-4 h-4 text-[#525252]" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col justify-between h-full">
       <div className="space-y-3">
         <Progress value={68} className="h-2 bg-[#242424]" />
        {storageBreakdown.map((item) => (
          <div key={item.type} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={"w-2 h-2 rounded-full " + item.color} />
              <span className="text-sm text-[#a3a3a3]">{item.type}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#e7e7e7]">{item.used}</span>
              <span className="text-xs text-[#525252] w-8 text-right">{item.percentage}%</span>
            </div>
          </div>
        ))}
       </div>

        <div className="border-t border-[#2a2a2a]">
          <div className=" pt-3 mt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-[#525252]" />
                <span className="text-xs text-[#525252]">Monthly Bandwidth</span>
              </div>
              <span className="text-xs text-[#e7e7e7] font-medium">42.6 GB / 100 GB</span>
            </div>
            <Progress value={43} className="h-1.5 mt-2 bg-[#242424]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
