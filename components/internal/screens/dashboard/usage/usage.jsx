"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import { BarChart, Bar } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";

const zeroUsageData = [
  { label: "W1", size: 0, users: 0 },
  { label: "W2", size: 0, users: 0 },
  { label: "W3", size: 0, users: 0 },
  { label: "W4", size: 0, users: 0 },
];

const databaseUsageData = zeroUsageData;

const storageUsageData = zeroUsageData;

const monthlyActiveUserData = zeroUsageData;

const projectSummaryMetrics = [
  {
    label: "Database size",
    value: "0 MB",
    limit: "0 MB",
    limitLabel: "No limit",
    progress: "0%",
  },
  {
    label: "Storage used",
    value: "0 MB",
    limit: "0 MB",
    limitLabel: "No limit",
    progress: "0%",
  },
  {
    label: "Active users",
    value: "0",
    limit: "0",
    limitLabel: "No users",
    progress: "0%",
  },
];

export function UsageScreen() {
  return (
    <MainScreenWrapper className="flex flex-col gap-8 space-y-0 text-[#e7e7e7]">
     <div className="flex w-full justify-between flex-col gap-4 border-b border-[#2a2a2a] pb-6 lg:flex-row lg:items-center lg:justify-between">
      
      <div className="space-y-4 w-full">
        <div className="space-y-4 flex w-full justify-between -mb-4">
         <div>
           <h1 className="text-2xl font-semibold tracking-tight text-[#e7e7e7] md:text-3xl">
            Usage
          </h1>
          <p className="text-[#a3a3a3] text-sm mt-1">
            General configuration, privacy, and lifecycle controls
          </p>
         </div>
          <div className="flex gap-3 lg:flex-row lg:items-center">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#8b8b8b] lg:justify-end">
              <span>No billing period</span>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#2c2c2c]">
                  <div className="h-full w-full bg-primary" />
                </div>
                <span className="text-xs font-medium text-foreground">
                  0d / 0d
                </span>
                <span className="text-xs text-muted-foreground">0%</span>
              </div>
            </div>

             <div className="flex flex-wrap items-center gap-3">
              <Select defaultValue="billing">
                <SelectTrigger className="h-8 w-full border-[#2c2c2c] bg-[#181818] text-xs text-[#a3a3a3] sm:w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent className="border-[#2c2c2c] bg-[#181818] text-[#e7e7e7]">
                  <SelectItem value="billing">This billing cycle</SelectItem>
                  <SelectItem value="monthly">Past 30 days</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="all">
                <SelectTrigger className="h-8 w-full border-[#2c2c2c] bg-[#181818] text-xs text-[#a3a3a3] sm:w-[180px]">
                  <SelectValue placeholder="All projects" />
                </SelectTrigger>
                <SelectContent className="border-[#2c2c2c] bg-[#181818] text-[#e7e7e7]">
                  <SelectItem value="all">All projects</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
</div>
      <div className="space-y-3">
        <div>
          <h3 className="text-xl font-medium text-[#e7e7e7]">
            Project summary
          </h3>
          <p className="mt-1 max-w-5xl text-[13px] text-[#8b8b8b]">
            Total usage for all projects across all regions. Select a project above to narrow the
            usage view.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {projectSummaryMetrics.map((metric) => (
            <Card
              key={metric.label}
              className="gap-3 rounded-lg border-[#2c2c2c] bg-[#181818] p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-[13px] font-medium text-[#a3a3a3]">
                  {metric.label}
                  <Info className="h-3.5 w-3.5 text-[#7a7a7a]" />
                </div>
                {metric.limitLabel !== "" && (
                  <span className="text-xs text-[#666]">
                    {metric.limitLabel || metric.limit}
                  </span>
                )}
              </div>

              <div className="flex items-end gap-2">
                <span className="text-2xl font-semibold leading-none text-[#e7e7e7]">
                  {metric.value}
                </span>
                <span className="text-xs leading-none text-[#666]">
                  {metric.progress ? `of ${metric.limit}` : metric.limit}
                </span>
              </div>

              {metric.progress && (
                <div className="h-1.5 w-full overflow-hidden rounded-full border border-[#333] bg-[#2c2c2c]">
                  <div
                    className="h-full bg-primary"
                    style={{ width: metric.progress }}
                  />
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      <div className="w-full border-b border-[#2c2c2c]" />

      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-medium text-[#e7e7e7]">
            Database & Storage Size
          </h3>
          <p className="mt-1 text-[13px] text-[#8b8b8b]">
            Storage consumed across all projects in this organization
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <div className="mb-2 flex items-center justify-between border-b border-[#2c2c2c] pb-2">
              <div className="text-[13px] font-medium text-[#e7e7e7]">
                Database size
              </div>
              <div className="text-[13px] font-medium text-[#e7e7e7]">
                0 MB <span className="font-normal text-[#666]">/ 0 MB</span>
              </div>
            </div>
            <div className="mb-3 text-[13px] font-medium text-primary">
              No usage data
            </div>
            <div className="h-[120px] w-full">
              <ChartContainer
                config={{
                  size: {
                    label: "Size",
                    color: "var(--chart-2)",
                  },
                }}
                className="h-full w-full"
              >
                <BarChart data={databaseUsageData}>
                  <Bar
                    dataKey="size"
                    fill="var(--color-size)"
                    radius={[2, 2, 0, 0]}
                  />
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                </BarChart>
              </ChartContainer>
            </div>
          </div>

          <div className="space-y-4">
            <div className="mb-2 flex items-center justify-between border-b border-[#2c2c2c] pb-2">
              <div className="text-[13px] font-medium text-[#e7e7e7]">
                Storage size
              </div>
              <div className="text-[13px] font-medium text-[#e7e7e7]">
                0 MB <span className="font-normal text-[#666]">/ 0 MB</span>
              </div>
            </div>
            <div className="mb-3 text-[13px] font-medium text-primary">
              No storage data
            </div>
            <div className="h-[120px] w-full">
              <ChartContainer
                config={{
                  size: {
                    label: "Size",
                    color: "var(--chart-2)",
                  },
                }}
                className="h-full w-full"
              >
                <BarChart data={storageUsageData}>
                  <Bar
                    dataKey="size"
                    fill="var(--color-size)"
                    fillOpacity={0.1}
                    radius={[2, 2, 0, 0]}
                  />
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full border-b border-[#2c2c2c]" />

      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-medium text-[#e7e7e7]">Activity</h3>
          <p className="mt-1 text-[13px] text-[#8b8b8b]">
            Usage associated with active users of your projects
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <div className="mb-2 flex items-center justify-between border-b border-[#2c2c2c] pb-2">
              <div className="text-[13px] font-medium text-[#e7e7e7]">
                Monthly Active Users
              </div>
              <div className="text-[13px] font-medium text-[#e7e7e7]">
                0 <span className="font-normal text-[#666]">/ 0</span>
              </div>
            </div>
            <div className="mb-3 text-[13px] font-medium text-primary">
              No active user data
            </div>
            <div className="h-[160px] w-full">
              <ChartContainer
                config={{
                  users: {
                    label: "Users",
                    color: "#e7e7e7",
                  },
                }}
                className="h-full w-full"
              >
                <BarChart
                  data={monthlyActiveUserData}
                  margin={{ left: -20, right: 0 }}
                >
                  <Bar
                    dataKey="users"
                    fill="var(--color-users)"
                    radius={[2, 2, 0, 0]}
                    barSize={32}
                  />
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                </BarChart>
              </ChartContainer>
            </div>
          </div>

          <div className="space-y-4">
            <div className="mb-2 flex items-center justify-between border-b border-[#2c2c2c] pb-2">
              <div className="text-[13px] font-medium text-[#e7e7e7]">
                Sessions
              </div>
              <div className="text-[13px] font-medium text-[#e7e7e7]">
                0 <span className="font-normal text-[#666]">/ 0</span>
              </div>
            </div>
            <div className="mb-3 text-[13px] font-medium text-primary">
              No session data
            </div>
            <div className="h-[160px] w-full">
              <ChartContainer
                config={{
                  users: {
                    label: "Sessions",
                    color: "var(--chart-2)",
                  },
                }}
                className="h-full w-full"
              >
                <BarChart
                  data={monthlyActiveUserData}
                  margin={{ left: -20, right: 0 }}
                >
                  <Bar
                    dataKey="users"
                    fill="var(--color-users)"
                    fillOpacity={0.15}
                    radius={[2, 2, 0, 0]}
                    barSize={32}
                  />
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        </div>
      </div>
    </MainScreenWrapper>
  );
}
