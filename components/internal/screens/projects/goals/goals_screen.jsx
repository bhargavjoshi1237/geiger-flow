"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
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
import { useProject } from "@/context/project-context";
import {
  listGoals,
  createGoal,
  updateGoal,
  softDeleteGoal,
} from "@/features/goals/actions";

const STATUS_META = {
  not_started: {
    label: "Not Started",
    className: "bg-zinc-500/10 text-muted-foreground border-zinc-500/20",
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
    <Card className="bg-surface-subtle border-border text-foreground hover:border-border-strong transition-colors duration-200 rounded-xl py-0 gap-0 group">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-foreground leading-snug group-hover:text-foreground transition-colors">
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
            <p className="text-xs text-text-secondary line-clamp-2">
              {goal.description}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 text-text-tertiary hover:text-muted-foreground hover:bg-surface-active"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-surface-subtle border-border text-foreground rounded-lg w-48"
              >
                <DropdownMenuItem
                  className="text-xs gap-2 focus:bg-surface-active focus:text-foreground cursor-pointer"
                  onSelect={() => onEdit?.(goal)}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit Goal
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-xs gap-2 focus:bg-surface-active focus:text-foreground cursor-pointer"
                  onSelect={() => onDuplicate?.(goal)}
                >
                  <Copy className="w-3.5 h-3.5" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="text-xs gap-2 focus:bg-surface-active focus:text-foreground cursor-pointer">
                    <Target className="w-3.5 h-3.5" />
                    Change Status
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-surface-subtle border-border text-foreground rounded-lg">
                    {Object.entries(STATUS_META).map(([key, meta]) => {
                      const SIcon = STATUS_ICON[key];
                      return (
                        <DropdownMenuItem
                          key={key}
                          className={cn(
                            "text-xs gap-2 focus:bg-surface-active focus:text-foreground cursor-pointer",
                            goal.status === key && "bg-surface-active"
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
                <DropdownMenuSeparator className="bg-surface-hover" />
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

        <div className="flex items-center gap-4 text-xs text-text-secondary">
          <span className="inline-flex items-center gap-1">
            <User className="w-3 h-3" />
            {goal.owner}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(goal.targetDate)}
          </span>
          <span className="ml-auto inline-flex items-center gap-1 text-text-tertiary">
            <Target className="w-3 h-3" />
            {completedKR}/{totalKR} key results
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-text-tertiary font-medium">
              Progress
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {goal.progress}%
            </span>
          </div>
          <Progress
            value={goal.progress}
            className={cn(
              "h-1.5 bg-surface-hover rounded-full",
              progressBarColor
            )}
          />
        </div>

        {goal.keyResults && goal.keyResults.length > 0 && (
          <div className="border-t border-border pt-2">
            <Button
              type="button"
              onClick={() => setKrsOpen((prev) => !prev)}
              className="flex items-center justify-between w-full gap-2 group/acc cursor-pointer"
            >
              <span className="text-[10px] uppercase tracking-wider text-text-tertiary font-medium">
                Key Results
              </span>
              <ChevronDown
                className={cn(
                  "w-3 h-3 text-text-tertiary transition-transform duration-200",
                  krsOpen && "rotate-180"
                )}
              />
            </Button>
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
                      <Circle className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                    )}
                    <span
                      className={cn(
                        "text-xs flex-1 truncate",
                        kr.done ? "text-muted-foreground line-through" : "text-text-secondary"
                      )}
                    >
                      {kr.label}
                    </span>
                    <span className="text-[10px] tabular-nums text-text-tertiary shrink-0">
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
    <div className="flex items-center gap-4 px-4 py-3 rounded-lg bg-surface-subtle border border-border hover:border-border-strong transition-colors group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-medium text-foreground group-hover:text-foreground transition-colors truncate">
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
        <div className="flex items-center gap-3 text-xs text-text-secondary">
          <span className="inline-flex items-center gap-1">
            <User className="w-3 h-3" />
            {goal.owner}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(goal.targetDate)}
          </span>
          <span className="inline-flex items-center gap-1 text-text-tertiary">
            <Target className="w-3 h-3" />
            {completedKR}/{totalKR} KRs
          </span>
        </div>
      </div>

      <div className="w-32 shrink-0 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-text-tertiary">Progress</span>
          <span className="text-xs text-muted-foreground tabular-nums">{goal.progress}%</span>
        </div>
        <Progress
          value={goal.progress}
          className={cn("h-1 bg-surface-hover rounded-full", progressBarColor)}
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-text-tertiary hover:text-muted-foreground hover:bg-surface-active shrink-0"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="bg-surface-subtle border-border text-foreground rounded-lg w-48"
        >
          <DropdownMenuItem
            className="text-xs gap-2 focus:bg-surface-active focus:text-foreground cursor-pointer"
            onSelect={() => onEdit?.(goal)}
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit Goal
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-xs gap-2 focus:bg-surface-active focus:text-foreground cursor-pointer"
            onSelect={() => onDuplicate?.(goal)}
          >
            <Copy className="w-3.5 h-3.5" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="text-xs gap-2 focus:bg-surface-active focus:text-foreground cursor-pointer">
              <Target className="w-3.5 h-3.5" />
              Change Status
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="bg-surface-subtle border-border text-foreground rounded-lg">
              {Object.entries(STATUS_META).map(([key, meta]) => {
                const SIcon = STATUS_ICON[key];
                return (
                  <DropdownMenuItem
                    key={key}
                    className={cn(
                      "text-xs gap-2 focus:bg-surface-active focus:text-foreground cursor-pointer",
                      goal.status === key && "bg-surface-active"
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
          <DropdownMenuSeparator className="bg-surface-hover" />
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
  const { project } = useProject();
  const projectId = project?.id;

  const [view, setView] = useState("grid");
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editGoal, setEditGoal] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const goalColumns = [
    goals.filter((_, index) => index % 2 === 0),
    goals.filter((_, index) => index % 2 === 1),
  ];

  useEffect(() => {
    if (!projectId) {
      return;
    }
    let active = true;
    void Promise.resolve().then(async () => {
      setLoading(true);
      const rows = await listGoals(projectId, { objectiveId: null });
      if (active) {
        setGoals(rows);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [projectId]);

  const handleCreateGoal = async (newGoal) => {
    const created = await createGoal(projectId, { ...newGoal, objectiveId: null });
    if (!created) {
      toast.error("Failed to create goal");
      return;
    }
    setGoals((prev) => [created, ...prev]);
    toast.success("Goal created");
  };

  const handleEditGoal = (goal) => {
    setEditGoal(goal);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async (updated) => {
    const saved = await updateGoal(updated.id, updated);
    if (!saved) {
      toast.error("Failed to update goal");
      return;
    }
    setGoals((prev) => prev.map((g) => (g.id === saved.id ? saved : g)));
    setEditGoal(null);
    setEditDialogOpen(false);
    toast.success("Goal updated");
  };

  const handleDeleteGoal = async (id) => {
    const previous = goals;
    setGoals((prev) => prev.filter((g) => g.id !== id));
    const ok = await softDeleteGoal(id);
    if (!ok) {
      setGoals(previous);
      toast.error("Failed to delete goal");
      return;
    }
    toast.success("Goal deleted");
  };

  const handleDuplicateGoal = async (goal) => {
    const created = await createGoal(projectId, {
      ...goal,
      objectiveId: null,
      title: `${goal.title} (Copy)`,
      status: "not_started",
      progress: 0,
      keyResults: goal.keyResults.map((kr) => ({ ...kr, progress: 0, done: false })),
    });
    if (!created) {
      toast.error("Failed to duplicate goal");
      return;
    }
    setGoals((prev) => [created, ...prev]);
    toast.success("Goal duplicated");
  };

  const handleChangeStatus = async (id, newStatus) => {
    const goal = goals.find((g) => g.id === id);
    if (!goal) {
      return;
    }
    const progress =
      newStatus === "completed" ? 100 : newStatus === "not_started" ? 0 : goal.progress;
    const saved = await updateGoal(id, { status: newStatus, progress });
    if (!saved) {
      toast.error("Failed to update status");
      return;
    }
    setGoals((prev) => prev.map((g) => (g.id === id ? saved : g)));
  };

  return (
    <MainScreenWrapper>
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Goals</h1>
          <p className="text-muted-foreground mt-1">
            Define measurable targets & key business goals for this project. You can have max 6 goals at a time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-surface-subtle border border-border rounded-lg p-0.5">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "w-8 h-7 rounded-md",
                view === "grid"
                  ? "bg-surface-hover text-foreground"
                  : "text-text-tertiary hover:text-muted-foreground hover:bg-transparent"
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
                  ? "bg-surface-hover text-foreground"
                  : "text-text-tertiary hover:text-muted-foreground hover:bg-transparent"
              )}
              onClick={() => setView("list")}
            >
              <List className="w-3.5 h-3.5" />
            </Button>
          </div>
          <NewGoalDialog onCreate={handleCreateGoal}>
            <Button className="bg-primary text-primary-foreground hover:bg-primary">
              <Plus className="w-4 h-4 mr-2" />
              Define New Goal
            </Button>
          </NewGoalDialog>
        </div>
      </div>

      {loading ? (
        <div className="h-[260px] flex flex-col items-center justify-center gap-3 text-text-tertiary">
          <div className="w-5 h-5 rounded-full border-2 border-border-strong border-t-foreground animate-spin" />
          <span className="text-sm">Loading goals...</span>
        </div>
      ) : goals.length === 0 ? (
        <div className="h-[260px] flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-subtle text-text-secondary">
          <Target className="w-10 h-10 opacity-30" />
          <p className="mt-3 text-sm">No goals yet.</p>
          <p className="text-xs text-text-tertiary mt-1">
            Define your first measurable goal to get started.
          </p>
        </div>
      ) : view === "grid" ? (
        <>
        <div className="space-y-4 lg:hidden">
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
        <div className="hidden lg:grid lg:grid-cols-2 gap-4 items-start">
          {goalColumns.map((columnGoals, columnIndex) => (
            <div key={columnIndex} className="space-y-4">
              {columnGoals.map((goal) => (
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
          ))}
        </div>
        </>
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
