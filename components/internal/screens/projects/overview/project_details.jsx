"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, CardContent, CardHeader } from "@geiger/ui";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bug,
  ChevronRight,
  ClipboardList,
  Expand,
  GitMerge,
  Maximize2,
  Sparkles,
} from "lucide-react";
import { useProject } from "@/context/project-context";
import { DeadlinesSection } from "@/components/internal/shared/deadlines";
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
} from "@geiger/ui";
import FilterDropdown from "./filter_dropdown";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import {
  EditorSectionHeader,
  EmptyState,
  ScreenHeader,
  StatsBar,
} from "@/components/internal/shared/screen_kit";
import { severityColors } from "@geiger/ui";
import { LogoLoading } from "@geiger/ui";
import { cn } from "@/lib/utils";
import { ExternalLinkIcon } from "@/components/internal/externals/external_links";
import { listTasks } from "@/features/tasks/actions";
// NOTE: features/tasks/constants.js exposes statusLabels/statusMeta — there is
// no TASK_STATUS_MAP export, so the donut derives label+colour from those.
import { statusLabels as taskStatusLabels } from "@/features/tasks/constants";
import { listIssues } from "@/features/issues/actions";
import {
  isDoneStatus as isIssueDoneStatus,
  priorityWeight,
  statusLabels as issueStatusLabels,
} from "@/features/issues/constants";
import { listGoals } from "@/features/goals/actions";
import { listMilestones } from "@/features/milestones/actions";
import { listActivityLogs } from "@/features/activity_logs/actions";
import { listAllocations } from "@/features/resources/actions";
import { listMembers } from "@/features/team/actions";

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

const METRIC_CARD_CHART_COLOR = "var(--chart-2)";

// Range options honoured by every widget on this screen (single filterValue).
const RANGE_OPTIONS = [
  { value: "1w", label: "Last 1 week" },
  { value: "1m", label: "Last 1 month" },
  { value: "3m", label: "Last 3 months" },
  { value: "1y", label: "Last 1 year" },
];

const RANGE_DAYS = { "1w": 7, "1m": 30, "3m": 90, "1y": 365 };

const MS_PER_DAY = 86400000;
const SPARK_BUCKETS = 12;
const TOP_ISSUES_LIMIT = 5;
const DEADLINES_LIMIT = 5;

// Fixed radar/resource metric keys (labels live beside the derivations below).
const RADAR_METRIC_OPTIONS = [
  { value: "tasks", label: "Tasks completed" },
  { value: "issues", label: "Issues closed" },
  { value: "activity", label: "Activity" },
];

const RESOURCE_METRIC_OPTIONS = [
  { value: "tasks", label: "Tasks handled" },
  { value: "workload", label: "Allocation" },
];

function toTime(value) {
  if (!value) {
    return null;
  }
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
}

function getCount(value) {
  return Number.isFinite(value) ? value : 0;
}

function formatShortDate(value) {
  const time = toTime(value);
  if (time == null) {
    return "—";
  }
  return new Date(time).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Split [start, end] into `count` buckets and tally every timestamp into one.
function bucketize(times, start, end, count) {
  const buckets = Array.from({ length: count }, () => 0);
  const span = Math.max(end - start, 1);
  for (const time of times) {
    if (time == null || time < start || time > end) {
      continue;
    }
    const index = Math.min(
      count - 1,
      Math.floor(((time - start) / span) * count),
    );
    buckets[index] += 1;
  }
  return buckets;
}

function rangeBucketLabels(start, end, count) {
  const span = Math.max(end - start, 1);
  return Array.from({ length: count }, (_, index) => {
    const at = start + (span * (index + 0.5)) / count;
    return new Date(at).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  });
}

// Percent change of the second half of the buckets vs the first half.
function trendPct(buckets) {
  const mid = Math.floor(buckets.length / 2);
  const previous = buckets
    .slice(0, mid)
    .reduce((sum, value) => sum + value, 0);
  const next = buckets.slice(mid).reduce((sum, value) => sum + value, 0);
  if (!previous) {
    return next ? 100 : 0;
  }
  return Math.round(((next - previous) / previous) * 100);
}

function isTaskDone(task) {
  return task?.status === "done";
}

function MetricCard({ title, subtitle, value, data, rangeLabels }) {
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
          <span>{rangeLabels?.[0] ?? "No start timestamp"}</span>
          <span>
            {rangeLabels?.length
              ? rangeLabels[rangeLabels.length - 1]
              : "No end timestamp"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

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

function WidgetShell({ children, className, contentClassName }) {
  return (
    <Card className={cn("bg-surface-subtle border-border text-foreground rounded-xl py-0 gap-0 overflow-hidden", className)}>
      <CardContent className={cn("p-4", contentClassName)}>{children}</CardContent>
    </Card>
  );
}

function formatTrend(trend) {
  const value = getCount(trend);
  return `Trending ${value < 0 ? "down" : "up"} by ${Math.abs(value)}%`;
}

function TaskStatusShowcaseWidget({ items }) {
  const [selectedStatus, setSelectedStatus] = useState(null);
  const liveItems = Array.isArray(items) ? items : [];
  const activeKey = liveItems.some((item) => item.key === selectedStatus)
    ? selectedStatus
    : (liveItems[0]?.key ?? null);

  if (liveItems.length === 0) {
    return (
      <WidgetShell className="h-[420px]" contentClassName="h-full">
        <div className="flex h-full flex-col">
          <h3 className="text-base font-semibold text-foreground">Task Breakout by Status</h3>
          <p className="text-sm text-muted-foreground">Current task distribution across active statuses.</p>
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <EmptyState
              icon={ClipboardList}
              title="No tasks yet"
              description="Tasks will appear here grouped by status."
            />
          </div>
        </div>
      </WidgetShell>
    );
  }

  const total = liveItems.reduce((sum, item) => sum + getCount(item.value), 0);
  const chartData = liveItems.map((item) => ({
    ...item,
    value: getCount(item.value),
    fill: `var(--color-${item.key})`,
  }));
  const selectedIndex = Math.max(
    chartData.findIndex((item) => item.key === activeKey),
    0,
  );
  const selectedItem = chartData[selectedIndex] || chartData[0];
  const statusOptions = liveItems.map((item) => ({
    value: item.key,
    label: item.label,
  }));
  const chartConfig = liveItems.reduce(
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
            value={activeKey}
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
                  setSelectedStatus(chartData[index]?.key || activeKey);
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
            {selectedItem?.label || "Tasks"} accounts for {total ? Math.round(((selectedItem?.value || 0) / total) * 100) : 0}% of tasks
          </p>
          <p className="mt-1 text-sm text-text-secondary">Current project status mix</p>
        </div>
      </div>
    </WidgetShell>
  );
}

function YearlyRadarWidget({ metrics, caption }) {
  const [metric, setMetric] = useState(null);
  const keys = RADAR_METRIC_OPTIONS.map((option) => option.value);
  const activeKey = keys.includes(metric) ? metric : keys[0];
  const selected = (metrics && metrics[activeKey]) || {
    label: "Activity",
    description: "Delivery volume across the selected range.",
    trend: 0,
    data: [],
  };
  const radarData = (Array.isArray(selected.data) ? selected.data : []).map(
    (item, index) => ({
      ...item,
      label: item.label || `D${index + 1}`,
      value: getCount(item.value),
    }),
  );

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
              value={activeKey}
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
            {formatTrend(selected.trend)} in this range
          </p>
          <p className="mt-1 text-sm text-text-secondary">{caption}</p>
        </div>
      </div>
    </WidgetShell>
  );
}

function ResourcePerformanceWidget({ metrics, caption }) {
  const [metric, setMetric] = useState(null);
  const keys = RESOURCE_METRIC_OPTIONS.map((option) => option.value);
  const activeKey = keys.includes(metric) ? metric : keys[0];
  const selected = (metrics && metrics[activeKey]) || {
    label: "Resources",
    trend: 0,
    people: [],
  };
  const people = Array.isArray(selected.people) ? selected.people : [];
  const values = people.map((person) => getCount(person.value));
  const max = Math.max(0, ...values);
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
                Team workload across the selected range.
              </p>
            </div>
            <FilterDropdown
              value={activeKey}
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
              ? `${formatTrend(selected.trend)} in this range`
              : "No resource performance data yet"}
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            {people.length > 0
              ? `Across active resources · ${caption}`
              : "Assign tasks or allocate resources to see per-assignee load."}
          </p>
        </div>
      </div>
    </WidgetShell>
  );
}

export function ProjectDetailsScreen({ externalLinks = [], onViewIssues }) {
  const { project } = useProject();
  const { id: projectId } = project ?? {};
  const [filterValue, setFilterValue] = useState("1w");
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [goals, setGoals] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [members, setMembers] = useState([]);
  // Anchored when rows land (and when the range changes) so the range window
  // never calls Date.now() during render.
  const [rangeEnd, setRangeEnd] = useState(null);

  const dashboardLinks = useMemo(
    () => externalLinks.filter((link) => link.showOnDashboard),
    [externalLinks],
  );

  useEffect(() => {
    if (!projectId) {
      return undefined;
    }
    let cancelled = false;
    void Promise.resolve().then(async () => {
      setLoading(true);
      const [
        taskRows,
        issueRows,
        goalRows,
        milestoneRows,
        logRows,
        allocationRows,
        memberRows,
      ] = await Promise.all([
        listTasks(projectId),
        listIssues(projectId),
        listGoals(projectId),
        listMilestones(projectId),
        listActivityLogs(projectId),
        listAllocations(projectId),
        listMembers(projectId),
      ]);
      if (cancelled) {
        return;
      }
      setTasks(taskRows ?? []);
      setIssues(issueRows ?? []);
      setGoals(goalRows ?? []);
      setMilestones(milestoneRows ?? []);
      setActivityLogs(logRows ?? []);
      setAllocations(allocationRows ?? []);
      setMembers(memberRows ?? []);
      setRangeEnd(Date.now());
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  // Single range input every widget derives from: the cutoff the FilterDropdown
  // selects. Changing filterValue recomputes all memos below.
  const range = useMemo(() => {
    const days = RANGE_DAYS[filterValue] ?? RANGE_DAYS["1w"];
    const end = rangeEnd ?? 0;
    return { start: end - days * MS_PER_DAY, end };
  }, [filterValue, rangeEnd]);

  const handleRangeChange = (value) => {
    setFilterValue(value);
    setRangeEnd(Date.now());
  };

  const rangeCaption =
    RANGE_OPTIONS.find((option) => option.value === filterValue)?.label ??
    "Selected range";

  const bucketLabels = useMemo(
    () => rangeBucketLabels(range.start, range.end, SPARK_BUCKETS),
    [range],
  );

  // Completion/activity timestamps; bucketize() scopes them to the range, so
  // the bucket sums double as the in-range counts.
  const tasksCompletedTimes = useMemo(
    () =>
      tasks
        .filter(isTaskDone)
        .map((task) => toTime(task.updatedAt ?? task.createdAt))
        .filter((time) => time != null),
    [tasks],
  );
  const issuesClosedTimes = useMemo(
    () =>
      issues
        .filter((issue) => isIssueDoneStatus(issue.status))
        .map((issue) => toTime(issue.updatedAt ?? issue.createdAt))
        .filter((time) => time != null),
    [issues],
  );
  const goalsCompletedTimes = useMemo(
    () =>
      goals
        .filter((goal) => goal?.status === "completed")
        .map((goal) => toTime(goal.updatedAt ?? goal.createdAt))
        .filter((time) => time != null),
    [goals],
  );
  const activityTimes = useMemo(
    () =>
      activityLogs
        .map((log) => toTime(log.occurredAt ?? log.createdAt))
        .filter((time) => time != null),
    [activityLogs],
  );

  // Donut: group tasks by live status keys (label via task statusLabels).
  const statusShowcase = useMemo(() => {
    const counts = new Map();
    for (const task of tasks) {
      const key = task?.status || "todo";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()].map(([key, value], index) => ({
      key,
      value,
      label: taskStatusLabels[key] ?? key,
      color: CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length],
    }));
  }, [tasks]);

  // Radar: per-bucket series over the selected range.
  const radarMetrics = useMemo(() => {
    const defs = [
      {
        key: "tasks",
        label: "Tasks completed",
        description: "Completed tasks per period in the selected range.",
        times: tasksCompletedTimes,
      },
      {
        key: "issues",
        label: "Issues closed",
        description: "Closed issues per period in the selected range.",
        times: issuesClosedTimes,
      },
      {
        key: "activity",
        label: "Activity",
        description: "Logged activity per period in the selected range.",
        times: activityTimes,
      },
    ];
    return Object.fromEntries(
      defs.map((def) => {
        const buckets = bucketize(def.times, range.start, range.end, SPARK_BUCKETS);
        return [
          def.key,
          {
            label: def.label,
            description: def.description,
            trend: trendPct(buckets),
            data: buckets.map((value, index) => ({
              label: bucketLabels[index],
              value,
            })),
          },
        ];
      }),
    );
  }, [tasksCompletedTimes, issuesClosedTimes, activityTimes, range, bucketLabels]);

  // Resource rings: per-assignee task counts (names resolved via the member
  // directory, falling back to a short id) + allocation load from allocations.
  const resourceMetrics = useMemo(() => {
    const nameById = new Map();
    for (const member of members) {
      const id = member?.id ?? member?.userId ?? null;
      const name =
        member?.name ?? member?.displayName ?? member?.email ?? null;
      if (id && name) {
        nameById.set(id, name);
      }
    }
    const touched = tasks.filter((task) => {
      const at = Math.max(
        toTime(task.createdAt) ?? 0,
        toTime(task.updatedAt) ?? 0,
      );
      return at >= range.start;
    });
    const taskCounts = new Map();
    let unassigned = 0;
    for (const task of touched) {
      const ids = Array.isArray(task.assignees)
        ? task.assignees.filter(Boolean)
        : [];
      if (ids.length === 0) {
        unassigned += 1;
      }
      for (const id of ids) {
        taskCounts.set(id, (taskCounts.get(id) ?? 0) + 1);
      }
    }
    const taskPeople = [...taskCounts.entries()].map(([id, value]) => ({
      name: nameById.get(id) ?? `Member ${String(id).slice(0, 8)}`,
      value,
    }));
    if (unassigned > 0) {
      taskPeople.push({ name: "Unassigned", value: unassigned });
    }
    const loadByMember = new Map();
    for (const row of allocations) {
      const name = row?.member?.trim();
      if (!name) {
        continue;
      }
      loadByMember.set(
        name,
        Math.max(loadByMember.get(name) ?? 0, Number(row.allocation) || 0),
      );
    }
    const loadPeople = [...loadByMember.entries()].map(([name, value]) => ({
      name,
      value,
    }));
    const touchedTimes = touched
      .map((task) => toTime(task.updatedAt ?? task.createdAt))
      .filter((time) => time != null);
    const taskTrend = trendPct(
      bucketize(touchedTimes, range.start, range.end, SPARK_BUCKETS),
    );
    const allocationTimes = allocations
      .map((row) => toTime(row.createdAt))
      .filter((time) => time != null);
    const loadTrend = trendPct(
      bucketize(allocationTimes, range.start, range.end, SPARK_BUCKETS),
    );
    return {
      tasks: { label: "Tasks handled", trend: taskTrend, people: taskPeople },
      workload: { label: "Allocation", trend: loadTrend, people: loadPeople },
    };
  }, [tasks, allocations, members, range]);

  // Metric tiles: real in-range counts + a sparkline series per range.
  // ("PR Merged" proxies completed tasks — there is no PR source in the data
  // layer; milestones surface via Deadlines + the headline stats.)
  const metricCards = useMemo(() => {
    const taskBuckets = bucketize(
      tasksCompletedTimes,
      range.start,
      range.end,
      SPARK_BUCKETS,
    );
    const issueBuckets = bucketize(
      issuesClosedTimes,
      range.start,
      range.end,
      SPARK_BUCKETS,
    );
    const goalBuckets = bucketize(
      goalsCompletedTimes,
      range.start,
      range.end,
      SPARK_BUCKETS,
    );
    const activityBuckets = bucketize(
      activityTimes,
      range.start,
      range.end,
      SPARK_BUCKETS,
    );
    const sum = (buckets) => buckets.reduce((total, value) => total + value, 0);
    return [
      {
        title: "Productivity",
        subtitle: "Development activity",
        value: String(sum(activityBuckets)),
        data: activityBuckets,
      },
      {
        title: "New Features",
        subtitle: "Feature velocity",
        value: String(sum(goalBuckets)),
        data: goalBuckets,
      },
      {
        title: "Issues Solved",
        subtitle: "Bug resolutions",
        value: String(sum(issueBuckets)),
        data: issueBuckets,
      },
      {
        title: "PR Merged",
        subtitle: "Code contributions",
        value: String(sum(taskBuckets)),
        data: taskBuckets,
      },
    ];
  }, [
    tasksCompletedTimes,
    issuesClosedTimes,
    goalsCompletedTimes,
    activityTimes,
    range,
  ]);

  const headlineStats = useMemo(
    () => [
      { label: "Members", value: String(members.length), footer: "On this project" },
      { label: "Goals", value: String(goals.length), footer: "Currently defined" },
      { label: "Milestones", value: String(milestones.length), footer: "Tracked" },
      { label: "Pinned links", value: String(dashboardLinks.length), footer: "On this dashboard" },
    ],
    [members, goals, milestones, dashboardLinks],
  );

  // Top open issues by priority (then earliest due date).
  const topIssues = useMemo(() => {
    const open = issues.filter((issue) => !isIssueDoneStatus(issue.status));
    open.sort((a, b) => {
      const weight = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      if (weight !== 0) {
        return weight;
      }
      const aDue = toTime(a.dueDate) ?? Number.POSITIVE_INFINITY;
      const bDue = toTime(b.dueDate) ?? Number.POSITIVE_INFINITY;
      return aDue - bDue;
    });
    return open.slice(0, TOP_ISSUES_LIMIT);
  }, [issues]);

  // Deadlines come from milestone target dates (no second fetch in deadlines).
  const deadlines = useMemo(
    () =>
      milestones
        .filter((milestone) => toTime(milestone.targetDate) != null)
        .sort(
          (a, b) => toTime(a.targetDate) - toTime(b.targetDate),
        )
        .slice(0, DEADLINES_LIMIT)
        .map((milestone) => ({
          id: milestone.id,
          title: milestone.title,
          date: milestone.targetDate,
          owner: milestone.owner,
        })),
    [milestones],
  );

  return (
    <MainScreenWrapper>
      <ScreenHeader
        title={project?.name || "Project"}
        description={
          project?.description ||
          "Activity, delivery metrics, and pinned resources for this project."
        }
        actions={
          <FilterDropdown
            value={filterValue}
            onValueChange={handleRangeChange}
            options={RANGE_OPTIONS}
          />
        }
      />

      <StatsBar stats={headlineStats} />

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-subtle px-6 py-16 text-sm text-text-secondary">
          <LogoLoading size={48} />
          Loading overview…
        </div>
      ) : (
        <>
          {dashboardLinks.length > 0 ? (
            <section className="space-y-4">
              <EditorSectionHeader
                title="External links"
                description="Resources pinned to this project's dashboard."
              />
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
            {metricCards.map((card) => (
              <MetricCard
                key={card.title}
                title={card.title}
                subtitle={card.subtitle}
                value={card.value}
                data={card.data}
                rangeLabels={bucketLabels}
              />
            ))}
          </div>

          <DeadlinesSection deadlines={deadlines} />

          <div className="flex flex-col gap-4 xl:flex-row">
            <div className="min-w-0 flex-1">
              <ResourcePerformanceWidget metrics={resourceMetrics} caption={rangeCaption} />
            </div>
            <div className="min-w-0 flex-1">
              <YearlyRadarWidget metrics={radarMetrics} caption={rangeCaption} />
            </div>
            <div className="min-w-0 flex-1">
              <TaskStatusShowcaseWidget items={statusShowcase} />
            </div>
          </div>

          <div className="space-y-4">
            <EditorSectionHeader
              title="Top Issues"
              description="Issues that need attention first."
              action={
                <Button variant="ghost" size="sm" onClick={onViewIssues}>
                  View Issues <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              }
            />
            {topIssues.length === 0 ? (
              <div className="rounded-xl border border-border bg-surface-subtle">
                <EmptyState
                  icon={Bug}
                  title="No issues yet"
                  description="Issues raised on this project will surface here, highest priority first."
                />
              </div>
            ) : (
              <ul className="divide-y divide-border rounded-xl border border-border bg-surface-subtle">
                {topIssues.map((issue) => (
                  <li
                    key={issue.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <TaskPriorityBadge priority={issue.priority} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {issue.title}
                      </p>
                      <p className="mt-0.5 text-xs text-text-secondary">
                        {issueStatusLabels[issue.status] ?? issue.status}
                        {issue.dueDate
                          ? ` · Due ${formatShortDate(issue.dueDate)}`
                          : ""}
                      </p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-text-tertiary" />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

    </MainScreenWrapper>
  );
}
