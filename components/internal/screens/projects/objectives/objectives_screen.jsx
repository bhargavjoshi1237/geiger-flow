"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  CheckCircle2,
  Circle,
  Target,
  Calendar,
  MoreHorizontal,
  ArrowRight,
  ChevronDown,
  LayoutGrid,
  List,
  Pencil,
  Trash2,
  Copy,
  CircleDot,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { cn } from "@/lib/utils";
import { ObjectiveKanban } from "./objective_kanban";
import { NewObjectiveDialog } from "@/components/internal/dilouges/objectives/new_objective_dilouge";

const MOCK_OBJECTIVES = [
  {
    id: "obj_001",
    title: "Establish UX consistency across all project screens",
    description:
      "Ensure every screen follows the same design language, spacing tokens, and interaction patterns.",
    status: "on_track",
    progress: 68,
    owner: "Amélie",
    startDate: "2026-03-01",
    targetDate: "2026-04-15",
    keyResults: [
      { label: "Audit all screens against design system", progress: 100, done: true },
      { label: "Migrate remaining hardcoded colors to tokens", progress: 72, done: false },
      { label: "Unified input box standard applied globally", progress: 33, done: false },
    ],
    goals: [
      { id: "g_001_1", title: "Audit dashboard screens", description: "Review all dashboard-related screens for design token compliance", status: "completed", progress: 100, owner: "Amélie", keyResults: [{ label: "Check spacing tokens", progress: 100, done: true }, { label: "Verify color usage", progress: 100, done: true }] },
      { id: "g_001_2", title: "Audit project screens", description: "Review all project-level screens for consistency", status: "on_track", progress: 75, owner: "Alex", keyResults: [{ label: "Sidebar consistency", progress: 100, done: true }, { label: "Topbar alignment", progress: 50, done: false }] },
      { id: "g_001_3", title: "Migrate hardcoded colors", description: "Replace hardcoded hex colors with CSS variable tokens", status: "on_track", progress: 60, owner: "Sam", keyResults: [{ label: "globals.css tokens", progress: 100, done: true }, { label: "Component migration", progress: 20, done: false }] },
      { id: "g_001_4", title: "Update input standards", description: "Apply global input box standard across all form fields", status: "not_started", progress: 0, owner: "Riley", keyResults: [{ label: "Update Input component", progress: 0, done: false }, { label: "Migrate usages", progress: 0, done: false }] },
    ],
  },
  {
    id: "obj_002",
    title: "Achieve blocker visibility for every task",
    description:
      "Surface dependency chains and blocked-by relationships so PMs can act on blockers immediately.",
    status: "at_risk",
    progress: 30,
    owner: "Sam",
    startDate: "2026-03-10",
    targetDate: "2026-04-01",
    keyResults: [
      { label: "Dependency chain map UI complete", progress: 50, done: false },
      { label: "Real-time blocker alerts in inbox", progress: 10, done: false },
      { label: "Chain-view exported as shareable link", progress: 0, done: false },
    ],
    goals: [
      { id: "g_002_1", title: "Design chain map UI", description: "Create visual representation of task dependency chains", status: "on_track", progress: 50, owner: "Sam", keyResults: [{ label: "Wireframes approved", progress: 100, done: true }, { label: "Interactive prototype", progress: 0, done: false }] },
      { id: "g_002_2", title: "Blocker alert system", description: "Implement real-time notifications when tasks get blocked", status: "at_risk", progress: 10, owner: "Alex", keyResults: [{ label: "Alert trigger logic", progress: 20, done: false }, { label: "Inbox integration", progress: 0, done: false }] },
      { id: "g_002_3", title: "Export chain view", description: "Allow sharing dependency chain as a link", status: "not_started", progress: 0, owner: "Riley", keyResults: [{ label: "Serialize chain data", progress: 0, done: false }, { label: "Shareable URL", progress: 0, done: false }] },
    ],
  },
  {
    id: "obj_003",
    title: "Deliver delivery-insights analytics module",
    description:
      "Build weekly velocity, delay patterns, and burndown analytics so teams can self-serve data.",
    status: "on_track",
    progress: 45,
    owner: "Alex",
    startDate: "2026-03-20",
    targetDate: "2026-05-01",
    keyResults: [
      { label: "Velocity computation pipeline", progress: 80, done: false },
      { label: "Delay-pattern detection algorithm", progress: 40, done: false },
      { label: "Analytics dashboard UI", progress: 15, done: false },
    ],
    goals: [
      { id: "g_003_1", title: "Velocity pipeline", description: "Compute and store weekly velocity metrics per team", status: "on_track", progress: 80, owner: "Alex", keyResults: [{ label: "Data model", progress: 100, done: true }, { label: "Computation engine", progress: 60, done: false }] },
      { id: "g_003_2", title: "Delay detection", description: "Identify patterns in task delays across sprints", status: "at_risk", progress: 40, owner: "Sam", keyResults: [{ label: "Historical analysis", progress: 50, done: false }, { label: "Prediction model", progress: 30, done: false }] },
      { id: "g_003_3", title: "Dashboard UI", description: "Build the analytics dashboard with charts and filters", status: "not_started", progress: 15, owner: "Amélie", keyResults: [{ label: "Chart components", progress: 20, done: false }, { label: "Filter sidebar", progress: 10, done: false }] },
      { id: "g_003_4", title: "Burndown charts", description: "Implement sprint and milestone burndown visualization", status: "on_track", progress: 45, owner: "Alex", keyResults: [{ label: "Data aggregation", progress: 60, done: false }, { label: "Chart rendering", progress: 30, done: false }] },
    ],
  },
  {
    id: "obj_004",
    title: "Clean notification & inbox clarity",
    description:
      "Reduce inbox noise by defining triage rules and grouping logic for task-related notifications.",
    status: "completed",
    progress: 100,
    owner: "You",
    startDate: "2026-03-05",
    targetDate: "2026-03-14",
    keyResults: [
      { label: "Triage ruleset defined and approved", progress: 100, done: true },
      { label: "Grouping logic implemented", progress: 100, done: true },
      { label: "PM & TL sign-off received", progress: 100, done: true },
    ],
    goals: [
      { id: "g_004_1", title: "Define triage rules", description: "Audit existing notifications and define triage classification", status: "completed", progress: 100, owner: "You", keyResults: [{ label: "Ruleset document", progress: 100, done: true }, { label: "Stakeholder approval", progress: 100, done: true }] },
      { id: "g_004_2", title: "Implement grouping", description: "Build grouping logic for task-related notifications", status: "completed", progress: 100, owner: "Sam", keyResults: [{ label: "Grouping engine", progress: 100, done: true }, { label: "Inbox UI update", progress: 100, done: true }] },
      { id: "g_004_3", title: "Get sign-off", description: "Obtain PM and TL sign-off on notification changes", status: "completed", progress: 100, owner: "You", keyResults: [{ label: "PM approval", progress: 100, done: true }, { label: "TL approval", progress: 100, done: true }] },
    ],
  },
  {
    id: "obj_005",
    title: "Secure vault access control rollout",
    description:
      "Implement role-based vault access with environment scoping for all project team members.",
    status: "not_started",
    progress: 0,
    owner: "Riley",
    startDate: "2026-04-01",
    targetDate: "2026-05-15",
    keyResults: [
      { label: "RBAC policy spec written", progress: 0, done: false },
      { label: "Environment scoping middleware", progress: 0, done: false },
      { label: "Audit log for vault access events", progress: 0, done: false },
    ],
    goals: [
      { id: "g_005_1", title: "Write RBAC spec", description: "Define role-based access control policies for vault", status: "not_started", progress: 0, owner: "Riley", keyResults: [{ label: "Role definitions", progress: 0, done: false }, { label: "Permission matrix", progress: 0, done: false }] },
      { id: "g_005_2", title: "Environment middleware", description: "Build middleware for environment-scoped vault access", status: "not_started", progress: 0, owner: "Alex", keyResults: [{ label: "Middleware layer", progress: 0, done: false }, { label: "Env variable isolation", progress: 0, done: false }] },
      { id: "g_005_3", title: "Audit logging", description: "Implement audit trail for all vault access events", status: "not_started", progress: 0, owner: "Sam", keyResults: [{ label: "Log schema", progress: 0, done: false }, { label: "Event capture", progress: 0, done: false }] },
    ],
  },
];

const STATUS_META = {
  not_started: {
    label: "Not Started",
    className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  },
  on_track: {
    label: "On Track",
    className: "bg-zinc-500/10 text-zinc-300 border-zinc-500/20",
  },
  at_risk: {
    label: "At Risk",
    className: "bg-zinc-500/10 text-zinc-300 border-zinc-500/20",
  },
  completed: {
    label: "Completed",
    className: "bg-zinc-500/10 text-zinc-300 border-zinc-500/20",
  },
};

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "-" : dateFormatter.format(d);
}

const STATUS_ICON = {
  not_started: CircleDot,
  on_track: TrendingUp,
  at_risk: AlertTriangle,
  completed: CheckCircle,
};

function ObjectiveCard({ objective, onSelect, onEdit, onDelete, onDuplicate, onChangeStatus }) {
  const [goalsOpen, setGoalsOpen] = useState(false);
  const completedKR = objective.keyResults.filter(
    (kr) => kr.done
  ).length;
  const totalKR = objective.keyResults.length;

  const progressBarColor = (() => {
    if (objective.status === "completed") return "[&_[data-slot=progress-indicator]]:bg-blue-400";
    if (objective.status === "at_risk") return "[&_[data-slot=progress-indicator]]:bg-amber-400";
    if (objective.status === "not_started") return "[&_[data-slot=progress-indicator]]:bg-zinc-500";
    return "[&_[data-slot=progress-indicator]]:bg-zinc-400";
  })();

  return (
    <Card
      className="bg-[#1a1a1a] border-[#2a2a2a] text-[#e7e7e7] hover:border-[#3a3a3a] transition-colors duration-200 rounded-xl py-0 gap-0 group"
    >
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-[#e7e7e7] leading-snug group-hover:text-white transition-colors">
                {objective.title}
              </h3>
              <Badge
                className={cn(
                  "border text-[10px] px-2 py-0",
                  STATUS_META[objective.status]?.className
                )}
              >
                {STATUS_META[objective.status]?.label}
              </Badge>
            </div>
            <p className="text-xs text-[#737373] line-clamp-2">
              {objective.description}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 text-[#525252] hover:text-[#a3a3a3] hover:bg-[#242424]"
                  onClick={(e) => { e.stopPropagation(); }}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-[#1a1a1a] border-[#2a2a2a] text-[#e7e7e7] rounded-lg w-48"
              >
                <DropdownMenuItem
                  className="text-xs gap-2 focus:bg-[#242424] focus:text-[#e7e7e7] cursor-pointer"
                  onSelect={(e) => { e.stopPropagation(); onEdit?.(objective); }}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit Objective
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-xs gap-2 focus:bg-[#242424] focus:text-[#e7e7e7] cursor-pointer"
                  onSelect={(e) => { e.stopPropagation(); onDuplicate?.(objective); }}
                >
                  <Copy className="w-3.5 h-3.5" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="text-xs gap-2 focus:bg-[#242424] focus:text-[#e7e7e7] cursor-pointer">
                    <Target className="w-3.5 h-3.5" />
                    Change Status
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-[#1a1a1a] border-[#2a2a2a] text-[#e7e7e7] rounded-lg">
                    {Object.entries(STATUS_META).map(([key, meta]) => {
                      const SIcon = STATUS_ICON[key];
                      return (
                        <DropdownMenuItem
                          key={key}
                          className={cn(
                            "text-xs gap-2 focus:bg-[#242424] focus:text-[#e7e7e7] cursor-pointer",
                            objective.status === key && "bg-[#242424]"
                          )}
                          onSelect={(e) => { e.stopPropagation(); onChangeStatus?.(objective.id, key); }}
                        >
                          {SIcon && <SIcon className="w-3.5 h-3.5" />}
                          {meta.label}
                          {objective.status === key && (
                            <CheckCircle2 className="w-3 h-3 ml-auto text-blue-400" />
                          )}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator className="bg-[#2a2a2a]" />
                <DropdownMenuItem
                  variant="destructive"
                  className="text-xs gap-2 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
                  onSelect={(e) => { e.stopPropagation(); onDelete?.(objective.id); }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Objective
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7 text-[#3a3a3a] hover:text-white hover:bg-[#2a2a2a] cursor-pointer"
              onClick={(e) => { e.stopPropagation(); onSelect(objective); }}
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4  text-xs text-[#737373]">
          <span className="inline-flex items-center gap-1">
            <Circle className="w-3 h-3" />
            {objective.owner}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(objective.startDate)} — {formatDate(objective.targetDate)}
          </span>
          <span className="ml-auto inline-flex items-center gap-1 text-[#525252]">
            <Target className="w-3 h-3" />
            {completedKR}/{totalKR} key results
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-[#525252] font-medium">
              Progress
            </span>
            <span className="text-xs text-[#a3a3a3] tabular-nums">
              {objective.progress}%
            </span>
          </div>
          <Progress
            value={objective.progress}
            className={cn(
              "h-1.5 bg-[#2a2a2a] rounded-full",
              progressBarColor
            )}
          />
        </div>

        {objective.keyResults && objective.keyResults.length > 0 && (
          <div className="border-t border-[#222] pt-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setGoalsOpen((prev) => !prev);
              }}
              className="flex items-center justify-between w-full gap-2 group/acc cursor-pointer"
            >
              <span className="text-[10px] uppercase tracking-wider text-[#3a3a3a] font-medium">
                Key Results
              </span>
              <ChevronDown
                className={cn(
                  "w-3 h-3 text-[#3a3a3a] transition-transform duration-200",
                  goalsOpen && "rotate-180"
                )}
              />
            </button>
            <div
              className={cn(
                "grid transition-all duration-200 ease-in-out",
                goalsOpen
                  ? "grid-rows-[1fr] opacity-100 mt-2"
                  : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden space-y-2">
                {objective.keyResults.map((kr, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    {kr.done ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-[#3a3a3a] shrink-0" />
                    )}
                    <span
                      className={cn(
                        "text-xs flex-1 truncate",
                        kr.done ? "text-[#a3a3a3] line-through" : "text-[#737373]"
                      )}
                    >
                      {kr.label}
                    </span>
                    <span className="text-[10px] tabular-nums text-[#525252] shrink-0">
                      {kr.progress}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ObjectiveListItem({ objective, onSelect, onEdit, onDelete, onDuplicate, onChangeStatus }) {
  const completedKR = objective.keyResults.filter((kr) => kr.done).length;
  const totalKR = objective.keyResults.length;

  const progressBarColor = (() => {
    if (objective.status === "completed") return "[&_[data-slot=progress-indicator]]:bg-blue-400";
    if (objective.status === "at_risk") return "[&_[data-slot=progress-indicator]]:bg-amber-400";
    if (objective.status === "not_started") return "[&_[data-slot=progress-indicator]]:bg-zinc-500";
    return "[&_[data-slot=progress-indicator]]:bg-zinc-400";
  })();

  return (
    <div
      className="flex items-center gap-4 px-4 py-3 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors group"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-medium text-[#e7e7e7] group-hover:text-white transition-colors truncate">
            {objective.title}
          </h3>
          <Badge
            className={cn(
              "border text-[10px] px-2 py-0 shrink-0",
              STATUS_META[objective.status]?.className
            )}
          >
            {STATUS_META[objective.status]?.label}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#737373]">
          <span className="inline-flex items-center gap-1">
            <Circle className="w-3 h-3" />
            {objective.owner}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(objective.startDate)} — {formatDate(objective.targetDate)}
          </span>
          <span className="inline-flex items-center gap-1 text-[#525252]">
            <Target className="w-3 h-3" />
            {completedKR}/{totalKR} KRs
          </span>
        </div>
      </div>

      <div className="w-32 shrink-0 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#525252]">Progress</span>
          <span className="text-xs text-[#a3a3a3] tabular-nums">{objective.progress}%</span>
        </div>
        <Progress
          value={objective.progress}
          className={cn("h-1 bg-[#2a2a2a] rounded-full", progressBarColor)}
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-[#525252] hover:text-[#a3a3a3] hover:bg-[#242424] shrink-0"
            onClick={(e) => { e.stopPropagation(); }}
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="bg-[#1a1a1a] border-[#2a2a2a] text-[#e7e7e7] rounded-lg w-48"
        >
          <DropdownMenuItem
            className="text-xs gap-2 focus:bg-[#242424] focus:text-[#e7e7e7] cursor-pointer"
            onSelect={(e) => { e.stopPropagation(); onEdit?.(objective); }}
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit Objective
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-xs gap-2 focus:bg-[#242424] focus:text-[#e7e7e7] cursor-pointer"
            onSelect={(e) => { e.stopPropagation(); onDuplicate?.(objective); }}
          >
            <Copy className="w-3.5 h-3.5" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="text-xs gap-2 focus:bg-[#242424] focus:text-[#e7e7e7] cursor-pointer">
              <Target className="w-3.5 h-3.5" />
              Change Status
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="bg-[#1a1a1a] border-[#2a2a2a] text-[#e7e7e7] rounded-lg">
              {Object.entries(STATUS_META).map(([key, meta]) => {
                const SIcon = STATUS_ICON[key];
                return (
                  <DropdownMenuItem
                    key={key}
                    className={cn(
                      "text-xs gap-2 focus:bg-[#242424] focus:text-[#e7e7e7] cursor-pointer",
                      objective.status === key && "bg-[#242424]"
                    )}
                    onSelect={(e) => { e.stopPropagation(); onChangeStatus?.(objective.id, key); }}
                  >
                    {SIcon && <SIcon className="w-3.5 h-3.5" />}
                    {meta.label}
                    {objective.status === key && (
                      <CheckCircle2 className="w-3 h-3 ml-auto text-blue-400" />
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator className="bg-[#2a2a2a]" />
          <DropdownMenuItem
            variant="destructive"
            className="text-xs gap-2 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
            onSelect={(e) => { e.stopPropagation(); onDelete?.(objective.id); }}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Objective
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="ghost"
        size="icon"
        className="w-7 h-7 text-[#3a3a3a] hover:text-white hover:bg-[#2a2a2a] cursor-pointer shrink-0"
        onClick={(e) => { e.stopPropagation(); onSelect(objective); }}
      >
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

export function ObjectivesScreen() {
  const [selectedObjective, setSelectedObjective] = useState(null);
  const [view, setView] = useState("grid");
  const [objectives, setObjectives] = useState(MOCK_OBJECTIVES);
  const [editObjective, setEditObjective] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleCreateObjective = async (newObj) => {
    setObjectives((prev) => [newObj, ...prev]);
  };

  const handleEditObjective = (objective) => {
    setEditObjective(objective);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async (updated) => {
    setObjectives((prev) =>
      prev.map((o) => (o.id === updated.id ? updated : o))
    );
    setEditObjective(null);
    setEditDialogOpen(false);
  };

  const handleDeleteObjective = (id) => {
    setObjectives((prev) => prev.filter((o) => o.id !== id));
  };

  const handleDuplicateObjective = (objective) => {
    const duplicate = {
      ...objective,
      id: `obj_${Date.now()}`,
      title: `${objective.title} (Copy)`,
      status: "not_started",
      progress: 0,
      keyResults: objective.keyResults.map((kr) => ({
        ...kr,
        progress: 0,
        done: false,
      })),
      goals: [],
    };
    setObjectives((prev) => [duplicate, ...prev]);
  };

  const handleChangeStatus = (id, newStatus) => {
    setObjectives((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              status: newStatus,
              progress:
                newStatus === "completed"
                  ? 100
                  : newStatus === "not_started"
                  ? 0
                  : o.progress,
            }
          : o
      )
    );
  };

  if (selectedObjective) {
    return (
      <ObjectiveKanban
        objective={selectedObjective}
        onBack={() => setSelectedObjective(null)}
      />
    );
  }

  return (
    <MainScreenWrapper>
      <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#e7e7e7]">Objectives</h1>
          <p className="text-[#a3a3a3] mt-1">
            Define high level measurable objectives and track key results across the project.
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
          <NewObjectiveDialog onCreate={handleCreateObjective}>
            <Button className="bg-white text-black hover:bg-[#e7e7e7]">
              <Plus className="w-4 h-4 mr-2" />
              New Objective
            </Button>
          </NewObjectiveDialog>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {objectives.map((objective) => (
            <ObjectiveCard
              key={objective.id}
              objective={objective}
              onSelect={setSelectedObjective}
              onEdit={handleEditObjective}
              onDelete={handleDeleteObjective}
              onDuplicate={handleDuplicateObjective}
              onChangeStatus={handleChangeStatus}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {objectives.map((objective) => (
            <ObjectiveListItem
              key={objective.id}
              objective={objective}
              onSelect={setSelectedObjective}
              onEdit={handleEditObjective}
              onDelete={handleDeleteObjective}
              onDuplicate={handleDuplicateObjective}
              onChangeStatus={handleChangeStatus}
            />
          ))}
        </div>
      )}

      {/* Edit Dialog (controlled) */}
      <NewObjectiveDialog
        editObjective={editObjective}
        onEdit={handleSaveEdit}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setEditObjective(null);
        }}
      />
    </MainScreenWrapper>
  );
}
