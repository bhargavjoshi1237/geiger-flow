"use client";

import { useState } from "react";
import { Activity, BarChart3, GitBranch } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@geiger/ui";
import { DeadlinesSection } from "@/components/internal/shared/deadlines";
import FilterDropdown from "../../projects/overview/filter_dropdown";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import {
  EditorSectionHeader,
  EmptyState,
  ScreenHeader,
} from "@/components/internal/shared/screen_kit";

// Zero baseline so the chart keeps its axes until telemetry is wired.
const throughputData = [
  { time: "00:00", requests: 0 },
  { time: "04:00", requests: 0 },
  { time: "08:00", requests: 0 },
  { time: "12:00", requests: 0 },
  { time: "16:00", requests: 0 },
  { time: "20:00", requests: 0 },
  { time: "23:59", requests: 0 },
];

function EmptyPanel({ icon, title, description, className }) {
  return (
    <div className={`rounded-2xl border border-dashed border-border bg-surface-subtle ${className || ""}`}>
      <EmptyState icon={icon} title={title} description={description} />
    </div>
  );
}

export function OverviewScreen() {
  const [filterValue, setFilterValue] = useState("1w");

  return (
    <MainScreenWrapper className="flex flex-col gap-10 space-y-0 text-foreground">
      <ScreenHeader
        title="Overview"
        description="Throughput, deadlines, and recent activity across this workspace."
        actions={
          <FilterDropdown value={filterValue} onValueChange={setFilterValue} />
        }
      />

      <EmptyPanel
        icon={BarChart3}
        title="No overview metrics yet"
        description="Workspace metrics appear here once telemetry starts reporting."
      />

      <div className="relative z-10">
        <DeadlinesSection />
      </div>

      <div className="relative z-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex min-h-96 min-w-0 flex-col rounded-2xl border border-border bg-surface-subtle p-6 lg:col-span-2">
          <EditorSectionHeader
            title="Throughput Analysis"
            description="Live requests across regions."
          />
          <div className="relative mt-6 min-h-[260px] flex-1">
            <ChartContainer
              config={{ requests: { label: "Requests", color: "var(--chart-4)" } }}
              className="h-full w-full"
            >
              <AreaChart data={throughputData} margin={{ left: 0, right: 0, top: 20, bottom: 0 }}>
                <defs>
                  <linearGradient id="throughput-empty" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-requests)" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="var(--color-requests)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--divider)" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                />
                <YAxis
                  width={28}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  domain={[0, 1]}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke="var(--color-requests)"
                  strokeWidth={2}
                  fill="url(#throughput-empty)"
                  dot={false}
                  activeDot={false}
                />
              </AreaChart>
            </ChartContainer>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="rounded-xl border border-border bg-surface-subtle/90 px-5 py-4 text-center shadow-sm">
                <Activity className="mx-auto mb-2 h-5 w-5 text-text-tertiary" />
                <p className="text-sm font-medium text-foreground">No throughput yet</p>
                <p className="mt-1 max-w-[260px] text-xs text-text-secondary">
                  The chart is ready — telemetry will replace this zero baseline.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-col rounded-2xl border border-border bg-surface-subtle p-6">
          <EditorSectionHeader
            title="Activity Log"
            description="Recent workspace actions."
          />
          <EmptyPanel
            icon={Activity}
            className="mt-6 flex h-full flex-col items-center justify-center border-none"
            title="No activity yet"
            description="Workspace activity shows up here as members make changes."
          />
        </div>
      </div>

      <EmptyPanel
        icon={GitBranch}
        title="No deployments yet"
        description="Deployment records appear here once a project ships."
      />
    </MainScreenWrapper>
  );
}
