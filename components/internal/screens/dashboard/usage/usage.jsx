"use client";

import React from "react";
import {
  BarChart3,
  Database,
  HardDrive,
  Cpu,
  Activity,
  Clock,
} from "lucide-react";

export function UsageScreen() {
  const metrics = [
    {
      label: "Database Requests",
      value: "48.2k",
      limit: "100k",
      percentage: 48,
      icon: Database,
    },
    {
      label: "Storage Capacity",
      value: "1.2 GB",
      limit: "5 GB",
      percentage: 24,
      icon: HardDrive,
    },
    {
      label: "Compute Usage",
      value: "820 hrs",
      limit: "2,000 hrs",
      percentage: 41,
      icon: Cpu,
    },
  ];

  return (
    <div className="flex flex-col gap-8 w-full px-2 lg:px-0 lg:w-[75%] mx-auto my-3 text-[#e7e7e7]">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold text-[#e7e7e7] tracking-tight">
            Resource Usage
          </h1>
          <p className="text-[#a3a3a3] text-sm font-medium ">
            Monitor your organization's performance across all projects.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-[#202020] border border-[#2a2a2a] rounded-lg">
          <Clock className="w-4 h-4 text-[#737373]" />
          <span className="text-[#a3a3a3] text-sm font-medium">
            Updates in 12m
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((m, i) => (
          <div
            key={i}
            className="bg-[#202020] border border-[#2a2a2a] rounded-2xl p-6 relative overflow-hidden group hover:border-[#474747] transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-white ring-offset-[#202020] transition-colors group-hover:bg-[#2a2a2a] group-hover:border-[#333333]">
                <m.icon className="w-5 h-5 text-[#a3a3a3]" />
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-[#e7e7e7] tracking-tight">
                  {m.value}
                </div>
                <div className="text-[10px] font-bold text-[#525252] uppercase tracking-[0.05em]">
                  of {m.limit}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#e7e7e7]">
                  {m.label}
                </span>
                <span className="text-xs font-bold text-[#a3a3a3] bg-[#1a1a1a] px-2 py-0.5 rounded border border-[#2a2a2a]">
                  {m.percentage}%
                </span>
              </div>
              <div className="h-2 w-full bg-[#1a1a1a] rounded-full overflow-hidden border border-[#2a2a2a]">
                <div
                  className="h-full bg-[#e7e7e7] transition-all duration-1000 ease-out rounded-full shadow-[0_0_12px_rgba(231,231,231,0.2)]"
                  style={{ width: `${m.percentage}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
