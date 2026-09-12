"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { Button } from "@geiger/ui";
import { Input } from "@geiger/ui";
import { Textarea } from "@geiger/ui";
import { Badge } from "@geiger/ui";
import { Progress } from "@geiger/ui";
import { Slider } from "@geiger/ui";
import { ActionMenu } from "@geiger/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@geiger/ui";
import { Sheet, SheetContent, SheetTitle } from "@geiger/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@geiger/ui";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@geiger/ui";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@geiger/ui";
import {
  AlertOctagon,
  AlertTriangle,
  Bug,
  CalendarClock,
  CalendarDays,
  Check,
  Circle,
  CircleCheck,
  ClipboardList,
  Clock3,
  Gauge,
  Hash,
  Link2,
  Loader2,
  MessageSquare,
  Pencil,
  Plus,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  Tag,
  Timer,
  Trash2,
  Users,
  Wrench,
  X,
} from "lucide-react";
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
import { AddTaskDialog } from "./add_task_dialog";
import { cn } from "@/lib/utils";
import { useProject } from "@/context/project-context";
import { IssueSeverityBadge, severityIcons, LogoLoading } from "@geiger/ui";
import { getUser } from "@/lib/supabase/user";
import {
  getProfilesByIds,
  listOrgMembers,
  profileFromUser,
} from "@/lib/supabase/profiles";
import {
  addTaskComment,
  createTask,
  deleteTaskComment,
  listTaskComments,
  listTasks,
  softDeleteTask,
  updateTask,
  updateTaskComment,
} from "@/features/tasks/actions";
import {
  DEFAULT_TASK_SORT,
  TASK_PRIORITIES,
  TASK_SORTS,
  TASK_STAGES,
  TASK_STATUSES,
  TASK_TYPES,
  priorityWeight,
  statusLabels,
  statusMeta,
  stageLabels,
  typeLabels,
  typeMeta,
} from "@/features/tasks/constants";

// Status/priority pills for the list (config only — rows come from the data layer).
const TASK_STATUS_MAP = {
  todo: { label: "To Do", variant: "neutral", dotClass: "bg-zinc-400" },
  in_progress: { label: "In Progress", variant: "info", dotClass: "bg-sky-400" },
  blocked: { label: "Blocked", variant: "danger", dotClass: "bg-red-400" },
  done: { label: "Done", variant: "success", dotClass: "bg-emerald-400" },
};

const TASK_PRIORITY_MAP = {
  low: { label: "Low", variant: "info", dotClass: "bg-sky-400" },
  medium: { label: "Medium", variant: "neutral", dotClass: "bg-zinc-400" },
  high: { label: "High", variant: "warning", dotClass: "bg-amber-400" },
  critical: { label: "Critical", variant: "danger", dotClass: "bg-red-400" },
};

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All statuses" },
  ...TASK_STATUSES.map((status) => ({ value: status.value, label: status.label })),
];

const PRIORITY_FILTER_OPTIONS = [
  { value: "all", label: "All priorities" },
  ...TASK_PRIORITIES.map((priority) => ({ value: priority.value, label: priority.label })),
];

const GOAL_OPTIONS = [
  { value: "goal:predictable-delivery", label: "Predictable delivery" },
  { value: "goal:clean-inbox", label: "Clean inbox" },
  { value: "goal:onboarding-conversion", label: "Improve onboarding conversion rate" },
  { value: "goal:platform-uptime", label: "Achieve 99.9% platform uptime SLA" },
  { value: "goal:collaborative-editing", label: "Launch collaborative editing feature" },
];

// Status glyph + colour (tasks have their own statuses, distinct from issues).
const TASK_STATUS_ICONS = {
  todo: { Icon: Circle, color: "text-zinc-400" },
  in_progress: { Icon: Timer, color: "text-blue-400" },
  blocked: { Icon: AlertOctagon, color: "text-red-400" },
  done: { Icon: CircleCheck, color: "text-emerald-400" },
};

const TASK_TYPE_ICONS = {
  task: ClipboardList,
  issue: AlertTriangle,
  bug: Bug,
  feature: Sparkles,
  improvement: Wrench,
};

// Collapse long descriptions behind a fade past this length.
const DESCRIPTION_CLAMP = 220;

function formatDate(value) {
  if (!value) {
    return "—";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatRelative(value) {
  if (!value) {
    return "";
  }
  const diffMs = Date.now() - new Date(value).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(value);
}

function isOverdue(task) {
  if (!task?.dueDate || task.status === "done") {
    return false;
  }
  return new Date(task.dueDate).getTime() < Date.now();
}

function StatusGlyph({ status, className }) {
  const meta = TASK_STATUS_ICONS[status] || TASK_STATUS_ICONS.todo;
  const Icon = meta.Icon;
  return <Icon className={cn("h-3.5 w-3.5", meta.color, className)} />;
}

function StatusBadge({ status }) {
  return (
    <Badge
      className={cn(
        "gap-1.5 border px-2 py-1 capitalize",
        statusMeta[status]?.className,
      )}
    >
      <StatusGlyph status={status} />
      {statusLabels[status] || status}
    </Badge>
  );
}

function Label({ className, children }) {
  return <span className={className}>{children}</span>;
}

function StatTile({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-between gap-2 px-3 py-2.5">
      <span className="flex shrink-0 items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-text-tertiary">
        <Icon className="h-3 w-3" />
        {label}
      </span>
      <span className="truncate text-xs font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}

function CommentItem({ comment, author, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.body);
  const [busy, setBusy] = useState(false);

  const authorName = author?.name || "Member";
  const edited = comment.updatedAt && comment.updatedAt !== comment.createdAt;

  const handleSave = async () => {
    const body = draft.trim();
    if (!body || body === comment.body) {
      setEditing(false);
      setDraft(comment.body);
      return;
    }
    setBusy(true);
    const updated = await updateTaskComment(comment.id, body);
    setBusy(false);
    if (updated) {
      onUpdate(updated);
      setEditing(false);
    } else {
      toast.error("Couldn't update comment");
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    const ok = await deleteTaskComment(comment.id);
    setBusy(false);
    if (ok) {
      onDelete(comment.id);
    } else {
      toast.error("Couldn't delete comment");
    }
  };

  return (
    <div className="group flex gap-3">
      <Avatar className="h-8 w-8 shrink-0 ring-1 ring-inset ring-border">
        {author?.avatarUrl && (
          <AvatarImage src={author.avatarUrl} alt={authorName} />
        )}
        <AvatarFallback className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-[10px] font-semibold text-white">
          {author?.initials || "M"}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground">
            {authorName}
          </span>
          <span className="text-[11px] text-text-tertiary">
            {formatRelative(comment.createdAt)}
            {edited ? " · edited" : ""}
          </span>
          {!editing && (
            <div className="ml-auto flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded p-1 text-text-secondary hover:bg-surface-hover hover:text-foreground"
                aria-label="Edit comment"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={busy}
                className="rounded p-1 text-text-secondary hover:bg-red-500/10 hover:text-red-400"
                aria-label="Delete comment"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {editing ? (
          <div className="space-y-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              autoFocus
              className="bg-surface-card border-border text-foreground focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditing(false);
                  setDraft(comment.body);
                }}
                disabled={busy}
                className="text-muted-foreground hover:text-foreground hover:bg-surface-hover"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={busy || !draft.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {busy ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="mr-1.5 h-3.5 w-3.5" />
                )}
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-lg rounded-tl-sm border border-border bg-surface-card px-3 py-2">
            <p className="whitespace-pre-wrap text-sm text-foreground">
              {comment.body}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function AssigneeSection({ value, members, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const byId = useMemo(
    () => Object.fromEntries(members.map((member) => [member.id, member])),
    [members],
  );
  const selected = value.map((id) => byId[id]).filter(Boolean);

  const needle = query.trim().toLowerCase();
  const filtered = needle
    ? members.filter((member) => member.name.toLowerCase().includes(needle))
    : members;

  const toggle = (id) => {
    const next = value.includes(id)
      ? value.filter((existing) => existing !== id)
      : [...value, id];
    onChange(next);
  };

  return (
    <section className="space-y-3">
      <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
        <Users className="h-3.5 w-3.5" />
        Assignees
      </h3>
      <div className="flex flex-wrap items-center gap-2">
        {selected.map((person) => (
          <span
            key={person.id}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-card py-0.5 pl-0.5 pr-2 text-xs text-foreground"
          >
            <Avatar className="size-5">
              {person.avatarUrl && (
                <AvatarImage src={person.avatarUrl} alt={person.name} />
              )}
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-[8px] font-semibold text-white">
                {person.initials}
              </AvatarFallback>
            </Avatar>
            {person.name}
            <button
              type="button"
              onClick={() => toggle(person.id)}
              className="text-text-secondary hover:text-red-400"
              aria-label={`Remove ${person.name}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border-strong px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface-card hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
              Assign
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-60 border-border bg-surface-dialog p-0 text-foreground"
          >
            <div className="border-b border-border p-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-secondary" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search members…"
                  className="h-8 border-border bg-surface-card pl-8 text-xs text-foreground focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1"
                />
              </div>
            </div>
            <div className="max-h-[220px] overflow-y-auto p-1">
              {members.length === 0 ? (
                <p className="px-2 py-4 text-center text-xs text-text-secondary">
                  No members found.
                </p>
              ) : filtered.length === 0 ? (
                <p className="px-2 py-4 text-center text-xs text-text-secondary">
                  No matches.
                </p>
              ) : (
                filtered.map((person) => {
                  const isSelected = value.includes(person.id);
                  return (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => toggle(person.id)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                        isSelected
                          ? "bg-surface-active text-foreground"
                          : "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
                      )}
                    >
                      <Avatar className="size-6">
                        {person.avatarUrl && (
                          <AvatarImage src={person.avatarUrl} alt={person.name} />
                        )}
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-[9px] font-semibold text-white">
                          {person.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="flex-1 truncate font-medium">
                        {person.name}
                      </span>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </section>
  );
}

const DETAIL_TABS = [
  { id: "details", label: "Details" },
  { id: "comments", label: "Comments" },
];

function TaskDetails({ task, members = [], onUpdate, onDelete, onEdit }) {
  const [activeTab, setActiveTab] = useState("details");
  const [comments, setComments] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [authors, setAuthors] = useState({});
  const [me, setMe] = useState(null);
  const [descExpanded, setDescExpanded] = useState(false);
  const [progress, setProgress] = useState(task.progress);
  const labelInputRef = useRef(null);

  useEffect(() => {
    void Promise.resolve().then(() => setProgress(task.progress));
  }, [task.progress]);

  useEffect(() => {
    let active = true;
    void getUser().then((user) => {
      if (active) {
        setMe(profileFromUser(user));
      }
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) {
        return undefined;
      }
      setLoading(true);
      return listTaskComments(task.id).then(async (rows) => {
        if (!active) {
          return;
        }
        setComments(rows);
        setLoading(false);
        const map = await getProfilesByIds(rows.map((row) => row.authorId));
        if (active) {
          setAuthors(map);
        }
      });
    });
    return () => {
      active = false;
    };
  }, [task.id]);

  const resolveAuthor = useCallback(
    (authorId) => {
      if (authors[authorId]) return authors[authorId];
      if (me && authorId === me.id) return me;
      return null;
    },
    [authors, me],
  );

  const patchTask = useCallback(
    async (patch) => {
      const updated = await updateTask(task.id, patch);
      if (updated) {
        onUpdate(updated);
      } else {
        toast.error("Couldn't update task");
      }
      return updated;
    },
    [task.id, onUpdate],
  );

  const handleAddComment = async () => {
    const body = draft.trim();
    if (!body) {
      return;
    }
    setPosting(true);
    const created = await addTaskComment(task.id, body);
    setPosting(false);
    if (created) {
      setComments((current) => [...current, created]);
      setDraft("");
      if (created.authorId && !authors[created.authorId]) {
        const map = await getProfilesByIds([created.authorId]);
        setAuthors((current) => ({ ...current, ...map }));
      }
    } else {
      toast.error("Couldn't add comment");
    }
  };

  const handleAddLabel = async () => {
    const label = newLabel.trim();
    if (!label || task.labels.includes(label)) {
      setNewLabel("");
      return;
    }
    const updated = await patchTask({ labels: [...task.labels, label] });
    if (updated) {
      setNewLabel("");
    }
  };

  const handleRemoveLabel = (label) => {
    void patchTask({ labels: task.labels.filter((item) => item !== label) });
  };

  const handleDelete = async () => {
    setDeleting(true);
    const ok = await softDeleteTask(task.id);
    setDeleting(false);
    if (ok) {
      setConfirmDelete(false);
      onDelete(task.id);
      toast.success("Task deleted");
    } else {
      toast.error("Couldn't delete task");
    }
  };

  const overdue = isOverdue(task);
  const TypeIcon = TASK_TYPE_ICONS[task.type] || ClipboardList;

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      <div className="border-b border-border bg-gradient-to-b from-surface-subtle/60 to-background p-6 pr-12">
        <div className="mb-4 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-card px-2 py-1 font-mono text-xs text-muted-foreground">
            <Hash className="h-3 w-3" />
            {task.id.slice(0, 8)}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(task)}
              className="text-muted-foreground hover:bg-surface-hover hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmDelete(true)}
              className="text-red-400 hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span
            className={cn(
              "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
              typeMeta[task.type]?.className,
            )}
          >
            <TypeIcon className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold leading-tight text-foreground">
              {task.title}
            </h2>
            <p className="mt-1 text-xs text-text-secondary">
              Opened {formatDate(task.createdAt)}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <StatusBadge status={task.status} />
          <IssueSeverityBadge severity={task.priority} className="py-1" />
          <Badge
            className={cn(
              "gap-1.5 border px-2 py-1 capitalize",
              typeMeta[task.type]?.className,
            )}
          >
            <TypeIcon className="h-3 w-3" />
            {typeLabels[task.type] || task.type}
          </Badge>
          {task.stage ? (
            <Badge className="gap-1.5 border border-border bg-surface-card px-2 py-1 text-muted-foreground">
              {stageLabels[task.stage] || task.stage}
            </Badge>
          ) : null}
          <Badge className="gap-1.5 border border-border bg-surface-card px-2 py-1 text-muted-foreground">
            <Gauge className="h-3 w-3" />
            {task.progress}%
          </Badge>
          {overdue ? (
            <Badge className="gap-1.5 border border-orange-500/20 bg-orange-500/10 px-2 py-1 text-orange-400">
              <CalendarClock className="h-3 w-3" />
              Overdue
            </Badge>
          ) : null}
        </div>

        {task.description &&
          (() => {
            const isLong = task.description.length > DESCRIPTION_CLAMP;
            return (
              <div
                className={cn("relative mt-4", isLong && "cursor-pointer")}
                onClick={
                  isLong ? () => setDescExpanded((value) => !value) : undefined
                }
                title={isLong ? "Click to expand" : undefined}
              >
                <p
                  className={cn(
                    "text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap",
                    isLong && !descExpanded && "max-h-[4.5rem] overflow-hidden",
                  )}
                >
                  {task.description}
                </p>
                {isLong && !descExpanded && (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background via-background/80 to-transparent" />
                )}
              </div>
            );
          })()}
      </div>

      <div className="flex border-b border-border bg-surface-subtle/40">
        {DETAIL_TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 border-b-2 py-3 text-sm font-medium transition-colors",
                active
                  ? "border-primary text-foreground bg-surface-hover/30"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-surface-hover/20",
              )}
            >
              {tab.label}
              {tab.id === "comments" && comments.length > 0
                ? ` (${comments.length})`
                : ""}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "details" ? (
          <div className="space-y-6">
            <section className="space-y-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                Properties
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-text-secondary">
                    <Circle className="h-3.5 w-3.5" />
                    Status
                  </Label>
                  <Select
                    value={task.status}
                    onValueChange={(value) => patchTask({ status: value })}
                  >
                    <SelectTrigger className="w-full bg-surface-card border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          <span className="flex items-center gap-2">
                            <StatusGlyph status={status.value} />
                            {status.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-text-secondary">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    Priority
                  </Label>
                  <Select
                    value={task.priority}
                    onValueChange={(value) => patchTask({ priority: value })}
                  >
                    <SelectTrigger className="w-full bg-surface-card border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_PRIORITIES.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <span className="flex items-center gap-2">
                            {severityIcons[priority.value]}
                            {priority.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-text-secondary">
                    <ClipboardList className="h-3.5 w-3.5" />
                    Type
                  </Label>
                  <Select
                    value={task.type}
                    onValueChange={(value) => patchTask({ type: value })}
                  >
                    <SelectTrigger className="w-full bg-surface-card border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_TYPES.map((type) => {
                        const Icon = TASK_TYPE_ICONS[type.value] || ClipboardList;
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <span className="flex items-center gap-2">
                              <Icon className="h-3.5 w-3.5" />
                              {type.label}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-text-secondary">
                    <Link2 className="h-3.5 w-3.5" />
                    Stage
                  </Label>
                  <Select
                    value={task.stage || "none"}
                    onValueChange={(value) =>
                      patchTask({ stage: value === "none" ? null : value })
                    }
                  >
                    <SelectTrigger className="w-full bg-surface-card border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No stage</SelectItem>
                      {TASK_STAGES.map((stage) => (
                        <SelectItem key={stage.value} value={stage.value}>
                          {stage.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-text-secondary">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Start date
                  </Label>
                  <Input
                    type="date"
                    value={task.startDate || ""}
                    onChange={(e) =>
                      patchTask({ startDate: e.target.value || null })
                    }
                    className="bg-surface-card border-border text-foreground focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-text-secondary">
                    <CalendarClock className="h-3.5 w-3.5" />
                    Due date
                    {overdue && (
                      <span className="rounded bg-orange-500/10 px-1.5 py-0.5 text-[10px] font-semibold normal-case tracking-normal text-orange-400">
                        Overdue
                      </span>
                    )}
                  </Label>
                  <Input
                    type="date"
                    value={task.dueDate || ""}
                    onChange={(e) =>
                      patchTask({ dueDate: e.target.value || null })
                    }
                    className={cn(
                      "bg-surface-card border-border text-foreground focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1",
                      overdue && "border-orange-500/40 text-orange-400",
                    )}
                  />
                </div>
              </div>
            </section>

            {/* Progress */}
            <section className="space-y-2">
              <h3 className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                <span>Progress</span>
                <span className="font-mono text-text-tertiary">{progress}%</span>
              </h3>
              <Slider
                min={0}
                max={100}
                step={5}
                value={[progress]}
                onValueChange={([value]) => setProgress(value)}
                onValueCommit={([value]) => patchTask({ progress: value })}
                className="[&_[data-slot=slider-range]]:bg-primary [&_[data-slot=slider-track]]:bg-surface-hover [&_[data-slot=slider-thumb]]:border-foreground"
              />
            </section>

            {/* Assignees */}
            <AssigneeSection
              value={task.assignees || []}
              members={members}
              onChange={(ids) => patchTask({ assignees: ids })}
            />

            {/* Linked goal */}
            <section className="space-y-2">
              <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                <Link2 className="h-3.5 w-3.5" />
                Linked goal
              </h3>
              <Select
                value={task.parentLink || "none"}
                onValueChange={(value) =>
                  patchTask({ parentLink: value === "none" ? "" : value })
                }
              >
                <SelectTrigger className="w-full bg-surface-card border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No linked goal</SelectItem>
                  {GOAL_OPTIONS.map((goal) => (
                    <SelectItem key={goal.value} value={goal.value}>
                      {goal.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </section>

            {/* Labels */}
            <section className="space-y-3">
              <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                <Tag className="h-3.5 w-3.5" />
                Labels
              </h3>
              <div
                onMouseDown={(e) => {
                  if (e.target === e.currentTarget) {
                    e.preventDefault();
                    labelInputRef.current?.focus();
                  }
                }}
                className="flex min-h-[48px] cursor-text flex-wrap items-center gap-1.5 rounded-md border border-border bg-surface-card px-2.5 py-2 focus-within:ring-1 focus-within:ring-ring"
              >
                {task.labels.map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1 rounded bg-surface-hover px-2 py-1 text-xs text-foreground"
                  >
                    {label}
                    <button
                      type="button"
                      onClick={() => handleRemoveLabel(label)}
                      className="text-text-secondary hover:text-red-400"
                      aria-label={`Remove ${label}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <input
                  ref={labelInputRef}
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      void handleAddLabel();
                    } else if (
                      e.key === "Backspace" &&
                      !newLabel &&
                      task.labels.length > 0
                    ) {
                      handleRemoveLabel(task.labels[task.labels.length - 1]);
                    }
                  }}
                  onBlur={() => void handleAddLabel()}
                  placeholder={
                    task.labels.length
                      ? "Add label…"
                      : "Type a label and press Enter"
                  }
                  className="h-7 min-w-[140px] flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-text-tertiary"
                />
              </div>
            </section>

            {/* Stats */}
            <div className="flex items-stretch rounded-lg border border-border bg-black/20">
              {[
                {
                  icon: Clock3,
                  label: "Created",
                  value: formatDate(task.createdAt),
                },
                {
                  icon: Clock3,
                  label: "Updated",
                  value: formatDate(task.updatedAt),
                },
                {
                  icon: Hash,
                  label: "Task ID",
                  value: (
                    <span className="font-mono">{task.id.slice(0, 8)}</span>
                  ),
                },
              ].map((stat, index) => (
                <React.Fragment key={stat.label}>
                  {index > 0 && <div className="my-2.5 w-px bg-border" />}
                  <StatTile
                    icon={stat.icon}
                    label={stat.label}
                    value={stat.value}
                  />
                </React.Fragment>
              ))}
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-text-secondary">
            <LogoLoading size={36} label="Loading comments" />
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <MessageSquare className="h-8 w-8 text-text-tertiary" />
            <p className="text-sm text-text-secondary">No comments yet.</p>
            <p className="text-xs text-text-tertiary">
              Start the discussion below.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                author={resolveAuthor(comment.authorId)}
                onUpdate={(updated) =>
                  setComments((current) =>
                    current.map((c) => (c.id === updated.id ? updated : c)),
                  )
                }
                onDelete={(id) =>
                  setComments((current) => current.filter((c) => c.id !== id))
                }
              />
            ))}
          </div>
        )}
      </div>

      {activeTab === "comments" && (
        <div className="border-t border-border bg-surface-subtle/40 p-4">
          <div className="flex gap-3">
            <Avatar className="hidden h-8 w-8 shrink-0 ring-1 ring-inset ring-border sm:flex">
              {me?.avatarUrl && <AvatarImage src={me.avatarUrl} alt={me.name} />}
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-[10px] font-semibold text-white">
                {me?.initials || "M"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden rounded-lg border border-border bg-surface-card focus-within:ring-1 focus-within:ring-ring">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                    e.preventDefault();
                    void handleAddComment();
                  }
                }}
                placeholder="Write a comment…"
                rows={2}
                className="resize-none border-0 bg-transparent text-foreground shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <div className="flex items-center justify-between border-t border-border px-3 py-2">
                <span className="flex items-center gap-1 text-[11px] text-text-tertiary">
                  <kbd className="rounded border border-border bg-surface-subtle px-1 py-0.5 font-sans text-[10px]">
                    ⌘
                  </kbd>
                  <kbd className="rounded border border-border bg-surface-subtle px-1 py-0.5 font-sans text-[10px]">
                    ↵
                  </kbd>
                  to send
                </span>
                <Button
                  size="sm"
                  onClick={handleAddComment}
                  disabled={!draft.trim() || posting}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
                >
                  {posting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  {posting ? "Posting…" : "Comment"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="sm:max-w-md bg-background border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground">Delete task?</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              “{task.title}” will be removed. This can’t be undone from here.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              variant="ghost"
              onClick={() => setConfirmDelete(false)}
              disabled={deleting}
              className="text-muted-foreground hover:text-foreground hover:bg-surface-hover"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-500/90 text-white hover:bg-red-500"
            >
              {deleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function TasksScreen() {
  const { project } = useProject();
  const projectId = project?.id;
  const organizationId = project?.organization_id;

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sort, setSort] = useState(DEFAULT_TASK_SORT);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchTasks = useCallback(async () => {
    if (!projectId) {
      return;
    }
    setLoading(true);
    const rows = await listTasks(projectId);
    setTasks(rows);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    void Promise.resolve().then(fetchTasks);
  }, [fetchTasks]);

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

  const visibleTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = tasks.filter((task) => {
      if (statusFilter !== "all" && task.status !== statusFilter) return false;
      if (priorityFilter !== "all" && task.priority !== priorityFilter)
        return false;
      if (query) {
        const haystack = `${task.title} ${task.description}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "priority":
          return (
            (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0)
          );
        case "due": {
          const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          return aDue - bDue;
        }
        case "progress":
          return (b.progress || 0) - (a.progress || 0);
        case "newest":
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });
    return sorted;
  }, [tasks, search, statusFilter, priorityFilter, sort]);

  const handleDialogToggle = (open) => {
    setDialogOpen(open);
    if (!open) {
      setEditingTask(null);
    }
  };

  const handleCreate = () => {
    setEditingTask(null);
    setDialogOpen(true);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setDialogOpen(true);
  };

  const handleTaskUpdated = useCallback((updated) => {
    setTasks((current) =>
      current.map((task) => (task.id === updated.id ? updated : task)),
    );
    setSelectedTask((current) =>
      current && current.id === updated.id ? updated : current,
    );
  }, []);

  const handleTaskDeleted = useCallback((id) => {
    setTasks((current) => current.filter((task) => task.id !== id));
    setSelectedTask((current) =>
      current && current.id === id ? null : current,
    );
  }, []);

  const handleMenuDelete = async () => {
    const task = deleteTarget;
    if (!task) {
      return;
    }
    setDeleteTarget(null);
    const ok = await softDeleteTask(task.id);
    if (!ok) {
      toast.error("Couldn't delete task");
      return;
    }
    handleTaskDeleted(task.id);
    toast.success("Task deleted");
  };

  const handleSaveTask = async (payload) => {
    if (editingTask?.id) {
      const updated = await updateTask(editingTask.id, payload);
      if (!updated) {
        toast.error("Couldn't update task");
        return;
      }
      handleTaskUpdated(updated);
      toast.success("Task updated");
      return;
    }

    const created = await createTask(projectId, payload);
    if (!created) {
      toast.error("Couldn't create task");
      return;
    }
    setTasks((current) => [created, ...current]);
    toast.success("Task created");
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPriorityFilter("all");
  };

  const stats = useMemo(() => {
    const inProgress = tasks.filter((task) => task.status === "in_progress").length;
    const overdue = tasks.filter(isOverdue).length;
    const done = tasks.filter((task) => task.status === "done").length;
    return [
      { label: "Total tasks", value: String(tasks.length), footer: `${done} done` },
      { label: "In progress", value: String(inProgress), footer: "Actively being worked" },
      { label: "Overdue", value: String(overdue), footer: "Past the due date" },
      {
        label: "Completion",
        value: `${tasks.length ? Math.round((done / tasks.length) * 100) : 0}%`,
        footer: "Share of tasks done",
      },
    ];
  }, [tasks]);

  const pager = usePagination(visibleTasks, {
    resetKey: `${search}|${statusFilter}|${priorityFilter}|${sort}`,
  });

  const columns = [
    {
      key: "task",
      header: "Task",
      render: (task) => (
        <div className="flex flex-col gap-1">
          <span className="font-medium text-foreground">{task.title}</span>
          {task.description ? (
            <p className="line-clamp-1 text-xs text-text-secondary">
              {task.description}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (task) => <StatusPill status={task.status} map={TASK_STATUS_MAP} />,
    },
    {
      key: "priority",
      header: "Priority",
      render: (task) => (
        <StatusPill status={task.priority} map={TASK_PRIORITY_MAP} />
      ),
    },
    {
      key: "assignees",
      header: "Assignees",
      render: (task) => {
        const assignees = (task.assignees || [])
          .map((id) => memberMap[id])
          .filter(Boolean);
        if (assignees.length === 0) {
          return <span className="text-xs text-text-tertiary">—</span>;
        }
        return (
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
            {assignees.length > 3 && (
              <AvatarGroupCount className="size-6 text-[9px]">
                +{assignees.length - 3}
              </AvatarGroupCount>
            )}
          </AvatarGroup>
        );
      },
    },
    {
      key: "due",
      header: "Due",
      render: (task) => (
        <div className="text-sm text-muted-foreground">
          {task.dueDate ? formatDate(task.dueDate) : "—"}
          {isOverdue(task) ? (
            <span className="ml-1 text-orange-400">(Overdue)</span>
          ) : null}
        </div>
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
          <p className="text-xs text-text-secondary">{task.progress}%</p>
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      className: "text-right",
      render: (task) => (
        <ActionMenu
          label={`Actions for ${task.title}`}
          items={[
            { icon: Pencil, label: "Edit", onSelect: () => handleEdit(task) },
            { separator: true },
            {
              icon: Trash2,
              label: "Delete",
              destructive: true,
              onSelect: () => setDeleteTarget(task),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <MainScreenWrapper>
      <ScreenHeader
        title="Tasks"
        description="Create, track and manage project tasks."
        actions={
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleCreate}
          >
            <Plus className="h-4 w-4" />
            Create Task
          </Button>
        }
      />

      <StatsBar stats={stats} />

      <Toolbar>
        <div className="flex items-center gap-2">
          <FilterDropdown
            value={statusFilter}
            onValueChange={setStatusFilter}
            options={STATUS_FILTER_OPTIONS}
            height="h-9"
          />
          <FilterDropdown
            value={priorityFilter}
            onValueChange={setPriorityFilter}
            options={PRIORITY_FILTER_OPTIONS}
            height="h-9"
          />
          <FilterDropdown
            value={sort}
            onValueChange={setSort}
            options={TASK_SORTS}
            height="h-9"
          />
        </div>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search tasks…"
        />
      </Toolbar>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-subtle px-6 py-16 text-sm text-text-secondary">
          <LogoLoading size={40} label="Loading tasks" />
        </div>
      ) : (
        <div className="space-y-5">
          <DataTable
            columns={columns}
            data={pager.pageItems}
            getRowKey={(task) => task.id}
            onRowClick={(task) => setSelectedTask(task)}
            empty={
              <div className="rounded-xl border border-border bg-surface-subtle">
                <EmptyState
                  icon={ClipboardList}
                  title={
                    tasks.length
                      ? "No tasks match your filters"
                      : "No tasks yet"
                  }
                  description={
                    tasks.length
                      ? "Try clearing the search or filters, or create a new task to get started."
                      : "Create your first task to start tracking work."
                  }
                  action={
                    tasks.length ? (
                      <Button variant="ghost" onClick={clearFilters}>
                        Clear filters
                      </Button>
                    ) : (
                      <Button
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={handleCreate}
                      >
                        <Plus className="h-4 w-4" /> Create Task
                      </Button>
                    )
                  }
                />
              </div>
            }
          />
          <ListPagination {...pager} itemLabel="tasks" />
        </div>
      )}

      <AddTaskDialog
        open={dialogOpen}
        onOpenChange={handleDialogToggle}
        task={editingTask}
        onSave={handleSaveTask}
        goalOptions={GOAL_OPTIONS}
      />

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete task</DialogTitle>
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
              onClick={handleMenuDelete}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet
        open={Boolean(selectedTask)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTask(null);
          }
        }}
      >
        <SheetContent
          side="right"
          className="w-full border-l border-border bg-background p-0 text-foreground sm:max-w-2xl [&>button]:right-5 [&>button]:top-5 [&>button]:text-text-secondary hover:[&>button]:text-foreground"
        >
          <SheetTitle className="sr-only">
            {selectedTask?.title || "Task"}
          </SheetTitle>
          {selectedTask && (
            <TaskDetails
              task={selectedTask}
              members={members}
              onUpdate={handleTaskUpdated}
              onDelete={handleTaskDeleted}
              onEdit={handleEdit}
            />
          )}
        </SheetContent>
      </Sheet>
    </MainScreenWrapper>
  );
}
