"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@geiger/ui";
import { Card } from "@geiger/ui";
import { Info } from "lucide-react";
import { BarChart, Bar } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@geiger/ui";
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
    <MainScreenWrapper className="flex flex-col gap-8 space-y-0 text-foreground">
     <div className="flex w-full justify-between flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between">
      
      <div className="space-y-4 w-full">
        <div className="space-y-4 flex w-full justify-between -mb-4">
         <div>
           <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Usage
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            General configuration, privacy, and lifecycle controls
          </p>
         </div>
          <div className="flex gap-3 lg:flex-row lg:items-center">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground lg:justify-end">
              <span>No billing period</span>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-hover">
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
                <SelectTrigger className="h-8 w-full border-border bg-surface-subtle text-xs text-muted-foreground sm:w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent className="border-border bg-surface-subtle text-foreground">
                  <SelectItem value="billing">This billing cycle</SelectItem>
                  <SelectItem value="monthly">Past 30 days</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="all">
                <SelectTrigger className="h-8 w-full border-border bg-surface-subtle text-xs text-muted-foreground sm:w-[180px]">
                  <SelectValue placeholder="All projects" />
                </SelectTrigger>
                <SelectContent className="border-border bg-surface-subtle text-foreground">
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
          <h3 className="text-xl font-medium text-foreground">
            Project summary
          </h3>
          <p className="mt-1 max-w-5xl text-[13px] text-muted-foreground">
            Total usage for all projects across all regions. Select a project above to narrow the
            usage view.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {projectSummaryMetrics.map((metric) => (
            <Card
              key={metric.label}
              className="gap-3 rounded-lg border-border bg-surface-subtle p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground">
                  {metric.label}
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                {metric.limitLabel !== "" && (
                  <span className="text-xs text-muted-foreground">
                    {metric.limitLabel || metric.limit}
                  </span>
                )}
              </div>

              <div className="flex items-end gap-2">
                <span className="text-2xl font-semibold leading-none text-foreground">
                  {metric.value}
                </span>
                <span className="text-xs leading-none text-muted-foreground">
                  {metric.progress ? `of ${metric.limit}` : metric.limit}
                </span>
              </div>

              {metric.progress && (
                <div className="h-1.5 w-full overflow-hidden rounded-full border border-border bg-surface-hover">
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

      <div className="w-full border-b border-border" />

      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-medium text-foreground">
            Database & Storage Size
          </h3>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Storage consumed across all projects in this organization
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <div className="mb-2 flex items-center justify-between border-b border-border pb-2">
              <div className="text-[13px] font-medium text-foreground">
                Database size
              </div>
              <div className="text-[13px] font-medium text-foreground">
                0 MB <span className="font-normal text-muted-foreground">/ 0 MB</span>
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
            <div className="mb-2 flex items-center justify-between border-b border-border pb-2">
              <div className="text-[13px] font-medium text-foreground">
                Storage size
              </div>
              <div className="text-[13px] font-medium text-foreground">
                0 MB <span className="font-normal text-muted-foreground">/ 0 MB</span>
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

      <div className="w-full border-b border-border" />

      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-medium text-foreground">Activity</h3>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Usage associated with active users of your projects
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <div className="mb-2 flex items-center justify-between border-b border-border pb-2">
              <div className="text-[13px] font-medium text-foreground">
                Monthly Active Users
              </div>
              <div className="text-[13px] font-medium text-foreground">
                0 <span className="font-normal text-muted-foreground">/ 0</span>
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
            <div className="mb-2 flex items-center justify-between border-b border-border pb-2">
              <div className="text-[13px] font-medium text-foreground">
                Sessions
              </div>
              <div className="text-[13px] font-medium text-foreground">
                0 <span className="font-normal text-muted-foreground">/ 0</span>
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
