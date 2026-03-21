"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ReactFlow,
  Background,
  SelectionMode,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";
import {
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  ArrowUpDown,
  Flag,
  User,
  MessageCircle,
  AlertTriangle,
  Link2,
  BellRing,
  NotebookPen,
  Sparkles,
  GripVertical,
  Pencil,
  Kanban,
  Goal,
} from "lucide-react";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import CustomNode from "@/components/flow/nodes/CustomNode";
import ZoomControls from "@/components/internal/canvas/zoom-controls";
import "@xyflow/react/dist/style.css";

const statusOptions = ["pending", "in-progress", "completed", "blocked"];
const stageOptions = ["planning", "build", "review", "launch"];
const priorityOptions = ["low", "medium", "high", "urgent"];
const taskStatusOptions = ["todo", "in-progress", "blocked", "done"];

const initialMilestones = [
  {
    id: "1",
    title: "Phase 1: Foundation",
    description: "Initial setup and core infrastructure",
    stage: "build",
    priority: "high",
    goal: "Ship stable project core",
    objective: "Set architecture, auth, and baseline workflows",
    startDate: "2026-02-15",
    dueDate: "2026-03-15",
    status: "in-progress",
    assignee: "Bhargav",
    tags: ["infra", "backend", "release-a"],
    commentsCount: 7,
    issuesCount: 2,
    latestUpdate: "Auth hardening done, migration scripts under review.",
    activity: "5 updates this week",
    inboxReminder: "1d",
    isDraft: false,
    kanbanEnabled: true,
    assistEnabled: true,
    dependencies: {
      blockedBy: ["Security sign-off"],
      blocking: ["Feature streams for team B and C"],
    },
    tasks: [
      {
        id: "t-1",
        title: "Set up auth and org roles",
        status: "done",
        priority: "high",
        assignee: "Bhargav",
        startDate: "2026-02-15",
        targetDate: "2026-02-28",
        latestUpdate: "Merged and deployed to staging",
      },
      {
        id: "t-2",
        title: "Create project settings and status schema",
        status: "in-progress",
        priority: "high",
        assignee: "Sam",
        startDate: "2026-02-26",
        targetDate: "2026-03-08",
        latestUpdate: "Custom statuses in QA",
      },
      {
        id: "t-3",
        title: "Milestone analytics baseline",
        status: "todo",
        priority: "medium",
        assignee: "Priya",
        startDate: "2026-03-03",
        targetDate: "2026-03-14",
        latestUpdate: "Waiting on event schema",
      },
    ],
  },
  {
    id: "2",
    title: "Phase 2: Development",
    description: "Feature implementation and testing",
    stage: "build",
    priority: "medium",
    goal: "Complete collaboration workflows",
    objective: "Milestones, tasks, and issue relationships",
    startDate: "2026-03-20",
    dueDate: "2026-04-30",
    status: "in-progress",
    assignee: "Anika",
    tags: ["ui", "tasks", "milestones"],
    commentsCount: 13,
    issuesCount: 5,
    latestUpdate: "Task collection wiring started; comment feed pending.",
    activity: "11 updates this week",
    inboxReminder: "1w",
    isDraft: false,
    kanbanEnabled: true,
    assistEnabled: true,
    dependencies: {
      blockedBy: ["API pagination", "Events ingestion"],
      blocking: ["Cross-project dashboard cards"],
    },
    tasks: [
      {
        id: "t-4",
        title: "Task collection with labels/tags",
        status: "in-progress",
        priority: "high",
        assignee: "Anika",
        startDate: "2026-03-21",
        targetDate: "2026-04-06",
        latestUpdate: "Drag ordering done in draft",
      },
      {
        id: "t-5",
        title: "Comments and issue references",
        status: "todo",
        priority: "medium",
        assignee: "Rohan",
        startDate: "2026-04-02",
        targetDate: "2026-04-14",
        latestUpdate: "Spec reviewed",
      },
      {
        id: "t-6",
        title: "Assist update helper",
        status: "blocked",
        priority: "medium",
        assignee: "Nina",
        startDate: "2026-04-03",
        targetDate: "2026-04-18",
        latestUpdate: "Blocked by prompt templates",
      },
    ],
  },
  {
    id: "3",
    title: "Phase 3: Launch",
    description: "Production deployment and monitoring",
    stage: "launch",
    priority: "urgent",
    goal: "Go live with all milestone controls",
    objective: "Reliable release with measurable progress",
    startDate: "2026-05-01",
    dueDate: "2026-05-15",
    status: "pending",
    assignee: "Launch Team",
    tags: ["release", "monitoring"],
    commentsCount: 2,
    issuesCount: 1,
    latestUpdate: "Launch checklist drafted.",
    activity: "2 updates this week",
    inboxReminder: "1m",
    isDraft: true,
    kanbanEnabled: false,
    assistEnabled: false,
    dependencies: {
      blockedBy: ["UAT completion"],
      blocking: ["Public release notes"],
    },
    tasks: [
      {
        id: "t-7",
        title: "Production canary",
        status: "todo",
        priority: "urgent",
        assignee: "Ops",
        startDate: "2026-05-01",
        targetDate: "2026-05-06",
        latestUpdate: "Pending",
      },
      {
        id: "t-8",
        title: "Monitoring playbook",
        status: "todo",
        priority: "high",
        assignee: "SRE",
        startDate: "2026-05-02",
        targetDate: "2026-05-10",
        latestUpdate: "Pending",
      },
    ],
  },
];

const getStatusColor = (status) => {
  switch (status) {
    case "completed":
      return "#22c55e";
    case "in-progress":
      return "#eab308";
    case "blocked":
      return "#ef4444";
    case "pending":
      return "#71717a";
    default:
      return "#737373";
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case "urgent":
      return "#ef4444";
    case "high":
      return "#f97316";
    case "medium":
      return "#eab308";
    case "low":
      return "#22c55e";
    default:
      return "#737373";
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case "completed":
      return "Completed";
    case "in-progress":
      return "In Progress";
    case "pending":
      return "Pending";
    default:
      return status;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const getMilestoneProgress = (milestone) => {
  const total = milestone.tasks.length;
  if (total === 0) return 0;
  const done = milestone.tasks.filter((task) => task.status === "done").length;
  return Math.round((done / total) * 100);
};

const buildFlowNode = (milestone, index) => ({
  id: milestone.id,
  type: "custom",
  position: { x: 80 + index * 380, y: 150 },
  data: {
    label: `${milestone.title}\n${milestone.stage.toUpperCase()} • ${getMilestoneProgress(milestone)}%`,
    backgroundColor: "#2f2f2f",
    reactions: {},
  },
  style: { width: 338, height: 68 },
});

const initialNodes = initialMilestones.map((milestone, index) => buildFlowNode(milestone, index));

const initialEdges = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e2-3", source: "2", target: "3" },
];

export function MilestonesScreen() {
  const [milestones, setMilestones] = useState(initialMilestones);
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [editOpen, setEditOpen] = useState(false);
  const [editingMilestoneId, setEditingMilestoneId] = useState(null);
  const [draftMilestone, setDraftMilestone] = useState(null);
  const [draggingTaskId, setDraggingTaskId] = useState(null);

  const milestoneById = useMemo(() => {
    return milestones.reduce((acc, milestone) => {
      acc[milestone.id] = milestone;
      return acc;
    }, {});
  }, [milestones]);

  const nodeTypes = useMemo(
    () => ({
      custom: CustomNode,
    }),
    [],
  );

  useEffect(() => {
    setNodes((currentNodes) => {
      const milestoneIds = new Set(milestones.map((milestone) => milestone.id));
      const existingIds = new Set(currentNodes.map((node) => node.id));

      const syncedNodes = currentNodes
        .filter((node) => milestoneIds.has(node.id))
        .map((node) => {
          const milestone = milestoneById[node.id];
          return {
            ...node,
            data: {
              ...node.data,
              label: `${milestone.title}\n${milestone.stage.toUpperCase()} • ${getMilestoneProgress(milestone)}%`,
              backgroundColor: "#2f2f2f",
            },
          };
        });

      milestones.forEach((milestone, index) => {
        if (!existingIds.has(milestone.id)) {
          syncedNodes.push(buildFlowNode(milestone, index));
        }
      });

      return syncedNodes;
    });
  }, [milestones, milestoneById]);

  const onNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [],
  );

  const onEdgesChange = useCallback(
    (changes) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
    },
    [],
  );

  const onConnect = useCallback((params) => {
    setEdges((eds) => [...eds, { id: `e${Date.now()}`, ...params }]);
  }, []);

  const handleAddMilestone = useCallback(() => {
    const nextId = String(Date.now());
    const newMilestone = {
      id: nextId,
      title: "New Milestone",
      description: "Add details...",
      stage: "planning",
      priority: "medium",
      goal: "",
      objective: "",
      startDate: new Date().toISOString().split("T")[0],
      dueDate: new Date().toISOString().split("T")[0],
      status: "pending",
      assignee: "",
      tags: [],
      commentsCount: 0,
      issuesCount: 0,
      latestUpdate: "",
      activity: "No updates yet",
      inboxReminder: "1w",
      isDraft: true,
      kanbanEnabled: false,
      assistEnabled: false,
      dependencies: {
        blockedBy: [],
        blocking: [],
      },
      tasks: [],
    };

    setMilestones((currentMilestones) => [...currentMilestones, newMilestone]);

    setNodes((currentNodes) => [
      ...currentNodes,
      {
        id: nextId,
        type: "custom",
        position: {
          x: 120 + (currentNodes.length % 4) * 360,
          y: 120 + Math.floor(currentNodes.length / 4) * 140,
        },
        data: {
          label: `${newMilestone.title}\n${newMilestone.stage.toUpperCase()} • 0%`,
          backgroundColor: "#2f2f2f",
          reactions: {},
        },
        style: { width: 338, height: 68 },
      },
    ]);
  }, []);

  const openMilestoneEditor = useCallback((milestoneId) => {
    const selected = milestoneById[milestoneId];
    if (!selected) return;

    setEditingMilestoneId(milestoneId);
    setDraftMilestone({
      ...selected,
      tagsInput: selected.tags.join(", "),
      blockedByInput: selected.dependencies.blockedBy.join(", "),
      blockingInput: selected.dependencies.blocking.join(", "),
      tasks: selected.tasks.map((task) => ({ ...task })),
    });
    setEditOpen(true);
  }, [milestoneById]);

  const saveMilestoneEditor = useCallback(() => {
    if (!draftMilestone || !editingMilestoneId) return;

    const normalized = {
      ...draftMilestone,
      tags: draftMilestone.tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      dependencies: {
        blockedBy: draftMilestone.blockedByInput
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        blocking: draftMilestone.blockingInput
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
      },
    };

    delete normalized.tagsInput;
    delete normalized.blockedByInput;
    delete normalized.blockingInput;

    setMilestones((currentMilestones) =>
      currentMilestones.map((milestone) => (milestone.id === editingMilestoneId ? normalized : milestone)),
    );
    setEditOpen(false);
    setEditingMilestoneId(null);
    setDraftMilestone(null);
  }, [draftMilestone, editingMilestoneId]);

  const timelineData = useMemo(() => {
    if (milestones.length === 0) return [];
    const timestamps = milestones.map((milestone) => new Date(milestone.dueDate).getTime());
    const min = Math.min(...timestamps);
    const max = Math.max(...timestamps);
    const spread = Math.max(max - min, 1);

    return milestones.map((milestone) => ({
      ...milestone,
      progress: getMilestoneProgress(milestone),
      percent: ((new Date(milestone.dueDate).getTime() - min) / spread) * 100,
    }));
  }, [milestones]);

  const analytics = useMemo(() => {
    const totalMilestones = milestones.length;
    const allTasks = milestones.flatMap((milestone) => milestone.tasks);
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter((task) => task.status === "done").length;
    const blockedTasks = allTasks.filter((task) => task.status === "blocked").length;
    const avgProgress =
      totalMilestones === 0
        ? 0
        : Math.round(milestones.reduce((sum, milestone) => sum + getMilestoneProgress(milestone), 0) / totalMilestones);

    return {
      totalMilestones,
      totalTasks,
      completedTasks,
      blockedTasks,
      avgProgress,
    };
  }, [milestones]);

  const onTaskDrop = (targetTaskId) => {
    if (!draftMilestone || !draggingTaskId || draggingTaskId === targetTaskId) return;

    const tasks = [...draftMilestone.tasks];
    const sourceIndex = tasks.findIndex((task) => task.id === draggingTaskId);
    const targetIndex = tasks.findIndex((task) => task.id === targetTaskId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    const [movedTask] = tasks.splice(sourceIndex, 1);
    tasks.splice(targetIndex, 0, movedTask);

    setDraftMilestone((current) => ({
      ...current,
      tasks,
    }));
    setDraggingTaskId(null);
  };

  const addDraftTask = () => {
    if (!draftMilestone) return;
    const id = `task-${Date.now()}`;
    setDraftMilestone((current) => ({
      ...current,
      tasks: [
        ...current.tasks,
        {
          id,
          title: "New task",
          status: "todo",
          priority: "medium",
          assignee: "",
          startDate: current.startDate,
          targetDate: current.dueDate,
          latestUpdate: "",
        },
      ],
    }));
  };

  const onNodeClick = useCallback((_, node) => {
    openMilestoneEditor(node.id);
  }, [openMilestoneEditor]);

  const handleAskForUpdate = (milestoneId) => {
    setMilestones((currentMilestones) =>
      currentMilestones.map((milestone) => {
        if (milestone.id !== milestoneId) return milestone;
        return {
          ...milestone,
          latestUpdate: `Requested status update on ${new Date().toLocaleDateString("en-US")}`,
          activity: "Update request sent",
        };
      }),
    );
  };

  return (
    <MainScreenWrapper>
      <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#e7e7e7]">Milestones</h1>
          <p className="text-[#a3a3a3] mt-1">
            Track major project milestones and their progress.
          </p>
        </div>
        <Button
          className="bg-white text-black hover:bg-[#e7e7e7]"
          onClick={handleAddMilestone}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Milestone
        </Button>
      </div>

      <div className="mt-5 rounded-xl border border-[#2a2a2a] bg-[#1d1d1d] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Horizontal Milestone Timeline</h2>
          <span className="text-xs text-[#a3a3a3]">Calendar-based task and milestone showcase</span>
        </div>
        <div className="relative h-24 rounded-lg border border-[#323232] bg-[#191919] px-4 py-3">
          <div className="absolute left-4 right-4 top-1/2 h-[2px] -translate-y-1/2 bg-gradient-to-r from-[#333] via-[#626262] to-[#333]" />
          {timelineData.map((milestone) => (
            <div
              key={`timeline-${milestone.id}`}
              className="absolute top-2 -translate-x-1/2"
              style={{ left: `${Math.min(Math.max(milestone.percent, 0), 100)}%` }}
            >
              <div className="mb-1 h-3 w-3 rounded-full border border-[#111]" style={{ backgroundColor: getStatusColor(milestone.status) }} />
              <div className="max-w-28 text-[10px] leading-3 text-[#d4d4d4]">{milestone.title}</div>
              <div className="text-[10px] text-[#8a8a8a]">{formatDate(milestone.dueDate)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid h-[calc(100vh-290px)] grid-cols-1 gap-4 xl:grid-cols-[1.8fr_1.2fr]">
        {/* Left Half - Milestones List */}
        <div className="rounded-lg overflow-y-auto pr-1">
          <div className="space-y-4">
            {milestones.map((milestone) => {
              const progress = getMilestoneProgress(milestone);
              const completedTasks = milestone.tasks.filter((task) => task.status === "done").length;
              const blockedTasks = milestone.tasks.filter((task) => task.status === "blocked").length;

              return (
              <div
                key={milestone.id}
                className="bg-[#202020] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#474747] transition-all duration-200 group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2.5 mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            {milestone.title}
                          </h3>
                          <span
                            className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: `${getStatusColor(milestone.status)}20`,
                              color: getStatusColor(milestone.status),
                              border: `1px solid ${getStatusColor(milestone.status)}40`,
                            }}
                          >
                            {getStatusLabel(milestone.status)}
                          </span>
                          <span
                            className="rounded-full px-2 py-0.5 text-xs"
                            style={{
                              backgroundColor: `${getPriorityColor(milestone.priority)}1f`,
                              color: getPriorityColor(milestone.priority),
                              border: `1px solid ${getPriorityColor(milestone.priority)}45`,
                            }}
                          >
                            {milestone.priority}
                          </span>
                          <span className="rounded-full border border-[#3a3a3a] px-2 py-0.5 text-xs text-[#b5b5b5]">
                            stage: {milestone.stage}
                          </span>
                        </div>
                        <p className="text-sm text-[#a3a3a3]">
                          {milestone.description}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#9c9c9c]">
                          <span className="inline-flex items-center gap-1 rounded-full border border-[#343434] px-2 py-0.5">
                            <Goal className="h-3.5 w-3.5" /> {milestone.goal || "No goal"}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full border border-[#343434] px-2 py-0.5">
                            <Kanban className="h-3.5 w-3.5" /> {milestone.kanbanEnabled ? "Kanban on" : "Kanban off"}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full border border-[#343434] px-2 py-0.5">
                            <NotebookPen className="h-3.5 w-3.5" /> {milestone.isDraft ? "Draft" : "Published"}
                          </span>
                        </div>
                      </div>
                      <button type="button" className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="w-4 h-4 text-[#737373]" />
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#a3a3a3]">Progress</span>
                        <span className="text-white font-medium">
                          {progress}%
                        </span>
                      </div>
                      <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden border border-[#333333]">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${progress}%`,
                            backgroundColor: getStatusColor(milestone.status),
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 rounded-lg border border-[#2f2f2f] bg-[#1b1b1b] p-2 text-xs text-[#a3a3a3] lg:grid-cols-4">
                      <div className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {milestone.assignee || "Unassigned"}</div>
                      <div className="flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5" /> {milestone.commentsCount} comments</div>
                      <div className="flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" /> {milestone.issuesCount} issues</div>
                      <div className="flex items-center gap-1.5"><Link2 className="h-3.5 w-3.5" /> {milestone.dependencies.blockedBy.length + milestone.dependencies.blocking.length} deps</div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#a9a9a9]">
                      <span className="inline-flex items-center gap-1 rounded-md border border-[#353535] px-2 py-1">
                        <BellRing className="h-3.5 w-3.5" /> remind: {milestone.inboxReminder}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md border border-[#353535] px-2 py-1">
                        <Sparkles className="h-3.5 w-3.5" /> assist: {milestone.assistEnabled ? "enabled" : "off"}
                      </span>
                      <span className="rounded-md border border-[#353535] px-2 py-1">{milestone.activity}</span>
                    </div>

                    {/* Footer Stats */}
                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <div className="flex items-center gap-2 text-xs text-[#a3a3a3]">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(milestone.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#a3a3a3]">
                        <Flag className="w-3.5 h-3.5" />
                        <span>{formatDate(milestone.dueDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#a3a3a3]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>
                          {completedTasks} / {milestone.tasks.length} tasks
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#a3a3a3]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {milestone.tasks.length - completedTasks} remaining
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#d97706]">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{blockedTasks} blocked</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 border-t border-[#2d2d2d] pt-3">
                      <Button size="sm" variant="outline" className="border-[#3a3a3a] bg-transparent" onClick={() => openMilestoneEditor(milestone.id)}>
                        <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-[#3a3a3a] bg-transparent"
                        onClick={() => handleAskForUpdate(milestone.id)}
                      >
                        <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Ask Update
                      </Button>
                      <div className="text-xs text-[#8f8f8f]">{milestone.latestUpdate || "No latest update yet."}</div>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>

        {/* Right Half - React Flow Canvas */}
        <div className="grid gap-4">
          <div className="rounded-lg border border-[#2a2a2a] bg-[#1f1f1f] p-4">
            <h3 className="mb-3 text-sm font-semibold text-white">Milestone Analytics</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-md border border-[#323232] bg-[#191919] p-2 text-[#d1d1d1]">
                <div className="text-[11px] text-[#8f8f8f]">Milestones</div>
                <div className="text-xl font-semibold">{analytics.totalMilestones}</div>
              </div>
              <div className="rounded-md border border-[#323232] bg-[#191919] p-2 text-[#d1d1d1]">
                <div className="text-[11px] text-[#8f8f8f]">Avg progress</div>
                <div className="text-xl font-semibold">{analytics.avgProgress}%</div>
              </div>
              <div className="rounded-md border border-[#323232] bg-[#191919] p-2 text-[#d1d1d1]">
                <div className="text-[11px] text-[#8f8f8f]">Tasks done</div>
                <div className="text-xl font-semibold">{analytics.completedTasks}/{analytics.totalTasks}</div>
              </div>
              <div className="rounded-md border border-[#323232] bg-[#191919] p-2 text-[#d1d1d1]">
                <div className="text-[11px] text-[#8f8f8f]">Blocked tasks</div>
                <div className="text-xl font-semibold text-[#f97316]">{analytics.blockedTasks}</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg overflow-hidden border border-[#2a2a2a] bg-[#232323] relative min-h-[340px]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            colorMode="dark"
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            className="bg-[#232323]"
            proOptions={{ hideAttribution: true }}
            minZoom={0.1}
            maxZoom={2}
            deleteKeyCode={["Backspace", "Delete"]}
            panOnDrag={true}
            selectionOnDrag
            panOnScroll
            zoomOnScroll
            zoomOnDoubleClick={false}
            selectionMode={SelectionMode.Partial}
          >
            <Background color="#373737" gap={12} size={1} variant="dots" />
            <ZoomControls />
          </ReactFlow>
          </div>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-4xl border-[#313131] bg-[#1a1a1a] text-white">
          <DialogHeader>
            <DialogTitle>Edit Milestone</DialogTitle>
            <DialogDescription className="text-[#9d9d9d]">
              Update stage, status, dependencies, and reorder tasks with drag and drop.
            </DialogDescription>
          </DialogHeader>

          {draftMilestone && (
            <div className="grid max-h-[68vh] grid-cols-1 gap-3 overflow-y-auto pr-1 lg:grid-cols-2">
              <div className="space-y-3 rounded-lg border border-[#303030] bg-[#151515] p-3">
                <label className="text-xs text-[#b8b8b8]">Title</label>
                <Input
                  value={draftMilestone.title}
                  onChange={(event) => setDraftMilestone((current) => ({ ...current, title: event.target.value }))}
                  className="border-[#383838] bg-[#202020]"
                />

                <label className="text-xs text-[#b8b8b8]">Description</label>
                <Textarea
                  value={draftMilestone.description}
                  onChange={(event) => setDraftMilestone((current) => ({ ...current, description: event.target.value }))}
                  className="min-h-20 border-[#383838] bg-[#202020]"
                />

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs text-[#b8b8b8]">Stage</label>
                    <Select
                      value={draftMilestone.stage}
                      onValueChange={(value) => setDraftMilestone((current) => ({ ...current, stage: value }))}
                    >
                      <SelectTrigger className="w-full border-[#383838] bg-[#202020]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {stageOptions.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-[#b8b8b8]">Status</label>
                    <Select
                      value={draftMilestone.status}
                      onValueChange={(value) => setDraftMilestone((current) => ({ ...current, status: value }))}
                    >
                      <SelectTrigger className="w-full border-[#383838] bg-[#202020]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-[#b8b8b8]">Priority</label>
                    <Select
                      value={draftMilestone.priority}
                      onValueChange={(value) => setDraftMilestone((current) => ({ ...current, priority: value }))}
                    >
                      <SelectTrigger className="w-full border-[#383838] bg-[#202020]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-[#b8b8b8]">Start Date</label>
                    <Input
                      type="date"
                      value={draftMilestone.startDate}
                      onChange={(event) => setDraftMilestone((current) => ({ ...current, startDate: event.target.value }))}
                      className="border-[#383838] bg-[#202020]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#b8b8b8]">Target Date</label>
                    <Input
                      type="date"
                      value={draftMilestone.dueDate}
                      onChange={(event) => setDraftMilestone((current) => ({ ...current, dueDate: event.target.value }))}
                      className="border-[#383838] bg-[#202020]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-[#b8b8b8]">Assignee</label>
                    <Input
                      value={draftMilestone.assignee}
                      onChange={(event) => setDraftMilestone((current) => ({ ...current, assignee: event.target.value }))}
                      className="border-[#383838] bg-[#202020]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#b8b8b8]">Inbox Reminder</label>
                    <Select
                      value={draftMilestone.inboxReminder}
                      onValueChange={(value) => setDraftMilestone((current) => ({ ...current, inboxReminder: value }))}
                    >
                      <SelectTrigger className="w-full border-[#383838] bg-[#202020]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1d">1 day</SelectItem>
                        <SelectItem value="1w">1 week</SelectItem>
                        <SelectItem value="1m">1 month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <label className="text-xs text-[#b8b8b8]">Goal</label>
                <Input
                  value={draftMilestone.goal}
                  onChange={(event) => setDraftMilestone((current) => ({ ...current, goal: event.target.value }))}
                  className="border-[#383838] bg-[#202020]"
                />

                <label className="text-xs text-[#b8b8b8]">Objective</label>
                <Input
                  value={draftMilestone.objective}
                  onChange={(event) => setDraftMilestone((current) => ({ ...current, objective: event.target.value }))}
                  className="border-[#383838] bg-[#202020]"
                />

                <label className="text-xs text-[#b8b8b8]">Tags (comma separated)</label>
                <Input
                  value={draftMilestone.tagsInput}
                  onChange={(event) => setDraftMilestone((current) => ({ ...current, tagsInput: event.target.value }))}
                  className="border-[#383838] bg-[#202020]"
                />

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-[#b8b8b8]">Blocked By</label>
                    <Input
                      value={draftMilestone.blockedByInput}
                      onChange={(event) => setDraftMilestone((current) => ({ ...current, blockedByInput: event.target.value }))}
                      className="border-[#383838] bg-[#202020]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#b8b8b8]">Blocking</label>
                    <Input
                      value={draftMilestone.blockingInput}
                      onChange={(event) => setDraftMilestone((current) => ({ ...current, blockingInput: event.target.value }))}
                      className="border-[#383838] bg-[#202020]"
                    />
                  </div>
                </div>

                <label className="text-xs text-[#b8b8b8]">Latest Update</label>
                <Textarea
                  value={draftMilestone.latestUpdate}
                  onChange={(event) => setDraftMilestone((current) => ({ ...current, latestUpdate: event.target.value }))}
                  className="min-h-16 border-[#383838] bg-[#202020]"
                />

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className={`rounded-md border px-3 py-2 text-xs transition-colors ${draftMilestone.kanbanEnabled ? "border-[#5d5d5d] bg-[#262626] text-white" : "border-[#343434] bg-[#1e1e1e] text-[#a4a4a4]"}`}
                    onClick={() => setDraftMilestone((current) => ({ ...current, kanbanEnabled: !current.kanbanEnabled }))}
                  >
                    Kanban {draftMilestone.kanbanEnabled ? "enabled" : "disabled"}
                  </button>
                  <button
                    type="button"
                    className={`rounded-md border px-3 py-2 text-xs transition-colors ${draftMilestone.assistEnabled ? "border-[#5d5d5d] bg-[#262626] text-white" : "border-[#343434] bg-[#1e1e1e] text-[#a4a4a4]"}`}
                    onClick={() => setDraftMilestone((current) => ({ ...current, assistEnabled: !current.assistEnabled }))}
                  >
                    Assist {draftMilestone.assistEnabled ? "enabled" : "disabled"}
                  </button>
                </div>
              </div>

              <div className="space-y-3 rounded-lg border border-[#303030] bg-[#151515] p-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Tasks (drag to reorder)</h4>
                  <Button size="sm" variant="outline" className="border-[#3b3b3b] bg-transparent" onClick={addDraftTask}>
                    <Plus className="mr-1 h-3.5 w-3.5" /> Task
                  </Button>
                </div>

                <div className="space-y-2">
                  {draftMilestone.tasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => setDraggingTaskId(task.id)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => onTaskDrop(task.id)}
                      className="rounded-lg border border-[#323232] bg-[#1d1d1d] p-2"
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-[#8e8e8e]" />
                        <Input
                          value={task.title}
                          onChange={(event) =>
                            setDraftMilestone((current) => ({
                              ...current,
                              tasks: current.tasks.map((item) =>
                                item.id === task.id ? { ...item, title: event.target.value } : item,
                              ),
                            }))
                          }
                          className="h-8 border-[#3b3b3b] bg-[#252525]"
                        />
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          className="text-[#9a9a9a]"
                          onClick={() =>
                            setDraftMilestone((current) => ({
                              ...current,
                              tasks: current.tasks.filter((item) => item.id !== task.id),
                            }))
                          }
                        >
                          x
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                        <Select
                          value={task.status}
                          onValueChange={(value) =>
                            setDraftMilestone((current) => ({
                              ...current,
                              tasks: current.tasks.map((item) =>
                                item.id === task.id ? { ...item, status: value } : item,
                              ),
                            }))
                          }
                        >
                          <SelectTrigger className="h-8 w-full border-[#3b3b3b] bg-[#252525]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {taskStatusOptions.map((option) => (
                              <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={task.priority}
                          onValueChange={(value) =>
                            setDraftMilestone((current) => ({
                              ...current,
                              tasks: current.tasks.map((item) =>
                                item.id === task.id ? { ...item, priority: value } : item,
                              ),
                            }))
                          }
                        >
                          <SelectTrigger className="h-8 w-full border-[#3b3b3b] bg-[#252525]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {priorityOptions.map((option) => (
                              <SelectItem key={option} value={option}>{option}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Input
                          placeholder="Assignee"
                          value={task.assignee}
                          onChange={(event) =>
                            setDraftMilestone((current) => ({
                              ...current,
                              tasks: current.tasks.map((item) =>
                                item.id === task.id ? { ...item, assignee: event.target.value } : item,
                              ),
                            }))
                          }
                          className="h-8 border-[#3b3b3b] bg-[#252525]"
                        />

                        <Input
                          type="date"
                          value={task.targetDate}
                          onChange={(event) =>
                            setDraftMilestone((current) => ({
                              ...current,
                              tasks: current.tasks.map((item) =>
                                item.id === task.id ? { ...item, targetDate: event.target.value } : item,
                              ),
                            }))
                          }
                          className="h-8 border-[#3b3b3b] bg-[#252525]"
                        />
                      </div>
                    </div>
                  ))}

                  {draftMilestone.tasks.length === 0 && (
                    <div className="rounded-md border border-dashed border-[#3a3a3a] p-4 text-center text-xs text-[#8a8a8a]">
                      No tasks yet. Add one and drag to set order.
                    </div>
                  )}
                </div>

                <div className="rounded-md border border-[#313131] bg-[#1e1e1e] p-2 text-xs text-[#a2a2a2]">
                  <div className="mb-1 flex items-center gap-1.5"><ArrowUpDown className="h-3.5 w-3.5" /> Drag order controls execution sequence.</div>
                  <div>Use status, priority, dates, and assignee per task for objective-level visibility.</div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" className="border-[#3a3a3a] bg-transparent" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-white text-black hover:bg-[#e7e7e7]" onClick={saveMilestoneEditor}>
              Save Milestone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainScreenWrapper>
  );
}
