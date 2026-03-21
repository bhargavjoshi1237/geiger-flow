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
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export function UsageScreen() {
  const dbData = Array.from({ length: 30 }, (_, i) => ({
    time: i,
    size: 20 + Math.random() * 10,
  }));

  const storageData = Array.from({ length: 30 }, (_, i) => ({
    time: i,
    size: 5,
  }));

  const mauData = Array.from({ length: 15 }, (_, i) => ({
    time: i,
    users: i < 12 ? 20 : 60 + (i - 12) * 10,
  }));

  return (
    <div className="flex flex-col gap-10 w-full px-2 lg:px-0 lg:w-[75%] mx-auto my-3 text-primary">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mt-4">
        <div>
          <h1 className="text-2xl font-semibold text-primary tracking-tight mb-4">
            Usage
          </h1>
          <div className="flex items-center gap-4">
            <Select defaultValue="billing">
              <SelectTrigger className="w-[180px] h-8 text-xs bg-surface border-border text-secondary">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent className="bg-surface border-border text-primary">
                <SelectItem value="billing">This billing cycle</SelectItem>
                <SelectItem value="monthly">Past 30 days</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all">
              <SelectTrigger className="w-[180px] h-8 text-xs bg-surface border-border text-secondary">
                <SelectValue placeholder="All projects" />
              </SelectTrigger>
              <SelectContent className="bg-surface border-border text-primary">
                <SelectItem value="all">All projects</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-6 lg:mt-0 flex items-center gap-3 text-sm text-secondary">
          Usage since Nov 8 (today is Dec 8)
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-primary w-full" />
            </div>
            <span className="text-foreground font-medium text-xs">
              30d / 30d
            </span>
            <span className="text-muted-foreground text-xs">100%</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-medium text-primary">Project summary</h3>
        <p className="text-[13px] text-secondary mt-1">
          Total usage for all projects within "bhargavjoshi1237's Org" across
          all regions. To see usage for a specific project, select it from the
          dropdown above.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card className="bg-surface border-border p-5 shadow-sm rounded-xl">
            <div className="text-[13px] font-medium text-secondary mb-2 flex items-center gap-1.5">
              Total requests <Info className="w-3.5 h-3.5" />
            </div>
            <div className="text-2xl font-semibold text-primary">
              569.2K{" "}
              <span className="text-sm font-normal text-muted ml-1">/ ∞</span>
            </div>
          </Card>

          <Card className="bg-surface border-border p-5 shadow-sm rounded-xl">
            <div className="text-[13px] font-medium text-secondary mb-2 flex items-center gap-1.5">
              Data egress <Info className="w-3.5 h-3.5" />
            </div>
            <div className="text-2xl font-semibold text-primary">
              67.5 MB{" "}
              <span className="text-sm font-normal text-muted ml-1">
                / 5 GB
              </span>
            </div>
            <div className="mt-3 h-1.5 w-full bg-border rounded-full overflow-hidden border border-border">
              <div className="h-full bg-primary" style={{ width: "1.3%" }} />
            </div>
          </Card>

          <Card className="bg-surface border-border p-5 shadow-sm rounded-xl">
            <div className="text-[13px] font-medium text-secondary mb-2 flex items-center gap-1.5">
              Auth requests <Info className="w-3.5 h-3.5" />
            </div>
            <div className="text-2xl font-semibold text-primary">
              2{" "}
              <span className="text-sm font-normal text-muted ml-1">
                / 50K
              </span>
            </div>
            <div className="mt-3 h-1.5 w-full bg-border rounded-full overflow-hidden border border-border">
              <div className="h-full bg-primary" style={{ width: "1%" }} />
            </div>
          </Card>
        </div>
      </div>

      <div className="border-b border-border w-full" />

      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-medium text-primary">
            Database & Storage Size
          </h3>
          <p className="text-[13px] text-secondary mt-1">
            Storage consumed across all projects in this organization
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2 border-b border-border pb-2">
              <div className="text-[13px] font-medium text-primary">
                Database size
              </div>
              <div className="text-[13px] font-medium text-primary">
                48 MB <span className="text-muted font-normal">/ 500 MB</span>
              </div>
            </div>
            <div className="text-[13px] text-primary font-medium mb-3">
              500 MB included
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
                <BarChart data={dbData}>
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
            <div className="flex items-center justify-between mb-2 border-b border-border pb-2">
              <div className="text-[13px] font-medium text-primary">
                Storage size
              </div>
              <div className="text-[13px] font-medium text-primary">
                0 MB <span className="text-muted font-normal">/ 1 GB</span>
              </div>
            </div>
            <div className="text-[13px] text-primary font-medium mb-3">
              1 GB included
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
                <BarChart data={storageData}>
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

      <div className="border-b border-border w-full" />

      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-medium text-primary">Activity</h3>
          <p className="text-[13px] text-secondary mt-1">
            Usage associated with active users of your projects
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2 border-b border-border pb-2">
              <div className="text-[13px] font-medium text-primary">
                Monthly Active Users
              </div>
              <div className="text-[13px] font-medium text-primary">
                84 <span className="text-muted font-normal">/ 50,000</span>
              </div>
            </div>
            <div className="text-[13px] text-primary font-medium mb-3">
              50,000 included
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
                <BarChart data={mauData} margin={{ left: -20, right: 0 }}>
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
        </div>
      </div>
    </div>
  );
}
