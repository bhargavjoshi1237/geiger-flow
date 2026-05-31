"use client";

import React, { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  ArrowUpRight,
  AlertTriangle,
  Expand,
  LoaderCircle,
  Maximize2,
  Circle,
  Search,
  FileText,
} from "lucide-react";
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
import { SegmentedTabs } from "@/components/internal/shared/segmented_tabs";
import FilterDropdown from "@/components/internal/screens/projects/overview/filter_dropdown";
import { severityColors } from "@/components/ui/issue-item";
import { cn } from "@/lib/utils";

const REPORT_VIEWS = ["Tasks", "Projects", "Workload", "Time"];

const PROJECT_OPTIONS = [{ value: "all", label: "All projects" }];

const REPORT_ROWS = [];

const OWNER_META = {};

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

function ReportPulse() {
  return (
    <div className="flex h-9 items-center gap-2 rounded-md border border-[#2a2a2a] bg-[#202020] px-3 text-xs text-[#a3a3a3]">
      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
      <span>
        <span className="font-semibold text-[#ededed]">12</span> open
      </span>
      <span className="h-3.5 w-px bg-[#333]" />
      <span>
        <span className="font-semibold text-[#ededed]">3</span> due
      </span>
      <span className="h-3.5 w-px bg-[#333]" />
      <span>
        <span className="font-semibold text-[#ededed]">74%</span> cap
      </span>
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
    <MainScreenWrapper className="flex h-full min-h-0 min-w-0 flex-col gap-10 space-y-0 text-[#e7e7e7]">
      <div className="flex flex-col gap-4 border-b border-[#2a2a2a] pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#e7e7e7] md:text-3xl">Reporting</h1>
          <p className="mt-1 text-[#a3a3a3]">
            Track project progress, workload, deadlines and time in one place.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ReportPulse />
          <FilterDropdown value={dateRange} onValueChange={setDateRange} height="h-9" />
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#202020]">
        <div className="flex flex-col gap-3 border-b border-[#2a2a2a] p-4 xl:flex-row xl:items-center xl:justify-between">
          <SegmentedTabs
            tabs={REPORT_VIEWS}
            value={activeView}
            onChange={setActiveView}
            className="xl:w-auto"
            buttonClassName="h-8 text-xs"
          />

          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <FilterDropdown
              value={projectFilter}
              onValueChange={setProjectFilter}
              options={PROJECT_OPTIONS}
              placeholder="All projects"
              height="h-9"
            />
            <div className="relative w-full md:w-[280px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 z-10 w-4 -translate-y-1/2 text-[#737373]" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search reports"
                className="!h-9 w-full border-[#2a2a2a] bg-[#1a1a1a] !pl-10 !pr-3 text-sm text-[#ededed] placeholder:text-[#737373]"
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
                {rows.length === 0 ? (
                  <TableRow className="border-[#2a2a2a] hover:bg-transparent">
                    <TableCell colSpan={7} className="h-[320px]">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] text-[#525252]">
                          <FileText className="h-5 w-5" />
                        </div>
                        <p className="mt-4 text-sm font-semibold text-[#ededed]">
                          No report items yet
                        </p>
                        <p className="mt-1 max-w-sm text-xs leading-5 text-[#737373]">
                          Tasks, project progress, workload, and time entries will appear here after backend reporting data is connected.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </MainScreenWrapper>
  );
}
