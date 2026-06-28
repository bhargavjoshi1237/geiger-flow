"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { SearchBar } from "@/components/ui/search-bar";
import { cn } from "@/lib/utils";
import { useProject } from "@/context/project-context";
import {
  MILESTONE_STATUS_META,
  TASK_STATUS_META,
  STATUS_FILTERS,
  getMilestoneMetrics,
} from "@/features/milestones/constants";
import {
  listMilestones,
  createMilestone,
  updateMilestone,
  softDeleteMilestone,
} from "@/features/milestones/actions";
import { NewMilestoneDialog } from "@/components/internal/dilouges/milestones/new_milestone_dilouge";

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

function MilestoneMenu({ milestone, onEdit, onDelete }) {
  return (
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
        className="bg-surface-subtle border-border text-foreground rounded-lg w-44"
      >
        <DropdownMenuItem
          className="text-xs gap-2 focus:bg-surface-active focus:text-foreground cursor-pointer"
          onSelect={() => onEdit?.(milestone)}
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit Milestone
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-surface-hover" />
        <DropdownMenuItem
          variant="destructive"
          className="text-xs gap-2 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
          onSelect={() => onDelete?.(milestone.id)}
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete Milestone
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MilestoneCard({ milestone, onToggleTask, onEdit, onDelete }) {
  const statusMeta = MILESTONE_STATUS_META[milestone.metrics.status];

  return (
    <Card className="bg-surface-subtle border-border text-foreground hover:border-border-strong transition-colors duration-200 rounded-xl py-0 gap-0 flex flex-col">
      <CardContent className="p-5 space-y-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <h3 className="text-sm font-semibold text-foreground leading-snug">
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
            <p className="text-xs text-text-secondary line-clamp-2">{milestone.description}</p>
          </div>
          <MilestoneMenu milestone={milestone} onEdit={onEdit} onDelete={onDelete} />
        </div>

        <div className="flex items-center gap-3 text-xs text-text-secondary flex-wrap">
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
          <span className="ml-auto text-text-tertiary tabular-nums">
            {milestone.metrics.doneTasks}/{milestone.metrics.totalTasks} complete
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-text-tertiary font-medium">
              Completion
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">{milestone.metrics.progress}%</span>
          </div>
          <Progress
            value={milestone.metrics.progress}
            className={cn("h-1.5 bg-surface-hover rounded-full", statusMeta.progressClass)}
          />
        </div>

        <div className="border-t border-border pt-2 space-y-1">
          {milestone.tasks.map((task) => {
            const taskMeta = TASK_STATUS_META[task.status] || TASK_STATUS_META.todo;
            const isDone = task.status === "done";

            return (
              <Button
                key={task.id}
                type="button"
                onClick={() => onToggleTask(milestone.id, task.id)}
                className="w-full rounded-lg px-2 py-2 flex items-center gap-2.5 text-left hover:bg-surface-card transition-colors"
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : task.status === "blocked" ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-red-300 shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-xs truncate",
                      isDone ? "text-muted-foreground line-through" : "text-foreground"
                    )}
                  >
                    {task.title}
                  </p>
                  <p className="text-[11px] text-text-tertiary">{task.assignee}</p>
                </div>
                <Badge className={cn("border text-[10px] px-2 py-0 shrink-0", taskMeta.className)}>
                  {taskMeta.label}
                </Badge>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function MilestoneListItem({ milestone, onToggleTask, onEdit, onDelete }) {
  const statusMeta = MILESTONE_STATUS_META[milestone.metrics.status];

  return (
    <div className="rounded-xl bg-surface-subtle border border-border px-4 py-4 hover:border-border-strong transition-colors">
      <div className="flex flex-col xl:flex-row xl:items-center gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-sm font-semibold text-foreground truncate">{milestone.title}</h3>
            <Badge className={cn("border text-[10px] px-2 py-0", statusMeta.className)}>
              {statusMeta.label}
            </Badge>
            {milestone.metrics.overdue ? (
              <Badge className="border text-[10px] px-2 py-0 bg-red-500/10 text-red-300 border-red-500/20">
                Overdue
              </Badge>
            ) : null}
          </div>
          <p className="text-xs text-text-secondary line-clamp-1">{milestone.description}</p>
          <div className="mt-2 flex items-center gap-3 text-xs text-text-secondary flex-wrap">
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(milestone.targetDate)}
            </span>
            <span className="inline-flex items-center gap-1">
              <ListTodo className="w-3 h-3" />
              {milestone.metrics.totalTasks} tasks
            </span>
            <span className="text-text-tertiary">Owner: {milestone.owner}</span>
          </div>
        </div>

        <div className="w-full xl:w-[260px] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-text-tertiary font-medium">
              Completion
            </span>
            <span className="text-xs text-muted-foreground tabular-nums">
              {milestone.metrics.doneTasks}/{milestone.metrics.totalTasks}
            </span>
          </div>
          <Progress
            value={milestone.metrics.progress}
            className={cn("h-1.5 bg-surface-hover rounded-full", statusMeta.progressClass)}
          />
        </div>

        <MilestoneMenu milestone={milestone} onEdit={onEdit} onDelete={onDelete} />
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-1.5">
        {milestone.tasks.map((task) => {
          const isDone = task.status === "done";
          return (
            <Button
              key={task.id}
              type="button"
              onClick={() => onToggleTask(milestone.id, task.id)}
              className="rounded-lg px-2.5 py-2 bg-surface-card border border-border hover:border-border-strong text-left flex items-center gap-2 transition-colors"
            >
              {isDone ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
              )}
              <span className={cn("text-xs truncate", isDone ? "text-muted-foreground line-through" : "text-foreground")}>{task.title}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

export function MilestonesScreen() {
  const { project } = useProject();
  const projectId = project?.id;

  const [view, setView] = useState("grid");
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMilestone, setEditMilestone] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    if (!projectId) {
      return;
    }
    let active = true;
    void Promise.resolve().then(async () => {
      setLoading(true);
      const rows = await listMilestones(projectId);
      if (active) {
        setMilestones(rows);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [projectId]);

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

  const handleToggleTask = async (milestoneId, taskId) => {
    const milestone = milestones.find((m) => m.id === milestoneId);
    if (!milestone) {
      return;
    }
    const nextTasks = milestone.tasks.map((task) =>
      task.id === taskId
        ? { ...task, status: task.status === "done" ? "todo" : "done" }
        : task
    );
    const previous = milestones;
    setMilestones((prev) =>
      prev.map((m) => (m.id === milestoneId ? { ...m, tasks: nextTasks } : m))
    );
    const saved = await updateMilestone(milestoneId, { tasks: nextTasks });
    if (!saved) {
      setMilestones(previous);
      toast.error("Failed to update task");
    }
  };

  const handleCreateMilestone = async (input) => {
    const created = await createMilestone(projectId, input);
    if (!created) {
      toast.error("Failed to create milestone");
      return;
    }
    setMilestones((prev) => [created, ...prev]);
    toast.success("Milestone created");
  };

  const handleEditMilestone = (milestone) => {
    setEditMilestone(milestone);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async (updated) => {
    const saved = await updateMilestone(updated.id, updated);
    if (!saved) {
      toast.error("Failed to update milestone");
      return;
    }
    setMilestones((prev) => prev.map((m) => (m.id === saved.id ? saved : m)));
    setEditMilestone(null);
    setEditDialogOpen(false);
    toast.success("Milestone updated");
  };

  const handleDeleteMilestone = async (id) => {
    const previous = milestones;
    setMilestones((prev) => prev.filter((m) => m.id !== id));
    const ok = await softDeleteMilestone(id);
    if (!ok) {
      setMilestones(previous);
      toast.error("Failed to delete milestone");
      return;
    }
    toast.success("Milestone deleted");
  };

  return (
    <MainScreenWrapper>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Milestones</h1>
          <p className="text-muted-foreground mt-1">
            Organize milestones as task collections and monitor delivery health.
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
          <NewMilestoneDialog onCreate={handleCreateMilestone}>
            <Button className="bg-primary text-primary-foreground hover:bg-primary">
              <Plus className="w-4 h-4 mr-2" />
              New Milestone
            </Button>
          </NewMilestoneDialog>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-surface-subtle p-4">
          <p className="text-[11px] uppercase tracking-wide text-text-tertiary">Milestones</p>
          <p className="text-xl font-semibold text-foreground mt-1 tabular-nums">{summary.totalMilestones}</p>
          <p className="text-xs text-text-secondary mt-1">{summary.completedMilestones} completed</p>
        </div>
        <div className="rounded-xl border border-border bg-surface-subtle p-4">
          <p className="text-[11px] uppercase tracking-wide text-text-tertiary">Task Completion</p>
          <p className="text-xl font-semibold text-foreground mt-1 tabular-nums">{summary.taskProgress}%</p>
          <p className="text-xs text-text-secondary mt-1">{summary.doneTasks}/{summary.totalTasks} tasks done</p>
        </div>
        <div className="rounded-xl border border-border bg-surface-subtle p-4">
          <p className="text-[11px] uppercase tracking-wide text-text-tertiary">Overdue</p>
          <p className="text-xl font-semibold text-foreground mt-1 tabular-nums">{summary.overdueMilestones}</p>
          <p className="text-xs text-text-secondary mt-1">Milestones past due date</p>
        </div>
        <div className="rounded-xl border border-border bg-surface-subtle p-4">
          <p className="text-[11px] uppercase tracking-wide text-text-tertiary">In Scope</p>
          <p className="text-xl font-semibold text-foreground mt-1 tabular-nums">{summary.totalTasks}</p>
          <p className="text-xs text-text-secondary mt-1">Tasks assigned to milestones</p>
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
                  ? "bg-surface-hover text-foreground border-border-strong"
                  : "bg-surface-subtle text-text-secondary border-border hover:bg-surface-card hover:text-foreground"
              )}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-[260px] flex flex-col items-center justify-center gap-3 text-text-tertiary">
          <div className="w-5 h-5 rounded-full border-2 border-border-strong border-t-foreground animate-spin" />
          <span className="text-sm">Loading milestones...</span>
        </div>
      ) : filteredMilestones.length === 0 ? (
        <div className="h-[260px] flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-subtle text-text-secondary">
          <Flag className="w-10 h-10 opacity-30" />
          <p className="mt-3 text-sm">
            {milestones.length === 0
              ? "No milestones yet. Create your first milestone to get started."
              : "No milestones match your current filters."}
          </p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredMilestones.map((milestone) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              onToggleTask={handleToggleTask}
              onEdit={handleEditMilestone}
              onDelete={handleDeleteMilestone}
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
              onEdit={handleEditMilestone}
              onDelete={handleDeleteMilestone}
            />
          ))}
        </div>
      )}

      <NewMilestoneDialog
        editMilestone={editMilestone}
        onEdit={handleSaveEdit}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setEditMilestone(null);
        }}
      />
    </MainScreenWrapper>
  );
}
