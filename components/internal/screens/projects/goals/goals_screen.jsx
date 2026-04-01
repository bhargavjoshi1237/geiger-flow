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
  User,
} from "lucide-react";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { cn } from "@/lib/utils";
import { NewGoalDialog } from "@/components/internal/dilouges/goals/new_goal_dilouge";

const MOCK_GOALS = [
  {
    id: "g_001",
    title: "Improve onboarding conversion rate",
    description: "Increase the percentage of new users who complete onboarding from 40% to 75% within Q2.",
    status: "on_track",
    progress: 62,
    owner: "Amélie",
    targetDate: "2026-06-30",
    keyResults: [
      { label: "Redesign onboarding flow with fewer steps", progress: 100, done: true },
      { label: "Add progress indicators to guide users", progress: 80, done: false },
      { label: "Implement skip-and-return functionality", progress: 45, done: false },
      { label: "A/B test new flow with 500 users", progress: 20, done: false },
    ],
  },
  {
    id: "g_002",
    title: "Achieve 99.9% platform uptime SLA",
    description: "Maintain consistent platform availability and reduce incident response time to under 15 minutes.",
    status: "on_track",
    progress: 95,
    owner: "Alex",
    targetDate: "2026-04-15",
    keyResults: [
      { label: "Set up multi-region failover", progress: 100, done: true },
      { label: "Implement automated health checks", progress: 100, done: true },
      { label: "Reduce MTTR to under 15 minutes", progress: 85, done: false },
    ],
  },
  {
    id: "g_003",
    title: "Launch collaborative editing feature",
    description: "Enable real-time collaborative editing across all document types within the project workspace.",
    status: "at_risk",
    progress: 35,
    owner: "Sam",
    targetDate: "2026-05-01",
    keyResults: [
      { label: "Design conflict resolution protocol", progress: 60, done: false },
      { label: "Build WebSocket sync engine", progress: 40, done: false },
      { label: "Implement cursor presence awareness", progress: 15, done: false },
      { label: "Ship beta to 50 internal users", progress: 0, done: false },
    ],
  },
  {
    id: "g_004",
    title: "Reduce customer support ticket volume",
    description: "Decrease monthly support tickets by 40% through self-service improvements and better documentation.",
    status: "completed",
    progress: 100,
    owner: "You",
    targetDate: "2026-03-31",
    keyResults: [
      { label: "Launch searchable knowledge base", progress: 100, done: true },
      { label: "Add in-app contextual help tooltips", progress: 100, done: true },
      { label: "Automate 60% of common inquiries", progress: 100, done: true },
    ],
  },
  {
    id: "g_005",
    title: "Migrate to new authentication system",
    description: "Transition all users to the new OAuth 2.0 + PKCE authentication flow with zero downtime.",
    status: "not_started",
    progress: 0,
    owner: "Riley",
    targetDate: "2026-06-15",
    keyResults: [
      { label: "Audit current auth dependencies", progress: 0, done: false },
      { label: "Build new auth middleware layer", progress: 0, done: false },
      { label: "Migrate 100% of active sessions", progress: 0, done: false },
    ],
  },
  {
    id: "g_006",
    title: "Increase team sprint velocity by 25%",
    description: "Improve sprint planning accuracy and delivery speed across all project teams.",
    status: "on_track",
    progress: 48,
    owner: "Jordan",
    targetDate: "2026-05-30",
    keyResults: [
      { label: "Implement velocity tracking dashboard", progress: 100, done: true },
      { label: "Reduce sprint scope creep to under 10%", progress: 50, done: false },
      { label: "Achieve 90% sprint commitment accuracy", progress: 30, done: false },
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
    className: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  },
  at_risk: {
    label: "At Risk",
    className: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  },
  completed: {
    label: "Completed",
    className: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  },
};

const STATUS_ICON = {
  not_started: CircleDot,
  on_track: TrendingUp,
  at_risk: AlertTriangle,
  completed: CheckCircle,
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

function GoalCard({ goal, onEdit, onDelete, onDuplicate, onChangeStatus }) {
  const [krsOpen, setKrsOpen] = useState(false);

  const completedKR = goal.keyResults.filter((kr) => kr.done).length;
  const totalKR = goal.keyResults.length;

  const progressBarColor = (() => {
    if (goal.status === "completed") return "[&_[data-slot=progress-indicator]]:bg-blue-400";
    if (goal.status === "at_risk") return "[&_[data-slot=progress-indicator]]:bg-amber-400";
    if (goal.status === "not_started") return "[&_[data-slot=progress-indicator]]:bg-zinc-500";
    return "[&_[data-slot=progress-indicator]]:bg-emerald-400";
  })();

  return (
    <Card className="bg-[#1a1a1a] border-[#2a2a2a] text-[#e7e7e7] hover:border-[#3a3a3a] transition-colors duration-200 rounded-xl py-0 gap-0 group">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-[#e7e7e7] leading-snug group-hover:text-white transition-colors">
                {goal.title}
              </h3>
              <Badge
                className={cn(
                  "border text-[10px] px-2 py-0",
                  STATUS_META[goal.status]?.className
                )}
              >
                {STATUS_META[goal.status]?.label}
              </Badge>
            </div>
            <p className="text-xs text-[#737373] line-clamp-2">
              {goal.description}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 text-[#525252] hover:text-[#a3a3a3] hover:bg-[#242424]"
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
                  onSelect={() => onEdit?.(goal)}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit Goal
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-xs gap-2 focus:bg-[#242424] focus:text-[#e7e7e7] cursor-pointer"
                  onSelect={() => onDuplicate?.(goal)}
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
                            goal.status === key && "bg-[#242424]"
                          )}
                          onSelect={() => onChangeStatus?.(goal.id, key)}
                        >
                          {SIcon && <SIcon className="w-3.5 h-3.5" />}
                          {meta.label}
                          {goal.status === key && (
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
                  onSelect={() => onDelete?.(goal.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Goal
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-[#737373]">
          <span className="inline-flex items-center gap-1">
            <User className="w-3 h-3" />
            {goal.owner}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(goal.targetDate)}
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
              {goal.progress}%
            </span>
          </div>
          <Progress
            value={goal.progress}
            className={cn(
              "h-1.5 bg-[#2a2a2a] rounded-full",
              progressBarColor
            )}
          />
        </div>

        {goal.keyResults && goal.keyResults.length > 0 && (
          <div className="border-t border-[#222] pt-2">
            <button
              type="button"
              onClick={() => setKrsOpen((prev) => !prev)}
              className="flex items-center justify-between w-full gap-2 group/acc cursor-pointer"
            >
              <span className="text-[10px] uppercase tracking-wider text-[#3a3a3a] font-medium">
                Key Results
              </span>
              <ChevronDown
                className={cn(
                  "w-3 h-3 text-[#3a3a3a] transition-transform duration-200",
                  krsOpen && "rotate-180"
                )}
              />
            </button>
            <div
              className={cn(
                "grid transition-all duration-200 ease-in-out",
                krsOpen
                  ? "grid-rows-[1fr] opacity-100 mt-2"
                  : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden space-y-2">
                {goal.keyResults.map((kr, idx) => (
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

function GoalListItem({ goal, onEdit, onDelete, onDuplicate, onChangeStatus }) {
  const completedKR = goal.keyResults.filter((kr) => kr.done).length;
  const totalKR = goal.keyResults.length;

  const progressBarColor = (() => {
    if (goal.status === "completed") return "[&_[data-slot=progress-indicator]]:bg-blue-400";
    if (goal.status === "at_risk") return "[&_[data-slot=progress-indicator]]:bg-amber-400";
    if (goal.status === "not_started") return "[&_[data-slot=progress-indicator]]:bg-zinc-500";
    return "[&_[data-slot=progress-indicator]]:bg-emerald-400";
  })();

  return (
    <div className="flex items-center gap-4 px-4 py-3 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-medium text-[#e7e7e7] group-hover:text-white transition-colors truncate">
            {goal.title}
          </h3>
          <Badge
            className={cn(
              "border text-[10px] px-2 py-0 shrink-0",
              STATUS_META[goal.status]?.className
            )}
          >
            {STATUS_META[goal.status]?.label}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#737373]">
          <span className="inline-flex items-center gap-1">
            <User className="w-3 h-3" />
            {goal.owner}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(goal.targetDate)}
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
          <span className="text-xs text-[#a3a3a3] tabular-nums">{goal.progress}%</span>
        </div>
        <Progress
          value={goal.progress}
          className={cn("h-1 bg-[#2a2a2a] rounded-full", progressBarColor)}
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-[#525252] hover:text-[#a3a3a3] hover:bg-[#242424] shrink-0"
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
            onSelect={() => onEdit?.(goal)}
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit Goal
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-xs gap-2 focus:bg-[#242424] focus:text-[#e7e7e7] cursor-pointer"
            onSelect={() => onDuplicate?.(goal)}
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
                      goal.status === key && "bg-[#242424]"
                    )}
                    onSelect={() => onChangeStatus?.(goal.id, key)}
                  >
                    {SIcon && <SIcon className="w-3.5 h-3.5" />}
                    {meta.label}
                    {goal.status === key && (
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
            onSelect={() => onDelete?.(goal.id)}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Goal
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function GoalsScreen() {
  const [view, setView] = useState("grid");
  const [goals, setGoals] = useState(MOCK_GOALS);
  const [editGoal, setEditGoal] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleCreateGoal = async (newGoal) => {
    setGoals((prev) => [newGoal, ...prev]);
  };

  const handleEditGoal = (goal) => {
    setEditGoal(goal);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async (updated) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === updated.id ? updated : g))
    );
    setEditGoal(null);
    setEditDialogOpen(false);
  };

  const handleDeleteGoal = (id) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  const handleDuplicateGoal = (goal) => {
    const duplicate = {
      ...goal,
      id: `g_${Date.now()}`,
      title: `${goal.title} (Copy)`,
      status: "not_started",
      progress: 0,
      keyResults: goal.keyResults.map((kr) => ({
        ...kr,
        progress: 0,
        done: false,
      })),
    };
    setGoals((prev) => [duplicate, ...prev]);
  };

  const handleChangeStatus = (id, newStatus) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id
          ? {
              ...g,
              status: newStatus,
              progress:
                newStatus === "completed"
                  ? 100
                  : newStatus === "not_started"
                  ? 0
                  : g.progress,
            }
          : g
      )
    );
  };

  return (
    <MainScreenWrapper>
      <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#e7e7e7]">Goals</h1>
          <p className="text-[#a3a3a3] mt-1">
            Define measurable targets & key business goals for this project.
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
          <NewGoalDialog onCreate={handleCreateGoal}>
            <Button className="bg-white text-black hover:bg-[#e7e7e7]">
              <Plus className="w-4 h-4 mr-2" />
              Define New Goal
            </Button>
          </NewGoalDialog>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={handleEditGoal}
              onDelete={handleDeleteGoal}
              onDuplicate={handleDuplicateGoal}
              onChangeStatus={handleChangeStatus}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {goals.map((goal) => (
            <GoalListItem
              key={goal.id}
              goal={goal}
              onEdit={handleEditGoal}
              onDelete={handleDeleteGoal}
              onDuplicate={handleDuplicateGoal}
              onChangeStatus={handleChangeStatus}
            />
          ))}
        </div>
      )}

      <NewGoalDialog
        editGoal={editGoal}
        onEdit={handleSaveEdit}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setEditGoal(null);
        }}
      />
    </MainScreenWrapper>
  );
}