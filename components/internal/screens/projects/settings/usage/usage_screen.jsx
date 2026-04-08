"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Clock,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

const dailyRequests = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  count: Math.floor(800 + Math.random() * 1200),
}));

const dailyBandwidth = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  mb: Math.floor(15 + Math.random() * 25),
}));

const weeklyActiveUsers = Array.from({ length: 12 }, (_, i) => ({
  week: `W${i + 1}`,
  users: Math.floor(8 + Math.random() * 12),
}));

const storageTimeline = Array.from({ length: 20 }, (_, i) => ({
  day: i + 1,
  size: Math.floor(120 + i * 3.5 + Math.random() * 8),
}));

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
    <div className="bg-[#181818] border border-[#2c2c2c] rounded-2xl p-5 shadow-sm hover:border-[#3c3c3c] transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center border",
              isOverLimit
                ? "bg-red-500/10 border-red-500/20 text-red-400"
                : "bg-[#2c2c2c] border-[#3c3c3c] text-[#a3a3a3]"
            )}
          >
            <Icon className="w-4 h-4" strokeWidth={1.8} />
          </div>
          <span className="text-[13px] font-medium text-[#a3a3a3]">
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
        <span className="text-2xl font-semibold text-[#e7e7e7] tracking-tight">
          {value}
        </span>
        {limit && (
          <span className="text-sm font-normal text-[#555]">/ {limit}</span>
        )}
      </div>

      {percentage !== undefined && (
        <div className="mt-3 mb-1 h-1.5 w-full bg-[#2c2c2c] rounded-full overflow-hidden border border-[#333]">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              isOverLimit ? "bg-red-400" : "bg-primary"
            )}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}

      <p className="text-[12px] text-[#555] mt-2">{description}</p>
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
      <div className="flex items-center justify-between border-b border-[#2c2c2c] pb-2">
        <span className="text-[13px] font-medium text-[#e7e7e7]">
          {title}
        </span>
        <span className="text-[13px] font-medium text-[#e7e7e7]">
          {value}{" "}
          {limit && <span className="text-[#555] font-normal">/ {limit}</span>}
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
          value="18.4K"
          limit="50K"
          percentage={36.8}
          trend="up"
          trendValue="12.3%"
          description="36.8% of included quota this billing cycle"
        />
        <UsageMetricCard
          icon={HardDrive}
          label="Storage Used"
          value="342 MB"
          limit="1 GB"
          percentage={34.2}
          trend="up"
          trendValue="4.1%"
          description="34.2% of included storage"
        />
        <UsageMetricCard
          icon={Globe}
          label="Bandwidth"
          value="412 MB"
          limit="5 GB"
          percentage={8.2}
          trend="down"
          trendValue="2.7%"
          description="8.2% of bandwidth quota"
        />
        <UsageMetricCard
          icon={Server}
          label="Compute Time"
          value="128 hrs"
          limit="500 hrs"
          percentage={25.6}
          trend="up"
          trendValue="8.5%"
          description="25.6% of compute hours used"
        />
        <UsageMetricCard
          icon={Users}
          label="Active Users"
          value="12"
          limit="25"
          percentage={48}
          trend="up"
          trendValue="3 new"
          description="48% of seat allocation"
        />
        <UsageMetricCard
          icon={Database}
          label="Database Rows"
          value="6,842"
          limit="50K"
          percentage={13.7}
          trend="up"
          trendValue="340"
          description="13.7% of row capacity"
        />
      </div>

      <div className="bg-[#181818] border border-[#2c2c2c] rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#2c2c2c] border border-[#3c3c3c] text-[#a3a3a3] flex items-center justify-center shrink-0 mt-0.5">
            <Activity className="w-4 h-4" strokeWidth={1.8} />
          </div>
          <div>
            <div className="text-[14px] font-semibold text-[#e7e7e7] mb-1">
              Billing cycle progress
            </div>
            <div className="text-[13px] text-[#8b8b8b] leading-relaxed mb-3">
              Your current billing cycle ends on{" "}
              <span className="text-[#e7e7e7] font-medium">May 8, 2026</span>.
              Usage resets at the start of each cycle.
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-[#2c2c2c] rounded-full overflow-hidden border border-[#333]">
                <div
                  className="h-full bg-[#34b27b] rounded-full transition-all"
                  style={{ width: "26.7%" }}
                />
              </div>
              <span className="text-xs text-[#a3a3a3] font-medium whitespace-nowrap">
                8 / 30 days
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
            value="18.4K"
            limit="50K"
            included="50,000 included per cycle"
            data={dailyRequests}
            dataKey="count"
            chartType="bar"
            height={140}
          />
          <ChartSection
            title="Bandwidth"
            subtitle="Daily data transfer"
            value="412 MB"
            limit="5 GB"
            included="5 GB included per cycle"
            data={dailyBandwidth}
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
            value="342 MB"
            limit="1 GB"
            included="1 GB included storage"
            data={storageTimeline}
            dataKey="size"
            chartType="area"
            chartColor="#8b5cf6"
            height={140}
          />
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#2c2c2c] pb-2">
              <span className="text-[13px] font-medium text-[#e7e7e7]">
                Compute Hours
              </span>
              <span className="text-[13px] font-medium text-[#e7e7e7]">
                128 hrs{" "}
                <span className="text-[#555] font-normal">/ 500 hrs</span>
              </span>
            </div>
            <div className="text-[13px] text-[#34b27b] font-medium">
              500 hours included per cycle
            </div>

            <div className="grid grid-cols-2 gap-6 mt-4">
              <div className="bg-[#161616] border border-[#2c2c2c] rounded-xl p-4">
                <div className="text-[11px] text-[#666] uppercase tracking-wider font-medium mb-2">
                  Avg. Daily
                </div>
                <div className="text-xl font-semibold text-[#e7e7e7]">
                  4.2<span className="text-sm text-[#555] font-normal ml-1">hrs</span>
                </div>
              </div>
              <div className="bg-[#161616] border border-[#2c2c2c] rounded-xl p-4">
                <div className="text-[11px] text-[#666] uppercase tracking-wider font-medium mb-2">
                  Peak Day
                </div>
                <div className="text-xl font-semibold text-[#e7e7e7]">
                  8.1<span className="text-sm text-[#555] font-normal ml-1">hrs</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-2">
              {["Serverless Functions", "Edge Functions", "Background Jobs"].map(
                (item, i) => (
                  <div key={i} className="bg-[#161616] border border-[#2c2c2c] rounded-lg p-3 text-center">
                    <div className="text-[11px] text-[#666] mb-1">{item}</div>
                    <div className="text-[13px] font-semibold text-[#a3a3a3]">
                      {[62, 38, 28][i]}%
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
            value="12"
            limit="25"
            included="25 seats included"
            data={weeklyActiveUsers}
            dataKey="users"
            chartType="bar"
            chartColor="#e7e7e7"
            barSize={28}
            height={140}
          />
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#2c2c2c] pb-2">
              <span className="text-[13px] font-medium text-[#e7e7e7]">
                Sessions This Month
              </span>
              <span className="text-[13px] font-medium text-[#e7e7e7]">
                247
              </span>
            </div>

            <div className="space-y-3 mt-4">
              {[
                { label: "Web App", value: "164", pct: 66, color: "bg-primary" },
                { label: "API / CLI", value: "58", pct: 23, color: "bg-blue-500" },
                { label: "Mobile", value: "25", pct: 11, color: "bg-purple-500" },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[13px] text-[#a3a3a3]">
                      {item.label}
                    </span>
                    <span className="text-[13px] text-[#e7e7e7]">
                      {item.value}{" "}
                      <span className="text-[#555]">({item.pct}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#2c2c2c] rounded-full overflow-hidden border border-[#333]">
                    <div
                      className={cn("h-full rounded-full", item.color)}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-[#161616] border border-[#2c2c2c] rounded-xl p-4">
                <div className="text-[11px] text-[#666] uppercase tracking-wider font-medium mb-2">
                  Avg. Session
                </div>
                <div className="text-xl font-semibold text-[#e7e7e7]">
                  23<span className="text-sm text-[#555] font-normal ml-1">min</span>
                </div>
              </div>
              <div className="bg-[#161616] border border-[#2c2c2c] rounded-xl p-4">
                <div className="text-[11px] text-[#666] uppercase tracking-wider font-medium mb-2">
                  New Users
                </div>
                <div className="text-xl font-semibold text-[#e7e7e7]">
                  3<span className="text-sm text-[#555] font-normal ml-1">this month</span>
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

        <div className="border border-[#2c2c2c] rounded-xl overflow-hidden bg-[#181818]">
          <div className="border-b border-[#2c2c2c]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2c2c2c]">
                  <th className="px-5 py-3 text-[11px] font-bold text-[#666] tracking-wider uppercase">
                    Table
                  </th>
                  <th className="px-5 py-3 text-[11px] font-bold text-[#666] tracking-wider uppercase text-right">
                    Rows
                  </th>
                  <th className="px-5 py-3 text-[11px] font-bold text-[#666] tracking-wider uppercase text-right">
                    Size
                  </th>
                  <th className="px-5 py-3 text-[11px] font-bold text-[#666] tracking-wider uppercase text-right w-[140px]">
                    Usage
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { table: "flow_projects", rows: "3", size: "24 KB", pct: 0.3 },
                  { table: "flow_tasks", rows: "1,842", size: "4.2 MB", pct: 14 },
                  { table: "flow_goals", rows: "128", size: "856 KB", pct: 2.2 },
                  { table: "flow_logs", rows: "4,200", size: "18.6 MB", pct: 52 },
                  { table: "flow_notifications", rows: "645", size: "3.1 MB", pct: 10 },
                  { table: "flow_vault", rows: "24", size: "96 KB", pct: 0.2 },
                ].map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-[#2c2c2c] last:border-0 hover:bg-[#202020] transition-colors"
                  >
                    <td className="px-5 py-3 text-[13px] text-[#e7e7e7] font-mono">
                      {row.table}
                    </td>
                    <td className="px-5 py-3 text-[13px] text-[#a3a3a3] text-right">
                      {row.rows}
                    </td>
                    <td className="px-5 py-3 text-[13px] text-[#a3a3a3] text-right">
                      {row.size}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <div className="w-[80px] h-1.5 bg-[#2c2c2c] rounded-full overflow-hidden border border-[#333]">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              row.pct > 40 ? "bg-red-400/70" : "bg-primary"
                            )}
                            style={{ width: `${Math.max(row.pct, 1)}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-[#555] font-medium w-[36px] text-right">
                          {row.pct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 flex items-center justify-between bg-[#161616]/50">
            <span className="text-[12px] text-[#555]">Total across 6 tables</span>
            <span className="text-[12px] text-[#a3a3a3] font-medium">
              6,842 rows &middot; 26.9 MB
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-start gap-3 bg-[#181818] border border-[#2c2c2c] rounded-2xl p-5 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-[#2c2c2c] border border-[#3c3c3c] text-[#a3a3a3] flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-4 h-4" strokeWidth={1.8} />
          </div>
          <div>
            <div className="text-[14px] font-semibold text-[#e7e7e7] mb-1">
              Need more resources?
            </div>
            <div className="text-[13px] text-[#8b8b8b] leading-relaxed">
              You can upgrade your plan to increase usage quotas, or contact your
              organization admin to request additional allocations.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
