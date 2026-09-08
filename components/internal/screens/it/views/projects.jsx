"use client";

import React, { useMemo, useState } from "react";
import { Box, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Textarea,
} from "@geiger/ui";
import { cn } from "@/lib/utils";
import { createObjective, updateObjective } from "@/features/objectives/actions";
import { DEFAULT_DISPLAY, formatShortDate, isCompleted } from "../constants";
import { ProgressRing } from "../icons";
import { IssueSurface } from "../issue_list";
import { DisplayMenu, HeaderButton, ViewHeader } from "../view_header";
import { useTracker } from "../use_tracker";

// Linear's Projects. A project is a flow.objective — title, lead, health status,
// progress and a start/target window — and its scope is every issue whose
// metadata bag points at it. Health is stored in the objective's `status`.

const HEALTH = {
  not_started: { label: "Backlog", dot: "var(--lnr-backlog)" },
  on_track: { label: "On track", dot: "var(--lnr-review)" },
  at_risk: { label: "At risk", dot: "var(--lnr-started)" },
  completed: { label: "Completed", dot: "var(--lnr-done)" },
};

const HEALTH_ORDER = ["not_started", "on_track", "at_risk", "completed"];

function projectStats(project, issues) {
  const scoped = issues.filter((issue) => issue.objectiveId === project.id);
  const completed = scoped.filter((issue) => isCompleted(issue.status));
  // A project's own progress column wins when set; otherwise derive it.
  const derived = scoped.length ? Math.round((completed.length / scoped.length) * 100) : 0;
  return {
    issues: scoped,
    total: scoped.length,
    completed: completed.length,
    progress: project.progress || derived,
  };
}

function HealthPill({ status, onChange }) {
  const meta = HEALTH[status] ?? HEALTH.not_started;
  const next = () =>
    onChange?.(HEALTH_ORDER[(HEALTH_ORDER.indexOf(status) + 1) % HEALTH_ORDER.length]);

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        next();
      }}
      disabled={!onChange}
      className="flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--lnr-border-strong)] px-2 py-[2px] text-[11px] text-[var(--lnr-ink-muted)] enabled:hover:bg-[var(--lnr-hover)]"
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: meta.dot }} />
      {meta.label}
    </button>
  );
}

function NewProjectDialog({ open, onOpenChange, projectId, onCreated }) {
  const [draft, setDraft] = useState({ title: "", description: "", targetDate: "" });
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!draft.title.trim()) {
      toast.error("Give the project a name.");
      return;
    }
    setSaving(true);
    const created = await createObjective(projectId, {
      title: draft.title.trim(),
      description: draft.description.trim(),
      targetDate: draft.targetDate || null,
      status: "not_started",
    });
    setSaving(false);
    if (!created) {
      toast.error("Couldn't create the project.");
      return;
    }
    toast.success("Project created");
    setDraft({ title: "", description: "", targetDate: "" });
    onOpenChange(false);
    onCreated(created);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="linear-scope border-[var(--lnr-border-strong)] bg-[var(--lnr-elevated)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>
            Group related issues under a shared target date and health status.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="project-title">Name</Label>
            <Input
              id="project-title"
              autoFocus
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              placeholder="Billing revamp"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="project-summary">Summary</Label>
            <Textarea
              id="project-summary"
              rows={3}
              value={draft.description}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
              placeholder="What is this project for?"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="project-target">Target date</Label>
            <Input
              id="project-target"
              type="date"
              value={draft.targetDate}
              onChange={(event) => setDraft({ ...draft, targetDate: event.target.value })}
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
              Create project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ProjectsView({ onOpenIssue, onCreate, selectedId, onSelect }) {
  const { projects, issues, projectId, people } = useTracker();
  const [creating, setCreating] = useState(false);
  const [local, setLocal] = useState([]);
  const [health, setHealth] = useState({});
  const [display, setDisplay] = useState({ ...DEFAULT_DISPLAY, grouping: "status" });

  const all = useMemo(
    () =>
      [...projects, ...local].map((entry) => ({
        ...entry,
        status: health[entry.id] ?? entry.status,
      })),
    [projects, local, health],
  );

  const selected = selectedId ? all.find((entry) => entry.id === selectedId) : null;

  // Health is a single column write; keep the row optimistic and persist.
  const setProjectHealth = async (id, status) => {
    setHealth((current) => ({ ...current, [id]: status }));
    const saved = await updateObjective(id, { status });
    if (!saved) {
      setHealth((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      toast.error("Couldn't update project health.");
    }
  };

  if (selected) {
    const stats = projectStats(selected, issues);
    const lead = people.find((person) => person.name === selected.owner);

    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <ViewHeader
          crumbs={[
            { label: "Projects", icon: Box, onClick: () => onSelect(null) },
            { label: selected.title },
          ]}
          actions={<DisplayMenu display={display} onChange={setDisplay} />}
        />

        <div className="shrink-0 border-b border-[var(--lnr-border)] px-3 py-4 sm:px-4">
          <div className="flex items-start gap-3">
            <ProgressRing value={stats.progress} size={20} />
            <div className="min-w-0 flex-1">
              <h2 className="text-[16px] font-medium text-[var(--lnr-ink)]">
                {selected.title}
              </h2>
              {selected.description ? (
                <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-[var(--lnr-ink-subtle)]">
                  {selected.description}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-[var(--lnr-ink-subtle)]">
                <HealthPill
                  status={selected.status}
                  onChange={(status) => setProjectHealth(selected.id, status)}
                />
                {lead ? (
                  <span className="flex items-center gap-1.5 rounded-full border border-[var(--lnr-border-strong)] px-2 py-[2px]">
                    <Avatar className="h-3.5 w-3.5">
                      <AvatarImage src={lead.avatarUrl} alt="" />
                      <AvatarFallback className="bg-[var(--lnr-strong)] text-[7px]">
                        {lead.initials}
                      </AvatarFallback>
                    </Avatar>
                    {lead.name}
                  </span>
                ) : selected.owner ? (
                  <span className="rounded-full border border-[var(--lnr-border-strong)] px-2 py-[2px]">
                    {selected.owner}
                  </span>
                ) : null}
                {selected.targetDate ? (
                  <span className="rounded-full border border-[var(--lnr-border-strong)] px-2 py-[2px]">
                    Target {formatShortDate(selected.targetDate)}
                  </span>
                ) : null}
                <span className="tabular-nums">
                  {stats.completed}/{stats.total} issues · {stats.progress}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <IssueSurface
          issues={stats.issues}
          display={display}
          onOpenIssue={onOpenIssue}
          onCreate={(patch) => onCreate({ ...patch, objectiveId: selected.id })}
          emptyTitle="No issues in this project"
          emptyHint="Set an issue's Project property to pull it in here."
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ViewHeader
        crumbs={[{ label: "Projects", icon: Box }]}
        actions={<HeaderButton icon={Plus} label="New project" onClick={() => setCreating(true)} />}
      />

      {all.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <Box className="h-6 w-6 text-[var(--lnr-ink-tertiary)]" />
          <p className="text-[14px] font-medium text-[var(--lnr-ink)]">No projects yet</p>
          <p className="max-w-sm text-[13px] text-[var(--lnr-ink-subtle)]">
            Projects group issues under a shared goal, lead and target date.
          </p>
          <Button
            size="sm"
            onClick={() => setCreating(true)}
            className="mt-1 bg-[var(--lnr-accent)] text-white hover:bg-[var(--lnr-accent-hover)]"
          >
            <Plus className="h-3.5 w-3.5" />
            New project
          </Button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto lnr-scrollbar">
          <div className="flex h-8 items-center gap-3 border-b border-[var(--lnr-border)] px-3 text-[11px] text-[var(--lnr-ink-tertiary)] sm:px-4">
            <span className="flex-1">Project</span>
            <span className="hidden w-[92px] md:inline">Health</span>
            <span className="hidden w-[120px] sm:inline">Progress</span>
            <span className="w-[64px] text-right sm:w-[80px]">Target</span>
          </div>
          {all.map((entry) => {
            const stats = projectStats(entry, issues);
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => onSelect(entry.id)}
                className="flex w-full items-center gap-3 border-b border-[var(--lnr-border)] px-3 py-2.5 text-left transition-colors hover:bg-[var(--lnr-hover)] sm:px-4"
              >
                <Box className="h-4 w-4 shrink-0 text-[var(--lnr-accent)]" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] text-[var(--lnr-ink)]">
                    {entry.title}
                  </span>
                  {entry.description ? (
                    <span className="block truncate text-[12px] text-[var(--lnr-ink-tertiary)]">
                      {entry.description}
                    </span>
                  ) : null}
                </span>
                <span className="hidden w-[92px] shrink-0 md:block">
                  <HealthPill
                    status={entry.status}
                    onChange={(status) => setProjectHealth(entry.id, status)}
                  />
                </span>
                <span className="hidden w-[120px] shrink-0 items-center gap-2 sm:flex">
                  <span className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--lnr-strong)]">
                    <span
                      className="block h-full rounded-full bg-[var(--lnr-accent)]"
                      style={{ width: `${stats.progress}%` }}
                    />
                  </span>
                  <span className="w-8 text-right text-[11px] tabular-nums text-[var(--lnr-ink-tertiary)]">
                    {stats.progress}%
                  </span>
                </span>
                <span
                  className={cn(
                    "w-[64px] shrink-0 text-right text-[12px] tabular-nums sm:w-[80px]",
                    entry.targetDate && new Date(entry.targetDate) < new Date()
                      ? "text-[var(--lnr-urgent)]"
                      : "text-[var(--lnr-ink-subtle)]",
                  )}
                >
                  {entry.targetDate ? formatShortDate(entry.targetDate) : "—"}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <NewProjectDialog
        open={creating}
        onOpenChange={setCreating}
        projectId={projectId}
        onCreated={(created) => setLocal((current) => [...current, created])}
      />
    </div>
  );
}

export { projectStats, HEALTH };
