"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Inbox, Plus } from "lucide-react";
import { Button } from "@geiger/ui";
import { Progress } from "@geiger/ui";
import { toast } from "sonner";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import {
  DataTable,
  EmptyState,
  ScreenHeader,
  SearchInput,
  StatsBar,
  StatusPill,
  Toolbar,
} from "@/components/internal/shared/screen_kit";
import {
  ListPagination,
  usePagination,
} from "@/components/internal/shared/pagination";
import FilterDropdown from "@/components/internal/screens/projects/overview/filter_dropdown";
import { AddTaskDialog } from "@/components/internal/screens/projects/tasks/add_task_dialog";
import { useProject } from "@/context/project-context";
import { listOrgMembers } from "@/lib/supabase/profiles";
import {
  listTasks,
  createTask,
} from "@/features/tasks/actions";
import {
  TASK_STATUSES,
  priorityWeight,
} from "@/features/tasks/constants";

// Status/priority pills for the list (config only — rows come from the data layer).
const QUEUE_STATUS_MAP = {
  todo: { label: "To Do", variant: "neutral", dotClass: "bg-zinc-400" },
  in_progress: { label: "In Progress", variant: "info", dotClass: "bg-sky-400" },
  blocked: { label: "Blocked", variant: "danger", dotClass: "bg-red-400" },
  done: { label: "Done", variant: "success", dotClass: "bg-emerald-400" },
};

const QUEUE_PRIORITY_MAP = {
  low: { label: "Low", variant: "info", dotClass: "bg-sky-400" },
  medium: { label: "Medium", variant: "neutral", dotClass: "bg-zinc-400" },
  high: { label: "High", variant: "warning", dotClass: "bg-amber-400" },
  critical: { label: "Critical", variant: "danger", dotClass: "bg-red-400" },
};

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All statuses" },
  ...TASK_STATUSES.map((status) => ({ value: status.value, label: status.label })),
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

function formatDateLabel(dueDate) {
  if (!dueDate) {
    return "No date";
  }

  const date = new Date(`${dueDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return dueDate;
  }

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function OwnerPill({ name }) {
  const initials = (name || "?")
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span className="grid h-6 w-6 place-items-center rounded-full bg-zinc-300 text-[10px] font-bold text-primary-foreground">
        {initials || "?"}
      </span>
      <span className="hidden truncate text-xs font-medium text-foreground 2xl:inline">{name}</span>
    </span>
  );
}

export function WorkQueueScreen() {
  const { project } = useProject();
  const projectId = project?.id;
  const organizationId = project?.organization_id;

  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!projectId) {
      return;
    }

    let cancelled = false;

    void listTasks(projectId).then((rows) => {
      if (cancelled) {
        return;
      }
      setTasks(rows ?? []);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  useEffect(() => {
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
  }, [organizationId]);

  const memberMap = useMemo(
    () => Object.fromEntries(members.map((member) => [member.id, member])),
    [members],
  );

  // View model rows with the first assignee resolved to a display name.
  const queueRows = useMemo(
    () =>
      [...tasks]
        .map((task) => ({
          ...task,
          ownerName:
            memberMap[task.assignees?.[0]]?.name ||
            (task.assignees?.length ? "Member" : "Unassigned"),
        }))
        .sort((a, b) => {
          if (a.dueDate && b.dueDate && a.dueDate !== b.dueDate) {
            return a.dueDate < b.dueDate ? -1 : 1;
          }
          if (a.dueDate && !b.dueDate) {
            return -1;
          }
          if (!a.dueDate && b.dueDate) {
            return 1;
          }
          return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
        }),
    [tasks, memberMap],
  );

  const visibleRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return queueRows.filter((task) => {
      if (activeStatus !== "all" && task.status !== activeStatus) {
        return false;
      }
      if (!normalizedQuery) {
        return true;
      }

      return [task.title, task.description, task.ownerName, task.type]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [queueRows, activeStatus, query]);

  const summary = useMemo(() => {
    let dueToday = 0;
    let overdue = 0;

    for (const task of queueRows) {
      if (task.status === "done") {
        continue;
      }

      const days = dueDateInfo(task.dueDate);
      if (days === null) {
        continue;
      }
      if (days === 0) {
        dueToday += 1;
      }
      if (days < 0) {
        overdue += 1;
      }
    }

    const progress =
      queueRows.length > 0
        ? Math.round(queueRows.reduce((sum, task) => sum + task.progress, 0) / queueRows.length)
        : 0;
    const inProgress = queueRows.filter((task) => task.status === "in_progress").length;

    return { dueToday, overdue, progress, inProgress };
  }, [queueRows]);

  const stats = useMemo(
    () => [
      { label: "Queued", value: String(queueRows.length), footer: `${summary.inProgress} in progress` },
      { label: "Due today", value: String(summary.dueToday), footer: "Needs attention this cycle" },
      { label: "Overdue", value: String(summary.overdue), footer: "Past the planned due date" },
      { label: "Progress", value: `${summary.progress}%`, footer: "Average completion" },
    ],
    [queueRows.length, summary],
  );

  const pager = usePagination(visibleRows, {
    resetKey: `${query}|${activeStatus}`,
  });

  const columns = [
    {
      key: "work",
      header: "Work",
      render: (task) => (
        <div className="flex min-w-[220px] flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{task.title}</span>
            <span className="shrink-0 rounded-md border border-border px-1.5 py-0.5 text-[10px] font-medium capitalize text-text-secondary">
              {task.type}
            </span>
          </div>
          <p className="line-clamp-1 text-xs text-text-secondary">{task.description}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (task) => <StatusPill status={task.status} map={QUEUE_STATUS_MAP} />,
    },
    {
      key: "priority",
      header: "Priority",
      render: (task) => <StatusPill status={task.priority} map={QUEUE_PRIORITY_MAP} />,
    },
    {
      key: "owner",
      header: "Owner",
      render: (task) => <OwnerPill name={task.ownerName} />,
    },
    {
      key: "due",
      header: "Due",
      render: (task) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {formatDateLabel(task.dueDate)}
        </span>
      ),
    },
    {
      key: "progress",
      header: "Progress",
      render: (task) => (
        <div className="w-[130px] space-y-1.5">
          <Progress
            value={task.progress}
            className="h-1.5 bg-surface-hover [&_[data-slot=progress-indicator]]:bg-primary"
          />
          <p className="text-xs tabular-nums text-text-secondary">{task.progress}%</p>
        </div>
      ),
    },
  ];

  const saveTask = async (input) => {
    const optimisticId = crypto.randomUUID();
    const optimistic = { id: optimisticId, projectId, ...input };

    setTasks((prev) => [optimistic, ...prev]);
    setDialogOpen(false);

    const created = await createTask(projectId, input);
    if (!created) {
      setTasks((prev) => prev.filter((task) => task.id !== optimisticId));
      toast.error("Couldn't add the work item.");
      return;
    }

    setTasks((prev) => [created, ...prev.filter((task) => task.id !== optimisticId)]);
    toast.success("Work added to the queue");
  };

  return (
    <MainScreenWrapper>
      <ScreenHeader
        title="Work Queue"
        description="Review assigned work and follow-ups in one ordered queue."
        actions={
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Work
          </Button>
        }
      />

      <StatsBar stats={stats} />

      <Toolbar>
        <div className="flex items-center gap-2">
          <FilterDropdown
            value={activeStatus}
            onValueChange={setActiveStatus}
            options={STATUS_FILTER_OPTIONS}
            height="h-9"
          />
        </div>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search work by title, description or owner…"
        />
      </Toolbar>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-subtle px-6 py-16 text-sm text-text-secondary">
          <Inbox className="h-4 w-4 animate-pulse" />
          Loading the queue…
        </div>
      ) : (
        <div className="space-y-5">
          <DataTable
            columns={columns}
            data={pager.pageItems}
            getRowKey={(task) => task.id}
            empty={
              <div className="rounded-xl border border-border bg-surface-subtle">
                <EmptyState
                  icon={Inbox}
                  title={queueRows.length === 0 ? "The queue is empty" : "No work matches your filters"}
                  description={
                    queueRows.length === 0
                      ? "Add the first item or create tasks from the Tasks board — both land here ordered by due date."
                      : "Clear the search or switch status filters."
                  }
                  action={
                    queueRows.length === 0 ? (
                      <Button
                        onClick={() => setDialogOpen(true)}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <Plus className="h-4 w-4" /> Add Work
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setQuery("");
                          setActiveStatus("all");
                        }}
                      >
                        Clear filters
                      </Button>
                    )
                  }
                />
              </div>
            }
          />
          <ListPagination {...pager} itemLabel="items" />
        </div>
      )}

      <AddTaskDialog
        key={`queue-task-${dialogOpen}`}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={(input) => void saveTask(input)}
      />
    </MainScreenWrapper>
  );
}

export default WorkQueueScreen;
