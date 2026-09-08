"use client";

import React, { useMemo, useState } from "react";
import { Inbox, Plus, Search, SquareStack, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_DISPLAY, isCompleted } from "../constants";
import { IssueSurface, ListHint } from "../issue_list";
import { DisplayMenu, FilterBar, ViewHeader } from "../view_header";
import { useTracker } from "../use_tracker";

// Every issue surface in the tracker is this frame: header + filter bar +
// grouped list/board. The individual views differ only in their crumb, their
// tabs and the slice of issues they hand in.

function SearchField({ value, onChange }) {
  const [open, setOpen] = useState(false);

  if (!open && !value) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search issues"
        className="flex h-7 w-7 items-center justify-center rounded-[5px] text-[var(--lnr-ink-subtle)] hover:bg-[var(--lnr-hover)] hover:text-[var(--lnr-ink)]"
      >
        <Search className="h-3.5 w-3.5" />
      </button>
    );
  }

  return (
    <div className="flex h-7 items-center gap-1.5 rounded-[5px] border border-[var(--lnr-border-strong)] bg-[var(--lnr-panel)] px-2">
      <Search className="h-3.5 w-3.5 shrink-0 text-[var(--lnr-ink-tertiary)]" />
      <input
        autoFocus
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            onChange("");
            setOpen(false);
          }
        }}
        placeholder="Search issues..."
        className="w-28 bg-transparent text-[12px] text-[var(--lnr-ink)] outline-none placeholder:text-[var(--lnr-ink-tertiary)] sm:w-40"
      />
      <button
        type="button"
        aria-label="Clear search"
        onClick={() => {
          onChange("");
          setOpen(false);
        }}
        className="text-[var(--lnr-ink-tertiary)] hover:text-[var(--lnr-ink)]"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

export function IssueViewFrame({
  crumbs,
  tabs,
  activeTab,
  onTab,
  issues,
  initialDisplay,
  onOpenIssue,
  onCreate,
  emptyTitle,
  emptyHint,
}) {
  const [display, setDisplay] = useState({ ...DEFAULT_DISPLAY, ...initialDisplay });
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState("");

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ViewHeader
        crumbs={crumbs}
        tabs={tabs}
        activeTab={activeTab}
        onTab={onTab}
        actions={
          <>
            <SearchField value={search} onChange={setSearch} />
            <DisplayMenu display={display} onChange={setDisplay} />
            <button
              type="button"
              onClick={() => onCreate?.({})}
              className="flex h-7 items-center gap-1 rounded-[5px] bg-[var(--lnr-accent)] px-2.5 text-[12px] font-medium text-white hover:bg-[var(--lnr-accent-hover)]"
            >
              <Plus className="h-3.5 w-3.5" />
              New
            </button>
          </>
        }
      />
      <FilterBar filters={filters} onChange={setFilters} />
      <IssueSurface
        issues={issues}
        display={display}
        filters={filters}
        search={search}
        onOpenIssue={onOpenIssue}
        onCreate={onCreate}
        emptyTitle={emptyTitle}
        emptyHint={emptyHint}
      />
      {display.layout === "list" ? <ListHint /> : null}
    </div>
  );
}

export function AllIssuesView({ onOpenIssue, onCreate }) {
  const { issues, projectKey } = useTracker();
  const [tab, setTab] = useState("all");

  const scoped = useMemo(() => {
    if (tab === "active") {
      return issues.filter(
        (issue) => issue.status === "in_progress" || issue.status === "in_review",
      );
    }
    if (tab === "backlog") return issues.filter((issue) => issue.status === "backlog");
    return issues;
  }, [issues, tab]);

  return (
    <IssueViewFrame
      crumbs={[{ label: projectKey, icon: SquareStack }, { label: "Issues" }]}
      tabs={[
        { value: "all", label: "All issues" },
        {
          value: "active",
          label: "Active",
          count: issues.filter(
            (issue) => issue.status === "in_progress" || issue.status === "in_review",
          ).length,
        },
        {
          value: "backlog",
          label: "Backlog",
          count: issues.filter((issue) => issue.status === "backlog").length,
        },
      ]}
      activeTab={tab}
      onTab={setTab}
      issues={scoped}
      onOpenIssue={onOpenIssue}
      onCreate={onCreate}
      emptyTitle="No issues yet"
      emptyHint="Issues you create in this project show up here, grouped by status."
    />
  );
}

export function MyIssuesView({ onOpenIssue, onCreate }) {
  const { issues, me } = useTracker();
  const [tab, setTab] = useState("assigned");

  const buckets = useMemo(() => {
    if (!me) return { assigned: [], created: [], subscribed: [] };
    return {
      assigned: issues.filter((issue) => (issue.assignees ?? []).includes(me.id)),
      created: issues.filter((issue) => issue.createdBy === me.id),
      subscribed: issues.filter((issue) => (issue.subscribed ?? []).includes(me.id)),
    };
  }, [issues, me]);

  return (
    <IssueViewFrame
      crumbs={[{ label: "My Issues" }]}
      tabs={[
        { value: "assigned", label: "Assigned", count: buckets.assigned.length },
        { value: "created", label: "Created", count: buckets.created.length },
        { value: "subscribed", label: "Subscribed", count: buckets.subscribed.length },
      ]}
      activeTab={tab}
      onTab={setTab}
      issues={buckets[tab]}
      onOpenIssue={onOpenIssue}
      onCreate={onCreate}
      emptyTitle={
        tab === "assigned"
          ? "Nothing assigned to you"
          : tab === "created"
            ? "You haven't created any issues"
            : "You're not subscribed to any issues"
      }
      emptyHint="Issues matching this tab will collect here as work moves."
    />
  );
}

// Triage is Linear's intake queue: unassigned backlog work, accepted into the
// workflow or declined right from the row.
export function TriageView({ onOpenIssue, onCreate }) {
  const { issues, patchIssue } = useTracker();

  const queue = useMemo(
    () =>
      issues.filter(
        (issue) => issue.status === "backlog" && (issue.assignees ?? []).length === 0,
      ),
    [issues],
  );

  const [display, setDisplay] = useState({
    ...DEFAULT_DISPLAY,
    grouping: "priority",
    ordering: "created",
  });
  const [filters, setFilters] = useState({});

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ViewHeader
        crumbs={[{ label: "Triage", icon: Inbox }]}
        actions={
          <>
            <span className="mr-1 text-[12px] text-[var(--lnr-ink-tertiary)]">
              {queue.length} to triage
            </span>
            <DisplayMenu display={display} onChange={setDisplay} />
          </>
        }
      />
      <FilterBar filters={filters} onChange={setFilters} />

      {queue.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <Inbox className="h-6 w-6 text-[var(--lnr-ink-tertiary)]" />
          <p className="text-[14px] font-medium text-[var(--lnr-ink)]">Triage is empty</p>
          <p className="max-w-sm text-[13px] text-[var(--lnr-ink-subtle)]">
            Unassigned backlog issues land here so someone can accept or decline them.
          </p>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <IssueSurface
            issues={queue}
            display={display}
            filters={filters}
            onOpenIssue={onOpenIssue}
            onCreate={onCreate}
          />
          <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-[var(--lnr-border)] px-3 py-2 sm:px-4">
            <span className="text-[12px] text-[var(--lnr-ink-subtle)]">Bulk triage</span>
            <button
              type="button"
              onClick={() =>
                Promise.all(
                  queue.map((issue) => patchIssue(issue.id, { status: "todo" }, { silent: true })),
                )
              }
              className="rounded-[5px] border border-[var(--lnr-border-strong)] px-2 py-1 text-[12px] text-[var(--lnr-ink-muted)] hover:bg-[var(--lnr-hover)]"
            >
              Accept all into Todo
            </button>
            <button
              type="button"
              onClick={() =>
                Promise.all(
                  queue.map((issue) =>
                    patchIssue(issue.id, { status: "canceled" }, { silent: true }),
                  ),
                )
              }
              className={cn(
                "rounded-[5px] border border-[var(--lnr-border-strong)] px-2 py-1 text-[12px]",
                "text-[var(--destructive-text)] hover:bg-red-500/10",
              )}
            >
              Decline all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Saved views. Linear ships a set of built-ins; each is a filter preset that
// opens the same issue frame.
const SAVED_VIEWS = [
  {
    id: "active",
    name: "Active",
    description: "Everything in progress or in review",
    filter: (issue) => issue.status === "in_progress" || issue.status === "in_review",
  },
  {
    id: "urgent",
    name: "Urgent & high",
    description: "Top-priority work across the project",
    filter: (issue) => ["urgent", "high"].includes(issue.priority) && !isCompleted(issue.status),
  },
  {
    id: "unassigned",
    name: "Unassigned",
    description: "Open issues with nobody on them",
    filter: (issue) => (issue.assignees ?? []).length === 0 && !isCompleted(issue.status),
  },
  {
    id: "overdue",
    name: "Overdue",
    description: "Past their due date and still open",
    filter: (issue) =>
      issue.dueDate && !isCompleted(issue.status) && new Date(issue.dueDate) < new Date(),
  },
  {
    id: "no-estimate",
    name: "Needs estimate",
    description: "Open issues without story points",
    filter: (issue) => !issue.estimate && !isCompleted(issue.status),
  },
  {
    id: "recently-completed",
    name: "Recently completed",
    description: "Closed in the last 14 days",
    filter: (issue) =>
      isCompleted(issue.status) &&
      Date.now() - new Date(issue.updatedAt).getTime() < 14 * 86400000,
  },
];

export function ViewsView({ onOpenIssue, onCreate }) {
  const { issues } = useTracker();
  const [openId, setOpenId] = useState(null);

  const open = SAVED_VIEWS.find((view) => view.id === openId);

  if (open) {
    return (
      <IssueViewFrame
        crumbs={[
          { label: "Views", onClick: () => setOpenId(null) },
          { label: open.name },
        ]}
        issues={issues.filter(open.filter)}
        onOpenIssue={onOpenIssue}
        onCreate={onCreate}
        emptyTitle={`Nothing in ${open.name}`}
        emptyHint={open.description}
      />
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ViewHeader crumbs={[{ label: "Views" }]} />
      <div className="flex-1 overflow-y-auto lnr-scrollbar">
        {SAVED_VIEWS.map((view) => {
          const count = issues.filter(view.filter).length;
          return (
            <button
              key={view.id}
              type="button"
              onClick={() => setOpenId(view.id)}
              className="flex w-full items-center gap-3 border-b border-[var(--lnr-border)] px-3 py-3 text-left hover:bg-[var(--lnr-hover)] sm:px-4"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px] border border-[var(--lnr-border-strong)] bg-[var(--lnr-panel)]">
                <SquareStack className="h-3.5 w-3.5 text-[var(--lnr-ink-subtle)]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium text-[var(--lnr-ink)]">
                  {view.name}
                </span>
                <span className="block truncate text-[12px] text-[var(--lnr-ink-subtle)]">
                  {view.description}
                </span>
              </span>
              <span className="shrink-0 text-[12px] tabular-nums text-[var(--lnr-ink-tertiary)]">
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
