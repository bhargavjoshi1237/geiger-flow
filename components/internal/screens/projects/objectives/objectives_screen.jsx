"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@geiger/ui";
import { Progress } from "@geiger/ui";
import { Card, CardContent } from "@geiger/ui";
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
  CheckCircle2,
  Circle,
  Target,
  Calendar,
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
import {
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
import { ObjectiveKanban } from "./objective_kanban";
import { NewObjectiveDialog } from "@/components/internal/dilouges/objectives/new_objective_dilouge";
import { useProject } from "@/context/project-context";
import {
  OBJECTIVE_STATUSES,
  OBJECTIVE_STATUS_FILTER_OPTIONS,
  objectiveStatusPillMap,
} from "@/features/objectives/constants";
import {
  listObjectives,
  createObjective,
  updateObjective,
  softDeleteObjective,
} from "@/features/objectives/actions";

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

function ObjectiveMenu({ objective, onEdit, onDelete, onDuplicate, onChangeStatus }) {
  return (
    <ActionMenu
      label={`Actions for ${objective.title}`}
      items={[
        { icon: Pencil, label: "Edit", onSelect: () => onEdit?.(objective) },
        { icon: Copy, label: "Duplicate", onSelect: () => onDuplicate?.(objective) },
        { separator: true },
        ...OBJECTIVE_STATUSES.map((status) => ({
          icon: STATUS_ICON[status.value],
          label: status.label,
          onSelect: () => onChangeStatus?.(objective.id, status.value),
        })),
        { separator: true },
        {
          icon: Trash2,
          label: "Delete",
          destructive: true,
          onSelect: () => onDelete?.(objective.id),
        },
      ]}
    />
  );
}

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
      className="bg-surface-subtle border-border text-foreground hover:border-border-strong transition-colors duration-200 rounded-xl py-0 gap-0 group"
    >
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-foreground leading-snug group-hover:text-foreground transition-colors">
                {objective.title}
              </h3>
              <StatusPill status={objective.status} map={objectiveStatusPillMap} />
            </div>
            <p className="text-xs text-text-secondary line-clamp-2">
              {objective.description}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <ObjectiveMenu
              objective={objective}
              onEdit={onEdit}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onChangeStatus={onChangeStatus}
            />
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7 text-text-tertiary hover:text-foreground hover:bg-surface-hover cursor-pointer"
              onClick={(e) => { e.stopPropagation(); onSelect(objective); }}
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4  text-xs text-text-secondary">
          <span className="inline-flex items-center gap-1">
            <Circle className="w-3 h-3" />
            {objective.owner}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(objective.startDate)} — {formatDate(objective.targetDate)}
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
              {objective.progress}%
            </span>
          </div>
          <Progress
            value={objective.progress}
            className={cn(
              "h-1.5 bg-surface-hover rounded-full",
              progressBarColor
            )}
          />
        </div>

        {objective.keyResults && objective.keyResults.length > 0 && (
          <div className="border-t border-border pt-2">
            <Button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setGoalsOpen((prev) => !prev);
              }}
              className="flex items-center justify-between w-full gap-2 group/acc cursor-pointer"
            >
              <span className="text-[10px] uppercase tracking-wider text-text-tertiary font-medium">
                Key Results
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
      className="flex items-center gap-4 px-4 py-3 rounded-lg bg-surface-subtle border border-border hover:border-border-strong transition-colors group"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-medium text-foreground group-hover:text-foreground transition-colors truncate">
            {objective.title}
          </h3>
          <StatusPill status={objective.status} map={objectiveStatusPillMap} />
        </div>
        <div className="flex items-center gap-3 text-xs text-text-secondary">
          <span className="inline-flex items-center gap-1">
            <Circle className="w-3 h-3" />
            {objective.owner}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(objective.startDate)} — {formatDate(objective.targetDate)}
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
          <span className="text-xs text-muted-foreground tabular-nums">{objective.progress}%</span>
        </div>
        <Progress
          value={objective.progress}
          className={cn("h-1 bg-surface-hover rounded-full", progressBarColor)}
        />
      </div>

      <ObjectiveMenu
        objective={objective}
        onEdit={onEdit}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onChangeStatus={onChangeStatus}
      />

      <Button
        variant="ghost"
        size="icon"
        className="w-7 h-7 text-text-tertiary hover:text-foreground hover:bg-surface-hover cursor-pointer shrink-0"
        onClick={(e) => { e.stopPropagation(); onSelect(objective); }}
      >
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

export function ObjectivesScreen() {
  const { project } = useProject();
  const projectId = project?.id;

  const [selectedObjective, setSelectedObjective] = useState(null);
  const [view, setView] = useState("grid");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [objectives, setObjectives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editObjective, setEditObjective] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (!projectId) {
      return;
    }
    let active = true;
    void Promise.resolve().then(async () => {
      setLoading(true);
      const rows = await listObjectives(projectId);
      if (active) {
        setObjectives(rows);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [projectId]);

  const filteredObjectives = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase();
    return objectives.filter((objective) => {
      if (status !== "all" && objective.status !== status) return false;
      if (!normalizedQuery) return true;
      return [objective.title, objective.description, objective.owner]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [objectives, search, status]);

  const pager = usePagination(filteredObjectives, {
    resetKey: `${search}|${status}`,
  });

  const stats = useMemo(() => {
    const total = objectives.length;
    const completed = objectives.filter((o) => o.status === "completed").length;
    const onTrack = objectives.filter((o) => o.status === "on_track").length;
    const atRisk = objectives.filter((o) => o.status === "at_risk").length;
    const avgProgress = total
      ? Math.round(objectives.reduce((sum, o) => sum + (o.progress || 0), 0) / total)
      : 0;
    return [
      { label: "Total objectives", value: String(total), footer: `${completed} completed` },
      { label: "On track", value: String(onTrack), footer: "Progressing well" },
      { label: "At risk", value: String(atRisk), footer: "Needs attention" },
      { label: "Avg. progress", value: `${avgProgress}%`, footer: "Across all objectives" },
    ];
  }, [objectives]);

  const handleCreateObjective = async (newObj) => {
    const created = await createObjective(projectId, newObj);
    if (!created) {
      toast.error("Failed to create objective");
      return;
    }
    setObjectives((prev) => [created, ...prev]);
    toast.success("Objective created");
  };

  const handleEditObjective = (objective) => {
    setEditObjective(objective);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async (updated) => {
    const saved = await updateObjective(updated.id, updated);
    if (!saved) {
      toast.error("Failed to update objective");
      return;
    }
    setObjectives((prev) => prev.map((o) => (o.id === saved.id ? saved : o)));
    setEditObjective(null);
    setEditDialogOpen(false);
    toast.success("Objective updated");
  };

  const handleDeleteObjective = async (id) => {
    const previous = objectives;
    setObjectives((prev) => prev.filter((o) => o.id !== id));
    setDeleteTarget(null);
    const ok = await softDeleteObjective(id);
    if (!ok) {
      setObjectives(previous);
      toast.error("Failed to delete objective");
      return;
    }
    toast.success("Objective deleted");
  };

  const handleDuplicateObjective = async (objective) => {
    const created = await createObjective(projectId, {
      ...objective,
      title: `${objective.title} (Copy)`,
      status: "not_started",
      progress: 0,
      keyResults: objective.keyResults.map((kr) => ({ ...kr, progress: 0, done: false })),
    });
    if (!created) {
      toast.error("Failed to duplicate objective");
      return;
    }
    setObjectives((prev) => [created, ...prev]);
    toast.success("Objective duplicated");
  };

  const handleChangeStatus = async (id, newStatus) => {
    const objective = objectives.find((o) => o.id === id);
    if (!objective) {
      return;
    }
    const progress =
      newStatus === "completed" ? 100 : newStatus === "not_started" ? 0 : objective.progress;
    const saved = await updateObjective(id, { status: newStatus, progress });
    if (!saved) {
      toast.error("Failed to update status");
      return;
    }
    setObjectives((prev) => prev.map((o) => (o.id === id ? saved : o)));
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
      <ScreenHeader
        title="Objectives"
        description="Define high level measurable objectives and track key results across the project."
        actions={
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" /> New Objective
          </Button>
        }
      />

      <StatsBar stats={stats} />

      <Toolbar>
        <div className="flex items-center gap-2">
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
          <FilterDropdown
            value={status}
            onValueChange={setStatus}
            options={OBJECTIVE_STATUS_FILTER_OPTIONS}
            height="h-9"
          />
        </div>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search objectives, owners…"
        />
      </Toolbar>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-subtle px-6 py-16 text-sm text-text-secondary">
          <LogoLoading size={40} label="Loading objectives" />
        </div>
      ) : filteredObjectives.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface-subtle">
          <EmptyState
            icon={Target}
            title={objectives.length ? "No objectives match your filters" : "No objectives yet"}
            description={
              objectives.length
                ? "Try clearing the search or filters to see more objectives."
                : "Define your first objective to start tracking key results."
            }
            action={
              objectives.length ? (
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
                  <Plus className="h-4 w-4" /> New Objective
                </Button>
              )
            }
          />
        </div>
      ) : (
        <div className="space-y-5">
          {view === "grid" ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pager.pageItems.map((objective) => (
                <ObjectiveCard
                  key={objective.id}
                  objective={objective}
                  onSelect={setSelectedObjective}
                  onEdit={handleEditObjective}
                  onDelete={(id) => setDeleteTarget(objectives.find((o) => o.id === id))}
                  onDuplicate={handleDuplicateObjective}
                  onChangeStatus={handleChangeStatus}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {pager.pageItems.map((objective) => (
                <ObjectiveListItem
                  key={objective.id}
                  objective={objective}
                  onSelect={setSelectedObjective}
                  onEdit={handleEditObjective}
                  onDelete={(id) => setDeleteTarget(objectives.find((o) => o.id === id))}
                  onDuplicate={handleDuplicateObjective}
                  onChangeStatus={handleChangeStatus}
                />
              ))}
            </div>
          )}
          <ListPagination {...pager} itemLabel="objectives" />
        </div>
      )}

      <NewObjectiveDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={handleCreateObjective}
      />

      <NewObjectiveDialog
        editObjective={editObjective}
        onEdit={handleSaveEdit}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setEditObjective(null);
        }}
      />

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete objective</DialogTitle>
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
              onClick={() => handleDeleteObjective(deleteTarget.id)}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainScreenWrapper>
  );
}

export default ObjectivesScreen;
