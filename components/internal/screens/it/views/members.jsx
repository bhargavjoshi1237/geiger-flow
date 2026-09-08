"use client";

import React, { useMemo, useState } from "react";
import { Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@geiger/ui";
import { cn } from "@/lib/utils";
import { isCompleted, isOverdue } from "../constants";
import { ProgressRing } from "../icons";
import { ViewHeader } from "../view_header";
import { useTracker } from "../use_tracker";

// Linear's team/members page: everyone on the workspace with their live
// workload — assigned, in flight, completed and anything overdue — plus a
// per-member issue list on selection. Below `lg` that list replaces the table
// rather than sitting beside it, and the numeric columns thin out.

function memberStats(person, issues) {
  const assigned = issues.filter((issue) => (issue.assignees ?? []).includes(person.id));
  const completed = assigned.filter((issue) => isCompleted(issue.status));
  const started = assigned.filter(
    (issue) => issue.status === "in_progress" || issue.status === "in_review",
  );
  const overdue = assigned.filter(isOverdue);
  return {
    assigned: assigned.length,
    open: assigned.length - completed.length,
    started: started.length,
    completed: completed.length,
    overdue: overdue.length,
    progress: assigned.length ? Math.round((completed.length / assigned.length) * 100) : 0,
  };
}

export function MembersView({ onOpenIssue }) {
  const { people, issues, me, projectKey } = useTracker();
  const [selectedId, setSelectedId] = useState(null);

  const rows = useMemo(
    () =>
      people
        .map((person) => ({ person, stats: memberStats(person, issues) }))
        .sort((a, b) => b.stats.open - a.stats.open),
    [people, issues],
  );

  const selectedIssues = useMemo(
    () =>
      selectedId
        ? issues.filter((issue) => (issue.assignees ?? []).includes(selectedId))
        : [],
    [issues, selectedId],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ViewHeader
        crumbs={[{ label: projectKey, icon: Users }, { label: "Members" }]}
        actions={
          <span className="text-[12px] text-[var(--lnr-ink-tertiary)]">
            {rows.length} {rows.length === 1 ? "member" : "members"}
          </span>
        }
      />

      <div className="flex min-h-0 flex-1">
        <div
          className={cn(
            "min-w-0 flex-1 overflow-y-auto lnr-scrollbar",
            selectedId && "hidden lg:block",
          )}
        >
          <div className="flex h-8 items-center gap-3 border-b border-[var(--lnr-border)] px-3 text-[11px] text-[var(--lnr-ink-tertiary)] sm:px-4">
            <span className="flex-1">Member</span>
            <span className="w-12 text-right sm:w-16">Open</span>
            <span className="hidden w-16 text-right md:inline">Started</span>
            <span className="hidden w-16 text-right md:inline">Done</span>
            <span className="hidden w-16 text-right sm:inline">Overdue</span>
            <span className="w-10 text-right">%</span>
          </div>

          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
              <Users className="h-6 w-6 text-[var(--lnr-ink-tertiary)]" />
              <p className="text-[13px] text-[var(--lnr-ink-subtle)]">
                No members resolved for this workspace yet.
              </p>
            </div>
          ) : (
            rows.map(({ person, stats }) => (
              <button
                key={person.id}
                type="button"
                onClick={() =>
                  setSelectedId((current) => (current === person.id ? null : person.id))
                }
                className={cn(
                  "flex w-full items-center gap-3 border-b border-[var(--lnr-border)] px-3 py-2.5 text-left transition-colors hover:bg-[var(--lnr-hover)] sm:px-4",
                  selectedId === person.id && "bg-[var(--lnr-selected)]",
                )}
              >
                <Avatar className="h-6 w-6 shrink-0">
                  <AvatarImage src={person.avatarUrl} alt="" />
                  <AvatarFallback className="bg-[var(--lnr-strong)] text-[10px] text-[var(--lnr-ink-muted)]">
                    {person.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] text-[var(--lnr-ink)]">
                    {person.name}
                    {person.id === me?.id ? (
                      <span className="ml-1.5 text-[11px] text-[var(--lnr-ink-tertiary)]">You</span>
                    ) : null}
                  </span>
                  <span className="block truncate text-[11px] text-[var(--lnr-ink-tertiary)]">
                    {person.email || "—"}
                  </span>
                </span>
                <span className="w-12 text-right text-[12px] tabular-nums text-[var(--lnr-ink-muted)] sm:w-16">
                  {stats.open}
                </span>
                <span className="hidden w-16 text-right text-[12px] tabular-nums text-[var(--lnr-ink-subtle)] md:inline">
                  {stats.started}
                </span>
                <span className="hidden w-16 text-right text-[12px] tabular-nums text-[var(--lnr-ink-subtle)] md:inline">
                  {stats.completed}
                </span>
                <span
                  className={cn(
                    "hidden w-16 text-right text-[12px] tabular-nums sm:inline",
                    stats.overdue
                      ? "text-[var(--lnr-urgent)]"
                      : "text-[var(--lnr-ink-tertiary)]",
                  )}
                >
                  {stats.overdue}
                </span>
                <span className="flex w-10 shrink-0 justify-end">
                  <ProgressRing value={stats.progress} size={16} />
                </span>
              </button>
            ))
          )}
        </div>

        {selectedId ? (
          <aside className="min-w-0 flex-1 overflow-y-auto border-[var(--lnr-border)] lnr-scrollbar lg:w-[340px] lg:flex-none lg:shrink-0 lg:border-l">
            <div className="flex items-center gap-2 border-b border-[var(--lnr-border)] px-3 py-2">
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="rounded-[5px] px-1.5 py-0.5 text-[12px] text-[var(--lnr-ink-subtle)] hover:bg-[var(--lnr-hover)] hover:text-[var(--lnr-ink)] lg:hidden"
              >
                ← Members
              </button>
              <p className="text-[12px] text-[var(--lnr-ink-subtle)]">
                {selectedIssues.length} assigned
              </p>
            </div>
            {selectedIssues.map((issue) => (
              <button
                key={issue.id}
                type="button"
                onClick={() => onOpenIssue(issue.id)}
                className="flex w-full items-center gap-2 border-b border-[var(--lnr-border)] px-3 py-2 text-left hover:bg-[var(--lnr-hover)]"
              >
                <span className="min-w-0 flex-1 truncate text-[13px] text-[var(--lnr-ink-muted)]">
                  {issue.title}
                </span>
              </button>
            ))}
          </aside>
        ) : null}
      </div>
    </div>
  );
}
