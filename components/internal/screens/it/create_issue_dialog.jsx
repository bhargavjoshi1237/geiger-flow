"use client";

import React, { useState } from "react";
import { Box, Repeat, Tag, User } from "lucide-react";
import { toast } from "sonner";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Textarea,
} from "@geiger/ui";
import { labelColor } from "./constants";
import { PriorityIcon, StatusIcon, priorityLabel, statusLabel } from "./icons";
import {
  AssigneePicker,
  CyclePicker,
  LabelPicker,
  PriorityPicker,
  ProjectPicker,
  StatusPicker,
} from "./pickers";
import { useTracker } from "./use_tracker";

// Linear's create modal: title and description on top, every property as a
// pill along the bottom. Opens pre-filled from wherever it was triggered —
// a group's "+" seeds that group's value via `defaults`.

const EMPTY = {
  title: "",
  description: "",
  status: "backlog",
  priority: "none",
  assignees: [],
  labels: [],
  objectiveId: null,
  cycleId: null,
};

function Pill({ children, active }) {
  return (
    <button
      type="button"
      className={`flex h-7 items-center gap-1.5 rounded-[5px] border px-2 text-[12px] transition-colors ${
        active
          ? "border-[var(--lnr-border-strong)] bg-[var(--lnr-selected)] text-[var(--lnr-ink)]"
          : "border-[var(--lnr-border-strong)] text-[var(--lnr-ink-subtle)] hover:bg-[var(--lnr-hover)] hover:text-[var(--lnr-ink)]"
      }`}
    >
      {children}
    </button>
  );
}

export function CreateIssueDialog({ open, onOpenChange, defaults, onCreated }) {
  const { addIssue, projectKey, peopleById, projects, cycles } = useTracker();
  const [draft, setDraft] = useState(EMPTY);
  const [seeded, setSeeded] = useState(false);
  const [saving, setSaving] = useState(false);

  // Re-seed from `defaults` each time the dialog opens, not on every render.
  if (open && !seeded) {
    setSeeded(true);
    setDraft({ ...EMPTY, ...defaults });
  }
  if (!open && seeded) setSeeded(false);

  const set = (patch) => setDraft((current) => ({ ...current, ...patch }));

  const submit = async (event) => {
    event.preventDefault();
    if (!draft.title.trim()) {
      toast.error("Give the issue a title.");
      return;
    }
    setSaving(true);
    const created = await addIssue({ ...draft, title: draft.title.trim() });
    setSaving(false);
    if (created) {
      toast.success("Issue created");
      onOpenChange(false);
      onCreated?.(created);
    }
  };

  const linkedProject = projects.find((entry) => entry.id === draft.objectiveId);
  const linkedCycle = cycles.find((entry) => entry.id === draft.cycleId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="linear-scope max-h-[90dvh] w-[calc(100vw-2rem)] max-w-[640px] gap-0 overflow-y-auto border-[var(--lnr-border-strong)] bg-[var(--lnr-elevated)] p-0 lnr-scrollbar"
      >
        <DialogTitle className="sr-only">New issue</DialogTitle>
        <DialogDescription className="sr-only">
          Create an issue in {projectKey}.
        </DialogDescription>

        <form onSubmit={submit}>
          <div className="flex items-center gap-2 px-4 pt-3.5">
            <span className="rounded-[4px] border border-[var(--lnr-border-strong)] px-1.5 py-0.5 text-[11px] text-[var(--lnr-ink-subtle)]">
              {projectKey}
            </span>
            <span className="text-[12px] text-[var(--lnr-ink-tertiary)]">New issue</span>
          </div>

          <div className="px-4 pt-2">
            <input
              autoFocus
              value={draft.title}
              onChange={(event) => set({ title: event.target.value })}
              placeholder="Issue title"
              className="w-full bg-transparent text-[17px] font-medium text-[var(--lnr-ink)] outline-none placeholder:text-[var(--lnr-ink-tertiary)]"
            />
            <Textarea
              value={draft.description}
              onChange={(event) => set({ description: event.target.value })}
              placeholder="Add description..."
              rows={4}
              className="mt-1 resize-none border-0 bg-transparent px-0 text-[13px] shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 px-4 pb-3">
            <StatusPicker value={draft.status} onSelect={(status) => set({ status })}>
              <Pill active>
                <StatusIcon status={draft.status} />
                {statusLabel(draft.status)}
              </Pill>
            </StatusPicker>

            <PriorityPicker value={draft.priority} onSelect={(priority) => set({ priority })}>
              <Pill active={draft.priority !== "none"}>
                <PriorityIcon priority={draft.priority} />
                {priorityLabel(draft.priority)}
              </Pill>
            </PriorityPicker>

            <AssigneePicker
              value={draft.assignees}
              onSelect={(assignees) => set({ assignees })}
            >
              <Pill active={draft.assignees.length > 0}>
                {draft.assignees.length ? (
                  <>
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={peopleById[draft.assignees[0]]?.avatarUrl} alt="" />
                      <AvatarFallback className="bg-[var(--lnr-strong)] text-[8px]">
                        {peopleById[draft.assignees[0]]?.initials || "?"}
                      </AvatarFallback>
                    </Avatar>
                    {draft.assignees.length === 1
                      ? peopleById[draft.assignees[0]]?.name || "Assignee"
                      : `${draft.assignees.length} assignees`}
                  </>
                ) : (
                  <>
                    <User className="h-3.5 w-3.5" />
                    Assignee
                  </>
                )}
              </Pill>
            </AssigneePicker>

            <LabelPicker value={draft.labels} onSelect={(labels) => set({ labels })}>
              <Pill active={draft.labels.length > 0}>
                {draft.labels.length ? (
                  <>
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: labelColor(draft.labels[0]) }}
                    />
                    {draft.labels.length === 1 ? draft.labels[0] : `${draft.labels.length} labels`}
                  </>
                ) : (
                  <>
                    <Tag className="h-3.5 w-3.5" />
                    Label
                  </>
                )}
              </Pill>
            </LabelPicker>

            <ProjectPicker
              value={draft.objectiveId}
              onSelect={(objectiveId) => set({ objectiveId })}
            >
              <Pill active={Boolean(draft.objectiveId)}>
                <Box className="h-3.5 w-3.5" />
                {linkedProject?.title || "Project"}
              </Pill>
            </ProjectPicker>

            <CyclePicker value={draft.cycleId} onSelect={(cycleId) => set({ cycleId })}>
              <Pill active={Boolean(draft.cycleId)}>
                <Repeat className="h-3.5 w-3.5" />
                {linkedCycle?.title || "Cycle"}
              </Pill>
            </CyclePicker>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-[var(--lnr-border)] px-4 py-2.5">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="h-7 text-[12px] text-[var(--lnr-ink-subtle)]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={saving}
              className="h-7 bg-[var(--lnr-accent)] px-3 text-[12px] text-white hover:bg-[var(--lnr-accent-hover)]"
            >
              Create issue
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
