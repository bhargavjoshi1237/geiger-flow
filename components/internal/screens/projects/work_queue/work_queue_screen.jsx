"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  Archive,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
    <div className="flex w-full items-center overflow-x-auto rounded-lg border border-[#2a2a2a] bg-[#202020] p-0.5 xl:w-auto">
      {QUEUE_VIEWS.map(({ label, Icon }) => (
        <Button
          key={label}
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange(label)}
          className={cn(
            "h-7 rounded-md px-3 text-xs",
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

function MetricCard({ label, value, detail, Icon }) {
  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-[#a3a3a3]">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-[#e7e7e7]">{value}</p>
          <p className="mt-1 text-xs text-[#737373]">{detail}</p>
        </div>
        <Icon className="h-4 w-4 text-[#737373]" />
      </div>
    </div>
  );
}

function OwnerPill({ owner }) {
  const meta = OWNER_META[owner] || { name: owner, color: "bg-zinc-300 text-zinc-950" };

  return (
    <span className="inline-flex items-center gap-2">
      <Avatar size="sm">
        <AvatarFallback className={cn("text-[10px] font-bold", meta.color)}>{owner}</AvatarFallback>
      </Avatar>
      <span className="truncate text-xs font-medium text-[#ededed]">{meta.name}</span>
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

function TaskCard({ task }) {
  return (
    <article className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4 transition-colors hover:border-[#3a3a3a]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-[#ededed]">{task.title}</h3>
            <span className="rounded-md border border-[#333333] px-1.5 py-0.5 font-mono text-[10px] text-[#737373]">
              {task.id}
            </span>
          </div>
          <p className="mt-1 line-clamp-1 text-xs text-[#737373]">{task.description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#737373]">
            <span className="inline-flex items-center gap-1.5">
              <Inbox className="h-3.5 w-3.5" />
              {task.project}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MessageSquareText className="h-3.5 w-3.5" />
              {task.list}
            </span>
            <OwnerPill owner={task.owner} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:w-[520px]">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-[#525252]">Status</p>
            <Badge className={cn("mt-1 whitespace-nowrap border px-2 py-0.5", STATUS_META[task.status])}>
              {task.status}
            </Badge>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-[#525252]">Priority</p>
            <div className="mt-1">
              <PriorityBadge priority={task.priority} />
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-[#525252]">Due</p>
            <p className="mt-1 text-sm font-medium text-[#ededed]">{task.due}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-[#525252]">Progress</p>
            <div className="mt-2 space-y-1">
              <Progress
                value={task.progress}
                className="h-1.5 bg-[#2a2a2a] [&_[data-slot=progress-indicator]]:bg-[#ededed]"
              />
              <p className="text-xs text-[#737373]">{task.progress}%</p>
            </div>
          </div>
        </div>
      </div>
    </article>
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
    <MainScreenWrapper className="text-[#e7e7e7]">
      <div className="flex flex-col gap-4 border-b border-[#2a2a2a] pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#e7e7e7] md:text-3xl">Work Queue</h1>
          <p className="mt-1 text-[#a3a3a3]">
            Prioritize assigned work, personal follow-ups, files, notes and tracked time.
          </p>
        </div>
        <Button className="bg-white text-black hover:bg-[#e7e7e7]">
          <Plus className="mr-2 h-4 w-4" />
          Add Work
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Due today" value={summary.today} detail="Needs attention" Icon={CalendarDays} />
        <MetricCard label="Overdue" value={summary.overdue} detail="Across all projects" Icon={AlertTriangle} />
        <MetricCard label="Avg progress" value={`${summary.progress}%`} detail="Open queue" Icon={CheckCircle2} />
        <MetricCard label="Time logged" value="7h" detail="This week" Icon={Clock3} />
      </div>

      <div className="rounded-2xl border border-[#2a2a2a] bg-[#202020]">
        <div className="flex flex-col gap-3 border-b border-[#2a2a2a] p-4 xl:flex-row xl:items-center xl:justify-between">
          <QueueSwitch activeView={activeView} onChange={setActiveView} />

          <div className="relative w-full xl:w-[320px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#737373]" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search work queue"
              className="!h-10 border-[#2a2a2a] bg-[#1a1a1a] !pl-10 !pr-3 text-sm text-[#ededed] placeholder:text-[#737373]"
            />
          </div>
        </div>

        <div className="space-y-3 p-4">
          {activeView === "Tasks" ? (
            filteredTasks.length > 0 ? (
              filteredTasks.map((task) => <TaskCard key={task.id} task={task} />)
            ) : (
              <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed border-[#2a2a2a] text-[#737373]">
                <UserRound className="h-8 w-8 opacity-40" />
                <p className="mt-2 text-sm">No work matches your search.</p>
              </div>
            )
          ) : (
            <SecondaryList activeView={activeView} />
          )}
        </div>
      </div>
    </MainScreenWrapper>
  );
}
