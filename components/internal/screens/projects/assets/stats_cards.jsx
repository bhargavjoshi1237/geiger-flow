import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TrendingUp, FolderOpen, HardDrive, Download, Layers } from "lucide-react";

export function StatsCard({ icon: Icon, label, value, change, changeType }) {
  return (
    <Card className="bg-[#1a1a1a] border-[#2a2a2a] text-[#e7e7e7] hover:border-[#474747] transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#242424] flex items-center justify-center">
              <Icon className="w-4 h-4 text-[#a3a3a3]" />
            </div>
            <span className="text-sm text-[#a3a3a3]">{label}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp
              className={
                "w-3 h-3 " +
                (changeType === "positive" ? "text-green-500" : "text-red-500")
              }
            />
            <span
              className={
                "text-xs " +
                (changeType === "positive" ? "text-green-500" : "text-red-500")
              }
            >
              {change}
            </span>
            <span className="text-xs text-[#525252]">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function StatsRow() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard icon={FolderOpen} label="Total Assets" value="248" change="+12 this month" changeType="positive" />
      <StatsCard icon={HardDrive} label="Storage Used" value="6.83 GB" change="+420 MB" changeType="positive" />
      <StatsCard icon={Download} label="Downloads" value="1,847" change="+23%" changeType="positive" />
      <StatsCard icon={Layers} label="Asset Types" value="12" change="+2 new" changeType="positive" />
    </div>
  );
}
