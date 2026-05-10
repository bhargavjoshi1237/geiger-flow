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

const CHART_COLORS = {
  primary: "#ffffff",
  secondary: "#a3a3a3",
  muted: "#737373",
  borderStrong: "#474747",
  borderSubtle: "#333333",
  grid: "#2a2a2a",
  surface2: "#242424",
  ringBackground: "#333333",
  appBackground: "#161616",
};

const CHART_SERIES_COLORS = [
  CHART_COLORS.primary,
  "#e5e5e5",
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
    <Card className="bg-[#1a1a1a] border-[#2a2a2a] text-[#e7e7e7] overflow-hidden group hover:border-[#474747] transition-all duration-300">
      <CardHeader className="pb-2 space-y-1">
        <div className="flex items-center gap-2 text-[#a3a3a3]">
          <div className="w-5 h-5 rounded bg-[#2a2a2a] flex items-center justify-center">
            {title === "Productivity" && (
              <Activity className="w-3 h-3 text-[#737373]" />
            )}
            {title === "New Features" && (
              <Sparkles className="w-3 h-3 text-[#737373]" />
            )}
            {title === "Issues Solved" && (
              <Bug className="w-3 h-3 text-[#737373]" />
            )}
            {title === "PR Merged" && (
              <GitMerge className="w-3 h-3 text-[#737373]" />
            )}
          </div>
          <span className="text-sm font-medium">{title}</span>
        </div>
        <p className="text-xs text-[#525252]">{subtitle}</p>
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
        <div className="absolute bottom-2 left-4 text-[10px] text-[#404040] flex justify-between w-[calc(100%-32px)]">
          <span>Mar 1, 8:06pm</span>
          <span>Mar 1, 9:06pm</span>
        </div>
      </CardContent>
    </Card>
  );
}

const STATUS_SHOWCASE = [
  { key: "todo", label: "To Do", value: 3, color: CHART_COLORS.primary },
  { key: "inProgress", label: "In Progress", value: 2, color: CHART_COLORS.secondary },
  { key: "completed", label: "Completed", value: 2, color: CHART_COLORS.borderStrong },
];

const PLACEHOLDER_COUNT = 0;

function getCount(value) {
  return Number.isFinite(value) ? value : PLACEHOLDER_COUNT;
}

const RADAR_METRICS = {
  prs: {
    label: "PRs",
    description: "Pull request throughput across alternating months",
    trend: "+5.2%",
    data: [
      { month: "Jan", value: 42 },
      { month: "Mar", value: 48 },
      { month: "May", value: 54 },
      { month: "Jul", value: 70 },
      { month: "Sep", value: 64 },
      { month: "Nov", value: 52 },
    ],
  },
  tasks: {
    label: "Tasks",
    description: "Task completions and progress events across alternating months",
    trend: "+12.4%",
    data: [
      { month: "Jan", value: 68 },
      { month: "Mar", value: 72 },
      { month: "May", value: 77 },
      { month: "Jul", value: 91 },
      { month: "Sep", value: 76 },
      { month: "Nov", value: 69 },
    ],
  },
  issues: {
    label: "Issues",
    description: "Resolved issue count and remediation volume",
    trend: "+8.1%",
    data: [
      { month: "Jan", value: 37 },
      { month: "Mar", value: 57 },
      { month: "May", value: 61 },
      { month: "Jul", value: 63 },
      { month: "Sep", value: 59 },
      { month: "Nov", value: 52 },
    ],
  },
  milestones: {
    label: "Milestones",
    description: "Milestones completed, reviewed, or moved forward across alternating months",
    trend: "+3.8%",
    data: [
      { month: "Jan", value: 28 },
      { month: "Mar", value: 39 },
      { month: "May", value: 41 },
      { month: "Jul", value: 48 },
      { month: "Sep", value: 44 },
      { month: "Nov", value: 46 },
    ],
  },
};

const RADAR_METRIC_OPTIONS = Object.entries(RADAR_METRICS).map(([value, item]) => ({
  value,
  label: item.label,
}));

const RESOURCE_METRICS = {
  prs: {
    label: "PRs",
    unit: "merged",
    maxLabel: "22 PRs",
    trend: "+6.4%",
    people: [
      { name: "Aadit", initials: "AJ", value: 22, color: CHART_SERIES_COLORS[0] },
      { name: "Priya", initials: "PS", value: 18, color: CHART_SERIES_COLORS[1] },
      { name: "Sam", initials: "SL", value: 15, color: CHART_SERIES_COLORS[2] },
      { name: "Riley", initials: "RK", value: 11, color: CHART_SERIES_COLORS[3] },
      { name: "Jordan", initials: "JM", value: 8, color: CHART_SERIES_COLORS[4] },
    ],
  },
  tasks: {
    label: "Tasks",
    unit: "completed",
    maxLabel: "34 tasks",
    trend: "+11.8%",
    people: [
      { name: "Aadit", initials: "AJ", value: 31, color: CHART_SERIES_COLORS[0] },
      { name: "Priya", initials: "PS", value: 34, color: CHART_SERIES_COLORS[1] },
      { name: "Sam", initials: "SL", value: 25, color: CHART_SERIES_COLORS[2] },
      { name: "Riley", initials: "RK", value: 19, color: CHART_SERIES_COLORS[3] },
      { name: "Jordan", initials: "JM", value: 14, color: CHART_SERIES_COLORS[4] },
    ],
  },
  issues: {
    label: "Issues",
    unit: "resolved",
    maxLabel: "16 issues",
    trend: "+4.7%",
    people: [
      { name: "Aadit", initials: "AJ", value: 12, color: CHART_SERIES_COLORS[0] },
      { name: "Priya", initials: "PS", value: 16, color: CHART_SERIES_COLORS[1] },
      { name: "Sam", initials: "SL", value: 13, color: CHART_SERIES_COLORS[2] },
      { name: "Riley", initials: "RK", value: 8, color: CHART_SERIES_COLORS[3] },
      { name: "Jordan", initials: "JM", value: 7, color: CHART_SERIES_COLORS[4] },
    ],
  },
  milestones: {
    label: "Milestones",
    unit: "moved",
    maxLabel: "9 milestones",
    trend: "+3.1%",
    people: [
      { name: "Aadit", initials: "AJ", value: 9, color: CHART_SERIES_COLORS[0] },
      { name: "Priya", initials: "PS", value: 7, color: CHART_SERIES_COLORS[1] },
      { name: "Sam", initials: "SL", value: 6, color: CHART_SERIES_COLORS[2] },
      { name: "Riley", initials: "RK", value: 5, color: CHART_SERIES_COLORS[3] },
      { name: "Jordan", initials: "JM", value: 3, color: CHART_SERIES_COLORS[4] },
    ],
  },
  time: {
    label: "Time",
    unit: "logged",
    maxLabel: "38h",
    trend: "+9.6%",
    people: [
      { name: "Aadit", initials: "AJ", value: 38, color: CHART_SERIES_COLORS[0] },
      { name: "Priya", initials: "PS", value: 32, color: CHART_SERIES_COLORS[1] },
      { name: "Sam", initials: "SL", value: 29, color: CHART_SERIES_COLORS[2] },
      { name: "Riley", initials: "RK", value: 24, color: CHART_SERIES_COLORS[3] },
      { name: "Jordan", initials: "JM", value: 17, color: CHART_SERIES_COLORS[4] },
    ],
  },
};

const RESOURCE_METRIC_OPTIONS = Object.entries(RESOURCE_METRICS).map(([value, item]) => ({
  value,
  label: item.label,
}));

const DASHBOARD_TASKS = [
  {
    title: "Create a New Project",
    id: "DEM-1",
    priority: "High Priority",
    due: "May 8, 1:24 AM",
    status: "In Progress",
  },
  {
    title: "Test",
    id: "DEM-17",
    priority: "High Priority",
    due: "May 9, 12:00 AM",
    status: "To Do",
  },
  {
    title: "View Help Guides in Docs",
    id: "DEM-8",
    priority: "Low Priority",
    due: "May 10, 1:24 AM",
    status: "To Do",
  },
];

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

const DASHBOARD_MILESTONES = [
  { title: "Onboarding", date: "May 8-May 10", progress: 100 },
  { title: "Exploring Nifty", date: "May 9-May 11", progress: 33 },
  { title: "Getting Started", date: "May 10-May 14", progress: 18 },
];

const DASHBOARD_ACTIVITY = [
  "Aadit Joshi created milestone Exploring Nifty",
  "Aadit Joshi created milestone Getting Started",
  "Aadit Joshi created milestone Onboarding",
  "Aadit Joshi member joined",
  "Project Created",
  "Priya Shah completed View Help Guides in Docs",
  "Sam Lee moved Test to To Do",
  "Riley King updated Getting Started progress",
  "Jordan Miller commented on API Documentation",
  "Aadit Joshi assigned Create a New Project",
  "Priya Shah reviewed milestone dates",
  "Sam Lee updated task priority",
];

function WidgetShell({ children, className, contentClassName }) {
  return (
    <Card className={cn("bg-[#1a1a1a] border-[#2a2a2a] text-[#e7e7e7] rounded-xl py-0 gap-0 overflow-hidden", className)}>
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
            <h3 className="text-base font-semibold text-[#ededed]">Task Breakout by Status</h3>
            <p className="text-sm text-[#a3a3a3]">Current task distribution across active statuses.</p>
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
            <span className="text-3xl font-bold leading-none text-[#ffffff]">{selectedItem?.value ?? total}</span>
            <span className="mt-1 text-xs font-medium text-[#a3a3a3]">{selectedItem?.label || "Total Tasks"}</span>
          </div>
        </div>
        <div className="mt-2 min-h-[44px] text-center">
          <p className="text-sm font-semibold text-[#ededed]">
            {selectedItem?.label || "Tasks"} accounts for {total ? Math.round(((selectedItem?.value || 0) / total) * 100) : PLACEHOLDER_COUNT}% of tasks
          </p>
          <p className="mt-1 text-sm text-[#737373]">Current project status mix</p>
        </div>
      </div>
    </WidgetShell>
  );
}

function YearlyRadarWidget() {
  const [metric, setMetric] = useState("prs");
  const selected = RADAR_METRICS[metric];

  return (
    <WidgetShell className="h-[420px]" contentClassName="h-full">
      <div className="flex h-full flex-col">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-2 justify-between w-full">
            <div className="flex flex-col w-full">
              <h3 className="text-base font-semibold text-[#ededed]">Radar Chart</h3>
              <p className="text-sm text-[#a3a3a3]">{selected.description}</p>
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
            <RadarChart data={selected.data} margin={{ top: 12, right: 30, bottom: 12, left: 30 }}>
              <PolarGrid stroke={CHART_COLORS.grid} />
              <PolarAngleAxis dataKey="month" tick={{ fill: CHART_COLORS.muted, fontSize: 12 }} />
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
          <p className="text-sm font-semibold text-[#ededed]">
            Trending up by {selected.trend} this year
          </p>
          <p className="mt-1 text-sm text-[#737373]">January - November 2026</p>
        </div>
      </div>
    </WidgetShell>
  );
}

function ResourcePerformanceWidget() {
  const [metric, setMetric] = useState("tasks");
  const selected = RESOURCE_METRICS[metric];
  const values = selected.people.map((person) => getCount(person.value));
  const max = Math.max(PLACEHOLDER_COUNT, ...values);
  const chartMax = max || 1;
  const rings = [...selected.people]
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
              <h3 className="text-base font-semibold text-[#ededed]">Resource Performance</h3>
              <p className="text-sm text-[#a3a3a3]">
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
              className="h-full w-full [&_.recharts-radial-bar-background-sector]:fill-[#333333]"
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
              <span className="text-[28px] font-extrabold leading-none text-[#ffffff]">
                {max}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-2 min-h-[44px] text-center">
          <p className="text-sm font-semibold text-[#ededed]">
            Trending up by {selected.trend} this week
          </p>
          <p className="mt-1 text-sm text-[#737373]">Compared with last week across active resources</p>
        </div>
      </div>
    </WidgetShell>
  );
}

export function ProjectDetailsScreen() {
  const { project } = useProject();
  const { showBanner } = useBanner();
  const [activeIssueTab, setActiveIssueTab] = useState("SECURITY");
  const [filterValue, setFilterValue] = useState("1w");
  
  console.log("Current filter value:", filterValue);

  useEffect(() => {
    if (window.location.pathname === "/") {
      showBanner({
        message: "Geiger is currently in development (Pre-alpha preview).",
        type: "info",
        isSticky: true,
      });
    }
  }, [showBanner]);

  const databaseData = [2, 10, 5, 25, 8, 30, 2, 15, 5, 40, 2];
  const authData = [5, 15, 2, 20, 10, 35, 5, 25, 2, 45, 5];

  return (
    <MainScreenWrapper>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mt-2 gap-4">
        <div className="flex items-center justify-center md:justify-start gap-3 w-full md:w-auto text-center md:text-left">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {project?.name}
          </h1>
          <span className="bg-[#1a1a1a] text-[#737373] text-[9px] px-1.5 py-0.5 rounded border border-[#2a2a2a] font-mono tracking-widest shrink-0">
            NANO
          </span>
        </div>
        <div className="w-full md:w-auto">
          <div className="flex w-full md:w-auto md:gap-0">
            <div className="flex-1 md:flex-none flex flex-col items-center md:pr-8">
              <span className="text-[#737373] text-[11px] uppercase tracking-wider font-medium">
                Members
              </span>
              <span className="text-white font-bold text-2xl mt-0.5">6</span>
            </div>
            <div className="flex-1 md:flex-none flex flex-col items-center border-l border-[#2a2a2a] md:px-8">
              <span className="text-[#737373] text-[11px] uppercase tracking-wider font-medium">
                Goals
              </span>
              <span className="text-white font-bold text-2xl mt-0.5">0</span>
            </div>
            <div className="flex-1 md:flex-none flex flex-col items-center border-l border-[#2a2a2a] md:pl-8">
              <span className="text-[#737373] text-[11px] uppercase tracking-wider font-medium">
                Milestones
              </span>
              <span className="text-white font-bold text-2xl mt-0.5">0</span>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full mt-2 mb-6 md:mb-6">
        <p className="text-zinc-500 text-sm text-center md:text-left">
          Geiger Flow Lightweight creative project manager. Kanban, Timeline
          view, Process, End Node Progress Hiring Templets , Project Templets
          Staging. Milestones. Comments/Discussions , Dropdown Stack of Nodes
        </p>
      </div>
      <div className="pt-4 border-t border-[#242424]">
        <FilterDropdown
          value={filterValue}
          onValueChange={setFilterValue}
        />
      </div>

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

      {/* Deadlines Section */}
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

      {/* Top Issues Section */}
      <div className="py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="px-1">
            <h2 className="text-lg font-semibold text-[#e7e7e7] tracking-tight leading-tight">
              Top Issues
            </h2>
            <p className="text-xs text-[#737373]">
              Tasks requiring immediate attention
            </p>
          </div>
          <button className="text-xs font-medium text-[#737373] hover:text-[#e7e7e7] px-3 py-1.5 rounded-lg transition-colors hover:border-[#474747] flex items-center gap-2">
          View Issues <ChevronRight className="w-3 h-3" />
        </button>
        </div>
        <div className="space-y-2">
          <IssueItem
            title="API response time exceeding 500ms on /users endpoint"
            severity="critical"
            status="open"
            assignee="Alex M."
            dueDate="Today"
          >
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-2">API response time exceeding 500ms on /users endpoint</h2>
              <p className="text-sm text-[#a3a3a3] mb-4">Critical issue requiring immediate attention.</p>
              <div className="space-y-2 text-sm">
                <p><span className="text-[#737373]">Assignee:</span> Alex M.</p>
                <p><span className="text-[#737373]">Status:</span> Open</p>
                <p><span className="text-[#737373]">Due:</span> Today</p>
              </div>
            </div>
          </IssueItem>
          <IssueItem
            title="Memory leak in websocket connection handler"
            severity="critical"
            status="in_progress"
            assignee="Sarah J."
            dueDate="Tomorrow"
          >
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-2">Memory leak in websocket connection handler</h2>
              <p className="text-sm text-[#a3a3a3] mb-4">Critical issue requiring immediate attention.</p>
              <div className="space-y-2 text-sm">
                <p><span className="text-[#737373]">Assignee:</span> Sarah J.</p>
                <p><span className="text-[#737373]">Status:</span> In Progress</p>
                <p><span className="text-[#737373]">Due:</span> Tomorrow</p>
              </div>
            </div>
          </IssueItem>
          <IssueItem
            title="Database connection pool exhaustion"
            severity="high"
            status="open"
            assignee="Mike T."
            dueDate="Mar 10"
          >
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-2">Database connection pool exhaustion</h2>
              <p className="text-sm text-[#a3a3a3] mb-4">High priority issue.</p>
              <div className="space-y-2 text-sm">
                <p><span className="text-[#737373]">Assignee:</span> Mike T.</p>
                <p><span className="text-[#737373]">Status:</span> Open</p>
                <p><span className="text-[#737373]">Due:</span> Mar 10</p>
              </div>
            </div>
          </IssueItem>
          <IssueItem
            title="Authentication token refresh failing intermittently"
            severity="high"
            status="in_progress"
            assignee="Lisa K."
            dueDate="Mar 12"
          >
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-2">Authentication token refresh failing intermittently</h2>
              <p className="text-sm text-[#a3a3a3] mb-4">High priority issue.</p>
              <div className="space-y-2 text-sm">
                <p><span className="text-[#737373]">Assignee:</span> Lisa K.</p>
                <p><span className="text-[#737373]">Status:</span> In Progress</p>
                <p><span className="text-[#737373]">Due:</span> Mar 12</p>
              </div>
            </div>
          </IssueItem>
          <IssueItem
            title="Frontend build size exceeds 2MB limit"
            severity="medium"
            status="resolved"
            assignee="Chris P."
            dueDate="Mar 8"
          >
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-2">Frontend build size exceeds 2MB limit</h2>
              <p className="text-sm text-[#a3a3a3] mb-4">Medium priority issue.</p>
              <div className="space-y-2 text-sm">
                <p><span className="text-[#737373]">Assignee:</span> Chris P.</p>
                <p><span className="text-[#737373]">Status:</span> Resolved</p>
                <p><span className="text-[#737373]">Due:</span> Mar 8</p>
              </div>
            </div>
          </IssueItem>
          <IssueItem
            title="Tooltip text overlaps on small screens"
            severity="low"
            status="open"
            assignee="Jamie L."
            dueDate="Mar 18"
          >
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-2">Tooltip text overlaps on small screens</h2>
              <p className="text-sm text-[#a3a3a3] mb-4">Low priority cosmetic issue on mobile viewports.</p>
              <div className="space-y-2 text-sm">
                <p><span className="text-[#737373]">Assignee:</span> Jamie L.</p>
                <p><span className="text-[#737373]">Status:</span> Open</p>
                <p><span className="text-[#737373]">Due:</span> Mar 18</p>
              </div>
            </div>
          </IssueItem>
          <IssueItem
            title="Dark mode color mismatch on settings page"
            severity="low"
            status="resolved"
            assignee="Taylor R."
            dueDate="Mar 20"
          >
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-2">Dark mode color mismatch on settings page</h2>
              <p className="text-sm text-[#a3a3a3] mb-4">Low priority styling inconsistency.</p>
              <div className="space-y-2 text-sm">
                <p><span className="text-[#737373]">Assignee:</span> Taylor R.</p>
                <p><span className="text-[#737373]">Status:</span> Resolved</p>
                <p><span className="text-[#737373]">Due:</span> Mar 20</p>
              </div>
            </div>
          </IssueItem>
        </div>
      </div>

    </MainScreenWrapper>
  );
}
