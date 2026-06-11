"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bug,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Expand,
  Flag,
  GitMerge,
  ListTodo,
  Maximize2,
  Milestone,
  Sparkles,
  Users,
} from "lucide-react";
import { useProject } from "@/context/project-context";
import { DeadlinesSection } from "@/components/internal/shared/deadlines";
import { useBanner } from "@/context/banner-context";
import { useEffect } from "react";
import {
  Area,
  AreaChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import FilterDropdown from "./filter_dropdown";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { IssueItem, severityColors } from "@/components/ui/issue-item";
import { cn } from "@/lib/utils";
import { ExternalLinkIcon } from "@/components/internal/externals/external_links";

const CHART_COLORS = {
  primary: "var(--foreground)",
  secondary: "var(--text-secondary)",
  muted: "var(--muted-foreground)",
  borderStrong: "var(--border-strong)",
  borderSubtle: "var(--border)",
  grid: "var(--divider)",
  surface2: "var(--surface-active)",
  ringBackground: "var(--surface-strong)",
  appBackground: "var(--background)",
};

const CHART_SERIES_COLORS = [
  CHART_COLORS.primary,
  "var(--text-secondary)",
  CHART_COLORS.secondary,
  CHART_COLORS.muted,
  CHART_COLORS.borderStrong,
];

const METRIC_CARD_CHART_COLOR = "#10b981";

function MetricCard({ title, subtitle, value, data }) {
  const chartData =
    data && data.length > 0
      ? data.map((v, i) => ({ value: v, time: i }))
      : Array.from({ length: 11 }).map((_, i) => ({ value: 0, time: i }));

  const chartConfig = {
    value: {
      label: title,
      color: METRIC_CARD_CHART_COLOR,
    },
  };

  return (
    <Card className="bg-surface-subtle border-border text-foreground overflow-hidden group hover:border-border-strong transition-all duration-300">
      <CardHeader className="pb-2 space-y-1">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-5 h-5 rounded bg-surface-hover flex items-center justify-center">
            {title === "Productivity" && (
              <Activity className="w-3 h-3 text-text-secondary" />
            )}
            {title === "New Features" && (
              <Sparkles className="w-3 h-3 text-text-secondary" />
            )}
            {title === "Issues Solved" && (
              <Bug className="w-3 h-3 text-text-secondary" />
            )}
            {title === "PR Merged" && (
              <GitMerge className="w-3 h-3 text-text-secondary" />
            )}
          </div>
          <span className="text-sm font-medium">{title}</span>
        </div>
        <p className="text-xs text-text-tertiary">{subtitle}</p>
        <div className="text-2xl font-bold mt-1">{value}</div>
      </CardHeader>
      <CardContent className="p-0 h-32 relative transition-colors -mb-2">
        <div className="absolute inset-0 flex items-end">
          <ChartContainer
            config={chartConfig}
            className="w-[90%] mx-auto mb-6 h-full"
          >
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id={`metric-fill-${title.replace(/\s+/g, "-").toLowerCase()}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-value)" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="var(--color-value)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--color-value)"
                fill={`url(#metric-fill-${title.replace(/\s+/g, "-").toLowerCase()})`}
                fillOpacity={1}
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ChartContainer>
        </div>
        <div className="absolute bottom-2 left-4 text-[10px] text-text-tertiary flex justify-between w-[calc(100%-32px)]">
          <span>No start timestamp</span>
          <span>No end timestamp</span>
        </div>
      </CardContent>
    </Card>
  );
}

const STATUS_SHOWCASE = [];

const PLACEHOLDER_COUNT = 0;

function getCount(value) {
  return Number.isFinite(value) ? value : PLACEHOLDER_COUNT;
}

const RADAR_METRICS = {};

const EMPTY_RADAR_DATA = [
  { label: "D1", value: 0 },
  { label: "D2", value: 0 },
  { label: "D3", value: 0 },
  { label: "D4", value: 0 },
  { label: "D5", value: 0 },
  { label: "D6", value: 0 },
];

const RADAR_METRIC_OPTIONS = Object.entries(RADAR_METRICS).map(([value, item]) => ({
  value,
  label: item.label,
}));

const RESOURCE_METRICS = {};

const RESOURCE_METRIC_OPTIONS = Object.entries(RESOURCE_METRICS).map(([value, item]) => ({
  value,
  label: item.label,
}));

const DASHBOARD_TASKS = [];

const taskPriorityIcons = {
  critical: <AlertTriangle className="h-3 w-3" />,
  high: <Expand className="h-3 w-3" />,
  medium: <Maximize2 className="h-3 w-3" />,
  low: <ArrowUpRight className="h-3 w-3" />,
};

function getTaskPriorityKey(priority) {
  return priority?.toLowerCase().replace(" priority", "") || "medium";
}

function TaskPriorityBadge({ priority }) {
  const priorityKey = getTaskPriorityKey(priority);

  return (
    <span
      className={cn(
        "flex items-center justify-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-medium capitalize",
        severityColors[priorityKey] || severityColors.medium,
      )}
    >
      {taskPriorityIcons[priorityKey] || taskPriorityIcons.medium}
      {priorityKey}
    </span>
  );
}

const DASHBOARD_MILESTONES = [];

const DASHBOARD_ACTIVITY = [];

function WidgetShell({ children, className, contentClassName }) {
  return (
    <Card className={cn("bg-surface-subtle border-border text-foreground rounded-xl py-0 gap-0 overflow-hidden", className)}>
      <CardContent className={cn("p-4", contentClassName)}>{children}</CardContent>
    </Card>
  );
}

function TaskStatusShowcaseWidget() {
  const [selectedStatus, setSelectedStatus] = useState("inProgress");
  const total = STATUS_SHOWCASE.reduce((sum, item) => sum + getCount(item.value), 0);
  const chartData = STATUS_SHOWCASE.map((item) => ({
    ...item,
    value: getCount(item.value),
    fill: `var(--color-${item.key})`,
  }));
  const selectedIndex = Math.max(
    chartData.findIndex((item) => item.key === selectedStatus),
    0,
  );
  const selectedItem = chartData[selectedIndex] || chartData[0];
  const statusOptions = STATUS_SHOWCASE.map((item) => ({
    value: item.key,
    label: item.label,
  }));
  const chartConfig = STATUS_SHOWCASE.reduce(
    (config, item) => ({
      ...config,
      [item.key]: {
        label: item.label,
        color: item.color,
      },
    }),
    {},
  );

  return (
    <WidgetShell className="h-[420px]" contentClassName="h-full">
      <div className="flex h-full flex-col">
        <div className="flex w-full items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-col">
            <h3 className="text-base font-semibold text-foreground">Task Breakout by Status</h3>
            <p className="text-sm text-muted-foreground">Current task distribution across active statuses.</p>
          </div>
          <FilterDropdown
            value={selectedStatus}
            onValueChange={setSelectedStatus}
            options={statusOptions}
            height="h-9"
          />
        </div>
        <div className="relative mt-4 flex min-h-0 w-full flex-1 items-center justify-center">
          <ChartContainer config={chartConfig} className="mx-auto h-[260px] w-[260px]">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel nameKey="key" />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="key"
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={84}
                activeIndex={selectedIndex}
                activeShape={{ outerRadius: 94 }}
                onMouseEnter={(_, index) => {
                  setSelectedStatus(chartData[index]?.key || selectedStatus);
                }}
                stroke={CHART_COLORS.appBackground}
                strokeWidth={2}
              />
            </PieChart>
          </ChartContainer>
          <div className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
            <span className="text-3xl font-bold leading-none text-foreground">{selectedItem?.value ?? total}</span>
            <span className="mt-1 text-xs font-medium text-muted-foreground">{selectedItem?.label || "Total Tasks"}</span>
          </div>
        </div>
        <div className="mt-2 min-h-[44px] text-center">
          <p className="text-sm font-semibold text-foreground">
            {selectedItem?.label || "Tasks"} accounts for {total ? Math.round(((selectedItem?.value || 0) / total) * 100) : PLACEHOLDER_COUNT}% of tasks
          </p>
          <p className="mt-1 text-sm text-text-secondary">Current project status mix</p>
        </div>
      </div>
    </WidgetShell>
  );
}

function YearlyRadarWidget() {
  const [metric, setMetric] = useState("prs");
  const selected = RADAR_METRICS[metric] || {
    label: "Activity",
    description: "Backend chart data will appear here.",
    trend: "0%",
    data: EMPTY_RADAR_DATA,
  };
  const radarData = (Array.isArray(selected.data) && selected.data.length > 0
    ? selected.data
    : EMPTY_RADAR_DATA
  ).map((item, index) => ({
    ...item,
    label: item.label || item.month || `D${index + 1}`,
    value: getCount(item.value),
  }));

  return (
    <WidgetShell className="h-[420px]" contentClassName="h-full">
      <div className="flex h-full flex-col">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-2 justify-between w-full">
            <div className="flex flex-col w-full">
              <h3 className="text-base font-semibold text-foreground">Radar Chart</h3>
              <p className="text-sm text-muted-foreground">{selected.description}</p>
            </div>

            <FilterDropdown
              value={metric}
              onValueChange={setMetric}
              options={RADAR_METRIC_OPTIONS}
              height="h-9"
            />
          </div>
        </div>

        <div className="mt-4 flex min-h-0 flex-1 items-center justify-center">
          <ChartContainer
            config={{
              value: {
                label: selected.label,
                color: CHART_COLORS.primary,
              },
            }}
            className="mx-auto h-[260px] w-full"
          >
            <RadarChart data={radarData} margin={{ top: 12, right: 30, bottom: 12, left: 30 }}>
              <PolarGrid stroke={CHART_COLORS.grid} />
              <PolarAngleAxis dataKey="label" tick={{ fill: CHART_COLORS.muted, fontSize: 12 }} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Radar
                dataKey="value"
                stroke={CHART_COLORS.primary}
                fill={CHART_COLORS.primary}
                fillOpacity={0.18}
                strokeWidth={2}
              />
            </RadarChart>
          </ChartContainer>
        </div>

        <div className="mt-2 min-h-[44px] text-center">
          <p className="text-sm font-semibold text-foreground">
            Trending up by {selected.trend} this year
          </p>
          <p className="mt-1 text-sm text-text-secondary">January - November 2026</p>
        </div>
      </div>
    </WidgetShell>
  );
}

function ResourcePerformanceWidget() {
  const [metric, setMetric] = useState("tasks");
  const selected = RESOURCE_METRICS[metric] || {
    label: "Resources",
    trend: "0%",
    people: [],
  };
  const people = Array.isArray(selected.people) ? selected.people : [];
  const values = people.map((person) => getCount(person.value));
  const max = Math.max(PLACEHOLDER_COUNT, ...values);
  const chartMax = max || 1;
  const rings = (people.length > 0 ? [...people] : [{ name: "No data", value: 0 }])
    .sort((a, b) => getCount(b.value) - getCount(a.value))
    .map((person, index) => ({
      ...person,
      key: `resource${index}`,
      value: getCount(person.value),
      fill: `var(--color-resource${index})`,
    }));
  const chartConfig = rings.reduce(
    (config, ring, index) => ({
      ...config,
      [ring.key]: {
        label: ring.name,
        color: CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length],
      },
    }),
    {
      value: {
        label: selected.label,
      },
    },
  );

  return (
    <WidgetShell className="h-[420px]" contentClassName="h-full">
      <div className="flex h-full flex-col">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-2 justify-between w-full">
            <div className="flex flex-col w-full">
              <h3 className="text-base font-semibold text-foreground">Resource Performance</h3>
              <p className="text-sm text-muted-foreground">
                Weekly team performance.
              </p>
            </div>
            <FilterDropdown
              value={metric}
              onValueChange={setMetric}
              options={RESOURCE_METRIC_OPTIONS}
              height="h-9"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-1 items-center justify-center">
          <div className="relative h-[260px] w-[260px] shrink-0">
            <ChartContainer
              config={chartConfig}
              className="h-full w-full [&_.recharts-radial-bar-background-sector]:fill-muted-foreground"
            >
              <RadialBarChart
                data={rings}
                startAngle={90}
                endAngle={-270}
                innerRadius={38}
                outerRadius={112}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, chartMax]}
                  tick={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel nameKey="key" />}
                />
                <RadialBar
                  dataKey="value"
                  background
                  cornerRadius={8}
                />
              </RadialBarChart>
            </ChartContainer>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="text-[28px] font-extrabold leading-none text-foreground">
                {max}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-2 min-h-[44px] text-center">
          <p className="text-sm font-semibold text-foreground">
            {people.length > 0
              ? `Trending up by ${selected.trend} this week`
              : "No resource performance data yet"}
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            {people.length > 0
              ? "Compared with last week across active resources"
              : "Backend resource metrics will replace this zero baseline."}
          </p>
        </div>
      </div>
    </WidgetShell>
  );
}

export function ProjectDetailsScreen({ externalLinks = [] }) {
  const { project } = useProject();
  const { showBanner } = useBanner();
  const [activeIssueTab, setActiveIssueTab] = useState("SECURITY");
  const [filterValue, setFilterValue] = useState("1w");
  const dashboardLinks = externalLinks.filter((link) => link.showOnDashboard);

  useEffect(() => {
    if (window.location.pathname === "/") {
      showBanner({
        message: "Geiger is currently in development (Pre-alpha preview).",
        type: "info",
        isSticky: true,
      });
    }
  }, [showBanner]);

  const databaseData = [];
  const authData = [];

  return (
    <MainScreenWrapper>
      <div className="flex flex-col md:flex-row md:items-center justify-between mt-2 gap-4">
        <div className="flex items-center justify-center md:justify-start gap-3 w-full md:w-auto text-center md:text-left">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {project?.name}
          </h1>
          <span className="bg-surface-subtle text-text-secondary text-[9px] px-1.5 py-0.5 rounded border border-border font-mono tracking-widest shrink-0">
            NANO
          </span>
        </div>
        <div className="w-full md:w-auto">
          <div className="flex w-full md:w-auto md:gap-0">
            <div className="flex-1 md:flex-none flex flex-col items-center md:pr-8">
              <span className="text-text-secondary text-[11px] uppercase tracking-wider font-medium">
                Members
              </span>
              <span className="text-foreground font-bold text-2xl mt-0.5">6</span>
            </div>
            <div className="flex-1 md:flex-none flex flex-col items-center border-l border-border md:px-8">
              <span className="text-text-secondary text-[11px] uppercase tracking-wider font-medium">
                Goals
              </span>
              <span className="text-foreground font-bold text-2xl mt-0.5">0</span>
            </div>
            <div className="flex-1 md:flex-none flex flex-col items-center border-l border-border md:pl-8">
              <span className="text-text-secondary text-[11px] uppercase tracking-wider font-medium">
                Milestones
              </span>
              <span className="text-foreground font-bold text-2xl mt-0.5">0</span>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full mt-2 mb-6 md:mb-6">
        <p className="text-text-secondary text-sm text-center md:text-left">
          Geiger Flow Lightweight creative project manager. Kanban, Timeline
          view, Process, End Node Progress Hiring Templets , Project Templets
          Staging. Milestones. Comments/Discussions , Dropdown Stack of Nodes
        </p>
      </div>
      <div className="pt-4 border-t border-border">
        <FilterDropdown
          value={filterValue}
          onValueChange={setFilterValue}
        />
      </div>

      {dashboardLinks.length > 0 ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-medium text-foreground">External links</h2>
            <p className="text-sm text-text-secondary">Pinned project resources</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {dashboardLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target={link.openInNewTab ? "_blank" : undefined}
                rel={link.openInNewTab ? "noreferrer" : undefined}
                className="group flex min-h-20 items-center gap-3 rounded-lg border border-border bg-surface-card p-4 transition-colors hover:border-border-strong hover:bg-surface-active"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-surface-subtle">
                  <ExternalLinkIcon
                    iconName={link.icon}
                    className="h-5 w-5"
                    style={{ color: link.textColor || "var(--foreground)" }}
                  />
                </div>
                <div className="min-w-0">
                  <p
                    className="truncate text-sm font-medium"
                    style={{ color: link.textColor || "var(--foreground)" }}
                  >
                    {link.title}
                  </p>
                  <p className="mt-1 truncate text-xs text-text-secondary group-hover:text-muted-foreground">
                    {link.url}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          title="Productivity"
          subtitle="Development activity"
          value="2"
          data={databaseData}
        />
        <MetricCard
          title="New Features"
          subtitle="Feature velocity"
          value="2"
          data={authData}
        />
        <MetricCard
          title="Issues Solved"
          subtitle="Bug resolutions"
          value="0"
          data={[]}
        />
        <MetricCard
          title="PR Merged"
          subtitle="Code contributions"
          value="0"
          data={[]}
        />
      </div>

      <DeadlinesSection />

      <div className="flex flex-col gap-4 xl:flex-row">
        <div className="min-w-0 flex-1">
          <ResourcePerformanceWidget />
        </div>
        <div className="min-w-0 flex-1">
          <YearlyRadarWidget />
        </div>
        <div className="min-w-0 flex-1">
          <TaskStatusShowcaseWidget />
        </div>
      </div>

      <div className="py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="px-1">
            <h2 className="text-lg font-semibold text-foreground tracking-tight leading-tight">
              Top Issues
            </h2>
            <p className="text-xs text-text-secondary">
              Tasks requiring immediate attention
            </p>
          </div>
          <Button className="text-xs font-medium text-text-secondary hover:text-foreground px-3 py-1.5 rounded-lg transition-colors hover:border-border-strong flex items-center gap-2">
          View Issues <ChevronRight className="w-3 h-3" />
        </Button>
        </div>
        <div className="space-y-2">
          <div className="rounded-xl border border-dashed border-border bg-surface-subtle p-8 text-center">
            <p className="text-sm font-medium text-foreground">No issues yet</p>
            <p className="mt-1 text-xs text-text-secondary">
              Issue data will appear here after backend fetching is connected.
            </p>
          </div>
        </div>
      </div>

    </MainScreenWrapper>
  );
}
