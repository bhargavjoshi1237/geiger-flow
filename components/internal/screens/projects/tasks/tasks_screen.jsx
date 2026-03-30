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

const MOCK_TASKS = [
  {
    id: "task_101",
    title: "Implement flow timeline cards",
    description: "Create horizontal milestone cards with dependency highlighting and due date overlays.",
    status: "in_progress",
    priority: "high",
    assignees: ["user_1", "user_3"],
    startDate: "2026-03-17",
    dueDate: "2026-03-27",
    stage: "execution",
    labels: ["ui", "timeline"],
    type: "feature",
    parentLink: "milestone:mvp-ui",
    milestoneId: "milestone:mvp-ui",
    objectiveId: "objective:ux-consistency",
    initiativeLink: "initiative:q2-polish",
    dependencies: ["task_099"],
    blockedBy: [],
    blocking: ["task_110"],
    progress: 62,
    latestUpdate: "Visual shell done, pending motion pass.",
    activityLog: [],
    comments: [
      {
        id: "comment_1",
        author: "Alex",
        text: "Need fallback style for compact mode.",
        createdAt: "2026-03-20T08:00:00.000Z",
      },
    ],
    gitBranch: "feature/tasks-flow-timeline",
    issues: ["PR-281"],
    reminders: ["1_day"],
    project: "geiger-flow",
    workspace: "product-engineering",
    roleVisibility: "team",
    taskCollection: "release",
    inbox: {
      mode: "updates",
      isDraft: false,
      pokeEnabled: true,
    },
    deadlineTracking: "on_track",
    timeBlock: "14:00-16:00",
    integrations: {
      environmentVault: "vault:frontend",
      agentSession: "copilot-session-33",
    },
    assistPanel: {
      prompt: "What is blocking this task?",
      hint: "Check milestone and design review dependencies.",
    },
    createdAt: "2026-03-17T08:00:00.000Z",
    updatedAt: "2026-03-21T12:00:00.000Z",
  },
  {
    id: "task_102",
    title: "Dependency chain validation",
    description: "Map blocked-by chains and expose chain view before marking tasks done.",
    status: "blocked",
    priority: "critical",
    assignees: ["user_2"],
    startDate: "2026-03-14",
    dueDate: "2026-03-22",
    stage: "execution",
    labels: ["flow", "risk"],
    type: "task",
    parentLink: "goal:predictable-delivery",
    milestoneId: "milestone:flow-core",
    objectiveId: "objective:blocker-visibility",
    initiativeLink: "initiative:q2-core-flow",
    dependencies: ["task_088", "task_097"],
    blockedBy: ["api-review"],
    blocking: ["task_111", "task_113"],
    progress: 30,
    latestUpdate: "Waiting for API contract from backend owners.",
    activityLog: [],
    comments: [
      {
        id: "comment_2",
        author: "Sam",
        text: "Will unblock after tomorrow's review.",
        createdAt: "2026-03-21T16:00:00.000Z",
      },
    ],
    gitBranch: "feature/dependency-chain",
    issues: ["PR-289", "commit:17ea2b"],
    reminders: ["1_day"],
    project: "geiger-flow",
    workspace: "product-engineering",
    roleVisibility: "pm_tl",
    taskCollection: "core",
    inbox: {
      mode: "assigned",
      isDraft: false,
      pokeEnabled: true,
    },
    deadlineTracking: "at_risk",
    timeBlock: "09:30-11:00",
    integrations: {
      environmentVault: "vault:backend-staging",
      agentSession: "cursor-session-14",
    },
    assistPanel: {
      prompt: "Summarize blockers and propose next action.",
      hint: "High-priority cross-team blocker.",
    },
    createdAt: "2026-03-14T11:00:00.000Z",
    updatedAt: "2026-03-21T18:00:00.000Z",
  },
  {
    id: "task_103",
    title: "Analytics velocity module",
    description: "Compute weekly velocity and delay patterns for the analytics tab.",
    status: "todo",
    priority: "medium",
    assignees: ["user_4"],
    startDate: "2026-03-24",
    dueDate: "2026-04-04",
    stage: "planning",
    labels: ["analytics"],
    type: "improvement",
    parentLink: "objective:delivery-insights",
    milestoneId: "milestone:reporting",
    objectiveId: "objective:delivery-insights",
    initiativeLink: "initiative:q2-data",
    dependencies: [],
    blockedBy: [],
    blocking: [],
    progress: 5,
    latestUpdate: "Scope drafted.",
    activityLog: [],
    comments: [],
    gitBranch: "",
    issues: [],
    reminders: ["1_week"],
    project: "geiger-flow",
    workspace: "product-engineering",
    roleVisibility: "team",
    taskCollection: "research",
    inbox: {
      mode: "reminders",
      isDraft: true,
      pokeEnabled: false,
    },
    deadlineTracking: "on_track",
    timeBlock: "",
    integrations: {
      environmentVault: "",
      agentSession: "",
    },
    assistPanel: {
      prompt: "Generate a weekly summary from activity logs.",
      hint: "No blockers yet.",
    },
    createdAt: "2026-03-20T10:30:00.000Z",
    updatedAt: "2026-03-20T10:30:00.000Z",
  },
  {
    id: "task_104",
    title: "Draft inbox triage rules",
    description: "Define how assigned tasks, mentions, reminders and updates are grouped.",
    status: "done",
    priority: "low",
    assignees: ["user_5"],
    startDate: "2026-03-08",
    dueDate: "2026-03-14",
    stage: "completed",
    labels: ["inbox", "workflow"],
    type: "task",
    parentLink: "goal:clean-inbox",
    milestoneId: "milestone:inbox-core",
    objectiveId: "objective:notification-clarity",
    initiativeLink: "initiative:q1-foundation",
    dependencies: [],
    blockedBy: [],
    blocking: [],
    progress: 100,
    latestUpdate: "Rules approved by PM and TL.",
    activityLog: [],
    comments: [],
    gitBranch: "feature/inbox-rules",
    issues: ["PR-250"],
    reminders: ["1_day"],
    project: "geiger-flow",
    workspace: "product-engineering",
    roleVisibility: "team",
    taskCollection: "maintenance",
    inbox: {
      mode: "updates",
      isDraft: false,
      pokeEnabled: false,
    },
    deadlineTracking: "on_track",
    timeBlock: "",
    integrations: {
      environmentVault: "vault:ops",
      agentSession: "",
    },
    assistPanel: {
      prompt: "Summarize closure notes.",
      hint: "Closed with no blockers.",
    },
    createdAt: "2026-03-08T08:00:00.000Z",
    updatedAt: "2026-03-14T17:00:00.000Z",
  },
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

function isOverdue(task) {
  if (!task?.dueDate || task.status === "done") {
    return false;
  }

  return new Date(task.dueDate).getTime() < Date.now();
}

export function TasksScreen() {
  const [tasks, setTasks] = useState(MOCK_TASKS);
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
      <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#e7e7e7]">Tasks</h1>
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
                    <TableCell>
                      <Badge className={cn("border", STATUS_META[task.status]?.className)}>
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
      />
    </MainScreenWrapper>
  );
}