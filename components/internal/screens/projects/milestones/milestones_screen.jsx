"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@geiger/ui";
import { Badge } from "@geiger/ui";
import { Progress } from "@geiger/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@geiger/ui";
import { ActionMenu } from "@geiger/ui";
import { LogoLoading } from "@geiger/ui";
import {
  Flag,
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  AlertTriangle,
  Clock3,
  SquareStack,
  Pencil,
  Trash2,
} from "lucide-react";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import {
  DataTable,
  EmptyState,
  ScreenHeader,
  SearchInput,
  StatsBar,
  StatusPill,
  Toolbar,
} from "@/components/internal/shared/screen_kit";
import {
  ListPagination,
  usePagination,
} from "@/components/internal/shared/pagination";
import FilterDropdown from "@/components/internal/screens/projects/overview/filter_dropdown";
import { cn } from "@/lib/utils";
import { useProject } from "@/context/project-context";
import {
  MILESTONE_STATUS_PILL_MAP,
  MILESTONE_STATUS_FILTER_OPTIONS,
  TASK_STATUS_META,
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

function TaskToggle({ milestoneId, task, onToggleTask }) {
  const taskMeta = TASK_STATUS_META[task.status] || TASK_STATUS_META.todo;
  const isDone = task.status === "done";

  return (
    <button
      type="button"
      onClick={() => onToggleTask(milestoneId, task.id)}
      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-surface-card"
    >
      {isDone ? (
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
      ) : task.status === "blocked" ? (
        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-300" />
      ) : (
        <Circle className="h-3.5 w-3.5 shrink-0 text-text-tertiary" />
      )}
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-xs",
          isDone ? "text-muted-foreground line-through" : "text-foreground"
        )}
      >
        {task.title}
      </span>
      <Badge className={cn("shrink-0 border px-2 py-0 text-[10px]", taskMeta.className)}>
        {taskMeta.label}
      </Badge>
    </button>
  );
}

export function MilestonesScreen() {
  const { project } = useProject();
  const projectId = project?.id;

  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editMilestone, setEditMilestone] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

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

  const pager = usePagination(filteredMilestones, {
    resetKey: `${query}|${activeFilter}`,
  });

  const stats = useMemo(() => {
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
    const taskProgress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    return [
      {
        label: "Total milestones",
        value: String(totalMilestones),
        footer: `${completedMilestones} completed`,
      },
      {
        label: "Task completion",
        value: `${taskProgress}%`,
        footer: `${doneTasks}/${totalTasks} tasks done`,
      },
      {
        label: "Overdue",
        value: String(overdueMilestones),
        footer: "Past due date",
      },
      {
        label: "Tasks in scope",
        value: String(totalTasks),
        footer: "Assigned to milestones",
      },
    ];
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
    setDeleteTarget(null);
    const ok = await softDeleteMilestone(id);
    if (!ok) {
      setMilestones(previous);
      toast.error("Failed to delete milestone");
      return;
    }
    toast.success("Milestone deleted");
  };

  const columns = [
    {
      key: "milestone",
      header: "Milestone",
      render: (milestone) => (
        <div className="flex min-w-[240px] flex-col gap-1">
          <span className="font-medium text-foreground">{milestone.title}</span>
          {milestone.description ? (
            <span className="line-clamp-2 text-xs text-text-secondary">
              {milestone.description}
            </span>
          ) : null}
          <span className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(milestone.targetDate)}
            </span>
            <span className="inline-flex items-center gap-1">
              <SquareStack className="h-3 w-3" />
              {milestone.metrics.totalTasks} tasks
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3 w-3" />
              {milestone.owner}
            </span>
            <span className="tabular-nums text-text-tertiary">
              {milestone.metrics.doneTasks}/{milestone.metrics.totalTasks} complete
            </span>
          </span>
          {milestone.tasks.length > 0 ? (
            <div className="mt-1 space-y-0.5">
              {milestone.tasks.map((task) => (
                <TaskToggle
                  key={task.id}
                  milestoneId={milestone.id}
                  task={task}
                  onToggleTask={handleToggleTask}
                />
              ))}
            </div>
          ) : null}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (milestone) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusPill status={milestone.metrics.status} map={MILESTONE_STATUS_PILL_MAP} />
          {milestone.metrics.overdue ? (
            <Badge variant="danger">Overdue</Badge>
          ) : null}
        </div>
      ),
    },
    {
      key: "progress",
      header: "Progress",
      render: (milestone) => (
        <div className="w-[150px] space-y-1.5">
          <Progress
            value={milestone.metrics.progress}
            className="h-1.5 rounded-full bg-surface-hover [&_[data-slot=progress-indicator]]:bg-primary"
          />
          <p className="text-xs tabular-nums text-text-secondary">
            {milestone.metrics.doneTasks}/{milestone.metrics.totalTasks} · {milestone.metrics.progress}%
          </p>
        </div>
      ),
    },
    {
      key: "target",
      header: "Target date",
      render: (milestone) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {formatDate(milestone.targetDate)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      className: "text-right",
      render: (milestone) => (
        <ActionMenu
          label={`Actions for ${milestone.title}`}
          items={[
            { icon: Pencil, label: "Edit", onSelect: () => handleEditMilestone(milestone) },
            { separator: true },
            {
              icon: Trash2,
              label: "Delete",
              destructive: true,
              onSelect: () => setDeleteTarget(milestone),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <MainScreenWrapper>
      <ScreenHeader
        title="Milestones"
        description="Organize milestones as task collections and monitor delivery health."
        actions={
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" /> New Milestone
          </Button>
        }
      />

      <StatsBar stats={stats} />

      <Toolbar>
        <div className="flex items-center gap-2">
          <FilterDropdown
            value={activeFilter}
            onValueChange={setActiveFilter}
            options={MILESTONE_STATUS_FILTER_OPTIONS}
            height="h-9"
          />
        </div>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search milestones, owners, or task names"
        />
      </Toolbar>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-subtle px-6 py-16 text-sm text-text-secondary">
          <LogoLoading size={40} />
          Loading milestones…
        </div>
      ) : (
        <div className="space-y-5">
          <DataTable
            columns={columns}
            data={pager.pageItems}
            getRowKey={(m) => m.id}
            empty={
              <div className="rounded-xl border border-border bg-surface-subtle">
                <EmptyState
                  icon={Flag}
                  title={
                    milestones.length
                      ? "No milestones match your filters"
                      : "No milestones yet"
                  }
                  description={
                    milestones.length
                      ? "Try clearing the search or filters to see more milestones."
                      : "Create your first milestone to group delivery tasks and track health."
                  }
                  action={
                    milestones.length ? (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setQuery("");
                          setActiveFilter("all");
                        }}
                      >
                        Clear filters
                      </Button>
                    ) : (
                      <Button
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => setCreateOpen(true)}
                      >
                        <Plus className="h-4 w-4" /> New Milestone
                      </Button>
                    )
                  }
                />
              </div>
            }
          />
          <ListPagination {...pager} itemLabel="milestones" />
        </div>
      )}

      <NewMilestoneDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={handleCreateMilestone}
      />

      <NewMilestoneDialog
        editMilestone={editMilestone}
        onEdit={handleSaveEdit}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setEditMilestone(null);
        }}
      />

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete milestone</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">{deleteTarget?.title}</span>?
              This action can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              className="bg-red-500/90 text-white hover:bg-red-500"
              onClick={() => handleDeleteMilestone(deleteTarget.id)}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainScreenWrapper>
  );
}

export default MilestonesScreen;
