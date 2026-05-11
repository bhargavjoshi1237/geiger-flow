"use client";

import React, { useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  Download,
  ArrowUpRight,
  AlertTriangle,
  Expand,
  LoaderCircle,
  Maximize2,
  Circle,
  Search,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import FilterDropdown from "@/components/internal/screens/projects/overview/filter_dropdown";
import { severityColors } from "@/components/ui/issue-item";
import { cn } from "@/lib/utils";

const REPORT_VIEWS = ["Tasks", "Projects", "Workload", "Time"];

const PROJECT_OPTIONS = [
  { value: "all", label: "All projects" },
  { value: "demo-project", label: "Demo Project" },
  { value: "product-roadmap", label: "Product Roadmap" },
  { value: "launch-playbook", label: "Launch Playbook" },
];

const METRICS = [
  { label: "Open tasks", value: "12", detail: "3 due this week", Icon: CheckCircle2 },
  { label: "Projects", value: "4", detail: "1 at risk", Icon: BarChart3 },
  { label: "Capacity", value: "74%", detail: "Team average", Icon: Users },
  { label: "Tracked", value: "28h", detail: "This week", Icon: Clock3 },
];

const REPORT_ROWS = [
  {
    id: "DEM-1",
    task: "Create a New Project",
    project: "Demo Project",
    owner: "AJ",
    status: "In Progress",
    priority: "High",
    due: "May 8",
    progress: 44,
    view: "Tasks",
  },
  {
    id: "DEM-8",
    task: "View Help Guides in Docs",
    project: "Demo Project",
    owner: "AJ",
    status: "To Do",
    priority: "Low",
    due: "May 10",
    progress: 12,
    view: "Tasks",
  },
  {
    id: "PRD-4",
    task: "Finalize roadmap checkpoints",
    project: "Product Roadmap",
    owner: "Priya",
    status: "At Risk",
    priority: "High",
    due: "May 14",
    progress: 68,
    view: "Projects",
  },
  {
    id: "LCH-2",
    task: "Draft launch checklist",
    project: "Launch Playbook",
    owner: "Sam",
    status: "Planning",
    priority: "Medium",
    due: "May 21",
    progress: 27,
    view: "Projects",
  },
  {
    id: "WRK-1",
    task: "Review team allocation",
    project: "All Projects",
    owner: "Priya",
    status: "High Load",
    priority: "Medium",
    due: "This week",
    progress: 82,
    view: "Workload",
  },
  {
    id: "TIM-1",
    task: "Weekly time summary",
    project: "Demo Project",
    owner: "AJ",
    status: "Logged",
    priority: "Low",
    due: "28h",
    progress: 100,
    view: "Time",
  },
];

const OWNER_META = {
  AJ: {
    name: "Aadit Joshi",
    avatarClass: "bg-sky-300 text-sky-950",
  },
  Priya: {
    name: "Priya Shah",
    avatarClass: "bg-violet-300 text-violet-950",
  },
  Sam: {
    name: "Sam Lee",
    avatarClass: "bg-emerald-300 text-emerald-950",
  },
};

const STATUS_META = {
  "In Progress": {
    Icon: LoaderCircle,
    className: "border-blue-500/25 bg-blue-500/10 text-blue-300",
  },
  "To Do": {
    Icon: Circle,
    className: "border-zinc-500/25 bg-zinc-500/10 text-zinc-300",
  },
  "At Risk": {
    Icon: AlertTriangle,
    className: "border-amber-500/25 bg-amber-500/10 text-amber-300",
  },
  Planning: {
    Icon: Clock3,
    className: "border-violet-500/25 bg-violet-500/10 text-violet-300",
  },
  "High Load": {
    Icon: AlertTriangle,
    className: "border-rose-500/25 bg-rose-500/10 text-rose-300",
  },
  Logged: {
    Icon: CheckCircle2,
    className: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
  },
};

const PRIORITY_STYLES = {
  High: "high",
  Medium: "medium",
  Low: "low",
};

const PRIORITY_ICONS = {
  high: <Expand className="h-3 w-3" />,
  medium: <Maximize2 className="h-3 w-3" />,
  low: <ArrowUpRight className="h-3 w-3" />,
};

function MetricCard({ metric }) {
  return (
    <div className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-[#a3a3a3]">{metric.label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-[#e7e7e7]">
            {metric.value}
          </p>
          <p className="mt-1 text-xs text-[#737373]">{metric.detail}</p>
        </div>
        <metric.Icon className="h-4 w-4 shrink-0 text-[#737373]" />
      </div>
    </div>
  );
}

function PriorityBadge({ priority }) {
  const priorityKey = PRIORITY_STYLES[priority] || "medium";

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium capitalize",
        severityColors[priorityKey] || severityColors.medium,
      )}
    >
      {PRIORITY_ICONS[priorityKey] || PRIORITY_ICONS.medium}
      {priorityKey}
    </span>
  );
}

function OwnerWidget({ owner }) {
  const meta = OWNER_META[owner] || {
    name: owner,
    avatarClass: "bg-zinc-300 text-zinc-950",
  };

  return (
    <span className="inline-flex min-w-[116px] items-center gap-2">
      <Avatar size="sm">
        <AvatarFallback className={cn("text-[10px] font-bold", meta.avatarClass)}>
          {owner.slice(0, 2)}
        </AvatarFallback>
      </Avatar>
      <span className="truncate text-xs font-medium text-[#ededed]">{meta.name}</span>
    </span>
  );
}

function StatusWidget({ status }) {
  const meta = STATUS_META[status] || STATUS_META["To Do"];
  const Icon = meta.Icon;

  return (
    <span
      className={cn(
        "inline-flex min-w-[86px] items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium",
        meta.className,
      )}
    >
      <span className="inline-flex min-w-0 items-center gap-1.5">
        <Icon className="h-3 w-3 shrink-0" />
        <span className="truncate">{status}</span>
      </span>
    </span>
  );
}

export function ReportingScreen() {
  const [activeView, setActiveView] = useState("Tasks");
  const [dateRange, setDateRange] = useState("1w");
  const [projectFilter, setProjectFilter] = useState("all");
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return REPORT_ROWS.filter((row) => {
      const matchesView = activeView === "Tasks" ? true : row.view === activeView;
      const matchesProject =
        projectFilter === "all" ||
        row.project.toLowerCase().replaceAll(" ", "-") === projectFilter;
      const matchesSearch =
        !query ||
        [row.task, row.project, row.owner, row.status, row.id].some((value) =>
          value.toLowerCase().includes(query),
        );

      return matchesView && matchesProject && matchesSearch;
    });
  }, [activeView, projectFilter, search]);

  return (
    <MainScreenWrapper className="flex h-full min-h-0 flex-col text-[#e7e7e7]">
      <div className="flex flex-col gap-4 border-b border-[#2a2a2a] pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#e7e7e7] md:text-3xl">Reporting</h1>
          <p className="mt-1 text-[#a3a3a3]">
            Track project progress, workload, deadlines and time in one place.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FilterDropdown value={dateRange} onValueChange={setDateRange} height="h-9" />
          <Button className="bg-white text-black hover:bg-[#e7e7e7]">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {METRICS.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-[#2a2a2a] bg-[#202020]">
        <div className="flex flex-col gap-3 border-b border-[#2a2a2a] p-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex w-full items-center overflow-x-auto rounded-lg border border-[#2a2a2a] bg-[#202020] p-0.5 xl:w-auto">
            {REPORT_VIEWS.map((view) => (
              <Button
                key={view}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setActiveView(view)}
                className={cn(
                  "h-7 rounded-md px-3 text-xs",
                  activeView === view
                    ? "bg-[#2a2a2a] text-white"
                    : "text-[#737373] hover:bg-transparent hover:text-[#a3a3a3]",
                )}
              >
                {view}
              </Button>
            ))}
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <FilterDropdown
              value={projectFilter}
              onValueChange={setProjectFilter}
              options={PROJECT_OPTIONS}
              placeholder="All projects"
              height="h-10"
            />
            <div className="relative w-full md:w-[280px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#737373]" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search reports"
                className="!h-10 w-full border-[#2a2a2a] bg-[#1a1a1a] !pl-10 !pr-3 text-sm text-[#ededed] placeholder:text-[#737373]"
              />
            </div>
          </div>
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <div className="min-w-[920px]">
            <Table>
              <TableHeader>
                <TableRow className="border-[#2a2a2a] bg-[#1a1a1a] hover:bg-[#1a1a1a]">
                  <TableHead>Item</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due / Hours</TableHead>
                  <TableHead className="min-w-[160px]">Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} className="border-[#2a2a2a] hover:bg-[#242424]">
                    <TableCell>
                      <div className="min-w-[220px]">
                        <p className="font-medium text-[#ededed]">{row.task}</p>
                        <p className="mt-1 font-mono text-xs text-[#737373]">{row.id}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-[#a3a3a3]">{row.project}</TableCell>
                    <TableCell>
                      <OwnerWidget owner={row.owner} />
                    </TableCell>
                    <TableCell>
                      <StatusWidget status={row.status} />
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={row.priority} />
                    </TableCell>
                    <TableCell className="text-sm text-[#a3a3a3]">{row.due}</TableCell>
                    <TableCell>
                      <div className="w-[150px] space-y-1.5">
                        <Progress
                          value={row.progress}
                          className="h-1.5 bg-[#2a2a2a] [&_[data-slot=progress-indicator]]:bg-[#ededed]"
                        />
                        <p className="text-xs text-[#737373]">{row.progress}%</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </MainScreenWrapper>
  );
}
