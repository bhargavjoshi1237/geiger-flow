"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Kbd,
} from "@geiger/ui";
import { cn } from "@/lib/utils";
import { issueIdentifier } from "@/features/issues/constants";
import { labelColor } from "./constants";
import { filterIssues, groupIssues, groupPatch, sortIssues } from "./grouping";
import { PriorityIcon, StatusIcon } from "./icons";
import { IssueRow } from "./issue_row";
import {
  AssigneePicker,
  LabelPicker,
  PriorityPicker,
  StatusPicker,
} from "./pickers";
import { useTracker } from "./use_tracker";

// The grouped issue surface. Owns exactly three things the row does not:
// section headers, keyboard navigation (j/k/x/enter), and the bulk action bar
// that appears once more than one row is selected.

function GroupGlyph({ group }) {
  if (group.icon === "status") return <StatusIcon status={group.key} />;
  if (group.icon === "priority") return <PriorityIcon priority={group.key} />;
  if (group.icon === "label") {
    return (
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: labelColor(group.key) }}
      />
    );
  }
  if (group.icon === "avatar") {
    return group.avatar ? (
      <Avatar className="h-4 w-4">
        <AvatarImage src={group.avatar.avatarUrl} alt="" />
        <AvatarFallback className="bg-[var(--lnr-strong)] text-[8px] text-[var(--lnr-ink-muted)]">
          {group.avatar.initials}
        </AvatarFallback>
      </Avatar>
    ) : (
      <span className="h-4 w-4 rounded-full border border-dashed border-[var(--lnr-border-strong)]" />
    );
  }
  return <span className="h-2 w-2 rounded-full bg-[var(--lnr-ink-tertiary)]" />;
}

function GroupHeader({ group, onCreate }) {
  return (
    <div className="sticky top-0 z-10 flex h-9 items-center gap-2 border-b border-[var(--lnr-border)] bg-[var(--lnr-elevated)] px-3 sm:px-4">
      <GroupGlyph group={group} />
      <span className="text-[13px] font-medium text-[var(--lnr-ink)]">{group.label}</span>
      <span className="text-[12px] tabular-nums text-[var(--lnr-ink-tertiary)]">
        {group.issues.length}
      </span>
      <button
        type="button"
        onClick={onCreate}
        aria-label={`New issue in ${group.label}`}
        className="ml-auto flex h-5 w-5 items-center justify-center rounded-[4px] text-[var(--lnr-ink-tertiary)] hover:bg-[var(--lnr-hover)] hover:text-[var(--lnr-ink)]"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// Bulk bar — Linear floats it over the list once a selection exists.
function BulkBar({ ids, onClear }) {
  const { patchIssue, removeIssue } = useTracker();

  const applyAll = async (patch) => {
    await Promise.all(ids.map((id) => patchIssue(id, patch, { silent: true })));
    onClear();
  };

  return (
    <div className="pointer-events-auto absolute bottom-5 left-1/2 z-30 flex max-w-[calc(100vw-1.5rem)] -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-[8px] border border-[var(--lnr-border-strong)] bg-[var(--lnr-elevated)] p-1 shadow-2xl lnr-scrollbar">
      <span className="px-2 text-[12px] text-[var(--lnr-ink-subtle)]">
        {ids.length} selected
      </span>
      <StatusPicker onSelect={(status) => applyAll({ status })}>
        <Button size="sm" variant="ghost" className="h-7 gap-1.5 px-2 text-[12px]">
          <StatusIcon status="todo" />
          Status
        </Button>
      </StatusPicker>
      <PriorityPicker onSelect={(priority) => applyAll({ priority })}>
        <Button size="sm" variant="ghost" className="h-7 gap-1.5 px-2 text-[12px]">
          <PriorityIcon priority="medium" />
          Priority
        </Button>
      </PriorityPicker>
      <AssigneePicker value={[]} onSelect={(assignees) => applyAll({ assignees })}>
        <Button size="sm" variant="ghost" className="hidden h-7 px-2 text-[12px] sm:inline-flex">
          Assignee
        </Button>
      </AssigneePicker>
      <LabelPicker value={[]} onSelect={(labels) => applyAll({ labels })}>
        <Button size="sm" variant="ghost" className="hidden h-7 px-2 text-[12px] sm:inline-flex">
          Labels
        </Button>
      </LabelPicker>
      <Button
        size="sm"
        variant="ghost"
        onClick={async () => {
          await Promise.all(ids.map((id) => removeIssue(id)));
          onClear();
        }}
        className="h-7 gap-1.5 px-2 text-[12px] text-[var(--destructive-text)] hover:bg-red-500/10"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={onClear}
        aria-label="Clear selection"
        className="h-7 w-7 px-0"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export function IssueSurface({
  issues,
  display,
  filters = {},
  search = "",
  onOpenIssue,
  onCreate,
  emptyTitle = "No issues",
  emptyHint = "Create an issue to get started.",
}) {
  const tracker = useTracker();
  const { project, peopleById, projects, cycles } = tracker;
  const [selected, setSelected] = useState(() => new Set());
  const [focusIndex, setFocusIndex] = useState(0);
  const containerRef = useRef(null);

  const visible = useMemo(() => {
    const filtered = filterIssues(issues, { filters, search, display });
    return sortIssues(filtered, display.ordering);
  }, [issues, filters, search, display]);

  const groups = useMemo(
    () => groupIssues(visible, display.grouping, { peopleById, projects, cycles }),
    [visible, display.grouping, peopleById, projects, cycles],
  );

  // Flat order across groups is what j/k walks.
  const flat = useMemo(() => groups.flatMap((group) => group.issues), [groups]);

  const toggle = useCallback((id) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelected(new Set()), []);

  // Linear's list shortcuts. Ignored while the user is typing in a field or a
  // dialog/popover has focus.
  useEffect(() => {
    const handler = (event) => {
      const tag = event.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || event.target?.isContentEditable) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const key = event.key.toLowerCase();
      if (key === "j" || event.key === "ArrowDown") {
        event.preventDefault();
        setFocusIndex((index) => Math.min(flat.length - 1, index + 1));
      } else if (key === "k" || event.key === "ArrowUp") {
        event.preventDefault();
        setFocusIndex((index) => Math.max(0, index - 1));
      } else if (key === "x") {
        event.preventDefault();
        const issue = flat[focusIndex];
        if (issue) toggle(issue.id);
      } else if (event.key === "Enter") {
        const issue = flat[focusIndex];
        if (issue) {
          event.preventDefault();
          onOpenIssue?.(issue.id);
        }
      } else if (event.key === "Escape") {
        clearSelection();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [flat, focusIndex, toggle, clearSelection, onOpenIssue]);

  if (display.layout === "board") {
    return (
      <IssueBoardSurface
        groups={groups}
        display={display}
        onOpenIssue={onOpenIssue}
        onCreate={onCreate}
      />
    );
  }

  if (visible.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <p className="text-[15px] font-medium text-[var(--lnr-ink)]">{emptyTitle}</p>
        <p className="max-w-sm text-[13px] text-[var(--lnr-ink-subtle)]">{emptyHint}</p>
        {onCreate ? (
          <Button
            size="sm"
            onClick={() => onCreate({})}
            className="mt-1 bg-[var(--lnr-accent)] text-white hover:bg-[var(--lnr-accent-hover)]"
          >
            <Plus className="h-3.5 w-3.5" />
            New issue
          </Button>
        ) : null}
      </div>
    );
  }

  const selectionActive = selected.size > 0;

  return (
    <div ref={containerRef} className="relative flex-1 overflow-y-auto lnr-scrollbar">
      {groups.map((group) => (
        <section key={group.key}>
          <GroupHeader
            group={group}
            onCreate={() => onCreate?.(groupPatch(display.grouping, group.key))}
          />
          {group.issues.map((issue) => (
            <IssueRow
              key={issue.id}
              issue={issue}
              identifier={issueIdentifier(issue, project)}
              properties={display.properties}
              selected={selected.has(issue.id)}
              focused={flat[focusIndex]?.id === issue.id}
              selectionActive={selectionActive}
              onOpen={() => onOpenIssue?.(issue.id)}
              onToggleSelect={() => toggle(issue.id)}
            />
          ))}
        </section>
      ))}

      {selectionActive ? (
        <div className="sticky bottom-0 left-0 h-0">
          <BulkBar ids={[...selected]} onClear={clearSelection} />
        </div>
      ) : null}
    </div>
  );
}

// --- Board -----------------------------------------------------------------

function BoardCard({ issue, identifier, properties, onOpen }) {
  const { peopleById, patchIssue } = useTracker();
  const assignee = peopleById[issue.assignees?.[0]];

  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onDragStart={(event) => event.dataTransfer.setData("text/plain", issue.id)}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter") onOpen();
      }}
      className="cursor-default rounded-[6px] border border-[var(--lnr-border)] bg-[var(--lnr-panel)] p-2.5 transition-colors hover:border-[var(--lnr-border-strong)] hover:bg-[var(--lnr-hover)]"
    >
      <div className="mb-1.5 flex items-center gap-2">
        <span className="text-[11px] tabular-nums text-[var(--lnr-ink-tertiary)]">
          {identifier}
        </span>
        <span className="ml-auto flex items-center gap-1.5">
          {properties.priority ? (
            <PriorityPicker
              value={issue.priority}
              onSelect={(priority) => patchIssue(issue.id, { priority }, { silent: true })}
            >
              <button
                type="button"
                onClick={(event) => event.stopPropagation()}
                aria-label="Set priority"
              >
                <PriorityIcon priority={issue.priority} />
              </button>
            </PriorityPicker>
          ) : null}
          {assignee ? (
            <Avatar className="h-[18px] w-[18px]">
              <AvatarImage src={assignee.avatarUrl} alt="" />
              <AvatarFallback className="bg-[var(--lnr-strong)] text-[8px] text-[var(--lnr-ink-muted)]">
                {assignee.initials}
              </AvatarFallback>
            </Avatar>
          ) : null}
        </span>
      </div>
      <p className="line-clamp-2 text-[13px] text-[var(--lnr-ink)]">{issue.title}</p>
      {properties.labels && issue.labels?.length ? (
        <div className="mt-2 flex flex-wrap gap-1">
          {issue.labels.slice(0, 3).map((label) => (
            <span
              key={label}
              className="flex items-center gap-1 rounded-full border border-[var(--lnr-border-strong)] px-1.5 py-[1px] text-[10px] text-[var(--lnr-ink-muted)]"
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: labelColor(label) }}
              />
              {label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function IssueBoardSurface({ groups, display, onOpenIssue, onCreate }) {
  const { project, patchIssue } = useTracker();
  const [dragOver, setDragOver] = useState(null);

  return (
    <div className="flex flex-1 gap-3 overflow-x-auto p-2 lnr-scrollbar sm:p-4">
      {groups.map((group) => (
        <div
          key={group.key}
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(group.key);
          }}
          onDragLeave={() => setDragOver((current) => (current === group.key ? null : current))}
          onDrop={(event) => {
            event.preventDefault();
            setDragOver(null);
            const id = event.dataTransfer.getData("text/plain");
            const patch = groupPatch(display.grouping, group.key);
            if (id && Object.keys(patch).length) {
              void patchIssue(id, patch, { silent: true });
            }
          }}
          className={cn(
            "flex w-[calc(100vw-3rem)] max-w-[300px] shrink-0 flex-col rounded-[8px] border border-transparent sm:w-[300px]",
            dragOver === group.key && "border-[var(--lnr-accent)] bg-[var(--lnr-accent-soft)]",
          )}
        >
          <div className="flex h-9 items-center gap-2 px-2">
            <GroupGlyph group={group} />
            <span className="text-[13px] font-medium text-[var(--lnr-ink)]">{group.label}</span>
            <span className="text-[12px] tabular-nums text-[var(--lnr-ink-tertiary)]">
              {group.issues.length}
            </span>
            <button
              type="button"
              onClick={() => onCreate?.(groupPatch(display.grouping, group.key))}
              aria-label={`New issue in ${group.label}`}
              className="ml-auto flex h-5 w-5 items-center justify-center rounded-[4px] text-[var(--lnr-ink-tertiary)] hover:bg-[var(--lnr-hover)] hover:text-[var(--lnr-ink)]"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex flex-col gap-1.5 overflow-y-auto px-1 pb-2 lnr-scrollbar">
            {group.issues.map((issue) => (
              <BoardCard
                key={issue.id}
                issue={issue}
                identifier={issueIdentifier(issue, project)}
                properties={display.properties}
                onOpen={() => onOpenIssue?.(issue.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ListHint() {
  return (
    <div className="hidden items-center gap-2 border-t border-[var(--lnr-border)] px-4 py-1.5 text-[11px] text-[var(--lnr-ink-tertiary)] lg:flex">
      <Kbd>J</Kbd>
      <Kbd>K</Kbd>
      navigate
      <Kbd className="ml-2">X</Kbd>
      select
      <Kbd className="ml-2">↵</Kbd>
      open
      <Kbd className="ml-2">C</Kbd>
      new issue
    </div>
  );
}
