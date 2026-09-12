"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@geiger/ui";
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
  Plus,
  Target,
  Calendar,
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
import { NewGoalDialog } from "@/components/internal/dilouges/goals/new_goal_dilouge";
import { useProject } from "@/context/project-context";
import {
  GOAL_STATUSES,
  GOAL_STATUS_FILTER_OPTIONS,
  goalStatusPillMap,
} from "@/features/goals/constants";
import {
  listGoals,
  createGoal,
  updateGoal,
  softDeleteGoal,
} from "@/features/goals/actions";

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

export function GoalsScreen() {
  const { project } = useProject();
  const projectId = project?.id;

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

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

  const filteredGoals = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase();
    return goals.filter((goal) => {
      if (status !== "all" && goal.status !== status) return false;
      if (!normalizedQuery) return true;
      return [goal.title, goal.description, goal.owner]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [goals, search, status]);

  const pager = usePagination(filteredGoals, {
    resetKey: `${search}|${status}`,
  });

  const stats = useMemo(() => {
    const total = goals.length;
    const completed = goals.filter((g) => g.status === "completed").length;
    const onTrack = goals.filter((g) => g.status === "on_track").length;
    const atRisk = goals.filter((g) => g.status === "at_risk").length;
    const avgProgress = total
      ? Math.round(goals.reduce((sum, g) => sum + (g.progress || 0), 0) / total)
      : 0;
    return [
      { label: "Total goals", value: String(total), footer: `${completed} completed` },
      { label: "On track", value: String(onTrack), footer: "Progressing well" },
      { label: "At risk", value: String(atRisk), footer: "Needs attention" },
      { label: "Avg. progress", value: `${avgProgress}%`, footer: "Across all goals" },
    ];
  }, [goals]);

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
    setDeleteTarget(null);
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

  const columns = [
    {
      key: "goal",
      header: "Goal",
      render: (goal) => {
        const completedKR = goal.keyResults.filter((kr) => kr.done).length;
        const totalKR = goal.keyResults.length;
        return (
          <div className="flex min-w-[240px] flex-col gap-1">
            <span className="font-medium text-foreground">{goal.title}</span>
            {goal.description ? (
              <span className="line-clamp-2 text-xs text-text-secondary">
                {goal.description}
              </span>
            ) : null}
            <span className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
              <span className="inline-flex items-center gap-1">
                <User className="h-3 w-3" />
                {goal.owner}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(goal.targetDate)}
              </span>
              <span className="inline-flex items-center gap-1 text-text-tertiary">
                <Target className="h-3 w-3" />
                {completedKR}/{totalKR} key results
              </span>
            </span>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (goal) => <StatusPill status={goal.status} map={goalStatusPillMap} />,
    },
    {
      key: "progress",
      header: "Progress",
      render: (goal) => {
        const barColor = (() => {
          if (goal.status === "completed") return "[&_[data-slot=progress-indicator]]:bg-blue-400";
          if (goal.status === "at_risk") return "[&_[data-slot=progress-indicator]]:bg-amber-400";
          if (goal.status === "not_started") return "[&_[data-slot=progress-indicator]]:bg-zinc-500";
          return "[&_[data-slot=progress-indicator]]:bg-emerald-400";
        })();
        return (
          <div className="w-[150px] space-y-1.5">
            <Progress
              value={goal.progress}
              className={cn("h-1.5 rounded-full bg-surface-hover", barColor)}
            />
            <p className="text-xs tabular-nums text-text-secondary">{goal.progress}%</p>
          </div>
        );
      },
    },
    {
      key: "target",
      header: "Target date",
      render: (goal) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {formatDate(goal.targetDate)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      className: "text-right",
      render: (goal) => (
        <ActionMenu
          label={`Actions for ${goal.title}`}
          items={[
            { icon: Pencil, label: "Edit", onSelect: () => handleEditGoal(goal) },
            { icon: Copy, label: "Duplicate", onSelect: () => handleDuplicateGoal(goal) },
            { separator: true },
            ...GOAL_STATUSES.map((entry) => ({
              icon: STATUS_ICON[entry.value],
              label: entry.label,
              onSelect: () => handleChangeStatus(goal.id, entry.value),
            })),
            { separator: true },
            {
              icon: Trash2,
              label: "Delete",
              destructive: true,
              onSelect: () => setDeleteTarget(goal),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <MainScreenWrapper>
      <ScreenHeader
        title="Goals"
        description="Define measurable targets & key business goals for this project. You can have max 6 goals at a time."
        actions={
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" /> Define New Goal
          </Button>
        }
      />

      <StatsBar stats={stats} />

      <Toolbar>
        <div className="flex items-center gap-2">
          <FilterDropdown
            value={status}
            onValueChange={setStatus}
            options={GOAL_STATUS_FILTER_OPTIONS}
            height="h-9"
          />
        </div>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search goals, owners…"
        />
      </Toolbar>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-subtle px-6 py-16 text-sm text-text-secondary">
          <LogoLoading size={40} />
          Loading goals…
        </div>
      ) : (
        <div className="space-y-5">
          <DataTable
            columns={columns}
            data={pager.pageItems}
            getRowKey={(g) => g.id}
            empty={
              <div className="rounded-xl border border-border bg-surface-subtle">
                <EmptyState
                  icon={Target}
                  title={goals.length ? "No goals match your filters" : "No goals yet"}
                  description={
                    goals.length
                      ? "Try clearing the search or filters to see more goals."
                      : "Define your first measurable goal to get started."
                  }
                  action={
                    goals.length ? (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setSearch("");
                          setStatus("all");
                        }}
                      >
                        Clear filters
                      </Button>
                    ) : (
                      <Button
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => setCreateOpen(true)}
                      >
                        <Plus className="h-4 w-4" /> Define New Goal
                      </Button>
                    )
                  }
                />
              </div>
            }
          />
          <ListPagination {...pager} itemLabel="goals" />
        </div>
      )}

      <NewGoalDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={handleCreateGoal}
      />

      <NewGoalDialog
        editGoal={editGoal}
        onEdit={handleSaveEdit}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setEditGoal(null);
        }}
      />

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete goal</DialogTitle>
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
              onClick={() => handleDeleteGoal(deleteTarget.id)}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainScreenWrapper>
  );
}

export default GoalsScreen;
