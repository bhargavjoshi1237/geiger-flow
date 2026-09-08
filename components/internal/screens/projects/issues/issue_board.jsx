"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import {
  Bug,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Circle,
  CircleDashed,
  ClipboardList,
  Cog,
  GripVertical,
  Hash,
  Layers,
  CheckCircle2,
  Loader2,
  Sparkles,
  Wrench,
  XCircle,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
  IssueSeverityBadge,
  Sheet,
  SheetContent,
  SheetTitle,
  Switch,
  statusIcons,
} from "@geiger/ui";
import { ActionMenu } from "@geiger/ui";
import { EmptyState } from "@/components/internal/shared/screen_kit";
import { cn } from "@/lib/utils";
import { updateIssue } from "@/features/issues/actions";
import {
  ISSUE_STATUSES,
  isDoneStatus,
  issueIdentifier,
  statusLabels,
  typeLabels,
  typeMeta,
} from "@/features/issues/constants";

// Empty columns for these terminal states stay hidden until "show closed" is
// enabled. Non-empty ones always render.
const TERMINAL_STATUSES = ["canceled", "duplicate"];

const FALLBACK_COLUMN_CLASS =
  "bg-zinc-500/10 text-zinc-300 border-zinc-500/20";

// Icon per issue type (mirrors workflows.jsx; the metadata-bag `type` field).
const TYPE_ICONS = {
  task: ClipboardList,
  bug: Bug,
  feature: Sparkles,
  improvement: Wrench,
  chore: Cog,
};

const DETAIL_SHEET_CLASSNAME =
  "w-full p-0 sm:max-w-2xl border-l border-border bg-surface-dialog text-foreground [&>button]:right-5 [&>button]:top-5 [&>button]:text-text-secondary hover:[&>button]:text-foreground";

// Glyphs for workflow states the shared kit doesn't know yet (@geiger/ui's
// statusIcons only covers the legacy open/in_progress/resolved set). Mirrors
// the statusIconFor helper in workflows.jsx (kept local to avoid a cycle).
const WORKFLOW_STATUS_ICONS = {
  backlog: CircleDashed,
  todo: Circle,
  in_progress: Loader2,
  done: CheckCircle2,
  canceled: XCircle,
  duplicate: Layers,
};

function statusIconFor(status, className = "h-3.5 w-3.5") {
  if (statusIcons[status]) {
    return statusIcons[status];
  }
  const Fallback = WORKFLOW_STATUS_ICONS[status] || Circle;
  return <Fallback className={className} />;
}

function isOverdue(issue) {
  if (!issue?.dueDate || isDoneStatus(issue.status)) {
    return false;
  }

  return new Date(issue.dueDate).getTime() < Date.now();
}

function formatShortDate(value) {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function BoardCardBody({ issue, project, memberMap }) {
  const overdue = isOverdue(issue);
  const TypeIcon = TYPE_ICONS[issue.type] || ClipboardList;
  const assignees = (issue.assignees || [])
    .map((id) => memberMap[id])
    .filter(Boolean);
  const labels = issue.labels || [];

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-text-tertiary">
          <Hash className="h-3 w-3" />
          {issueIdentifier(issue, project)}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] capitalize",
            typeMeta[issue.type]?.className || FALLBACK_COLUMN_CLASS,
          )}
          title={typeLabels[issue.type] || issue.type}
        >
          <TypeIcon className="h-3 w-3" />
          {typeLabels[issue.type] || issue.type}
        </span>
      </div>

      <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
        {issue.title}
      </p>

      <div className="flex flex-wrap items-center gap-1.5">
        <IssueSeverityBadge severity={issue.priority} />
        {issue.estimate ? (
          <span className="rounded border border-border bg-surface-hover px-1.5 py-0.5 text-[11px] tabular-nums text-muted-foreground">
            {issue.estimate} PTS
          </span>
        ) : null}
      </div>

      {labels.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1">
          {labels.slice(0, 2).map((label) => (
            <span
              key={label}
              className="max-w-[120px] truncate rounded bg-surface-hover px-1.5 py-0.5 text-[11px] text-muted-foreground"
              title={label}
            >
              {label}
            </span>
          ))}
          {labels.length > 2 ? (
            <span className="rounded bg-surface-hover px-1.5 py-0.5 text-[11px] tabular-nums text-text-secondary">
              +{labels.length - 2}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-2">
        {issue.dueDate ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-[11px]",
              overdue
                ? "font-medium text-orange-400"
                : "text-text-secondary",
            )}
            title={overdue ? "Overdue" : "Due date"}
          >
            <CalendarDays className="h-3 w-3" />
            {formatShortDate(issue.dueDate)}
          </span>
        ) : (
          <span />
        )}
        {assignees.length > 0 ? (
          <AvatarGroup>
            {assignees.slice(0, 3).map((person) => (
              <Avatar key={person.id} className="size-6">
                {person.avatarUrl && (
                  <AvatarImage src={person.avatarUrl} alt={person.name} />
                )}
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-[9px] font-semibold text-white">
                  {person.initials}
                </AvatarFallback>
              </Avatar>
            ))}
            {assignees.length > 3 ? (
              <AvatarGroupCount className="size-6 text-[9px]">
                +{assignees.length - 3}
              </AvatarGroupCount>
            ) : null}
          </AvatarGroup>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}

function BoardCard({ issue, project, memberMap, isOverlay, onOpen }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: issue.id, disabled: isOverlay });

  const style = isOverlay
    ? {}
    : {
        transform: CSS.Transform.toString(transform),
        transition,
      };

  const body = (
    <div
      onClick={isOverlay ? undefined : onOpen}
      className={cn(
        "group space-y-2.5 rounded-lg border border-border bg-surface-card p-3 transition-colors",
        !isOverlay && "cursor-pointer hover:border-border-strong",
        !isOverlay && isDragging && "opacity-40",
        isOverlay && "border-border-strong shadow-2xl shadow-black/40",
      )}
    >
      {!isOverlay ? (
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <BoardCardBody issue={issue} project={project} memberMap={memberMap} />
          </div>
          <div className="mt-0.5 flex shrink-0 items-center">
            {!isOverlay ? (
              <ActionMenu
                label={`Actions for ${issue.title}`}
                items={[
                  {
                    icon: ClipboardList,
                    label: "Open details",
                    onSelect: onOpen,
                  },
                ]}
              />
            ) : null}
            <button
              type="button"
              {...listeners}
              onClick={(event) => event.stopPropagation()}
              aria-label={`Drag ${issue.title}`}
              className="shrink-0 cursor-grab touch-none rounded p-1 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-foreground active:cursor-grabbing"
            >
              <GripVertical className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <BoardCardBody issue={issue} project={project} memberMap={memberMap} />
      )}
    </div>
  );

  if (isOverlay) {
    return <div className="w-[280px]">{body}</div>;
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {body}
    </div>
  );
}

function BoardColumn({
  column,
  columnIssues,
  project,
  memberMap,
  collapsed,
  onToggleCollapse,
  isDragging,
  onOpenIssue,
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.value });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-[280px] shrink-0 flex-col rounded-xl border border-border bg-surface-subtle/30 transition-colors sm:w-[300px]",
        isOver && "border-border-strong bg-surface-subtle/70",
      )}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span className="flex min-w-0 flex-1 items-center gap-1.5">
          {statusIconFor(column.value)}
          <span className="truncate text-xs font-medium text-muted-foreground">
            {column.label}
          </span>
          <span className="shrink-0 rounded-full bg-surface-hover px-1.5 py-0.5 text-[10px] tabular-nums text-text-secondary">
            {columnIssues.length}
          </span>
        </span>
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? `Expand ${column.label}` : `Collapse ${column.label}`}
          className="shrink-0 rounded p-1 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-foreground"
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {collapsed ? null : (
        <SortableContext
          items={columnIssues.map((issue) => issue.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="max-h-[60vh] min-h-[80px] flex-1 space-y-2 overflow-y-auto p-2 pt-0">
            {columnIssues.map((issue) => (
              <BoardCard
                key={issue.id}
                issue={issue}
                project={project}
                memberMap={memberMap}
                onOpen={() => onOpenIssue(issue)}
              />
            ))}
            {columnIssues.length === 0 ? (
              <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-border px-2 text-center text-[11px] text-text-tertiary">
                {isDragging ? "Drop issues here" : "No issues"}
              </div>
            ) : null}
          </div>
        </SortableContext>
      )}
    </div>
  );
}

export function IssueBoard({
  issues = [],
  project = null,
  memberMap = {},
  onIssuesChange,
  renderDetails,
}) {
  const [showEmpty, setShowEmpty] = useState(true);
  const [showClosed, setShowClosed] = useState(false);
  const [collapsed, setCollapsed] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [selected, setSelected] = useState(null);

  const startSnapshot = useRef(null);
  const startStatus = useRef(null);
  const lastDragEndAt = useRef(0);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  // Columns follow ISSUE_STATUSES order; issues with an unrecognised status
  // get their own trailing column instead of disappearing.
  const columns = useMemo(() => {
    const known = ISSUE_STATUSES.map((status) => ({
      value: status.value,
      label: status.label,
    }));
    const knownSet = new Set(known.map((column) => column.value));
    const extras = [
      ...new Set(
        issues
          .map((issue) => issue.status)
          .filter((status) => status && !knownSet.has(status)),
      ),
    ].map((value) => ({ value, label: statusLabels[value] || value }));
    return [...known, ...extras];
  }, [issues]);

  const statusValues = useMemo(
    () => new Set(columns.map((column) => column.value)),
    [columns],
  );

  const byStatus = useMemo(() => {
    const grouped = {};
    for (const column of columns) {
      grouped[column.value] = [];
    }
    for (const issue of issues) {
      if (!grouped[issue.status]) {
        grouped[issue.status] = [];
      }
      grouped[issue.status].push(issue);
    }
    return grouped;
  }, [columns, issues]);

  const visibleColumns = useMemo(
    () =>
      columns.filter((column) => {
        const count = (byStatus[column.value] || []).length;
        if (
          !showClosed &&
          TERMINAL_STATUSES.includes(column.value) &&
          count === 0
        ) {
          return false;
        }
        if (!showEmpty && count === 0) {
          return false;
        }
        return true;
      }),
    [columns, byStatus, showEmpty, showClosed],
  );

  const activeIssue = useMemo(
    () => issues.find((issue) => issue.id === activeId) || null,
    [issues, activeId],
  );

  const liveSelected = selected
    ? issues.find((issue) => issue.id === selected.id) || selected
    : null;

  function findColumnFor(id) {
    if (statusValues.has(id)) {
      return id;
    }
    return issues.find((issue) => issue.id === id)?.status || null;
  }

  function handleDragStart(event) {
    startSnapshot.current = issues;
    startStatus.current = findColumnFor(event.active.id);
    setActiveId(event.active.id);
  }

  function handleDragOver(event) {
    const { active, over } = event;
    if (!over) {
      return;
    }

    const activeCol = findColumnFor(active.id);
    const overCol = findColumnFor(over.id);

    if (!activeCol || !overCol || activeCol === overCol) {
      return;
    }

    onIssuesChange((previous) =>
      previous.map((issue) =>
        issue.id === active.id ? { ...issue, status: overCol } : issue,
      ),
    );
  }

  async function handleDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);
    lastDragEndAt.current = Date.now();

    const snapshot = startSnapshot.current;
    const fromStatus = startStatus.current;
    startSnapshot.current = null;
    startStatus.current = null;

    if (!over) {
      if (snapshot) {
        onIssuesChange(snapshot);
      }
      return;
    }

    const targetCol =
      findColumnFor(over.id) || findColumnFor(active.id) || fromStatus;
    if (!targetCol) {
      if (snapshot) {
        onIssuesChange(snapshot);
      }
      return;
    }

    const previous = issues;
    const moving = previous.find((issue) => issue.id === active.id);
    if (!moving) {
      if (snapshot) {
        onIssuesChange(snapshot);
      }
      return;
    }

    // Rebuild the global order while slotting the card at its drop position
    // inside the target column (local reorder only — never persisted).
    const without = previous.filter((issue) => issue.id !== active.id);
    const moved = { ...moving, status: targetCol };
    const columnWithout = without.filter(
      (issue) => issue.status === targetCol,
    );

    let rawIndex = columnWithout.findIndex((issue) => issue.id === over.id);
    if (rawIndex === -1) {
      rawIndex = columnWithout.length;
    }

    let next;
    if (columnWithout.length === 0) {
      next = [...without, moved];
    } else if (rawIndex >= columnWithout.length) {
      const anchor = columnWithout[columnWithout.length - 1];
      const anchorIndex = without.findIndex(
        (issue) => issue.id === anchor.id,
      );
      next = [...without];
      next.splice(anchorIndex + 1, 0, moved);
    } else {
      const anchor = columnWithout[rawIndex];
      const anchorIndex = without.findIndex(
        (issue) => issue.id === anchor.id,
      );
      next = [...without];
      next.splice(anchorIndex, 0, moved);
    }
    onIssuesChange(next);

    // Persist cross-column moves; revert + toast on failure.
    if (fromStatus && fromStatus !== targetCol) {
      const updated = await updateIssue(active.id, { status: targetCol });
      if (!updated) {
        if (snapshot) {
          onIssuesChange(snapshot);
        }
        toast.error("Couldn't update issue status");
      } else {
        onIssuesChange((current) =>
          current.map((issue) =>
            issue.id === active.id ? updated : issue,
          ),
        );
      }
    }
  }

  function handleDragCancel() {
    setActiveId(null);
    startStatus.current = null;
    if (startSnapshot.current) {
      onIssuesChange(startSnapshot.current);
      startSnapshot.current = null;
    }
  }

  function handleOpenIssue(issue) {
    if (Date.now() - lastDragEndAt.current < 200) {
      return;
    }
    setSelected(issue);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
          <Switch checked={showEmpty} onCheckedChange={setShowEmpty} />
          Show empty columns
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
          <Switch checked={showClosed} onCheckedChange={setShowClosed} />
          Show closed
        </label>
        <span className="ml-auto hidden text-[11px] text-text-tertiary sm:inline">
          Drag cards between columns to change status
        </span>
      </div>

      {visibleColumns.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface-subtle">
          <EmptyState
            icon={Layers}
            title="No columns to show"
            description="Turn on “Show empty columns” or clear your filters."
          />
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="flex items-start gap-3 overflow-x-auto pb-2">
            {visibleColumns.map((column) => (
              <BoardColumn
                key={column.value}
                column={column}
                columnIssues={byStatus[column.value] || []}
                project={project}
                memberMap={memberMap}
                collapsed={Boolean(collapsed[column.value])}
                onToggleCollapse={() =>
                  setCollapsed((previous) => ({
                    ...previous,
                    [column.value]: !previous[column.value],
                  }))
                }
                isDragging={activeId !== null}
                onOpenIssue={handleOpenIssue}
              />
            ))}
          </div>

          <DragOverlay>
            {activeIssue ? (
              <BoardCard
                issue={activeIssue}
                project={project}
                memberMap={memberMap}
                isOverlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <Sheet
        open={liveSelected !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
          }
        }}
      >
        <SheetContent className={DETAIL_SHEET_CLASSNAME}>
          <SheetTitle className="sr-only">
            {liveSelected?.title || "Issue details"}
          </SheetTitle>
          {liveSelected ? renderDetails(liveSelected) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
