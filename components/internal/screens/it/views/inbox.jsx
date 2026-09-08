"use client";

import React, { useMemo, useState } from "react";
import { AtSign, Bell, CheckCheck, GitPullRequest, Inbox, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@geiger/ui";
import { cn } from "@/lib/utils";
import { issueIdentifier } from "@/features/issues/constants";
import { formatRelative, isOverdue } from "../constants";
import { PriorityIcon, StatusIcon } from "../icons";
import { IssueDetail } from "../issue_detail";
import { HeaderButton, ViewHeader } from "../view_header";
import { useTracker } from "../use_tracker";

// Linear's Inbox: notification list on the left, the selected issue rendered
// full-width on the right. Notifications are derived — this app has no
// notifications table, so they are synthesised from the signals that actually
// warrant attention: assignment, an overdue due date, an unassigned backlog
// item, and the project's own activity log.
//
// Below `lg` there is only room for one pane, so the list is the view and
// picking a row swaps to the reader (which carries its own back control).

const KIND_META = {
  assigned: { icon: AtSign, label: "Assigned to you", priority: true },
  overdue: { icon: Bell, label: "Overdue", priority: true },
  review: { icon: GitPullRequest, label: "In review", priority: true },
  triage: { icon: Inbox, label: "Needs triage", priority: false },
  activity: { icon: MessageSquare, label: "Activity", priority: false },
};

function buildNotifications({ issues, activity, me }) {
  const rows = [];

  for (const issue of issues) {
    const mine = me && (issue.assignees ?? []).includes(me.id);
    if (mine && !["done", "canceled", "duplicate"].includes(issue.status)) {
      rows.push({
        id: `assigned:${issue.id}`,
        kind: "assigned",
        issue,
        at: issue.updatedAt,
        detail: "You were assigned",
      });
    }
    if (isOverdue(issue)) {
      rows.push({
        id: `overdue:${issue.id}`,
        kind: "overdue",
        issue,
        at: issue.dueDate,
        detail: `Due ${formatRelative(issue.dueDate)} ago`,
      });
    }
    if (issue.status === "in_review") {
      rows.push({
        id: `review:${issue.id}`,
        kind: "review",
        issue,
        at: issue.updatedAt,
        detail: "Waiting on review",
      });
    }
    if (issue.status === "backlog" && (issue.assignees ?? []).length === 0) {
      rows.push({
        id: `triage:${issue.id}`,
        kind: "triage",
        issue,
        at: issue.createdAt,
        detail: "Unassigned in backlog",
      });
    }
  }

  for (const log of activity.slice(0, 40)) {
    rows.push({
      id: `activity:${log.id}`,
      kind: "activity",
      issue: null,
      at: log.occurredAt || log.createdAt,
      title: log.message,
      detail: log.detail || log.source,
      actorId: log.createdBy,
    });
  }

  return rows.sort((a, b) => new Date(b.at) - new Date(a.at));
}

function NotificationRow({ row, identifier, active, read, onSelect, peopleById }) {
  const meta = KIND_META[row.kind];
  const Icon = meta.icon;
  const actor = row.actorId ? peopleById[row.actorId] : null;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full gap-2.5 border-b border-[var(--lnr-border)] px-3 py-2.5 text-left transition-colors",
        active ? "bg-[var(--lnr-selected)]" : "hover:bg-[var(--lnr-hover)]",
      )}
    >
      <span className="relative mt-0.5 shrink-0">
        {actor ? (
          <Avatar className="h-6 w-6">
            <AvatarImage src={actor.avatarUrl} alt="" />
            <AvatarFallback className="bg-[var(--lnr-strong)] text-[10px] text-[var(--lnr-ink-muted)]">
              {actor.initials}
            </AvatarFallback>
          </Avatar>
        ) : (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--lnr-strong)]">
            <Icon className="h-3.5 w-3.5 text-[var(--lnr-ink-subtle)]" />
          </span>
        )}
        {!read ? (
          <span className="absolute -left-1 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[var(--lnr-accent)]" />
        ) : null}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="text-[12px] text-[var(--lnr-ink-subtle)]">{meta.label}</span>
          {identifier ? (
            <span className="text-[11px] tabular-nums text-[var(--lnr-ink-tertiary)]">
              {identifier}
            </span>
          ) : null}
          <span className="ml-auto shrink-0 text-[11px] text-[var(--lnr-ink-tertiary)]">
            {formatRelative(row.at)}
          </span>
        </span>
        <span className="mt-0.5 flex items-center gap-1.5">
          {row.issue ? <StatusIcon status={row.issue.status} /> : null}
          <span
            className={cn(
              "min-w-0 flex-1 truncate text-[13px]",
              read ? "text-[var(--lnr-ink-muted)]" : "font-medium text-[var(--lnr-ink)]",
            )}
          >
            {row.issue?.title ?? row.title}
          </span>
          {row.issue ? <PriorityIcon priority={row.issue.priority} /> : null}
        </span>
        <span className="mt-0.5 block truncate text-[11px] text-[var(--lnr-ink-tertiary)]">
          {row.detail}
        </span>
      </span>
    </button>
  );
}

export function InboxView() {
  const { issues, activity, me, project, peopleById } = useTracker();
  const [tab, setTab] = useState("priority");
  const [selectedId, setSelectedId] = useState(null);
  const [read, setRead] = useState(() => new Set());

  const notifications = useMemo(
    () => buildNotifications({ issues, activity, me }),
    [issues, activity, me],
  );

  const visible = useMemo(
    () =>
      notifications.filter((row) =>
        tab === "priority" ? KIND_META[row.kind].priority : !KIND_META[row.kind].priority,
      ),
    [notifications, tab],
  );

  // On mobile nothing is auto-selected: the list is the landing surface.
  const explicit = visible.find((row) => row.id === selectedId) ?? null;
  const selected = explicit ?? visible[0] ?? null;

  const select = (row) => {
    setSelectedId(row.id);
    setRead((current) => new Set(current).add(row.id));
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ViewHeader
        crumbs={[{ label: "Inbox", icon: Inbox }]}
        tabs={[
          {
            value: "priority",
            label: "Priority",
            count: notifications.filter((row) => KIND_META[row.kind].priority).length,
          },
          {
            value: "other",
            label: "Other",
            count: notifications.filter((row) => !KIND_META[row.kind].priority).length,
          },
        ]}
        activeTab={tab}
        onTab={setTab}
        actions={
          <HeaderButton
            icon={CheckCheck}
            label="Mark all read"
            onClick={() => setRead(new Set(notifications.map((row) => row.id)))}
          />
        }
      />

      <div className="flex min-h-0 flex-1">
        <div
          className={cn(
            "flex min-w-0 flex-col overflow-y-auto border-[var(--lnr-border)] lnr-scrollbar lg:w-[360px] lg:shrink-0 lg:border-r",
            explicit ? "hidden lg:flex" : "flex-1 lg:flex-none",
          )}
        >
          {visible.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
              <CheckCheck className="h-6 w-6 text-[var(--lnr-ink-tertiary)]" />
              <p className="text-[13px] font-medium text-[var(--lnr-ink)]">All caught up</p>
              <p className="text-[12px] text-[var(--lnr-ink-subtle)]">
                Nothing needs your attention here.
              </p>
            </div>
          ) : (
            visible.map((row) => (
              <NotificationRow
                key={row.id}
                row={row}
                identifier={row.issue ? issueIdentifier(row.issue, project) : null}
                active={selected?.id === row.id}
                read={read.has(row.id)}
                peopleById={peopleById}
                onSelect={() => select(row)}
              />
            ))
          )}
        </div>

        <div
          className={cn(
            "min-w-0 flex-1 flex-col bg-[var(--lnr-panel)]",
            explicit ? "flex" : "hidden lg:flex",
          )}
        >
          {selected?.issue ? (
            <IssueDetail issueId={selected.issue.id} onClose={() => setSelectedId(null)} />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
              <Bell className="h-6 w-6 text-[var(--lnr-ink-tertiary)]" />
              <p className="text-[13px] text-[var(--lnr-ink-subtle)]">
                {selected ? selected.title : "Select a notification to read it here"}
              </p>
              {selected?.detail ? (
                <p className="max-w-sm text-[12px] text-[var(--lnr-ink-tertiary)]">
                  {selected.detail}
                </p>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
