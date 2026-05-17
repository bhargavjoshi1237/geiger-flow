import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, FolderOpen, HardDrive, Download, Layers } from "lucide-react";

export function StatsCard({ icon: Icon, label, value, change, changeType }) {
  const isPositive = changeType === "positive";

  return (
    <Card className="gap-0 rounded-lg border-[#2a2a2a] bg-[#1a1a1a] p-3 text-[#e7e7e7] shadow-none transition-all duration-300 hover:border-[#474747]">
      <CardContent className="flex items-center gap-3 p-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#2a2a2a] bg-[#202020]">
          <Icon className="h-3.5 w-3.5 text-[#a3a3a3]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-xs font-medium text-[#a3a3a3]">{label}</span>
            {change && (
              <span
                className={
                  "inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-0.5 text-[11px] leading-none " +
                  (isPositive
                    ? "border-emerald-500/15 bg-emerald-500/10 text-emerald-400"
                    : "border-red-500/15 bg-red-500/10 text-red-400")
                }
              >
                <TrendingUp className="h-2.5 w-2.5" />
                {change}
              </span>
            )}
          </div>
          <div className="mt-1 text-lg font-semibold leading-none text-[#f4f4f4]">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsRow() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard icon={FolderOpen} label="Total Assets" value="248" change="+12 this month" changeType="positive" />
      <StatsCard icon={HardDrive} label="Storage Used" value="6.83 GB" change="+420 MB" changeType="positive" />
      <StatsCard icon={Download} label="Downloads" value="1,847" change="+23%" changeType="positive" />
      <StatsCard icon={Layers} label="Asset Types" value="12" change="+2 new" changeType="positive" />
    </div>
  );
}
