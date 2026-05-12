"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  Archive,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  FileText,
  Inbox,
  ListChecks,
  Maximize2,
  MessageSquareText,
  NotebookText,
  Plus,
  Search,
  Timer,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { severityColors } from "@/components/ui/issue-item";
import { cn } from "@/lib/utils";

const QUEUE_VIEWS = [
  { label: "Tasks", Icon: ListChecks },
  { label: "Created", Icon: FileText },
  { label: "Calendar", Icon: CalendarDays },
  { label: "Files", Icon: Archive },
  { label: "Notes", Icon: NotebookText },
  { label: "Time", Icon: Timer },
];

const TASKS = [
  {
    id: "DEM-1",
    title: "Create a New Project",
    project: "Demo Project",
    status: "In Progress",
    list: "Getting Started",
    owner: "AJ",
    due: "May 8",
    priority: "High",
    progress: 44,
    description: "Finish the starter project setup and confirm the onboarding checklist.",
  },
  {
    id: "DEM-17",
    title: "Test",
    project: "Demo Project",
    status: "To Do",
    list: "Exploring Nifty",
    owner: "AJ",
    due: "May 9",
    priority: "High",
    progress: 0,
    description: "Run through the basic task flow and record any rough edges.",
  },
  {
    id: "DEM-8",
    title: "View Help Guides in Docs",
    project: "Demo Project",
    status: "To Do",
    list: "Exploring Nifty",
    owner: "AJ",
    due: "May 10",
    priority: "Low",
    progress: 12,
    description: "Review help docs and capture follow-up questions for the team.",
  },
  {
    id: "LCH-4",
    title: "Launch content checklist",
    project: "Launch Playbook",
    status: "In Review",
    list: "Launch prep",
    owner: "PS",
    due: "May 14",
    priority: "Medium",
    progress: 72,
    description: "Validate copy, owners, and channel readiness before launch.",
  },
];

const SECONDARY_ROWS = {
  Created: [
    ["Project permissions review", "Feature Requests", "In Review", "May 14"],
    ["Roadmap intake template", "Product Roadmap", "To Do", "May 18"],
    ["Launch content checklist", "Launch Playbook", "In Progress", "May 21"],
  ],
  Calendar: [
    ["Today", "View Help Guides in Docs", "10:00 AM", "Demo Project"],
    ["Today", "Planning sync", "2:30 PM", "Launch Playbook"],
    ["Tomorrow", "Roadmap review", "11:00 AM", "Product Roadmap"],
  ],
  Files: [
    ["Release brief.pdf", "Launch Playbook", "Edited today", "1.2 MB"],
    ["Customer feedback.csv", "Feature Requests", "Edited yesterday", "840 KB"],
    ["Roadmap Q2.fig", "Product Roadmap", "Edited May 6", "5.8 MB"],
  ],
  Notes: [
    ["Daily blockers", "Demo Project", "Updated 20m ago", "Private"],
    ["Launch risks", "Launch Playbook", "Updated yesterday", "Team"],
    ["Feature review notes", "Feature Requests", "Updated May 7", "Team"],
  ],
  Time: [
    ["Create a New Project", "Demo Project", "02:45", "Today"],
    ["View Help Guides in Docs", "Demo Project", "01:20", "Today"],
    ["Launch checklist", "Launch Playbook", "03:10", "This week"],
  ],
};

const STATUS_META = {
  "To Do": "border-zinc-500/25 bg-zinc-500/10 text-zinc-300",
  "In Progress": "border-blue-500/25 bg-blue-500/10 text-blue-300",
  "In Review": "border-violet-500/25 bg-violet-500/10 text-violet-300",
};

const PRIORITY_META = {
  High: { key: "high", Icon: AlertTriangle },
  Medium: { key: "medium", Icon: Maximize2 },
  Low: { key: "low", Icon: ArrowUpRight },
};

const OWNER_META = {
  AJ: { name: "Aadit Joshi", color: "bg-sky-300 text-sky-950" },
  PS: { name: "Priya Shah", color: "bg-violet-300 text-violet-950" },
};

function QueueSwitch({ activeView, onChange }) {
  return (
    <div className="flex flex-wrap items-center rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-0.5">
      {QUEUE_VIEWS.map(({ label, Icon }) => (
        <Button
          key={label}
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange(label)}
          className={cn(
            "h-7 rounded-md px-2.5 text-xs",
            activeView === label
              ? "bg-[#2a2a2a] text-white"
              : "text-[#737373] hover:bg-transparent hover:text-[#a3a3a3]",
          )}
        >
          <Icon className="mr-1.5 h-3.5 w-3.5" />
          {label}
        </Button>
      ))}
    </div>
  );
}

function CompactStat({ label, value, Icon, tone = "text-[#737373]" }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2">
      <Icon className={cn("h-3.5 w-3.5", tone)} />
      <span className="text-xs text-[#737373]">{label}</span>
      <span className="text-sm font-semibold text-[#ededed]">{value}</span>
    </div>
  );
}

function OwnerPill({ owner }) {
  const meta = OWNER_META[owner] || { name: owner, color: "bg-zinc-300 text-zinc-950" };

  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span className={cn("grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold", meta.color)}>
        {owner}
      </span>
      <span className="hidden truncate text-xs font-medium text-[#ededed] 2xl:inline">{meta.name}</span>
    </span>
  );
}

function PriorityBadge({ priority }) {
  const meta = PRIORITY_META[priority] || PRIORITY_META.Medium;
  const Icon = meta.Icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium capitalize",
        severityColors[meta.key],
      )}
    >
      <Icon className="h-3 w-3" />
      {meta.key}
    </span>
  );
}

function TasksTable({ tasks }) {
  return (
    <Table className="table-fixed">
      <TableHeader>
        <TableRow className="bg-[#1a1a1a] border-[#2a2a2a]">
          <TableHead className="px-4">Work</TableHead>
          <TableHead className="w-[116px] px-3 md:px-4">Status</TableHead>
          <TableHead className="hidden px-4 md:table-cell">Priority</TableHead>
          <TableHead className="hidden px-4 md:table-cell">Owner</TableHead>
          <TableHead className="hidden px-4 md:table-cell">Due</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id} className="border-[#2a2a2a] hover:bg-[#242424]">
            <TableCell className="px-4 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-[#ededed]">{task.title}</span>
                  <span className="shrink-0 rounded border border-[#333333] px-1.5 py-0.5 font-mono text-[10px] text-[#737373]">
                    {task.id}
                  </span>
                </div>
                <div className="mt-1 flex min-w-0 items-center gap-3 text-xs text-[#737373]">
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <Inbox className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{task.project}</span>
                  </span>
                  <span className="md:hidden">{task.due}</span>
                  <span className="hidden min-w-0 items-center gap-1.5 lg:inline-flex">
                    <MessageSquareText className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{task.list}</span>
                  </span>
                </div>
              </div>
            </TableCell>
            <TableCell className="whitespace-nowrap px-3 py-3 md:px-4">
              <Badge className={cn("min-w-[78px] justify-center whitespace-nowrap border px-2 py-0.5 text-[11px] md:min-w-[86px] md:text-xs", STATUS_META[task.status])}>
                {task.status}
              </Badge>
            </TableCell>
            <TableCell className="hidden px-4 py-3 md:table-cell">
              <PriorityBadge priority={task.priority} />
            </TableCell>
            <TableCell className="hidden px-4 py-3 md:table-cell">
              <OwnerPill owner={task.owner} />
            </TableCell>
            <TableCell className="hidden whitespace-nowrap px-4 py-3 text-sm font-medium text-[#ededed] md:table-cell">
              {task.due}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function SecondaryList({ activeView }) {
  const rows = SECONDARY_ROWS[activeView] || [];

  return (
    <div className="overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#1a1a1a]">
      {rows.map((row) => (
        <div
          key={row.join("-")}
          className="grid grid-cols-1 gap-2 border-b border-[#2a2a2a] px-4 py-3 last:border-b-0 md:grid-cols-[1.4fr_1fr_0.8fr_0.8fr]"
        >
          {row.map((cell, index) => (
            <span
              key={`${cell}-${index}`}
              className={cn(index === 0 ? "text-sm font-medium text-[#ededed]" : "text-sm text-[#a3a3a3]")}
            >
              {cell}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

export function WorkQueueScreen() {
  const [activeView, setActiveView] = useState("Tasks");
  const [query, setQuery] = useState("");

  const filteredTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return TASKS;

    return TASKS.filter((task) =>
      [task.title, task.project, task.status, task.list, task.id]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query]);

  const summary = useMemo(() => {
    const overdue = TASKS.filter((task) => task.due === "May 8" || task.due === "May 9").length;
    const today = TASKS.filter((task) => task.due === "May 10").length;
    const progress = Math.round(TASKS.reduce((sum, task) => sum + task.progress, 0) / TASKS.length);

    return { overdue, today, progress };
  }, []);

  return (
    <MainScreenWrapper className="space-y-6 text-[#e7e7e7]">
      <div className="flex flex-col gap-4 border-b border-[#2a2a2a] pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#e7e7e7] md:text-3xl">Work Queue</h1>
          <p className="mt-1 text-[#a3a3a3]">A clean view of assigned work and follow-ups.</p>
        </div>
        <Button className="bg-white text-black hover:bg-[#e7e7e7]">
          <Plus className="mr-2 h-4 w-4" />
          Add
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#202020]">
        <div className="flex flex-col gap-3 border-b border-[#2a2a2a] p-3 xl:flex-row xl:items-center xl:justify-between">
          <QueueSwitch activeView={activeView} onChange={setActiveView} />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center xl:justify-end">
            <div className="flex flex-wrap gap-2">
              <CompactStat label="Today" value={summary.today} Icon={CalendarDays} />
              <CompactStat label="Overdue" value={summary.overdue} Icon={AlertTriangle} tone="text-amber-300" />
              <CompactStat label="Avg" value={`${summary.progress}%`} Icon={CheckCircle2} />
            </div>
            <div className="relative w-full sm:w-[260px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#737373]" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search"
                className="!h-9 border-[#2a2a2a] bg-[#1a1a1a] !pl-10 !pr-3 text-sm text-[#ededed] placeholder:text-[#737373]"
              />
            </div>
          </div>
        </div>

        <div>
          {activeView === "Tasks" ? (
            filteredTasks.length > 0 ? (
              <TasksTable tasks={filteredTasks} />
            ) : (
              <div className="flex h-40 flex-col items-center justify-center text-[#737373]">
                <UserRound className="h-8 w-8 opacity-40" />
                <p className="mt-2 text-sm">No work matches your search.</p>
              </div>
            )
          ) : (
            <div className="p-3">
              <SecondaryList activeView={activeView} />
            </div>
          )}
        </div>
      </div>
    </MainScreenWrapper>
  );
}
