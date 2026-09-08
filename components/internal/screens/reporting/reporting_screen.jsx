"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Clock3,
  FileText,
  ListChecks,
  Loader2,
  Plus,
  Timer,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@geiger/ui";
import { Button } from "@geiger/ui";
import { Progress } from "@geiger/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@geiger/ui";
import { ActionMenu } from "@geiger/ui";
import { toast } from "sonner";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import {
  DataTable,
  EmptyState,
  ScreenHeader,
  SearchInput,
  SegmentedTabs,
  StatsBar,
  StatusPill,
  Toolbar,
} from "@/components/internal/shared/screen_kit";
import {
  ListPagination,
  usePagination,
} from "@/components/internal/shared/pagination";
import FilterDropdown from "@/components/internal/screens/projects/overview/filter_dropdown";
import { AddTimeEntryDialog } from "./add_time_entry_dialog";
import { useProject } from "@/context/project-context";
import { listOrgMembers } from "@/lib/supabase/profiles";
import {
  statusLabels as taskStatusLabels,
} from "@/features/tasks/constants";
import { listTasks as fetchTasks } from "@/features/tasks/actions";
import {
  listIssues as fetchIssues,
} from "@/features/issues/actions";
import {
  statusLabels as issueStatusLabels,
} from "@/features/issues/constants";
import {
  createTimeEntry,
  listTimeEntries,
  softDeleteTimeEntry,
} from "@/features/time_entries/actions";
import {
  formatDuration,
  formatDateLabel,
  formatWeekLabel,
  weekStartOf,
} from "@/features/time_entries/constants";
import { cn } from "@/lib/utils";

const REPORT_VIEWS = ["Tasks", "Workload", "Time"];

const DONE_TASK_STATUSES = new Set(["done"]);
const OPEN_ISSUE_STATUSES = new Set(["open", "in_progress"]);
const DUE_SOON_WINDOW_DAYS = 7;

// Status/priority pills for the list (config only — rows come from the data layer).
// Report rows store display labels, so the map is keyed by label.
const REPORT_STATUS_MAP = {
  "To Do": { label: "To Do", variant: "neutral", dotClass: "bg-zinc-400" },
  Todo: { label: "Todo", variant: "neutral", dotClass: "bg-zinc-400" },
  Backlog: { label: "Backlog", variant: "neutral", dotClass: "bg-zinc-400" },
  "In Progress": { label: "In Progress", variant: "info", dotClass: "bg-sky-400" },
  Blocked: { label: "Blocked", variant: "danger", dotClass: "bg-red-400" },
  Done: { label: "Done", variant: "success", dotClass: "bg-emerald-400" },
  Canceled: { label: "Canceled", variant: "outline", dotClass: "bg-zinc-500" },
  Duplicate: { label: "Duplicate", variant: "outline", dotClass: "bg-zinc-500" },
};

const REPORT_PRIORITY_MAP = {
  low: { label: "Low", variant: "info", dotClass: "bg-sky-400" },
  medium: { label: "Medium", variant: "neutral", dotClass: "bg-zinc-400" },
  high: { label: "High", variant: "warning", dotClass: "bg-amber-400" },
  critical: { label: "Critical", variant: "danger", dotClass: "bg-red-400" },
};

const KIND_FILTER_OPTIONS = [
  { value: "all", label: "All kinds" },
  { value: "Task", label: "Tasks" },
  { value: "Issue", label: "Issues" },
];

function dueDateInfo(dueDate) {
  if (!dueDate) {
    return null;
  }

  const due = new Date(`${dueDate}T00:00:00`);
  if (Number.isNaN(due.getTime())) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Math.round((due.getTime() - today.getTime()) / 86400000);
}

export function ReportingScreen() {
  const { project } = useProject();
  const projectId = project?.id;

  const [tasks, setTasks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("Tasks");
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (!projectId) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const [taskRows, issueRows, entryRows] = await Promise.all([
        fetchTasks(projectId),
        fetchIssues(projectId),
        listTimeEntries(projectId),
      ]);

      if (cancelled) {
        return;
      }

      setTasks(taskRows ?? []);
      setIssues(issueRows ?? []);
      setTimeEntries(entryRows ?? []);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  useEffect(() => {
    const organizationId = project?.organization_id;
    if (!organizationId) {
      return undefined;
    }

    let active = true;

    void listOrgMembers(organizationId).then((rows) => {
      if (active) {
        setMembers(rows);
      }
    });

    return () => {
      active = false;
    };
  }, [project?.organization_id]);

  const memberMap = useMemo(
    () => Object.fromEntries(members.map((member) => [member.id, member])),
    [members],
  );

  // Tasks and issues share one reporting row shape; kind keeps them apart in
  // the table and the workload rollup.
  const reportRows = useMemo(() => {
    const taskRows = tasks.map((task) => ({
      id: task.id,
      kind: "Task",
      title: task.title,
      status: taskStatusLabels[task.status] || task.status,
      isDone: DONE_TASK_STATUSES.has(task.status),
      priority: task.priority,
      assignees: task.assignees,
      dueDate: task.dueDate,
      progress: task.progress,
    }));

    const issueRows = issues.map((issue) => ({
      id: issue.id,
      kind: "Issue",
      title: issue.title,
      status: issueStatusLabels[issue.status] || issue.status,
      isDone: !OPEN_ISSUE_STATUSES.has(issue.status),
      priority: issue.priority,
      assignees: issue.assignees,
      dueDate: issue.dueDate,
      progress: null,
    }));

    return [...taskRows, ...issueRows];
  }, [tasks, issues]);

  const pulse = useMemo(() => {
    const open = reportRows.filter((row) => !row.isDone);
    const dueSoon = open.filter((row) => {
      const days = dueDateInfo(row.dueDate);
      return days !== null && days <= DUE_SOON_WINDOW_DAYS;
    });
    const completion =
      reportRows.length > 0
        ? Math.round(((reportRows.length - open.length) / reportRows.length) * 100)
        : 0;

    return {
      open: open.length,
      dueSoon: dueSoon.length,
      completion,
    };
  }, [reportRows]);

  const timeMetrics = useMemo(() => {
    const totalMinutes = timeEntries.reduce((sum, entry) => sum + entry.minutes, 0);
    const billableMinutes = timeEntries
      .filter((entry) => entry.billable)
      .reduce((sum, entry) => sum + entry.minutes, 0);

    return {
      total: formatDuration(totalMinutes),
      billable:
        totalMinutes > 0 ? `${Math.round((billableMinutes / totalMinutes) * 100)}%` : "—",
      entries: timeEntries.length,
    };
  }, [timeEntries]);

  const stats = useMemo(
    () => [
      { label: "Open items", value: String(pulse.open), footer: "Tasks and issues still open" },
      { label: "Due soon", value: String(pulse.dueSoon), footer: "Due within 7 days" },
      { label: "Completion", value: `${pulse.completion}%`, footer: "Share of work done" },
      { label: "Time logged", value: timeMetrics.total, footer: `${timeMetrics.entries} entries` },
    ],
    [pulse, timeMetrics],
  );

  const visibleRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reportRows.filter((row) => {
      if (kindFilter !== "all" && row.kind !== kindFilter) {
        return false;
      }
      if (!query) {
        return true;
      }

      return [row.title, row.kind, row.status].join(" ").toLowerCase().includes(query);
    });
  }, [reportRows, search, kindFilter]);

  const tasksPager = usePagination(visibleRows, {
    resetKey: `${search}|${kindFilter}`,
  });

  const workload = useMemo(() => {
    const byOwner = {};

    for (const row of reportRows) {
      if (row.isDone) {
        continue;
      }

      const names = row.assignees.length
        ? row.assignees.map((id) => memberMap[id]?.name || "Member")
        : ["Unassigned"];

      for (const name of names) {
        if (!byOwner[name]) {
          byOwner[name] = { owner: name, openItems: 0, overdue: 0 };
        }
        byOwner[name].openItems += 1;

        const days = dueDateInfo(row.dueDate);
        if (days !== null && days < 0) {
          byOwner[name].overdue += 1;
        }
      }
    }

    for (const entry of timeEntries) {
      const name =
        memberMap[entry.owner]?.name ||
        (entry.owner && !entry.owner.includes("-") ? entry.owner : "Unassigned");
      if (!byOwner[name]) {
        byOwner[name] = { owner: name, openItems: 0, overdue: 0 };
      }
      byOwner[name].loggedMinutes = (byOwner[name].loggedMinutes || 0) + entry.minutes;
    }

    return Object.values(byOwner).sort((a, b) => b.openItems - a.openItems);
  }, [reportRows, timeEntries, memberMap]);

  const maxLoad = useMemo(
    () => workload.reduce((max, row) => Math.max(max, row.openItems), 0),
    [workload],
  );

  const visibleWorkload = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return workload;
    }
    return workload.filter((row) => row.owner.toLowerCase().includes(query));
  }, [workload, search]);

  const workloadPager = usePagination(visibleWorkload, {
    resetKey: `${search}|workload`,
  });

  const visibleEntries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return timeEntries;
    }
    return timeEntries.filter((entry) => {
      const ownerName = memberMap[entry.owner]?.name || entry.owner || "";
      return [entry.title, entry.notes, ownerName]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [timeEntries, search, memberMap]);

  const timeByWeek = useMemo(() => {
    const weeks = {};

    for (const entry of visibleEntries) {
      const key = weekStartOf(entry.workedOn);
      if (!key) {
        continue;
      }
      if (!weeks[key]) {
        weeks[key] = [];
      }
      weeks[key].push(entry);
    }

    return Object.entries(weeks).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [visibleEntries]);

  const weeksPager = usePagination(timeByWeek, {
    resetKey: `${search}|time`,
  });

  const saveTimeEntry = async (input) => {
    const optimisticId = crypto.randomUUID();
    const optimistic = {
      id: optimisticId,
      projectId,
      taskId: null,
      owner: "",
      notes: "",
      ...input,
    };

    setTimeEntries((prev) => [optimistic, ...prev]);
    setDialogOpen(false);

    const created = await createTimeEntry(projectId, { ...input, id: optimisticId });
    if (!created) {
      setTimeEntries((prev) => prev.filter((entry) => entry.id !== optimisticId));
      toast.error("Couldn't log the time entry.");
      return;
    }

    setTimeEntries((prev) => prev.map((entry) => (entry.id === created.id ? created : entry)));
    toast.success("Time logged");
  };

  const confirmDeleteTimeEntry = async () => {
    const entry = deleteTarget;
    if (!entry) {
      return;
    }
    setDeleteTarget(null);
    setTimeEntries((prev) => prev.filter((item) => item.id !== entry.id));

    const ok = await softDeleteTimeEntry(entry.id);
    if (!ok) {
      setTimeEntries((prev) => [entry, ...prev]);
      toast.error("Couldn't delete the time entry.");
    }
  };

  const reportColumns = [
    {
      key: "item",
      header: "Item",
      render: (row) => (
        <p className="max-w-[360px] truncate font-medium text-foreground">{row.title}</p>
      ),
    },
    {
      key: "kind",
      header: "Kind",
      render: (row) => (
        <span className="rounded-md border border-border px-2 py-0.5 text-[11px] font-medium text-text-secondary">
          {row.kind}
        </span>
      ),
    },
    {
      key: "owner",
      header: "Owner",
      render: (row) => (
        <OwnerWidget
          name={
            row.assignees.length
              ? memberMap[row.assignees[0]]?.name || "Member"
              : "Unassigned"
          }
        />
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusPill status={row.status} map={REPORT_STATUS_MAP} />,
    },
    {
      key: "priority",
      header: "Priority",
      render: (row) => <StatusPill status={row.priority} map={REPORT_PRIORITY_MAP} />,
    },
    {
      key: "due",
      header: "Due",
      render: (row) => (
        <span className="text-sm text-muted-foreground">{formatDateLabel(row.dueDate)}</span>
      ),
    },
    {
      key: "progress",
      header: "Progress",
      render: (row) =>
        row.progress === null ? (
          <span className="text-xs text-text-secondary">—</span>
        ) : (
          <div className="w-[150px] space-y-1.5">
            <Progress
              value={row.progress}
              className="h-1.5 bg-surface-hover [&_[data-slot=progress-indicator]]:bg-primary"
            />
            <p className="text-xs text-text-secondary">{row.progress}%</p>
          </div>
        ),
    },
  ];

  const workloadColumns = [
    {
      key: "owner",
      header: "Owner",
      render: (row) => <OwnerWidget name={row.owner} large />,
    },
    {
      key: "open",
      header: "Open items",
      render: (row) => (
        <span className="text-sm font-medium tabular-nums text-foreground">
          {row.openItems} open · {row.overdue} overdue
        </span>
      ),
    },
    {
      key: "load",
      header: "Load",
      render: (row) => (
        <div className="w-[180px]">
          <Progress
            value={maxLoad > 0 ? Math.round((row.openItems / maxLoad) * 100) : 0}
            className="h-1.5 bg-surface-hover [&_[data-slot=progress-indicator]]:bg-primary"
          />
        </div>
      ),
    },
    {
      key: "logged",
      header: "Logged",
      align: "right",
      className: "text-right",
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
          <Clock3 className="h-3.5 w-3.5" />
          {formatDuration(row.loggedMinutes || 0)} logged
        </span>
      ),
    },
  ];

  const timeColumns = [
    {
      key: "entry",
      header: "Entry",
      render: (entry) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{entry.title}</p>
          {entry.notes ? (
            <p className="mt-0.5 line-clamp-1 text-xs text-text-secondary">{entry.notes}</p>
          ) : null}
        </div>
      ),
    },
    {
      key: "owner",
      header: "Owner",
      render: (entry) => (
        <OwnerWidget
          name={
            memberMap[entry.owner]?.name ||
            (entry.owner && !entry.owner.includes("-") ? entry.owner : "Unassigned")
          }
        />
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (entry) => (
        <span className="text-xs text-muted-foreground">{formatDateLabel(entry.workedOn)}</span>
      ),
    },
    {
      key: "duration",
      header: "Duration",
      align: "right",
      className: "text-right",
      render: (entry) => (
        <span className="text-sm font-medium tabular-nums text-foreground">
          {formatDuration(entry.minutes)}
        </span>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (entry) => (
        <span
          className={cn(
            "rounded-md border px-1.5 py-0.5 text-[10px] font-medium",
            entry.billable
              ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
              : "border-zinc-500/25 bg-zinc-500/10 text-foreground",
          )}
        >
          {entry.billable ? "Billable" : "Internal"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      className: "text-right",
      render: (entry) => (
        <ActionMenu
          label={`Actions for ${entry.title}`}
          items={[
            {
              icon: Trash2,
              label: "Delete",
              destructive: true,
              onSelect: () => setDeleteTarget(entry),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <MainScreenWrapper>
      <ScreenHeader
        title="Reporting"
        description="Track project progress, workload, deadlines and time in one place."
        actions={
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Log time
          </Button>
        }
      />

      <StatsBar stats={stats} />

      <Toolbar>
        <div className="flex items-center gap-2">
          <SegmentedTabs
            tabs={REPORT_VIEWS}
            value={activeView}
            onChange={setActiveView}
            className="xl:w-auto"
            buttonClassName="h-8 text-xs"
          />
          {activeView === "Tasks" ? (
            <FilterDropdown
              value={kindFilter}
              onValueChange={setKindFilter}
              options={KIND_FILTER_OPTIONS}
              height="h-9"
            />
          ) : null}
        </div>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search reports…"
        />
      </Toolbar>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-subtle px-6 py-16 text-sm text-text-secondary">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading report data…
        </div>
      ) : activeView === "Tasks" ? (
        <div className="space-y-5">
          <DataTable
            columns={reportColumns}
            data={tasksPager.pageItems}
            getRowKey={(row) => `${row.kind}-${row.id}`}
            empty={
              <div className="rounded-xl border border-border bg-surface-subtle">
                <EmptyState
                  icon={ListChecks}
                  title={reportRows.length === 0 ? "No work to report yet" : "No items match your search"}
                  description={
                    reportRows.length === 0
                      ? "Create tasks and issues in this project and they will roll up here automatically."
                      : "Try a different search term."
                  }
                />
              </div>
            }
          />
          <ListPagination {...tasksPager} itemLabel="items" />
        </div>
      ) : activeView === "Workload" ? (
        <div className="space-y-5">
          <DataTable
            columns={workloadColumns}
            data={workloadPager.pageItems}
            getRowKey={(row) => row.owner}
            empty={
              <div className="rounded-xl border border-border bg-surface-subtle">
                <EmptyState
                  icon={FileText}
                  title="Nothing assigned yet"
                  description="Assign owners to tasks and issues and their load will show up here."
                />
              </div>
            }
          />
          <ListPagination {...workloadPager} itemLabel="owners" />
        </div>
      ) : weeksPager.total === 0 ? (
        <div className="rounded-xl border border-border bg-surface-subtle">
          <EmptyState
            icon={Timer}
            title="No time logged yet"
            description="Log the first entry to build the project timesheet."
            action={
              <Button
                onClick={() => setDialogOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" /> Log time
              </Button>
            }
          />
        </div>
      ) : (
        <div className="space-y-5">
          {weeksPager.pageItems.map(([weekStart, entries]) => {
            const weekTotal = entries.reduce((sum, entry) => sum + entry.minutes, 0);
            return (
              <section key={weekStart} className="overflow-hidden rounded-xl border border-border">
                <div className="flex items-center justify-between border-b border-border bg-surface-subtle px-4 py-2.5">
                  <span className="text-sm font-semibold text-foreground">
                    {formatWeekLabel(weekStart)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
                    <Clock3 className="h-3.5 w-3.5" />
                    {formatDuration(weekTotal)}
                  </span>
                </div>
                <DataTable
                  columns={timeColumns}
                  data={entries}
                  getRowKey={(entry) => entry.id}
                  className="rounded-none border-0"
                />
              </section>
            );
          })}
          <ListPagination {...weeksPager} itemLabel="weeks" />
        </div>
      )}

      <AddTimeEntryDialog
        key={`time-${dialogOpen}`}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tasks={tasks}
        defaultOwner=""
        onSave={(input) => void saveTimeEntry(input)}
      />

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete time entry</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.title}
              </span>
              ? This action can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              className="bg-red-500/90 text-white hover:bg-red-500"
              onClick={confirmDeleteTimeEntry}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainScreenWrapper>
  );
}

function OwnerWidget({ name, large = false }) {
  const initials = (name || "?")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <Avatar size={large ? "md" : "sm"}>
        <AvatarFallback className="bg-zinc-300 text-[10px] font-bold text-primary-foreground">
          {initials || "?"}
        </AvatarFallback>
      </Avatar>
      <span className="truncate text-xs font-medium text-foreground">{name}</span>
    </span>
  );
}

export default ReportingScreen;
