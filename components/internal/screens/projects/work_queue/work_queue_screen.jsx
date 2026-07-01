"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  Archive,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Circle,
  FileText,
  Inbox,
  ListChecks,
  MessageSquareText,
  MoreHorizontal,
  NotebookText,
  Plus,
  Timer,
  UserRound,
  Maximize2,
} from "lucide-react";
import { Badge } from "@geiger/ui";
import { Button } from "@geiger/ui";
import { Progress } from "@geiger/ui";
import { SearchBar } from "@geiger/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@geiger/ui";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { severityColors } from "@geiger/ui";
import { cn } from "@/lib/utils";

const QUEUE_VIEWS = [
  { label: "Tasks", Icon: ListChecks, count: 0 },
  { label: "Created", Icon: FileText, count: 0 },
  { label: "Calendar", Icon: CalendarDays, count: 0 },
  { label: "Files", Icon: Archive, count: 0 },
  { label: "Notes", Icon: NotebookText, count: 0 },
  { label: "Time", Icon: Timer, count: 0 },
];

const TASKS = [];

const SECONDARY_ROWS = {};

const STATUS_META = {
  "To Do": {
    className: "border-zinc-500/25 bg-zinc-500/10 text-foreground",
    Icon: Circle,
  },
  "In Progress": {
    className: "border-blue-500/25 bg-blue-500/10 text-blue-300",
    Icon: Timer,
  },
  "In Review": {
    className: "border-violet-500/25 bg-violet-500/10 text-violet-300",
    Icon: CheckCircle2,
  },
};

const PRIORITY_META = {
  High: { key: "high", Icon: AlertTriangle },
  Medium: { key: "medium", Icon: Maximize2 },
  Low: { key: "low", Icon: ArrowUpRight },
};

const OWNER_META = {};

function HeaderAction() {
  return (
    <Button className="bg-primary text-primary-foreground hover:bg-primary">
      <Plus className="mr-2 h-4 w-4" />
      Add Work
    </Button>
  );
}

function SummaryCard({ label, value, detail, Icon, tone = "text-text-secondary" }) {
  return (
    <div className="rounded-xl border border-border bg-surface-subtle p-4">
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
        <Icon className={cn("h-3.5 w-3.5", tone)} />
        {label}
      </div>
      <p className="mt-2 text-xl font-semibold tabular-nums text-foreground">{value}</p>
      <p className="mt-1 text-xs text-text-secondary">{detail}</p>
    </div>
  );
}

function QueueFilters({ activeView, onChange }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {QUEUE_VIEWS.map(({ label, Icon, count }) => (
        <Button
          key={label}
          type="button"
          variant="ghost"
          className={cn(
            "h-8 rounded-lg border px-3 text-xs",
            activeView === label
              ? "border-border-strong bg-surface-hover text-foreground"
              : "border-border bg-surface-subtle text-text-secondary hover:bg-surface-card hover:text-foreground",
          )}
          onClick={() => onChange(label)}
        >
          <Icon className="h-3.5 w-3.5" />
          <span>{label}</span>
          <span className="ml-1 rounded bg-surface-active px-1.5 py-0.5 text-[10px] text-text-secondary">
            {count}
          </span>
        </Button>
      ))}
    </div>
  );
}

function OwnerPill({ owner }) {
  const meta = OWNER_META[owner] || { name: owner, color: "bg-zinc-300 text-primary-foreground" };

  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span className={cn("grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold", meta.color)}>
        {owner}
      </span>
      <span className="hidden truncate text-xs font-medium text-foreground 2xl:inline">{meta.name}</span>
    </span>
  );
}

function PriorityBadge({ priority }) {
  const meta = PRIORITY_META[priority] || PRIORITY_META.Medium;
  const Icon = meta.Icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium capitalize",
        severityColors[meta.key],
      )}
    >
      <Icon className="h-3 w-3" />
      {meta.key}
    </span>
  );
}

function TasksTable({ tasks }) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-surface-subtle border-border">
          <TableHead>Work</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Due</TableHead>
          <TableHead>Progress</TableHead>
          <TableHead className="text-right"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id} className="border-border hover:bg-surface-active">
            <TableCell>
              <div className="flex min-w-[220px] flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{task.title}</span>
                  <span className="shrink-0 rounded-md border border-border px-1.5 py-0.5 font-mono text-[10px] text-text-secondary">
                    {task.id}
                  </span>
                </div>
                <p className="line-clamp-1 text-xs text-text-secondary">{task.description}</p>
                <div className="flex min-w-0 items-center gap-3 text-xs text-text-secondary">
                  <span className="inline-flex items-center gap-1.5">
                    <Inbox className="h-3.5 w-3.5" />
                    {task.project}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MessageSquareText className="h-3.5 w-3.5" />
                    {task.list}
                  </span>
                </div>
              </div>
            </TableCell>
            <TableCell className="whitespace-nowrap">
              <Badge className={cn("min-w-[86px] justify-center whitespace-nowrap border px-2", STATUS_META[task.status]?.className)}>
                {task.status}
              </Badge>
            </TableCell>
            <TableCell>
              <PriorityBadge priority={task.priority} />
            </TableCell>
            <TableCell>
              <OwnerPill owner={task.owner} />
            </TableCell>
            <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
              {task.due}
            </TableCell>
            <TableCell>
              <div className="w-[130px] space-y-1.5">
                <Progress
                  value={task.progress}
                  className="h-1.5 bg-surface-hover [&_[data-slot=progress-indicator]]:bg-primary"
                />
                <p className="text-xs tabular-nums text-text-secondary">{task.progress}%</p>
              </div>
            </TableCell>
            <TableCell className="text-right">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-text-tertiary hover:bg-surface-active hover:text-muted-foreground"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function TaskCards({ tasks }) {
  return (
    <div className="space-y-2 md:hidden">
      {tasks.map((task) => {
        const statusMeta = STATUS_META[task.status];
        const StatusIcon = statusMeta?.Icon || Circle;

        return (
          <div
            key={task.id}
            className="rounded-xl border border-border bg-surface-subtle p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-sm font-semibold text-foreground">{task.title}</h3>
                  <span className="shrink-0 rounded-md border border-border px-1.5 py-0.5 font-mono text-[10px] text-text-secondary">
                    {task.id}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-text-secondary">{task.description}</p>
              </div>
              <StatusIcon className="mt-0.5 h-4 w-4 shrink-0 text-text-secondary" />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge className={cn("border text-[10px] px-2 py-0", statusMeta?.className)}>
                {task.status}
              </Badge>
              <PriorityBadge priority={task.priority} />
              <span className="inline-flex items-center gap-1 text-xs text-text-secondary">
                <CalendarDays className="h-3.5 w-3.5" />
                {task.due}
              </span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <OwnerPill owner={task.owner} />
              <div className="min-w-0 flex-1 space-y-1">
                <Progress
                  value={task.progress}
                  className="h-1.5 bg-surface-hover [&_[data-slot=progress-indicator]]:bg-primary"
                />
                <p className="text-xs tabular-nums text-text-secondary">{task.progress}% complete</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SecondaryList({ activeView, rows }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface-card">
      <div className="border-b border-border bg-surface-subtle px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">{activeView}</h2>
        <p className="mt-1 text-xs text-text-secondary">
          Related queue items grouped by the selected project activity.
        </p>
      </div>
      <div className="divide-y divide-border">
        {rows.length > 0 ? (
          rows.map((row, rowIndex) => (
            <div
              key={row.join("-")}
              className="grid grid-cols-1 gap-2 px-5 py-4 md:grid-cols-[1.4fr_1fr_0.8fr_0.8fr] md:items-center"
            >
              {row.map((cell, index) => (
                <span
                  key={`${cell}-${index}`}
                  className={cn(
                    index === 0 ? "text-sm font-medium text-foreground" : "text-sm text-muted-foreground",
                    index > 1 && "md:text-right",
                  )}
                >
                  {index === 0 ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md border border-border bg-surface-subtle text-[11px] text-text-secondary">
                        {rowIndex + 1}
                      </span>
                      {cell}
                    </span>
                  ) : (
                    cell
                  )}
                </span>
              ))}
            </div>
          ))
        ) : (
          <div className="flex h-[220px] flex-col items-center justify-center text-text-secondary">
            <UserRound className="h-10 w-10 opacity-30" />
            <p className="mt-3 text-sm">No {activeView.toLowerCase()} items match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function WorkQueueScreen() {
  const [activeView, setActiveView] = useState("Tasks");
  const [query, setQuery] = useState("");

  const filteredTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return TASKS;

    return TASKS.filter((task) =>
      [task.title, task.project, task.status, task.list, task.id]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query]);

  const filteredSecondaryRows = useMemo(() => {
    const rows = SECONDARY_ROWS[activeView] || [];
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return rows;

    return rows.filter((row) =>
      row
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [activeView, query]);

  const summary = useMemo(() => {
    const overdue = 0;
    const today = 0;
    const progress = Math.round(TASKS.reduce((sum, task) => sum + task.progress, 0) / TASKS.length);
    const inProgress = TASKS.filter((task) => task.status === "In Progress" || task.status === "In Review").length;

    return { overdue, today, progress, inProgress };
  }, []);

  return (
    <MainScreenWrapper className="text-foreground">
      <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Work Queue</h1>
          <p className="mt-1 text-muted-foreground">Review assigned work, follow-ups, and project activity in one queue.</p>
        </div>
        <HeaderAction />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          label="Assigned"
          value={TASKS.length}
          detail={`${summary.inProgress} currently active`}
          Icon={ListChecks}
        />
        <SummaryCard
          label="Due Today"
          value={summary.today}
          detail="Needs attention this cycle"
          Icon={CalendarDays}
        />
        <SummaryCard
          label="Overdue"
          value={summary.overdue}
          detail="Past planned due date"
          Icon={AlertTriangle}
          tone="text-amber-300"
        />
        <SummaryCard
          label="Progress"
          value={`${summary.progress}%`}
          detail="Average completion"
          Icon={CheckCircle2}
        />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchBar
          className="w-full lg:max-w-xl"
          placeholder="Search work, lists, status, or project"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onClear={() => setQuery("")}
        />
        <QueueFilters activeView={activeView} onChange={setActiveView} />
      </div>

      {activeView === "Tasks" ? (
        filteredTasks.length > 0 ? (
          <>
            <TaskCards tasks={filteredTasks} />
            <div className="hidden overflow-hidden rounded-2xl border border-border bg-surface-card md:block">
              <TasksTable tasks={filteredTasks} />
            </div>
          </>
        ) : (
          <div className="flex h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-subtle text-text-secondary">
            <UserRound className="h-10 w-10 opacity-30" />
            <p className="mt-3 text-sm">No work matches your current search.</p>
          </div>
        )
      ) : (
        <SecondaryList activeView={activeView} rows={filteredSecondaryRows} />
      )}
    </MainScreenWrapper>
  );
}
