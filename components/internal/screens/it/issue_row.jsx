"use client";

import React from "react";
import { Link2, Paperclip, Trash2 } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Checkbox,
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@geiger/ui";
import { cn } from "@/lib/utils";
import {
  PRIORITIES,
  WORKFLOW_STATES,
  formatShortDate,
  isOverdue,
  labelColor,
} from "./constants";
import { PriorityIcon, StatusIcon } from "./icons";
import { AssigneePicker, PriorityPicker, StatusPicker } from "./pickers";
import { useTracker } from "./use_tracker";

// One Linear issue row. Left to right: select box, priority, identifier,
// status, title, then the right cluster (labels, project/cycle, links, due
// date, avatar). Every glyph in the left cluster is its own picker trigger, so
// properties are editable without opening the issue — that inline editability
// is the thing that makes the list feel like Linear rather than a table.
//
// Narrow screens drop the right cluster progressively rather than letting it
// squeeze the title: labels/project/cycle go first (<xl), then the identifier
// and dates (<sm). Priority, status, title and assignee always survive.

function AssigneeStack({ ids, peopleById }) {
  if (!ids?.length) {
    return (
      <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full border border-dashed border-[var(--lnr-border-strong)] text-[9px] text-[var(--lnr-ink-tertiary)]">
        ?
      </span>
    );
  }

  return (
    <span className="flex -space-x-1.5">
      {ids.slice(0, 3).map((id) => {
        const person = peopleById[id];
        return (
          <Avatar
            key={id}
            className="h-[22px] w-[22px] ring-2 ring-[var(--lnr-panel)]"
            title={person?.name || "Unknown"}
          >
            <AvatarImage src={person?.avatarUrl} alt="" />
            <AvatarFallback className="bg-[var(--lnr-strong)] text-[9px] text-[var(--lnr-ink-muted)]">
              {person?.initials || "?"}
            </AvatarFallback>
          </Avatar>
        );
      })}
      {ids.length > 3 ? (
        <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[var(--lnr-strong)] text-[9px] text-[var(--lnr-ink-muted)] ring-2 ring-[var(--lnr-panel)]">
          +{ids.length - 3}
        </span>
      ) : null}
    </span>
  );
}

// Radix closes a context menu on any outside pointer-down, which would take a
// popover opened from inside it with it — so the row menu uses real submenus.
function RowSubMenu({ label, icon, children }) {
  return (
    <ContextMenuSub>
      <ContextMenuSubTrigger>
        {icon}
        {label}
      </ContextMenuSubTrigger>
      <ContextMenuSubContent className="linear-scope max-h-72 w-56 overflow-y-auto border-[var(--lnr-border-strong)] bg-[var(--lnr-elevated)] lnr-scrollbar">
        {children}
      </ContextMenuSubContent>
    </ContextMenuSub>
  );
}

export function IssueRow({
  issue,
  identifier,
  properties,
  selected,
  focused,
  selectionActive,
  onOpen,
  onToggleSelect,
}) {
  const { peopleById, people, issues, projects, cycles, patchIssue, removeIssue } =
    useTracker();

  const knownLabels = React.useMemo(
    () => [...new Set(issues.flatMap((entry) => entry.labels ?? []))].sort(),
    [issues],
  );

  const project = projects.find((entry) => entry.id === issue.objectiveId);
  const cycle = cycles.find((entry) => entry.id === issue.cycleId);
  const overdue = isOverdue(issue);

  const stop = (event) => event.stopPropagation();
  const set = (patch) => patchIssue(issue.id, patch, { silent: true });

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          data-lnr-row
          data-selected={selected ? "true" : "false"}
          data-focused={focused ? "true" : "false"}
          role="button"
          tabIndex={-1}
          onClick={onOpen}
          className="group relative flex h-10 cursor-default items-center gap-2 border-b border-[var(--lnr-border)] pl-2 pr-2 text-[13px] transition-colors sm:pl-3 sm:pr-4"
        >
          {/* The checkbox only takes up space once a selection is in flight,
              matching Linear's reveal-on-hover behaviour. */}
          <span
            onClick={stop}
            className={cn(
              "hidden shrink-0 transition-opacity sm:block",
              selectionActive || selected
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100",
            )}
          >
            <Checkbox
              checked={selected}
              onCheckedChange={onToggleSelect}
              aria-label={`Select ${identifier}`}
              className="h-3.5 w-3.5 rounded-[3px] border-[var(--lnr-border-strong)]"
            />
          </span>

          {properties.priority ? (
            <PriorityPicker value={issue.priority} onSelect={(priority) => set({ priority })}>
              <button
                type="button"
                onClick={stop}
                aria-label="Set priority"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] hover:bg-[var(--lnr-selected)]"
              >
                <PriorityIcon priority={issue.priority} />
              </button>
            </PriorityPicker>
          ) : null}

          {properties.identifier ? (
            <span className="hidden w-[74px] shrink-0 truncate text-[12px] tabular-nums text-[var(--lnr-ink-tertiary)] sm:block">
              {identifier}
            </span>
          ) : null}

          {properties.status ? (
            <StatusPicker value={issue.status} onSelect={(status) => set({ status })}>
              <button
                type="button"
                onClick={stop}
                aria-label="Change status"
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] hover:bg-[var(--lnr-selected)]"
              >
                <StatusIcon status={issue.status} />
              </button>
            </StatusPicker>
          ) : null}

          <span className="min-w-0 flex-1 truncate text-[var(--lnr-ink)]">
            {issue.title}
          </span>

          {/* Right cluster — everything here is fixed-width so rows align. */}
          <span className="flex shrink-0 items-center gap-1.5">
            {properties.labels && issue.labels?.length
              ? issue.labels.slice(0, 3).map((label) => (
                  <span
                    key={label}
                    className="hidden items-center gap-1 rounded-full border border-[var(--lnr-border-strong)] px-1.5 py-[1px] text-[11px] text-[var(--lnr-ink-muted)] xl:flex"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: labelColor(label) }}
                    />
                    {label}
                  </span>
                ))
              : null}
            {properties.labels && issue.labels?.length > 3 ? (
              <span className="hidden rounded-full border border-[var(--lnr-border-strong)] px-1.5 py-[1px] text-[11px] text-[var(--lnr-ink-tertiary)] xl:inline">
                +{issue.labels.length - 3}
              </span>
            ) : null}

            {properties.project && project ? (
              <span className="hidden max-w-[140px] truncate rounded-full border border-[var(--lnr-border-strong)] px-1.5 py-[1px] text-[11px] text-[var(--lnr-ink-muted)] lg:inline">
                {project.title}
              </span>
            ) : null}

            {properties.cycle && cycle ? (
              <span className="hidden max-w-[120px] truncate rounded-full border border-[var(--lnr-border-strong)] px-1.5 py-[1px] text-[11px] text-[var(--lnr-ink-muted)] lg:inline">
                {cycle.title}
              </span>
            ) : null}

            {properties.estimate && issue.estimate ? (
              <span className="hidden w-5 text-center text-[11px] tabular-nums text-[var(--lnr-ink-subtle)] sm:inline">
                {issue.estimate}
              </span>
            ) : null}

            {properties.links && issue.attachments?.length ? (
              <span className="hidden items-center gap-0.5 text-[11px] text-[var(--lnr-ink-tertiary)] sm:flex">
                <Paperclip className="h-3 w-3" />
                {issue.attachments.length}
              </span>
            ) : null}

            {properties.links && issue.parentId ? (
              <Link2 className="hidden h-3.5 w-3.5 text-[var(--lnr-ink-tertiary)] sm:block" />
            ) : null}

            {properties.created ? (
              <span className="hidden w-[52px] text-right text-[11px] text-[var(--lnr-ink-tertiary)] md:inline">
                {formatShortDate(issue.createdAt)}
              </span>
            ) : null}

            {properties.dueDate && issue.dueDate ? (
              <span
                className={cn(
                  "hidden text-[11px] tabular-nums sm:inline",
                  overdue ? "text-[var(--lnr-urgent)]" : "text-[var(--lnr-ink-subtle)]",
                )}
              >
                {formatShortDate(issue.dueDate)}
              </span>
            ) : null}

            {properties.assignee ? (
              <AssigneePicker
                align="end"
                value={issue.assignees ?? []}
                onSelect={(assignees) => set({ assignees })}
              >
                <button
                  type="button"
                  onClick={stop}
                  aria-label="Assign"
                  className="flex items-center rounded-full"
                >
                  <AssigneeStack ids={issue.assignees} peopleById={peopleById} />
                </button>
              </AssigneePicker>
            ) : null}
          </span>
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="linear-scope w-52 border-[var(--lnr-border-strong)] bg-[var(--lnr-elevated)]">
        <RowSubMenu label="Status" icon={<StatusIcon status={issue.status} />}>
          {WORKFLOW_STATES.map((state) => (
            <ContextMenuCheckboxItem
              key={state.value}
              checked={issue.status === state.value}
              onSelect={() => set({ status: state.value })}
            >
              <StatusIcon status={state.value} />
              {state.label}
            </ContextMenuCheckboxItem>
          ))}
        </RowSubMenu>

        <RowSubMenu label="Priority" icon={<PriorityIcon priority={issue.priority} />}>
          {PRIORITIES.map((priority) => (
            <ContextMenuCheckboxItem
              key={priority.value}
              checked={issue.priority === priority.value}
              onSelect={() => set({ priority: priority.value })}
            >
              <PriorityIcon priority={priority.value} />
              {priority.label}
            </ContextMenuCheckboxItem>
          ))}
        </RowSubMenu>

        <RowSubMenu label="Assignees">
          <ContextMenuCheckboxItem
            checked={!issue.assignees?.length}
            onSelect={() => set({ assignees: [] })}
          >
            No assignee
          </ContextMenuCheckboxItem>
          {people.map((person) => {
            const assigned = (issue.assignees ?? []).includes(person.id);
            return (
              <ContextMenuCheckboxItem
                key={person.id}
                checked={assigned}
                onSelect={() =>
                  set({
                    assignees: assigned
                      ? issue.assignees.filter((entry) => entry !== person.id)
                      : [...(issue.assignees ?? []), person.id],
                  })
                }
              >
                {person.name}
              </ContextMenuCheckboxItem>
            );
          })}
        </RowSubMenu>

        {knownLabels.length ? (
          <RowSubMenu label="Labels">
            {knownLabels.map((label) => {
              const applied = (issue.labels ?? []).includes(label);
              return (
                <ContextMenuCheckboxItem
                  key={label}
                  checked={applied}
                  onSelect={() =>
                    set({
                      labels: applied
                        ? issue.labels.filter((entry) => entry !== label)
                        : [...(issue.labels ?? []), label],
                    })
                  }
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: labelColor(label) }}
                  />
                  {label}
                </ContextMenuCheckboxItem>
              );
            })}
          </RowSubMenu>
        ) : null}

        <RowSubMenu label="Project">
          <ContextMenuCheckboxItem
            checked={!issue.objectiveId}
            onSelect={() => set({ objectiveId: null })}
          >
            No project
          </ContextMenuCheckboxItem>
          {projects.map((entry) => (
            <ContextMenuCheckboxItem
              key={entry.id}
              checked={issue.objectiveId === entry.id}
              onSelect={() => set({ objectiveId: entry.id })}
            >
              {entry.title}
            </ContextMenuCheckboxItem>
          ))}
        </RowSubMenu>

        <RowSubMenu label="Cycle">
          <ContextMenuCheckboxItem
            checked={!issue.cycleId}
            onSelect={() => set({ cycleId: null })}
          >
            No cycle
          </ContextMenuCheckboxItem>
          {cycles.map((entry) => (
            <ContextMenuCheckboxItem
              key={entry.id}
              checked={issue.cycleId === entry.id}
              onSelect={() => set({ cycleId: entry.id })}
            >
              {entry.title}
            </ContextMenuCheckboxItem>
          ))}
        </RowSubMenu>

        <ContextMenuSeparator className="bg-[var(--lnr-border)]" />
        <ContextMenuItem
          onSelect={() => {
            void navigator.clipboard?.writeText(identifier);
          }}
        >
          Copy ID
        </ContextMenuItem>
        <ContextMenuItem
          variant="destructive"
          onSelect={() => removeIssue(issue.id)}
          className="text-[var(--destructive-text)] focus:bg-red-500/10"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
