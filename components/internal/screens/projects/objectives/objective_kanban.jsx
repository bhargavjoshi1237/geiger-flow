"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  ArrowLeft,
  GripVertical,
  Target,
  Calendar,
  Circle,
  CheckCircle2,
  ChevronDown,
  MoreHorizontal,
  Plus,
  AlertTriangle,
  TrendingUp,
  User,
  Pencil,
  Trash2,
  Copy,
} from "lucide-react";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = [
  { key: "not_started", label: "Not Started", color: "zinc" },
  { key: "on_track", label: "On Track", color: "emerald" },
  { key: "at_risk", label: "At Risk", color: "amber" },
  { key: "completed", label: "Completed", color: "blue" },
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

const COLUMN_ACCENT = {
  not_started: "border-t-zinc-500",
  on_track: "border-t-emerald-500",
  at_risk: "border-t-amber-500",
  completed: "border-t-blue-400",
};

const COLUMN_ICON = {
  not_started: Circle,
  on_track: TrendingUp,
  at_risk: AlertTriangle,
  completed: CheckCircle2,
};

function GoalCard({ goal, isDragOverlay, onEdit, onDelete, onDuplicate }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: goal.id, disabled: isDragOverlay });

  const [goalsOpen, setGoalsOpen] = useState(false);

  const style = isDragOverlay
    ? {}
    : {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      };

  const completedKR = goal.keyResults.filter((kr) => kr.done).length;
  const totalKR = goal.keyResults.length;
  const hasKeyResults = goal.keyResults && goal.keyResults.length > 0;

  const cardElement = (
    <Card
        className={cn(
          "bg-[#1a1a1a] border-[#2a2a2a] text-[#e7e7e7] rounded-xl py-0 gap-0 cursor-grab active:cursor-grabbing",
          isDragOverlay && "shadow-2xl shadow-black/40 border-[#3a3a3a]"
        )}
      >
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start gap-2">
            {!isDragOverlay && (
              <button
                className="mt-0.5 text-[#3a3a3a] hover:text-[#525252] cursor-grab active:cursor-grabbing shrink-0"
                {...listeners}
              >
                <GripVertical className="w-3.5 h-3.5" />
              </button>
            )}
            <div className="flex-1 min-w-0 space-y-1.5">
              <h4 className="text-sm font-medium text-[#e7e7e7] leading-snug">
                {goal.title}
              </h4>
              <p className="text-[11px] text-[#525252] line-clamp-2">
                {goal.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] justify-between text-[#525252]">
            <span className="inline-flex items-center gap-1">
              <User className="w-3 h-3" />
              {goal.owner}
            </span>
            <span className="inline-flex items-center gap-1">
              <Target className="w-3 h-3" />
              {completedKR}/{totalKR} KRs
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-[#3a3a3a] font-medium">
                Progress
              </span>
              <span className="text-[11px] text-[#737373] tabular-nums">{goal.progress}%</span>
            </div>
            <Progress
              value={goal.progress}
              className={cn(
                "h-1 bg-[#2a2a2a] rounded-full",
                goal.status === "completed" && "[&_[data-slot=progress-indicator]]:bg-blue-400",
                goal.status === "at_risk" && "[&_[data-slot=progress-indicator]]:bg-amber-400",
                goal.status === "not_started" && "[&_[data-slot=progress-indicator]]:bg-zinc-500",
                goal.status === "on_track" && "[&_[data-slot=progress-indicator]]:bg-emerald-400"
              )}
            />
          </div>

          {hasKeyResults && (
            <div className="border-t border-[#222] pt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setGoalsOpen((prev) => !prev);
                }}
                className="flex items-center justify-between w-full gap-2 group cursor-pointer"
              >
                <span className="text-[10px] uppercase tracking-wider text-[#3a3a3a] font-medium">
                  Goals
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
                    ? "grid-rows-[1fr] opacity-100 mt-1.5"
                    : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden space-y-1.5">
                  {goal.keyResults.map((kr, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      {kr.done ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-3 h-3 text-[#3a3a3a] shrink-0" />
                      )}
                      <span
                        className={cn(
                          "text-[11px] flex-1 truncate",
                          kr.done ? "text-[#737373] line-through" : "text-[#525252]"
                        )}
                      >
                        {kr.label}
                      </span>
                      <span className="text-[10px] tabular-nums text-[#3a3a3a] shrink-0">
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

  if (isDragOverlay) {
    return <div style={style}>{cardElement}</div>;
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {cardElement}
        </ContextMenuTrigger>
        <ContextMenuContent className="bg-[#1a1a1a] border-[#2a2a2a] text-[#e7e7e7] rounded-lg">
          <ContextMenuItem
            className="text-xs gap-2 focus:bg-[#242424] focus:text-[#e7e7e7]"
            onSelect={() => onEdit?.(goal)}
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit Goal
          </ContextMenuItem>
          <ContextMenuItem
            className="text-xs gap-2 focus:bg-[#242424] focus:text-[#e7e7e7]"
            onSelect={() => onDuplicate?.(goal)}
          >
            <Copy className="w-3.5 h-3.5" />
            Duplicate
          </ContextMenuItem>
          <ContextMenuSeparator className="bg-[#2a2a2a]" />
          <ContextMenuItem
            variant="destructive"
            className="text-xs gap-2 focus:bg-red-500/10 focus:text-red-400"
            onSelect={() => onDelete?.(goal.id)}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Goal
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}

function KanbanColumn({ statusKey, goals, objective, onEdit, onDelete, onDuplicate, onAddGoal }) {
  const config = STATUS_CONFIG.find((s) => s.key === statusKey);
  const Icon = COLUMN_ICON[statusKey];

  return (
    <div
      className={cn(
        "flex flex-col bg-[#131313] border border-[#2a2a2a] rounded-xl min-w-[280px] flex-1 min-h-0"
      )}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#222]">
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 text-[#737373]" />
          <span className="text-xs font-medium text-[#a3a3a3]">{config?.label}</span>
          <span className="text-[10px] text-[#3a3a3a] bg-[#1a1a1a] rounded-full px-1.5 py-0.5 tabular-nums">
            {goals.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onAddGoal?.(statusKey)}
          className="w-6 h-6 text-[#3a3a3a] hover:text-[#a3a3a3] hover:bg-[#1a1a1a]"
        >
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>

      <SortableContext items={goals.map((g) => g.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 p-3 space-y-3 overflow-y-auto min-h-[80px]">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={onEdit}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
            />
          ))}
          {goals.length === 0 && (
            <div className="flex items-center justify-center h-24 text-[11px] text-[#3a3a3a] border border-dashed border-[#222] rounded-lg">
              Drop goals here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export function ObjectiveKanban({ objective, onBack }) {
  const [goals, setGoals] = useState(
    (objective.goals || []).map((g) => ({ ...g }))
  );

  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  function handleEditGoal(goal) {
    const newTitle = window.prompt("Edit goal title:", goal.title);
    if (newTitle === null || newTitle.trim() === "") return;
    setGoals((prev) =>
      prev.map((g) => g.id === goal.id ? { ...g, title: newTitle.trim() } : g)
    );
  }

  function handleDeleteGoal(goalId) {
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  }

  function handleDuplicateGoal(goal) {
    const duplicate = {
      ...goal,
      id: `${goal.id}-copy-${Date.now()}`,
      title: `${goal.title} (Copy)`,
    };
    setGoals((prev) => [...prev, duplicate]);
  }

  function handleAddGoal(statusKey) {
    const title = window.prompt("New goal title:");
    if (title === null || title.trim() === "") return;
    const newGoal = {
      id: `goal-${Date.now()}`,
      title: title.trim(),
      description: "",
      status: statusKey,
      owner: "You",
      progress: 0,
      keyResults: [],
    };
    setGoals((prev) => [...prev, newGoal]);
  }

  const goalsByColumn = useMemo(() => {
    const grouped = {};
    STATUS_CONFIG.forEach((col) => {
      grouped[col.key] = [];
    });
    goals.forEach((g) => {
      if (!grouped[g.status]) {
        grouped[g.status] = [];
      }
      grouped[g.status].push(g);
    });
    return grouped;
  }, [goals]);

  const activeGoal = useMemo(
    () => goals.find((g) => g.id === activeId),
    [goals, activeId]
  );

  function findColumnForGoal(goalId) {
    for (const [colKey, colGoals] of Object.entries(goalsByColumn)) {
      if (colGoals.some((g) => g.id === goalId)) {
        return colKey;
      }
    }
    return null;
  }

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  function handleDragOver(event) {
    const { active, over } = event;
    if (!over) return;

    const activeCol = findColumnForGoal(active.id);
    let overCol = findColumnForGoal(over.id);

    if (!overCol && STATUS_CONFIG.some((s) => s.key === over.id)) {
      overCol = over.id;
    }

    if (!activeCol || !overCol || activeCol === overCol) return;

    setGoals((prev) =>
      prev.map((g) =>
        g.id === active.id ? { ...g, status: overCol } : g
      )
    );
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeCol = findColumnForGoal(active.id);
    let overCol = findColumnForGoal(over.id);

    if (!overCol && STATUS_CONFIG.some((s) => s.key === over.id)) {
      overCol = over.id;
    }

    if (overCol && activeCol !== overCol) {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === active.id ? { ...g, status: overCol } : g
        )
      );
      return;
    }

    if (activeCol === overCol) {
      const columnGoals = goals.filter((g) => g.status === activeCol);
      const oldIndex = columnGoals.findIndex((g) => g.id === active.id);
      const overIndex = columnGoals.findIndex((g) => g.id === over.id);

      if (oldIndex !== -1 && overIndex !== -1 && oldIndex !== overIndex) {
        setGoals((prev) => {
          const updated = [...prev];
          const movedGoal = updated.find((g) => g.id === active.id);
          const otherGoals = updated.filter((g) => g.id !== active.id);
          const sameColOthers = otherGoals.filter((g) => g.status === activeCol);
          const diffColGoals = otherGoals.filter((g) => g.status !== activeCol);

          sameColOthers.splice(overIndex, 0, movedGoal);
          return [...diffColGoals, ...sameColOthers];
        });
      }
    }
  }

  const dateFormatter = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const completedKRs = objective.keyResults.filter((kr) => kr.done).length;
  const totalKRs = objective.keyResults.length;

  const progressBarColor = (() => {
    if (objective.status === "completed") return "[&_[data-slot=progress-indicator]]:bg-blue-400";
    if (objective.status === "at_risk") return "[&_[data-slot=progress-indicator]]:bg-amber-400";
    if (objective.status === "not_started") return "[&_[data-slot=progress-indicator]]:bg-zinc-500";
    return "[&_[data-slot=progress-indicator]]:bg-emerald-400";
  })();

  return (
    <MainScreenWrapper>
      <div className="flex flex-col h-[calc(90dvh)]">
        <div className="flex items-start justify-between border-b border-[#2a2a2a] pb-5 shrink-0">
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="shrink-0 w-8 h-8 text-[#525252] hover:text-[#a3a3a3] hover:bg-[#242424]"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap justify-between">
                  <h1 className="text-2xl font-bold text-[#e7e7e7] leading-tight">
                    {objective.title}
                  </h1>
                  <Badge
                    className={cn(
                      "border text-[10px] px-2 py-0",
                      STATUS_META[objective.status]?.className
                    )}
                  >
                    {STATUS_META[objective.status]?.label}
                  </Badge>
                </div>
                <p className="text-sm text-[#737373] mt-1">
                  {objective.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 ml-11 justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-[#3a3a3a] font-medium">
                  Progress
                </span>
                <Progress
                  value={objective.progress}
                  className={cn("h-1.5 w-28 bg-[#2a2a2a] rounded-full", progressBarColor)}
                />
                <span className="text-xs text-[#737373] tabular-nums">
                  {objective.progress}%
                </span>
              </div>
              <div className="flex items-center gap-6">
                <span className="inline-flex items-center gap-1 text-xs text-[#525252]">
                <Calendar className="w-3 h-3" />
                {dateFormatter.format(new Date(objective.startDate))} —{" "}
                {dateFormatter.format(new Date(objective.targetDate))}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-[#525252]">
                <Target className="w-3 h-3" />
                {completedKRs}/{totalKRs} key results
              </span>
              </div>
            </div>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 flex-1 overflow-x-auto py-4 min-h-0 items-stretch">
            {STATUS_CONFIG.map((col) => (
              <KanbanColumn
                key={col.key}
                statusKey={col.key}
                goals={goalsByColumn[col.key] || []}
                objective={objective}
                onEdit={handleEditGoal}
                onDelete={handleDeleteGoal}
                onDuplicate={handleDuplicateGoal}
                onAddGoal={handleAddGoal}
              />
            ))}
          </div>

          <DragOverlay>
            {activeGoal ? (
              <div className="w-[280px]">
                <GoalCard goal={activeGoal} isDragOverlay />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </MainScreenWrapper>
  );
}
