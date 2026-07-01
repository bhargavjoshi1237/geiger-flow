"use client";

import React, { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@geiger/ui";
import { Input } from "@geiger/ui";
import { Badge } from "@geiger/ui";
import { Progress } from "@geiger/ui";
import { Card, CardContent } from "@geiger/ui";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@geiger/ui";
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
import { NewGoalDialog } from "@/components/internal/dilouges/goals/new_goal_dilouge";
import { cn } from "@/lib/utils";
import { useProject } from "@/context/project-context";
import { DEFAULT_OBJECTIVE_COLUMNS } from "@/features/objectives/constants";
import { updateObjective } from "@/features/objectives/actions";
import {
  listGoals,
  createGoal,
  updateGoal,
  softDeleteGoal,
} from "@/features/goals/actions";

const STATUS_CONFIG = DEFAULT_OBJECTIVE_COLUMNS;

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

function createColumnKey(label, columns) {
  const base = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  const seed = base || "custom_column";
  const usedKeys = new Set(columns.map((col) => col.key));
  let key = seed;
  let index = 2;

  while (usedKeys.has(key)) {
    key = `${seed}_${index}`;
    index += 1;
  }

  return key;
}

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
          "bg-surface-subtle border-border text-foreground rounded-xl py-0 gap-0 cursor-grab active:cursor-grabbing",
          isDragOverlay && "shadow-2xl shadow-black/40 border-border-strong"
        )}
      >
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start gap-2">
            {!isDragOverlay && (
              <Button
                className="mt-0.5 text-text-tertiary hover:text-text-tertiary cursor-grab active:cursor-grabbing shrink-0"
                {...listeners}
              >
                <GripVertical className="w-3.5 h-3.5" />
              </Button>
            )}
            <div className="flex-1 min-w-0 space-y-1.5">
              <h4 className="text-sm font-medium text-foreground leading-snug">
                {goal.title}
              </h4>
              <p className="text-[11px] text-text-tertiary line-clamp-2">
                {goal.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] justify-between text-text-tertiary">
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
              <span className="text-[10px] uppercase tracking-wider text-text-tertiary font-medium">
                Progress
              </span>
              <span className="text-[11px] text-text-secondary tabular-nums">{goal.progress}%</span>
            </div>
            <Progress
              value={goal.progress}
              className={cn(
                "h-1 bg-surface-hover rounded-full",
                goal.status === "completed" && "[&_[data-slot=progress-indicator]]:bg-blue-400",
                goal.status === "at_risk" && "[&_[data-slot=progress-indicator]]:bg-amber-400",
                goal.status === "not_started" && "[&_[data-slot=progress-indicator]]:bg-zinc-500",
                goal.status === "on_track" && "[&_[data-slot=progress-indicator]]:bg-emerald-400"
              )}
            />
          </div>

          {hasKeyResults && (
            <div className="border-t border-border pt-2">
              <Button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setGoalsOpen((prev) => !prev);
                }}
                className="flex items-center justify-between w-full gap-2 group cursor-pointer"
              >
                <span className="text-[10px] uppercase tracking-wider text-text-tertiary font-medium">
                  Goals
                </span>
                <ChevronDown
                  className={cn(
                    "w-3 h-3 text-text-tertiary transition-transform duration-200",
                    goalsOpen && "rotate-180"
                  )}
                />
              </Button>
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
                        <Circle className="w-3 h-3 text-text-tertiary shrink-0" />
                      )}
                      <span
                        className={cn(
                          "text-[11px] flex-1 truncate",
                          kr.done ? "text-text-secondary line-through" : "text-text-tertiary"
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

  if (isDragOverlay) {
    return <div style={style}>{cardElement}</div>;
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {cardElement}
        </ContextMenuTrigger>
        <ContextMenuContent className="bg-surface-subtle border-border text-foreground rounded-lg">
          <ContextMenuItem
            className="text-xs gap-2 focus:bg-surface-active focus:text-foreground"
            onSelect={() => onEdit?.(goal)}
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit Goal
          </ContextMenuItem>
          <ContextMenuItem
            className="text-xs gap-2 focus:bg-surface-active focus:text-foreground"
            onSelect={() => onDuplicate?.(goal)}
          >
            <Copy className="w-3.5 h-3.5" />
            Duplicate
          </ContextMenuItem>
          <ContextMenuSeparator className="bg-surface-hover" />
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

function KanbanColumn({ column, goals, onEdit, onDelete, onDuplicate, onAddGoal }) {
  const statusKey = column.key;
  const Icon = COLUMN_ICON[statusKey] || Circle;
  const { setNodeRef, isOver } = useDroppable({ id: statusKey });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col bg-background border border-border border-t-2 rounded-xl min-w-[280px] flex-1 min-h-0 transition-colors",
        COLUMN_ACCENT[statusKey] || "border-t-border-strong",
        isOver && "bg-background border-border-strong"
      )}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 text-text-secondary" />
          <span className="text-xs font-medium text-muted-foreground">{column.label}</span>
          <span className="text-[10px] text-text-tertiary bg-surface-subtle rounded-full px-1.5 py-0.5 tabular-nums">
            {goals.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onAddGoal?.(statusKey)}
          className="w-6 h-6 text-text-tertiary hover:text-muted-foreground hover:bg-surface-subtle"
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
            <div className="flex items-center justify-center h-24 text-[11px] text-text-tertiary border border-dashed border-border rounded-lg">
              Drop goals here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

function AddColumnCard({ onAddColumn }) {
  const [columnName, setColumnName] = useState("");
  const trimmedName = columnName.trim();

  function handleSubmit(event) {
    event.preventDefault();
    if (!trimmedName) return;
    onAddColumn(trimmedName);
    setColumnName("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 bg-background border border-dashed border-border rounded-xl min-w-[280px] flex-1 p-4 self-stretch"
    >
      <div className="flex items-center gap-2 text-text-secondary">
        <Plus className="w-3.5 h-3.5" />
        <span className="text-xs font-medium">New Column</span>
      </div>
      <Input
        value={columnName}
        onChange={(event) => setColumnName(event.target.value)}
        placeholder="Column name"
        className="bg-surface-subtle border-border text-foreground placeholder:text-text-tertiary focus-visible:ring-1 focus-visible:ring-ring h-9 text-sm"
      />
      <Button
        type="submit"
        disabled={!trimmedName}
        className="h-8 bg-primary text-primary-foreground hover:bg-primary disabled:bg-surface-active disabled:text-text-tertiary"
      >
        <Plus className="w-3.5 h-3.5 mr-2" />
        Add Column
      </Button>
    </form>
  );
}

export function ObjectiveKanban({ objective, onBack }) {
  const { project } = useProject();
  const projectId = project?.id;

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState(
    objective.columns?.length ? objective.columns : STATUS_CONFIG
  );

  const [activeId, setActiveId] = useState(null);
  const [editGoal, setEditGoal] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogStatus, setAddDialogStatus] = useState(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  useEffect(() => {
    if (!projectId) {
      return;
    }
    let active = true;
    void Promise.resolve().then(async () => {
      setLoading(true);
      const rows = await listGoals(projectId, { objectiveId: objective.id });
      if (active) {
        setGoals(rows);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [projectId, objective.id]);

  function handleEditGoal(goal) {
    setEditGoal(goal);
    setEditDialogOpen(true);
  }

  async function handleSaveEditGoal(updated) {
    const saved = await updateGoal(updated.id, updated);
    if (!saved) {
      toast.error("Failed to update goal");
      return;
    }
    setGoals((prev) => prev.map((g) => (g.id === saved.id ? saved : g)));
    setEditGoal(null);
    setEditDialogOpen(false);
    toast.success("Goal updated");
  }

  async function handleDeleteGoal(goalId) {
    const previous = goals;
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
    const ok = await softDeleteGoal(goalId);
    if (!ok) {
      setGoals(previous);
      toast.error("Failed to delete goal");
      return;
    }
    toast.success("Goal deleted");
  }

  async function handleDuplicateGoal(goal) {
    const created = await createGoal(projectId, {
      ...goal,
      objectiveId: objective.id,
      title: `${goal.title} (Copy)`,
    });
    if (!created) {
      toast.error("Failed to duplicate goal");
      return;
    }
    setGoals((prev) => [...prev, created]);
    toast.success("Goal duplicated");
  }

  function handleAddGoal(statusKey) {
    setAddDialogStatus(statusKey);
    setAddDialogOpen(true);
  }

  async function handleCreateGoal(newGoal) {
    const status = addDialogStatus || newGoal.status;
    const position = goals.filter((g) => g.status === status).length;
    const created = await createGoal(projectId, {
      ...newGoal,
      objectiveId: objective.id,
      status,
      position,
    });
    setAddDialogOpen(false);
    setAddDialogStatus(null);
    if (!created) {
      toast.error("Failed to create goal");
      return;
    }
    setGoals((prev) => [...prev, created]);
    toast.success("Goal created");
  }

  function handleAddColumn(label) {
    const next = [
      ...columns,
      { key: createColumnKey(label, columns), label, color: "custom" },
    ];
    setColumns(next);
    void updateObjective(objective.id, { columns: next });
  }

  const goalsByColumn = useMemo(() => {
    const grouped = {};
    columns.forEach((col) => {
      grouped[col.key] = [];
    });
    goals.forEach((g) => {
      if (!grouped[g.status]) {
        grouped[g.status] = [];
      }
      grouped[g.status].push(g);
    });
    return grouped;
  }, [columns, goals]);

  const statusOptions = useMemo(
    () => columns.map((col) => ({ value: col.key, label: col.label })),
    [columns]
  );

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
    const overCol = columns.some((s) => s.key === over.id)
      ? over.id
      : findColumnForGoal(over.id);

    if (!activeCol || !overCol || activeCol === overCol) return;

    setGoals((prev) =>
      prev.map((g) =>
        g.id === active.id ? { ...g, status: overCol } : g
      )
    );
  }

  // Persists every goal in `colKey` with its new status + position so both
  // cross-column moves and within-column reorders survive a refresh.
  async function persistColumn(colKey, colGoals) {
    const results = await Promise.all(
      colGoals.map((g, index) => updateGoal(g.id, { status: colKey, position: index }))
    );
    if (results.some((r) => !r)) {
      toast.error("Failed to save goal order");
    }
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeCol = findColumnForGoal(active.id);
    const overCol = columns.some((s) => s.key === over.id)
      ? over.id
      : findColumnForGoal(over.id);

    if (!activeCol) return;

    // handleDragOver may have already moved the goal across columns optimistically;
    // `targetCol` is wherever it should ultimately land.
    const targetCol = overCol || activeCol;

    let working = goals;
    if (working.find((g) => g.id === active.id)?.status !== targetCol) {
      working = working.map((g) =>
        g.id === active.id ? { ...g, status: targetCol } : g
      );
    }

    const colGoals = working.filter((g) => g.status === targetCol);
    const others = working.filter((g) => g.status !== targetCol);
    const fromIndex = colGoals.findIndex((g) => g.id === active.id);
    let toIndex = colGoals.findIndex((g) => g.id === over.id);
    if (toIndex === -1) toIndex = colGoals.length - 1;

    if (fromIndex !== -1 && fromIndex !== toIndex) {
      const [moved] = colGoals.splice(fromIndex, 1);
      colGoals.splice(toIndex, 0, moved);
    }

    const repositioned = colGoals.map((g, index) => ({ ...g, position: index }));
    setGoals([...others, ...repositioned]);
    void persistColumn(targetCol, repositioned);
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
        <div className="flex items-start justify-between border-b border-border pb-5 shrink-0">
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="shrink-0 w-8 h-8 text-text-tertiary hover:text-muted-foreground hover:bg-surface-active"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap justify-between">
                  <h1 className="text-2xl font-bold text-foreground leading-tight">
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
                <p className="text-sm text-text-secondary mt-1">
                  {objective.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 ml-11 justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-text-tertiary font-medium">
                  Progress
                </span>
                <Progress
                  value={objective.progress}
                  className={cn("h-1.5 w-28 bg-surface-hover rounded-full", progressBarColor)}
                />
                <span className="text-xs text-text-secondary tabular-nums">
                  {objective.progress}%
                </span>
              </div>
              <div className="flex items-center gap-6">
                <span className="inline-flex items-center gap-1 text-xs text-text-tertiary">
                <Calendar className="w-3 h-3" />
                {dateFormatter.format(new Date(objective.startDate))} —{" "}
                {dateFormatter.format(new Date(objective.targetDate))}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-text-tertiary">
                <Target className="w-3 h-3" />
                {completedKRs}/{totalKRs} key results
              </span>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center gap-3 text-text-tertiary">
            <div className="w-5 h-5 rounded-full border-2 border-border-strong border-t-foreground animate-spin" />
            <span className="text-sm">Loading goals...</span>
          </div>
        ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 flex-1 overflow-x-auto py-4 min-h-0 items-stretch">
            {columns.map((col) => (
              <KanbanColumn
                key={col.key}
                column={col}
                goals={goalsByColumn[col.key] || []}
                onEdit={handleEditGoal}
                onDelete={handleDeleteGoal}
                onDuplicate={handleDuplicateGoal}
                onAddGoal={handleAddGoal}
              />
            ))}
            <AddColumnCard onAddColumn={handleAddColumn} />
          </div>

          <DragOverlay>
            {activeGoal ? (
              <div className="w-[280px]">
                <GoalCard goal={activeGoal} isDragOverlay />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
        )}
      </div>

      <NewGoalDialog
        editGoal={editGoal}
        onEdit={handleSaveEditGoal}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setEditGoal(null);
        }}
        statusOptions={statusOptions}
      />

      <NewGoalDialog
        onCreate={handleCreateGoal}
        open={addDialogOpen}
        onOpenChange={(open) => {
          setAddDialogOpen(open);
          if (!open) setAddDialogStatus(null);
        }}
        statusOptions={statusOptions}
      />
    </MainScreenWrapper>
  );
}
