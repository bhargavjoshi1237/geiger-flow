"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
  Flag,
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  LayoutGrid,
  List,
  AlertTriangle,
  ListTodo,
  Clock3,
  SquareStack,
} from "lucide-react";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { SearchBar } from "@/components/ui/search-bar";
import { cn } from "@/lib/utils";

const MOCK_MILESTONES = [
  {
    id: "ms_001",
    title: "Foundation Sprint",
    description: "Stabilize base architecture, token setup, and initial project scaffolding.",
    targetDate: "2026-04-22",
    owner: "Alex",
    tasks: [
      { id: "t_001", title: "Finalize app shell and route guards", status: "done", assignee: "Alex" },
      { id: "t_002", title: "Define design tokens in globals", status: "done", assignee: "Sam" },
      { id: "t_003", title: "Wire project context hydration", status: "in_progress", assignee: "Jordan" },
      { id: "t_004", title: "Set baseline analytics events", status: "todo", assignee: "Riley" },
    ],
  },
  {
    id: "ms_002",
    title: "Task Intelligence",
    description: "Deliver blocker visibility, dependency graphing, and status health indicators.",
    targetDate: "2026-04-28",
    owner: "Sam",
    tasks: [
      { id: "t_005", title: "Render dependency chain map", status: "in_progress", assignee: "Sam" },
      { id: "t_006", title: "Detect blocked-by cycles", status: "blocked", assignee: "Alex" },
      { id: "t_007", title: "Ship blocker inbox summaries", status: "todo", assignee: "Riley" },
      { id: "t_008", title: "Backfill historical blocker data", status: "todo", assignee: "Taylor" },
    ],
  },
  {
    id: "ms_003",
    title: "Milestone Reporting",
    description: "Provide delivery snapshots with completion ratios and milestone health metrics.",
    targetDate: "2026-05-10",
    owner: "Jordan",
    tasks: [
      { id: "t_009", title: "Create KPI metric cards", status: "done", assignee: "Jordan" },
      { id: "t_010", title: "Build export endpoint for PM reports", status: "in_progress", assignee: "Alex" },
      { id: "t_011", title: "Add due-date drift detection", status: "todo", assignee: "Sam" },
      { id: "t_012", title: "Finalize report filters", status: "todo", assignee: "Riley" },
    ],
  }
];

const MILESTONE_STATUS_META = {
  not_started: {
    label: "Not Started",
    className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    progressClass: "[&_[data-slot=progress-indicator]]:bg-[#e7e7e7]",
  },
  on_track: {
    label: "On Track",
    className: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    progressClass: "[&_[data-slot=progress-indicator]]:bg-[#e7e7e7]",
  },
  at_risk: {
    label: "At Risk",
    className: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    progressClass: "[&_[data-slot=progress-indicator]]:bg-[#e7e7e7]",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    progressClass: "[&_[data-slot=progress-indicator]]:bg-[#e7e7e7]",
  },
};

const TASK_STATUS_META = {
  todo: {
    label: "To Do",
    className: "bg-zinc-500/10 text-zinc-300 border-zinc-500/20",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  },
  blocked: {
    label: "Blocked",
    className: "bg-red-500/10 text-red-300 border-red-500/20",
  },
  done: {
    label: "Done",
    className: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  },
};

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "not_started", label: "Not Started" },
  { id: "on_track", label: "On Track" },
  { id: "at_risk", label: "At Risk" },
  { id: "completed", label: "Completed" },
];

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(value) {
  if (!value) return "-";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "-" : dateFormatter.format(parsed);
}

function getMilestoneMetrics(milestone) {
  const totalTasks = milestone.tasks.length;
  const doneTasks = milestone.tasks.filter((task) => task.status === "done").length;
  const blockedTasks = milestone.tasks.filter((task) => task.status === "blocked").length;
  const inProgressTasks = milestone.tasks.filter((task) => task.status === "in_progress").length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  let status = "not_started";
  if (doneTasks === totalTasks && totalTasks > 0) {
    status = "completed";
  } else if (blockedTasks > 0) {
    status = "at_risk";
  } else if (inProgressTasks > 0 || doneTasks > 0) {
    status = "on_track";
  }

  const dueDate = new Date(milestone.targetDate);
  const overdue =
    !Number.isNaN(dueDate.getTime()) &&
    dueDate.getTime() < Date.now() &&
    status !== "completed";

  return {
    totalTasks,
    doneTasks,
    blockedTasks,
    inProgressTasks,
    progress,
    status,
    overdue,
  };
}

function MilestoneCard({ milestone, onToggleTask }) {
  const statusMeta = MILESTONE_STATUS_META[milestone.metrics.status];

  return (
    <Card className="bg-[#1a1a1a] border-[#2a2a2a] text-[#e7e7e7] hover:border-[#3a3a3a] transition-colors duration-200 rounded-xl py-0 gap-0 flex flex-col">
      <CardContent className="p-5 space-y-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <h3 className="text-sm font-semibold text-[#e7e7e7] leading-snug">
                {milestone.title}
              </h3>
              <Badge className={cn("ml-auto border text-[10px] px-2 py-0", statusMeta.className)}>
                {statusMeta.label}
              </Badge>
              {milestone.metrics.overdue ? (
                <Badge className="border text-[10px] px-2 py-0 bg-red-500/10 text-red-300 border-red-500/20">
                  Overdue
                </Badge>
              ) : null}
            </div>
            <p className="text-xs text-[#737373] line-clamp-2">{milestone.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#737373] flex-wrap">
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(milestone.targetDate)}
          </span>
          <span className="inline-flex items-center gap-1">
            <SquareStack className="w-3 h-3" />
            {milestone.metrics.totalTasks} tasks
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock3 className="w-3 h-3" />
            {milestone.owner}
          </span>
          <span className="ml-auto text-[#525252] tabular-nums">
            {milestone.metrics.doneTasks}/{milestone.metrics.totalTasks} complete
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-[#525252] font-medium">
              Completion
            </span>
            <span className="text-xs text-[#a3a3a3] tabular-nums">{milestone.metrics.progress}%</span>
          </div>
          <Progress
            value={milestone.metrics.progress}
            className={cn("h-1.5 bg-[#2a2a2a] rounded-full", statusMeta.progressClass)}
          />
        </div>

        <div className="border-t border-[#222] pt-2 space-y-1">
          {milestone.tasks.map((task) => {
            const taskMeta = TASK_STATUS_META[task.status] || TASK_STATUS_META.todo;
            const isDone = task.status === "done";

            return (
              <button
                key={task.id}
                type="button"
                onClick={() => onToggleTask(milestone.id, task.id)}
                className="w-full rounded-lg px-2 py-2 flex items-center gap-2.5 text-left hover:bg-[#202020] transition-colors"
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : task.status === "blocked" ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-red-300 shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-[#3a3a3a] shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-xs truncate",
                      isDone ? "text-[#a3a3a3] line-through" : "text-[#d4d4d4]"
                    )}
                  >
                    {task.title}
                  </p>
                  <p className="text-[11px] text-[#525252]">{task.assignee}</p>
                </div>
                <Badge className={cn("border text-[10px] px-2 py-0 shrink-0", taskMeta.className)}>
                  {taskMeta.label}
                </Badge>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function MilestoneListItem({ milestone, onToggleTask }) {
  const statusMeta = MILESTONE_STATUS_META[milestone.metrics.status];

  return (
    <div className="rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] px-4 py-4 hover:border-[#3a3a3a] transition-colors">
      <div className="flex flex-col xl:flex-row xl:items-center gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-sm font-semibold text-[#e7e7e7] truncate">{milestone.title}</h3>
            <Badge className={cn("border text-[10px] px-2 py-0", statusMeta.className)}>
              {statusMeta.label}
            </Badge>
            {milestone.metrics.overdue ? (
              <Badge className="border text-[10px] px-2 py-0 bg-red-500/10 text-red-300 border-red-500/20">
                Overdue
              </Badge>
            ) : null}
          </div>
          <p className="text-xs text-[#737373] line-clamp-1">{milestone.description}</p>
          <div className="mt-2 flex items-center gap-3 text-xs text-[#737373] flex-wrap">
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(milestone.targetDate)}
            </span>
            <span className="inline-flex items-center gap-1">
              <ListTodo className="w-3 h-3" />
              {milestone.metrics.totalTasks} tasks
            </span>
            <span className="text-[#525252]">Owner: {milestone.owner}</span>
          </div>
        </div>

        <div className="w-full xl:w-[260px] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-[#525252] font-medium">
              Completion
            </span>
            <span className="text-xs text-[#a3a3a3] tabular-nums">
              {milestone.metrics.doneTasks}/{milestone.metrics.totalTasks}
            </span>
          </div>
          <Progress
            value={milestone.metrics.progress}
            className={cn("h-1.5 bg-[#2a2a2a] rounded-full", statusMeta.progressClass)}
          />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-1.5">
        {milestone.tasks.map((task) => {
          const isDone = task.status === "done";
          return (
            <button
              key={task.id}
              type="button"
              onClick={() => onToggleTask(milestone.id, task.id)}
              className="rounded-lg px-2.5 py-2 bg-[#202020] border border-[#2a2a2a] hover:border-[#3a3a3a] text-left flex items-center gap-2 transition-colors"
            >
              {isDone ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-[#3a3a3a] shrink-0" />
              )}
              <span className={cn("text-xs truncate", isDone ? "text-[#a3a3a3] line-through" : "text-[#d4d4d4]")}>{task.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function MilestonesScreen() {
  const [view, setView] = useState("grid");
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [milestones, setMilestones] = useState(MOCK_MILESTONES);

  const milestonesWithMetrics = useMemo(
    () =>
      milestones
        .map((milestone) => ({
          ...milestone,
          metrics: getMilestoneMetrics(milestone),
        }))
        .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()),
    [milestones]
  );

  const filteredMilestones = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return milestonesWithMetrics.filter((milestone) => {
      const matchesFilter =
        activeFilter === "all" || milestone.metrics.status === activeFilter;

      if (!matchesFilter) return false;

      if (!normalizedQuery) return true;

      const searchableText = [
        milestone.title,
        milestone.description,
        milestone.owner,
        ...milestone.tasks.map((task) => task.title),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [milestonesWithMetrics, query, activeFilter]);

  const summary = useMemo(() => {
    const totalMilestones = milestonesWithMetrics.length;
    const completedMilestones = milestonesWithMetrics.filter(
      (milestone) => milestone.metrics.status === "completed"
    ).length;
    const overdueMilestones = milestonesWithMetrics.filter(
      (milestone) => milestone.metrics.overdue
    ).length;
    const totalTasks = milestonesWithMetrics.reduce(
      (sum, milestone) => sum + milestone.metrics.totalTasks,
      0
    );
    const doneTasks = milestonesWithMetrics.reduce(
      (sum, milestone) => sum + milestone.metrics.doneTasks,
      0
    );

    return {
      totalMilestones,
      completedMilestones,
      overdueMilestones,
      totalTasks,
      doneTasks,
      taskProgress: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
    };
  }, [milestonesWithMetrics]);

  const handleToggleTask = (milestoneId, taskId) => {
    setMilestones((currentMilestones) =>
      currentMilestones.map((milestone) => {
        if (milestone.id !== milestoneId) return milestone;

        return {
          ...milestone,
          tasks: milestone.tasks.map((task) => {
            if (task.id !== taskId) return task;
            return {
              ...task,
              status: task.status === "done" ? "todo" : "done",
            };
          }),
        };
      })
    );
  };

  return (
    <MainScreenWrapper>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-[#2a2a2a] pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#e7e7e7]">Milestones</h1>
          <p className="text-[#a3a3a3] mt-1">
            Organize milestones as task collections and monitor delivery health.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-0.5">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "w-8 h-7 rounded-md",
                view === "grid"
                  ? "bg-[#2a2a2a] text-white"
                  : "text-[#525252] hover:text-[#a3a3a3] hover:bg-transparent"
              )}
              onClick={() => setView("grid")}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "w-8 h-7 rounded-md",
                view === "list"
                  ? "bg-[#2a2a2a] text-white"
                  : "text-[#525252] hover:text-[#a3a3a3] hover:bg-transparent"
              )}
              onClick={() => setView("list")}
            >
              <List className="w-3.5 h-3.5" />
            </Button>
          </div>
          <Button className="bg-white text-black hover:bg-[#e7e7e7]">
            <Plus className="w-4 h-4 mr-2" />
            New Milestone
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4">
          <p className="text-[11px] uppercase tracking-wide text-[#525252]">Milestones</p>
          <p className="text-xl font-semibold text-[#e7e7e7] mt-1 tabular-nums">{summary.totalMilestones}</p>
          <p className="text-xs text-[#737373] mt-1">{summary.completedMilestones} completed</p>
        </div>
        <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4">
          <p className="text-[11px] uppercase tracking-wide text-[#525252]">Task Completion</p>
          <p className="text-xl font-semibold text-[#e7e7e7] mt-1 tabular-nums">{summary.taskProgress}%</p>
          <p className="text-xs text-[#737373] mt-1">{summary.doneTasks}/{summary.totalTasks} tasks done</p>
        </div>
        <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4">
          <p className="text-[11px] uppercase tracking-wide text-[#525252]">Overdue</p>
          <p className="text-xl font-semibold text-[#e7e7e7] mt-1 tabular-nums">{summary.overdueMilestones}</p>
          <p className="text-xs text-[#737373] mt-1">Milestones past due date</p>
        </div>
        <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4">
          <p className="text-[11px] uppercase tracking-wide text-[#525252]">In Scope</p>
          <p className="text-xl font-semibold text-[#e7e7e7] mt-1 tabular-nums">{summary.totalTasks}</p>
          <p className="text-xs text-[#737373] mt-1">Tasks assigned to milestones</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchBar
          className="w-full lg:max-w-xl"
          placeholder="Search milestones, owners, or task names"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onClear={() => setQuery("")}
        />
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {STATUS_FILTERS.map((filter) => (
            <Button
              key={filter.id}
              type="button"
              variant="ghost"
              className={cn(
                "h-8 px-3 text-xs rounded-lg border",
                activeFilter === filter.id
                  ? "bg-[#2a2a2a] text-white border-[#3a3a3a]"
                  : "bg-[#1a1a1a] text-[#737373] border-[#2a2a2a] hover:bg-[#202020] hover:text-[#e7e7e7]"
              )}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {filteredMilestones.length === 0 ? (
        <div className="h-[260px] flex flex-col items-center justify-center rounded-xl border border-dashed border-[#2a2a2a] bg-[#1a1a1a] text-[#737373]">
          <Flag className="w-10 h-10 opacity-30" />
          <p className="mt-3 text-sm">No milestones match your current filters.</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredMilestones.map((milestone) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              onToggleTask={handleToggleTask}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredMilestones.map((milestone) => (
            <MilestoneListItem
              key={milestone.id}
              milestone={milestone}
              onToggleTask={handleToggleTask}
            />
          ))}
        </div>
      )}
    </MainScreenWrapper>
  );
}
