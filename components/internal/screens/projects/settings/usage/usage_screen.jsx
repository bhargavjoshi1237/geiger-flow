"use client";

import React, { useEffect, useMemo, useState } from "react";
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
} from "@geiger/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  LoadingArea,
} from "@geiger/ui";
import { cn } from "@/lib/utils";
import { SectionCard } from "@/components/internal/shared/screen_kit";
import { useProject } from "@/context/project-context";
import { listTasks } from "@/features/tasks/actions";
import { listIssues } from "@/features/issues/actions";
import { listAssets } from "@/features/assets/actions";
import { listActivityLogs } from "@/features/activity_logs/actions";
import { listTimeEntries } from "@/features/time_entries/actions";

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(timestamp) {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function last7Days() {
  const today = startOfDay(Date.now());
  return Array.from({ length: 7 }, (_, index) => {
    const time = today - (6 - index) * DAY_MS;
    return {
      time,
      label: new Date(time).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
    };
  });
}

function formatMb(bytes) {
  const mb = bytes / (1024 * 1024);
  if (mb >= 100) return `${Math.round(mb)} MB`;
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.max(Math.round(bytes / 1024), bytes > 0 ? 1 : 0)} KB`;
}

function distinctActors(logs) {
  return new Set(logs.map((log) => log.actor ?? log.createdBy).filter(Boolean));
}

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
        <div className="text-[13px] text-emerald-400 font-medium">{included}</div>
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
  const projectId = project?.id ?? null;
  const [tasks, setTasks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [assets, setAssets] = useState([]);
  const [logs, setLogs] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) {
        return undefined;
      }
      if (!projectId) {
        setTasks([]);
        setIssues([]);
        setAssets([]);
        setLogs([]);
        setTimeEntries([]);
        setLoading(false);
        return undefined;
      }
      setLoading(true);
      return Promise.all([
        listTasks(projectId),
        listIssues(projectId),
        listAssets(projectId),
        listActivityLogs(projectId),
        listTimeEntries(projectId),
      ]).then(([taskRows, issueRows, assetRows, logRows, entryRows]) => {
        if (!active) return;
        setTasks(taskRows ?? []);
        setIssues(issueRows ?? []);
        setAssets(assetRows ?? []);
        setLogs(logRows ?? []);
        setTimeEntries(entryRows ?? []);
        setLoading(false);
      });
    });
    return () => {
      active = false;
    };
  }, [projectId]);

  const usage = useMemo(() => {
    const storageBytes = assets.reduce((sum, asset) => sum + (Number(asset.sizeBytes) || 0), 0);
    const computeMinutes = timeEntries.reduce((sum, entry) => sum + (Number(entry.minutes) || 0), 0);
    const actors = distinctActors(logs);
    const days = last7Days();

    const daily = days.map(({ time, label }) => {
      const end = time + DAY_MS;
      const inDay = (value) => {
        const parsed = new Date(value).getTime();
        return Number.isFinite(parsed) && parsed >= time && parsed < end;
      };
      const dayLogs = logs.filter((log) => inDay(log.occurredAt ?? log.createdAt));
      const dayBytes = assets
        .filter((asset) => inDay(asset.createdAt))
        .reduce((sum, asset) => sum + (Number(asset.sizeBytes) || 0), 0);
      const mb = Number((dayBytes / (1024 * 1024)).toFixed(2));
      return { day: label, count: dayLogs.length, mb, users: distinctActors(dayLogs).size, size: mb };
    });

    const createdBytes = [...assets]
      .map((asset) => ({ time: new Date(asset.createdAt).getTime(), bytes: Number(asset.sizeBytes) || 0 }))
      .filter((entry) => Number.isFinite(entry.time))
      .sort((a, b) => a.time - b.time);
    const growth = days.map(({ time, label }) => {
      const end = time + DAY_MS;
      const bytes = createdBytes
        .filter((entry) => entry.time < end)
        .reduce((sum, entry) => sum + entry.bytes, 0);
      return { day: label, size: Number((bytes / (1024 * 1024)).toFixed(2)) };
    });

    const bySource = new Map();
    logs.forEach((log) => {
      const source = log.source || "app";
      bySource.set(source, (bySource.get(source) ?? 0) + 1);
    });
    const palette = ["bg-primary", "bg-emerald-400", "bg-sky-400", "bg-amber-400", "bg-violet-400"];
    const sessionBreakdown = [...bySource.entries()]
      .map(([label, value], index) => ({
        label,
        value,
        pct: logs.length > 0 ? Math.round((value / logs.length) * 100) : 0,
        color: palette[index % palette.length],
      }))
      .sort((a, b) => b.value - a.value);

    const tableCounts = [
      { table: "tasks", rows: tasks.length, size: null },
      { table: "issues", rows: issues.length, size: null },
      { table: "assets", rows: assets.length, size: formatMb(storageBytes) },
      { table: "activity_logs", rows: logs.length, size: null },
      { table: "time_entries", rows: timeEntries.length, size: null },
    ];
    const totalRows = tableCounts.reduce((sum, row) => sum + row.rows, 0);
    const databaseRows = tableCounts.map((row) => ({
      ...row,
      size: row.size ?? "—",
      pct: totalRows > 0 ? Math.round((row.rows / totalRows) * 100) : 0,
    }));

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthLogs = logs.filter(
      (log) => new Date(log.occurredAt ?? log.createdAt).getTime() >= monthStart.getTime(),
    );
    const firstSeen = new Map();
    [...logs]
      .sort((a, b) => new Date(a.occurredAt ?? a.createdAt) - new Date(b.occurredAt ?? b.createdAt))
      .forEach((log) => {
        const actor = log.actor ?? log.createdBy;
        if (actor && !firstSeen.has(actor)) {
          firstSeen.set(actor, new Date(log.occurredAt ?? log.createdAt).getTime());
        }
      });
    const newUsersMonth = [...firstSeen.values()].filter((time) => time >= monthStart.getTime()).length;

    const hoursByDay = new Map();
    timeEntries.forEach((entry) => {
      const key = entry.workedOn || (entry.createdAt ?? "").slice(0, 10);
      if (!key) return;
      hoursByDay.set(key, (hoursByDay.get(key) ?? 0) + (Number(entry.minutes) || 0) / 60);
    });
    const dayHours = [...hoursByDay.values()];
    const peakHours = dayHours.length > 0 ? Math.max(...dayHours) : 0;
    const avgHours = dayHours.length > 0 ? dayHours.reduce((sum, hours) => sum + hours, 0) / dayHours.length : 0;

    const minutesByOwner = new Map();
    timeEntries.forEach((entry) => {
      const owner = entry.owner || "Unassigned";
      minutesByOwner.set(owner, (minutesByOwner.get(owner) ?? 0) + (Number(entry.minutes) || 0));
    });
    const ownerTiles = [...minutesByOwner.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([owner, minutes]) => ({
        label: owner,
        pct: computeMinutes > 0 ? Math.round((minutes / computeMinutes) * 100) : 0,
      }));

    return {
      daily,
      growth,
      sessionBreakdown,
      databaseRows,
      totalRows,
      storageBytes,
      storageLabel: formatMb(storageBytes),
      activityCount: logs.length,
      activeUsers: actors.size,
      computeHours: computeMinutes / 60,
      monthEvents: monthLogs.length,
      newUsersMonth,
      peakHours,
      avgHours,
      ownerTiles,
    };
  }, [tasks, issues, assets, logs, timeEntries]);

  if (loading) {
    return <LoadingArea className="h-[400px] rounded-lg border border-border py-0" label="Loading usage" />;
  }

  const {
    daily,
    growth,
    sessionBreakdown,
    databaseRows,
    totalRows,
    storageBytes,
    storageLabel,
    activityCount,
    activeUsers,
    computeHours,
    monthEvents,
    newUsersMonth,
    peakHours,
    avgHours,
    ownerTiles,
  } = usage;

  const formatHours = (hours) =>
    hours >= 10 ? String(Math.round(hours)) : (Math.round(hours * 10) / 10).toString();

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <UsageMetricCard
          icon={Zap}
          label="API Requests"
          value={String(activityCount)}
          description="Recorded project events across every source"
        />
        <UsageMetricCard
          icon={HardDrive}
          label="Storage Used"
          value={storageLabel}
          description={`Across ${assets.length} stored asset${assets.length === 1 ? "" : "s"}`}
        />
        <UsageMetricCard
          icon={Globe}
          label="Bandwidth"
          value={storageLabel}
          description="Stored bytes served — egress metering isn't connected"
        />
        <UsageMetricCard
          icon={Server}
          label="Compute Time"
          value={`${formatHours(computeHours)} hrs`}
          description={`Logged across ${timeEntries.length} time entr${timeEntries.length === 1 ? "y" : "ies"}`}
        />
        <UsageMetricCard
          icon={Users}
          label="Active Users"
          value={String(activeUsers)}
          description="Contributors appearing in project activity"
        />
        <UsageMetricCard
          icon={Database}
          label="Database Rows"
          value={String(totalRows)}
          description="Live rows across tasks, issues, assets, and logs"
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
                  className="h-full bg-emerald-400 rounded-full transition-all"
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

      <SectionCard
        title="Request & Bandwidth"
        description="Daily API request volume and bandwidth consumption for the last 30 days."
      >

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartSection
            title="API Requests"
            subtitle="Daily request count"
            value={String(activityCount)}
            included={activityCount > 0 ? `${daily.reduce((sum, day) => sum + day.count, 0)} events in the last 7 days` : "No request data"}
            data={daily}
            dataKey="count"
            chartType="bar"
            height={140}
          />
          <ChartSection
            title="Bandwidth"
            subtitle="Daily data transfer"
            value={storageLabel}
            included={storageBytes > 0 ? "Stored bytes served" : "No bandwidth data"}
            data={daily}
            dataKey="mb"
            chartType="bar"
            height={140}
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Storage & Compute"
        description="Track how your project's storage and compute resources are being used over time."
      >

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartSection
            title="Storage Growth"
            value={storageLabel}
            included={storageBytes > 0 ? `Across ${assets.length} assets` : "No storage data"}
            data={growth}
            dataKey="size"
            chartType="area"
            chartColor="var(--chart-4)"
            height={140}
          />
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-[13px] font-medium text-foreground">
                Compute Hours
              </span>
              <span className="text-[13px] font-medium text-foreground">
                {formatHours(computeHours)} hrs
              </span>
            </div>
            <div className="text-[13px] text-emerald-400 font-medium">
              {timeEntries.length > 0 ? `${timeEntries.length} logged entries` : "No compute data"}
            </div>

            <div className="grid grid-cols-2 gap-6 mt-4">
              <div className="bg-background border border-border rounded-xl p-4">
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-2">
                  Avg. Daily
                </div>
                <div className="text-xl font-semibold text-foreground">
                  {formatHours(avgHours)}<span className="text-sm text-muted-foreground font-normal ml-1">hrs</span>
                </div>
              </div>
              <div className="bg-background border border-border rounded-xl p-4">
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-2">
                  Peak Day
                </div>
                <div className="text-xl font-semibold text-foreground">
                  {formatHours(peakHours)}<span className="text-sm text-muted-foreground font-normal ml-1">hrs</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-2">
              {ownerTiles.length === 0 ? (
                <div className="col-span-3 rounded-lg border border-dashed border-border bg-background px-4 py-6 text-center text-[13px] text-text-secondary">
                  Log time to see the breakdown by contributor.
                </div>
              ) : (
                ownerTiles.map((item) => (
                  <div key={item.label} className="bg-background border border-border rounded-lg p-3 text-center">
                    <div className="text-[11px] text-muted-foreground mb-1 truncate">{item.label}</div>
                    <div className="text-[13px] font-semibold text-foreground">
                      {item.pct}%
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="User Activity"
        description="Active user trends and session breakdown for the project."
      >

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartSection
            title="Weekly Active Users"
            value={String(activeUsers)}
            included={activeUsers > 0 ? `${monthEvents} events this month` : "No active user data"}
            data={daily}
            dataKey="users"
            chartType="bar"
            chartColor="var(--foreground)"
            barSize={28}
            height={140}
          />
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-[13px] font-medium text-foreground">
                Sessions This Month
              </span>
              <span className="text-[13px] font-medium text-foreground">
                {monthEvents}
              </span>
            </div>

            <div className="space-y-3 mt-4">
              {sessionBreakdown.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-background px-4 py-6 text-center text-[13px] text-text-secondary">
                  No project events recorded yet.
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
                  Avg. Daily Events
                </div>
                <div className="text-xl font-semibold text-foreground">
                  {activityCount > 0 ? Math.round((activityCount / 7) * 10) / 10 : 0}
                </div>
              </div>
              <div className="bg-background border border-border rounded-xl p-4">
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-2">
                  New Users
                </div>
                <div className="text-xl font-semibold text-foreground">
                  {newUsersMonth}<span className="text-sm text-muted-foreground font-normal ml-1">this month</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Database Usage"
        description="Row counts and storage breakdown per table."
      >

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
            <span className="text-[12px] text-muted-foreground">Total across {databaseRows.length} tables</span>
            <span className="text-[12px] text-muted-foreground font-medium">
              {totalRows} rows &middot; {storageLabel}
            </span>
          </div>
        </div>
      </SectionCard>

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
