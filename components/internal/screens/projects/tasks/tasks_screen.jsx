"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  AlertTriangle,
  Link2,
  Pencil,
  ArrowUpRight,
  Expand,
  Maximize2,
  GitBranch,
  GitCommit,
  GitCompare,
  GitFork,
  GitMerge,
  GitPullRequest,
  GitPullRequestClosed,
  GitPullRequestDraft,
  GitRequest,
  GitHub,
  LucideGithub,
} from "lucide-react";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { AddTaskDialog } from "./add_task_dialog";
import { cn } from "@/lib/utils";

const GOAL_OPTIONS = [
  { value: "goal:predictable-delivery", label: "Predictable delivery" },
  { value: "goal:clean-inbox", label: "Clean inbox" },
  { value: "goal:onboarding-conversion", label: "Improve onboarding conversion rate" },
  { value: "goal:platform-uptime", label: "Achieve 99.9% platform uptime SLA" },
  { value: "goal:collaborative-editing", label: "Launch collaborative editing feature" },
];

const STATUS_META = {
  todo: {
    label: "To Do",
    className: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  },
  blocked: {
    label: "Blocked",
    className: "bg-red-500/15 text-red-300 border-red-500/30",
  },
  done: {
    label: "Done",
    className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
};

const PRIORITY_META = {
  low: { className: "text-emerald-300", Icon: ArrowUpRight },
  medium: { className: "text-amber-300", Icon: Maximize2 },
  high: { className: "text-orange-300", Icon: Expand },
  critical: { className: "text-rose-300", Icon: AlertTriangle },
};

const GOAL_LABELS = GOAL_OPTIONS.reduce((labels, goal) => {
  labels[goal.value] = goal.label;
  return labels;
}, {});

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
});

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return dateFormatter.format(parsedDate);
}

function formatLinkedGoal(parentLink) {
  if (!parentLink?.startsWith("goal:")) {
    return "-";
  }

  return GOAL_LABELS[parentLink] || parentLink.replace(/^goal:/, "").replaceAll("-", " ");
}

function isOverdue(task) {
  if (!task?.dueDate || task.status === "done") {
    return false;
  }

  return new Date(task.dueDate).getTime() < Date.now();
}

export function TasksScreen() {
  const [tasks, setTasks] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const blockedCount = useMemo(
    () => tasks.filter((task) => task.status === "blocked").length,
    [tasks],
  );

  const overdueCount = useMemo(
    () => tasks.filter((task) => isOverdue(task)).length,
    [tasks],
  );

  const averageProgress = useMemo(() => {
    if (tasks.length === 0) {
      return 0;
    }

    const total = tasks.reduce((sum, task) => sum + (task.progress || 0), 0);
    return Math.round(total / tasks.length);
  }, [tasks]);

  const handleDialogToggle = (openState) => {
    setDialogOpen(openState);

    if (!openState) {
      setEditingTask(null);
    }
  };

  const handleCreate = () => {
    setEditingTask(null);
    setDialogOpen(true);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleSaveTask = async (taskPayload) => {
    setTasks((currentTasks) => {
      const existingIndex = currentTasks.findIndex((task) => task.id === taskPayload.id);
      if (existingIndex === -1) {
        return [taskPayload, ...currentTasks];
      }

      const nextTasks = [...currentTasks];
      nextTasks[existingIndex] = taskPayload;
      return nextTasks;
    });
  };

  return (
    <MainScreenWrapper>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-[#2a2a2a] pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#e7e7e7]">Tasks</h1>
          <p className="text-[#a3a3a3] mt-1">
            Create, track and manage project tasks.
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-white text-black hover:bg-[#e7e7e7]" onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Task
          </Button>
          <Button className="bg-white text-black hover:bg-[#e7e7e7]" onClick={handleCreate}>
            <LucideGithub className="w-6 h-6" />
          </Button>
        </div>
      </div>

          <div className="bg-[#202020] border border-[#2a2a2a] rounded-2xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#1a1a1a] border-[#2a2a2a]">
                  <TableHead>Task</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Goal</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id} className="border-[#2a2a2a] hover:bg-[#242424]">
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[#ededed] font-medium">{task.title}</span>
                          {task.deadlineTracking === "at_risk" ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                          ) : null}
                        </div>
                        <p className="text-xs text-[#737373] line-clamp-1">{task.description}</p>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Badge className={cn("min-w-[86px] justify-center whitespace-nowrap border px-2", STATUS_META[task.status]?.className)}>
                        {STATUS_META[task.status]?.label || task.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const meta = PRIORITY_META[task.priority];
                        const PriorityIcon = meta?.Icon;
                        return (
                          <span className={cn("capitalize font-medium inline-flex items-center gap-1.5", meta?.className)}>
                            {PriorityIcon ? <PriorityIcon className="w-3.5 h-3.5" /> : null}
                            {task.priority}
                          </span>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      {task.parentLink?.startsWith("goal:") ? (
                        <span className="inline-flex max-w-[180px] items-center gap-1.5 text-xs text-[#a3a3a3]">
                          <Link2 className="w-3.5 h-3.5 shrink-0 text-[#737373]" />
                          <span className="truncate">{formatLinkedGoal(task.parentLink)}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-[#525252]">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-[#a3a3a3]">
                        {formatDate(task.dueDate)}
                        {isOverdue(task) ? <span className="text-red-300 ml-1">(Overdue)</span> : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="w-[130px] space-y-1.5">
                        <Progress value={task.progress} className="h-1.5 bg-[#2a2a2a] [&_[data-slot=progress-indicator]]:bg-[#ededed]" />
                        <p className="text-xs text-[#737373]">{task.progress}%</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-[#a3a3a3] hover:text-white hover:bg-[#252525]"
                        onClick={() => handleEdit(task)}
                      >
                        <Pencil className="w-2 h-2" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

      <AddTaskDialog
        open={dialogOpen}
        onOpenChange={handleDialogToggle}
        task={editingTask}
        onSave={handleSaveTask}
        goalOptions={GOAL_OPTIONS}
      />
    </MainScreenWrapper>
  );
}
