"use client";

import React, { useMemo, useState } from "react";
import { Plus, Repeat } from "lucide-react";
import { toast } from "sonner";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from "@geiger/ui";
import { cn } from "@/lib/utils";
import { createMilestone } from "@/features/milestones/actions";
import { DEFAULT_DISPLAY, isCompleted } from "../constants";
import { cycleStats } from "../grouping";
import { ProgressRing } from "../icons";
import { IssueSurface } from "../issue_list";
import { DisplayMenu, HeaderButton, ViewHeader } from "../view_header";
import { useTracker } from "../use_tracker";

// Linear's Cycles. A cycle is a flow.milestone — a titled window with a target
// date — and its scope is every issue whose metadata bag points at it. The
// active cycle is the one whose target date is next; anything past is completed.

function classifyCycles(cycles) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dated = [...cycles].sort((a, b) => {
    if (!a.targetDate) return 1;
    if (!b.targetDate) return -1;
    return new Date(a.targetDate) - new Date(b.targetDate);
  });

  const upcoming = dated.filter(
    (cycle) => cycle.targetDate && new Date(cycle.targetDate) >= today,
  );
  const completed = dated.filter(
    (cycle) => cycle.targetDate && new Date(cycle.targetDate) < today,
  );
  const undated = dated.filter((cycle) => !cycle.targetDate);

  return {
    active: upcoming[0] ?? undated[0] ?? null,
    upcoming: upcoming.slice(1).concat(undated.slice(upcoming[0] ? 0 : 1)),
    completed: completed.reverse(),
  };
}

// Burn-up: scope vs completed, one point per day between creation and target.
function CycleGraph({ stats, cycle }) {
  const points = useMemo(() => {
    const start = new Date(cycle.createdAt);
    const end = cycle.targetDate ? new Date(cycle.targetDate) : new Date();
    const span = Math.max(1, Math.round((end - start) / 86400000));
    const steps = Math.min(span, 21);

    return Array.from({ length: steps + 1 }, (_, index) => {
      const at = new Date(start.getTime() + (index / steps) * (end - start));
      const done = stats.issues.filter(
        (issue) => isCompleted(issue.status) && new Date(issue.updatedAt) <= at,
      ).length;
      const scope = stats.issues.filter((issue) => new Date(issue.createdAt) <= at).length;
      return { done, scope };
    });
  }, [cycle, stats]);

  const max = Math.max(1, ...points.map((point) => point.scope));
  const path = (key) =>
    points
      .map((point, index) => {
        const x = (index / Math.max(1, points.length - 1)) * 100;
        const y = 100 - (point[key] / max) * 100;
        return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ");

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="h-[104px] w-full"
      aria-label="Cycle burn-up"
    >
      <path
        d={path("scope")}
        fill="none"
        stroke="var(--lnr-border-strong)"
        strokeWidth="1.2"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={path("done")}
        fill="none"
        stroke="var(--lnr-accent)"
        strokeWidth="1.6"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function StatTile({ label, value, hint }) {
  return (
    <div className="flex flex-col gap-0.5 px-4 py-3">
      <span className="text-[11px] text-[var(--lnr-ink-subtle)]">{label}</span>
      <span className="text-[20px] font-medium tabular-nums text-[var(--lnr-ink)]">
        {value}
      </span>
      {hint ? <span className="text-[11px] text-[var(--lnr-ink-tertiary)]">{hint}</span> : null}
    </div>
  );
}

function CycleRow({ cycle, stats, active, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "flex w-full items-center gap-3 border-b border-[var(--lnr-border)] px-3 py-3 text-left transition-colors hover:bg-[var(--lnr-hover)] sm:px-4",
        active && "bg-[var(--lnr-selected)]",
      )}
    >
      <ProgressRing value={stats.progress} size={18} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium text-[var(--lnr-ink)]">
          {cycle.title}
        </span>
        <span className="block truncate text-[12px] text-[var(--lnr-ink-subtle)]">
          {stats.window}
          {cycle.owner ? ` · ${cycle.owner}` : ""}
        </span>
      </span>
      <span className="shrink-0 text-[12px] tabular-nums text-[var(--lnr-ink-subtle)]">
        {stats.completed}/{stats.total}
      </span>
      <span className="w-10 shrink-0 text-right text-[12px] tabular-nums text-[var(--lnr-ink-tertiary)]">
        {stats.progress}%
      </span>
    </button>
  );
}

function NewCycleDialog({ open, onOpenChange, projectId, onCreated }) {
  const [title, setTitle] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!title.trim()) {
      toast.error("Give the cycle a name.");
      return;
    }
    setSaving(true);
    const created = await createMilestone(projectId, {
      title: title.trim(),
      targetDate: targetDate || null,
    });
    setSaving(false);
    if (!created) {
      toast.error("Couldn't create the cycle.");
      return;
    }
    toast.success("Cycle created");
    setTitle("");
    setTargetDate("");
    onOpenChange(false);
    onCreated(created);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="linear-scope border-[var(--lnr-border-strong)] bg-[var(--lnr-elevated)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New cycle</DialogTitle>
          <DialogDescription>
            A cycle is a dated window of work. Issues join it from their Cycle property.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="cycle-title">Name</Label>
            <Input
              id="cycle-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Cycle 12"
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cycle-end">Ends</Label>
            <Input
              id="cycle-end"
              type="date"
              value={targetDate}
              onChange={(event) => setTargetDate(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-[var(--lnr-accent)] text-white hover:bg-[var(--lnr-accent-hover)]"
            >
              Create cycle
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CyclesView({ onOpenIssue, onCreate, cycleId, onSelectCycle }) {
  const { cycles, issues, projectId, projectKey } = useTracker();
  const [tab, setTab] = useState("active");
  const [creating, setCreating] = useState(false);
  const [localCycles, setLocalCycles] = useState([]);
  const [display, setDisplay] = useState({ ...DEFAULT_DISPLAY, grouping: "status" });

  const all = useMemo(() => [...cycles, ...localCycles], [cycles, localCycles]);
  const buckets = useMemo(() => classifyCycles(all), [all]);

  const selected = useMemo(() => {
    if (cycleId) return all.find((cycle) => cycle.id === cycleId) ?? null;
    if (tab === "active") return buckets.active;
    return null;
  }, [cycleId, all, tab, buckets]);

  const stats = useMemo(
    () => (selected ? cycleStats(selected, issues) : null),
    [selected, issues],
  );

  const list = tab === "upcoming" ? buckets.upcoming : buckets.completed;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ViewHeader
        crumbs={[
          { label: projectKey, icon: Repeat },
          {
            label: "Cycles",
            onClick: cycleId ? () => onSelectCycle(null) : undefined,
          },
          ...(cycleId && selected ? [{ label: selected.title }] : []),
        ]}
        tabs={
          cycleId
            ? undefined
            : [
                { value: "active", label: "Active" },
                { value: "upcoming", label: "Upcoming", count: buckets.upcoming.length },
                { value: "completed", label: "Completed", count: buckets.completed.length },
              ]
        }
        activeTab={tab}
        onTab={(next) => {
          onSelectCycle(null);
          setTab(next);
        }}
        actions={
          <>
            <DisplayMenu display={display} onChange={setDisplay} />
            <HeaderButton icon={Plus} label="New cycle" onClick={() => setCreating(true)} />
          </>
        }
      />

      {selected && stats ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="shrink-0 border-b border-[var(--lnr-border)]">
            <div className="flex flex-col items-start gap-4 px-3 py-4 sm:px-4 xl:flex-row xl:gap-6">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <ProgressRing value={stats.progress} size={16} />
                  <h2 className="text-[15px] font-medium text-[var(--lnr-ink)]">
                    {selected.title}
                  </h2>
                  <span className="text-[12px] text-[var(--lnr-ink-subtle)]">
                    {stats.window}
                  </span>
                </div>
                {selected.description ? (
                  <p className="mt-1 max-w-xl text-[12px] text-[var(--lnr-ink-subtle)]">
                    {selected.description}
                  </p>
                ) : null}
                <CycleGraph cycle={selected} stats={stats} />
                <div className="flex items-center gap-4 text-[11px] text-[var(--lnr-ink-tertiary)]">
                  <span className="flex items-center gap-1.5">
                    <span className="h-[2px] w-3 bg-[var(--lnr-accent)]" />
                    Completed
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-[2px] w-3 bg-[var(--lnr-border-strong)]" />
                    Scope
                  </span>
                </div>
              </div>

              <div className="grid w-full shrink-0 grid-cols-2 divide-x divide-y divide-[var(--lnr-border)] rounded-[8px] border border-[var(--lnr-border)] sm:grid-cols-4 xl:w-auto xl:grid-cols-2">
                <StatTile label="Scope" value={stats.total} hint="issues" />
                <StatTile label="Started" value={stats.started} />
                <StatTile label="Completed" value={stats.completed} />
                <StatTile label="Points" value={stats.scope} hint="estimated" />
              </div>
            </div>
          </div>

          <IssueSurface
            issues={stats.issues}
            display={display}
            onOpenIssue={onOpenIssue}
            onCreate={(patch) => onCreate({ ...patch, cycleId: selected.id })}
            emptyTitle="No issues in this cycle"
            emptyHint="Set an issue's Cycle property to pull it into this window."
          />
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <Repeat className="h-6 w-6 text-[var(--lnr-ink-tertiary)]" />
          <p className="text-[14px] font-medium text-[var(--lnr-ink)]">
            {tab === "active" ? "No active cycle" : `No ${tab} cycles`}
          </p>
          <p className="max-w-sm text-[13px] text-[var(--lnr-ink-subtle)]">
            Create a cycle to plan a dated window of work.
          </p>
          <Button
            size="sm"
            onClick={() => setCreating(true)}
            className="mt-1 bg-[var(--lnr-accent)] text-white hover:bg-[var(--lnr-accent-hover)]"
          >
            <Plus className="h-3.5 w-3.5" />
            New cycle
          </Button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto lnr-scrollbar">
          {list.map((cycle) => (
            <CycleRow
              key={cycle.id}
              cycle={cycle}
              stats={cycleStats(cycle, issues)}
              onOpen={() => onSelectCycle(cycle.id)}
            />
          ))}
        </div>
      )}

      <NewCycleDialog
        open={creating}
        onOpenChange={setCreating}
        projectId={projectId}
        onCreated={(cycle) => setLocalCycles((current) => [...current, cycle])}
      />
    </div>
  );
}
