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

const throughputData = [
  { time: "00:00", requests: 0 },
  { time: "04:00", requests: 0 },
  { time: "08:00", requests: 0 },
  { time: "12:00", requests: 0 },
  { time: "16:00", requests: 0 },
  { time: "20:00", requests: 0 },
  { time: "23:59", requests: 0 },
];

function EmptyPanel({ icon: Icon, title, description, className }) {
  return (
    <div className={`rounded-2xl border border-dashed border-border bg-surface-card p-10 text-center ${className}`}>
      <Icon className="mx-auto mb-3 h-6 w-6 text-text-tertiary" />
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-xs text-text-secondary">{description}</p>
    </div>
  );
}

export function OverviewScreen() {
  const [filterValue, setFilterValue] = useState("1w");

  return (
    <div className="w-[90%] ml-auto mr-auto">
      <MainScreenWrapper className="flex flex-col gap-10 space-y-0 text-foreground">
        <EmptyPanel
          icon={BarChart3}
          title="No overview metrics yet"
          description="Dashboard metrics will appear here after backend data is connected."
        />

        <div className="z-10 relative">
          <DeadlinesSection />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 z-10 relative">
          <div className="lg:col-span-2 bg-surface-subtle border border-border rounded-2xl p-6 min-h-96 flex flex-col min-w-0">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-foreground font-medium">Throughput Analysis</h3>
                <p className="text-sm text-text-secondary">Live requests across regions</p>
              </div>
              <FilterDropdown value={filterValue} onValueChange={setFilterValue} />
            </div>
            <div className="relative flex-1 min-h-[260px]">
              <ChartContainer
                config={{
                  requests: {
                    label: "Requests",
                    color: "#8b5cf6",
                  },
                }}
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
                    The chart is ready. Backend telemetry will replace this zero baseline.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface-card border border-border rounded-2xl p-6 flex flex-col min-w-0">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-foreground font-medium">Activity Log</h3>
                <p className="text-sm text-text-secondary">Recent workspace actions</p>
              </div>
              {/* <AddActivityDialog onSave={() => {}}>
                <Button variant="outline" size="sm" className="bg-surface-subtle border-border text-muted-foreground hover:text-foreground h-8">
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Add Activity
                </Button>
              </AddActivityDialog> */}
            </div>
            <EmptyPanel
              icon={Activity}
              className="h-full flex border-none flex-col items-center justify-center"
              title="No activity yet"
              description="Workspace activity will appear here after backend data is connected."
            />
          </div>
        </div>

        <EmptyPanel
          icon={GitBranch}
          className="flex flex-col items-center justify-center"
          title="No deployments yet"
          description="Deployment records will appear here after backend data is connected."
        />
      </MainScreenWrapper>
    </div>
  );
}
