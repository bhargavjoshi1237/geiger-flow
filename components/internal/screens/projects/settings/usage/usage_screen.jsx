"use client";

import React from "react";
import { useProject } from "@/context/project-context";
import {
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  HardDrive,
  Server,
  Users,
  Database,
  Globe,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const zeroDailyUsage = Array.from({ length: 7 }, (_, index) => ({
  day: `D${index + 1}`,
  count: 0,
  mb: 0,
  users: 0,
  size: 0,
}));
const databaseRows = [];
const sessionBreakdown = [];

function UsageMetricCard({
  icon: Icon,
  label,
  value,
  limit,
  percentage,
  trend,
  trendValue,
  description,
}) {
  const isOverLimit = percentage > 80;
  return (
    <div className="bg-surface-subtle border border-border rounded-2xl p-5 shadow-sm hover:border-border-strong transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center border",
              isOverLimit
                ? "bg-red-500/10 border-red-500/20 text-red-400"
                : "bg-surface-hover border-border-strong text-muted-foreground"
            )}
          >
            <Icon className="w-4 h-4" strokeWidth={1.8} />
          </div>
          <span className="text-[13px] font-medium text-muted-foreground">
            {label}
          </span>
        </div>
        {trendValue && (
          <div
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full",
              trend === "up"
                ? "text-green-400 bg-green-400/10"
                : "text-red-400 bg-red-400/10"
            )}
          >
            {trend === "up" ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {trendValue}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl font-semibold text-foreground tracking-tight">
          {value}
        </span>
        {limit && (
          <span className="text-sm font-normal text-muted-foreground">/ {limit}</span>
        )}
      </div>

      {percentage !== undefined && (
        <div className="mt-3 mb-1 h-1.5 w-full bg-surface-hover rounded-full overflow-hidden border border-border">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              isOverLimit ? "bg-red-400" : "bg-primary"
            )}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}

      <p className="text-[12px] text-muted-foreground mt-2">{description}</p>
    </div>
  );
}

function ChartSection({
  title,
  subtitle,
  valueLabel,
  value,
  limit,
  included,
  data,
  dataKey,
  chartType = "bar",
  chartColor = "var(--chart-2)",
  fillOpacity = 1,
  height = 140,
  barSize,
}) {
  const ChartComponent = chartType === "area" ? AreaChart : chartType === "line" ? LineChart : BarChart;
  const DataComponent = chartType === "area" ? Area : chartType === "line" ? Line : Bar;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <span className="text-[13px] font-medium text-foreground">
          {title}
        </span>
        <span className="text-[13px] font-medium text-foreground">
          {value}{" "}
          {limit && <span className="text-muted-foreground font-normal">/ {limit}</span>}
        </span>
      </div>
      {included && (
        <div className="text-[13px] text-[#34b27b] font-medium">{included}</div>
      )}
      <div className="h-[140px] w-full" style={{ height }}>
        <ChartContainer
          config={{
            [dataKey]: {
              label: title,
              color: chartColor,
            },
          }}
          className="h-full w-full"
        >
          <ChartComponent data={data} margin={{ left: -20, right: 0 }}>
            {chartType === "area" && (
              <defs>
                <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
            )}
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <DataComponent
              type="monotone"
              dataKey={dataKey}
              fill={chartType === "area" ? `url(#grad-${dataKey})` : chartColor}
              stroke={chartType === "area" || chartType === "line" ? chartColor : undefined}
              fillOpacity={chartType === "bar" ? fillOpacity : undefined}
              radius={chartType === "bar" ? [2, 2, 0, 0] : undefined}
              barSize={barSize}
              strokeWidth={chartType === "area" || chartType === "line" ? 2 : undefined}
              dot={chartType === "line" ? false : undefined}
            />
          </ChartComponent>
        </ChartContainer>
      </div>
    </div>
  );
}

export function UsageSettingsScreen() {
  const { project } = useProject();

  return (
    <div className="space-y-12">
      <div className="space-y-1.5">
        <h3 className="text-xl font-medium text-foreground">
          Project Usage
        </h3>
        <p className="text-sm text-muted-foreground">
          Track resource consumption and activity across{" "}
          <span className="text-foreground font-medium">{project?.name || "this project"}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <UsageMetricCard
          icon={Zap}
          label="API Requests"
          value="0"
          limit="0"
          percentage={0}
          description="Backend request usage will appear here"
        />
        <UsageMetricCard
          icon={HardDrive}
          label="Storage Used"
          value="0 MB"
          limit="0 MB"
          percentage={0}
          description="Backend storage usage will appear here"
        />
        <UsageMetricCard
          icon={Globe}
          label="Bandwidth"
          value="0 MB"
          limit="0 MB"
          percentage={0}
          description="Backend bandwidth usage will appear here"
        />
        <UsageMetricCard
          icon={Server}
          label="Compute Time"
          value="0 hrs"
          limit="0 hrs"
          percentage={0}
          description="Backend compute usage will appear here"
        />
        <UsageMetricCard
          icon={Users}
          label="Active Users"
          value="0"
          limit="0"
          percentage={0}
          description="Backend active user data will appear here"
        />
        <UsageMetricCard
          icon={Database}
          label="Database Rows"
          value="0"
          limit="0"
          percentage={0}
          description="Backend row counts will appear here"
        />
      </div>

      <div className="bg-surface-subtle border border-border rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface-hover border border-border-strong text-muted-foreground flex items-center justify-center shrink-0 mt-0.5">
            <Activity className="w-4 h-4" strokeWidth={1.8} />
          </div>
          <div>
            <div className="text-[14px] font-semibold text-foreground mb-1">
              Billing cycle progress
            </div>
            <div className="text-[13px] text-muted-foreground leading-relaxed mb-3">
              Your current billing cycle ends on{" "}
              <span className="text-foreground font-medium">No reset date</span>.
              Usage resets at the start of each cycle.
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-surface-hover rounded-full overflow-hidden border border-border">
                <div
                  className="h-full bg-[#34b27b] rounded-full transition-all"
                  style={{ width: "0%" }}
                />
              </div>
              <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                0 / 0 days
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="space-y-1">
          <h3 className="text-xl font-medium text-foreground">
            Request & Bandwidth
          </h3>
          <p className="text-sm text-muted-foreground">
            Daily API request volume and bandwidth consumption for the last 30
            days.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartSection
            title="API Requests"
            subtitle="Daily request count"
            value="0"
            limit="0"
            included="No request data"
            data={zeroDailyUsage}
            dataKey="count"
            chartType="bar"
            height={140}
          />
          <ChartSection
            title="Bandwidth"
            subtitle="Daily data transfer"
            value="0 MB"
            limit="0 MB"
            included="No bandwidth data"
            data={zeroDailyUsage}
            dataKey="mb"
            chartType="bar"
            height={140}
          />
        </div>
      </div>

      <div className="space-y-8">
        <div className="space-y-1">
          <h3 className="text-xl font-medium text-foreground">
            Storage & Compute
          </h3>
          <p className="text-sm text-muted-foreground">
            Track how your project&apos;s storage and compute resources are
            being used over time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartSection
            title="Storage Growth"
            value="0 MB"
            limit="0 MB"
            included="No storage data"
            data={zeroDailyUsage}
            dataKey="size"
            chartType="area"
            chartColor="#8b5cf6"
            height={140}
          />
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-[13px] font-medium text-foreground">
                Compute Hours
              </span>
              <span className="text-[13px] font-medium text-foreground">
                0 hrs{" "}
                <span className="text-muted-foreground font-normal">/ 0 hrs</span>
              </span>
            </div>
            <div className="text-[13px] text-[#34b27b] font-medium">
              No compute data
            </div>

            <div className="grid grid-cols-2 gap-6 mt-4">
              <div className="bg-background border border-border rounded-xl p-4">
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-2">
                  Avg. Daily
                </div>
                <div className="text-xl font-semibold text-foreground">
                  0<span className="text-sm text-muted-foreground font-normal ml-1">hrs</span>
                </div>
              </div>
              <div className="bg-background border border-border rounded-xl p-4">
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-2">
                  Peak Day
                </div>
                <div className="text-xl font-semibold text-foreground">
                  0<span className="text-sm text-muted-foreground font-normal ml-1">hrs</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-2">
              {["Serverless Functions", "Edge Functions", "Background Jobs"].map(
                (item) => (
                  <div key={item} className="bg-background border border-border rounded-lg p-3 text-center">
                    <div className="text-[11px] text-muted-foreground mb-1">{item}</div>
                    <div className="text-[13px] font-semibold text-muted-foreground">
                      0%
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="space-y-1">
          <h3 className="text-xl font-medium text-foreground">
            User Activity
          </h3>
          <p className="text-sm text-muted-foreground">
            Active user trends and session breakdown for the project.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartSection
            title="Weekly Active Users"
            value="0"
            limit="0"
            included="No active user data"
            data={zeroDailyUsage}
            dataKey="users"
            chartType="bar"
            chartColor="#e7e7e7"
            barSize={28}
            height={140}
          />
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-[13px] font-medium text-foreground">
                Sessions This Month
              </span>
              <span className="text-[13px] font-medium text-foreground">
                0
              </span>
            </div>

            <div className="space-y-3 mt-4">
              {sessionBreakdown.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-background px-4 py-6 text-center text-[13px] text-text-secondary">
                  Session breakdown will appear here after backend data is connected.
                </div>
              ) : (
                sessionBreakdown.map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[13px] text-muted-foreground">
                        {item.label}
                      </span>
                      <span className="text-[13px] text-foreground">
                        {item.value}{" "}
                        <span className="text-muted-foreground">({item.pct}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-hover rounded-full overflow-hidden border border-border">
                      <div
                        className={cn("h-full rounded-full", item.color)}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-background border border-border rounded-xl p-4">
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-2">
                  Avg. Session
                </div>
                <div className="text-xl font-semibold text-foreground">
                  0<span className="text-sm text-muted-foreground font-normal ml-1">min</span>
                </div>
              </div>
              <div className="bg-background border border-border rounded-xl p-4">
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-2">
                  New Users
                </div>
                <div className="text-xl font-semibold text-foreground">
                  0<span className="text-sm text-muted-foreground font-normal ml-1">this month</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="space-y-1">
          <h3 className="text-xl font-medium text-foreground">
            Database Usage
          </h3>
          <p className="text-sm text-muted-foreground">
            Row counts and storage breakdown per table.
          </p>
        </div>

        <div className="border border-border rounded-xl overflow-hidden bg-surface-subtle">
          <div className="border-b border-border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-auto px-5 py-3 text-muted-foreground">
                    Table
                  </TableHead>
                  <TableHead className="h-auto px-5 py-3 text-right text-muted-foreground">
                    Rows
                  </TableHead>
                  <TableHead className="h-auto px-5 py-3 text-right text-muted-foreground">
                    Size
                  </TableHead>
                  <TableHead className="h-auto w-[140px] px-5 py-3 text-right text-muted-foreground">
                    Usage
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {databaseRows.map((row, i) => (
                  <TableRow
                    key={i}
                    className="last:border-0 hover:bg-surface-card"
                  >
                    <TableCell className="px-5 py-3 text-[13px] text-foreground font-mono">
                      {row.table}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-[13px] text-muted-foreground text-right">
                      {row.rows}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-[13px] text-muted-foreground text-right">
                      {row.size}
                    </TableCell>
                    <TableCell className="px-5 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <div className="w-[80px] h-1.5 bg-surface-hover rounded-full overflow-hidden border border-border">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              row.pct > 40 ? "bg-red-400/70" : "bg-primary"
                            )}
                            style={{ width: `${Math.max(row.pct, 1)}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-muted-foreground font-medium w-[36px] text-right">
                          {row.pct}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="px-5 py-3 flex items-center justify-between bg-background/50">
            <span className="text-[12px] text-muted-foreground">Total across 0 tables</span>
            <span className="text-[12px] text-muted-foreground font-medium">
              0 rows &middot; 0 MB
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-start gap-3 bg-surface-subtle border border-border rounded-2xl p-5 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-surface-hover border border-border-strong text-muted-foreground flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-4 h-4" strokeWidth={1.8} />
          </div>
          <div>
            <div className="text-[14px] font-semibold text-foreground mb-1">
              Need more resources?
            </div>
            <div className="text-[13px] text-muted-foreground leading-relaxed">
              You can upgrade your plan to increase usage quotas, or contact your
              organization admin to request additional allocations.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
