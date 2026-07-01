"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Bug,
  CalendarClock,
  CalendarDays,
  Check,
  CircleDot,
  ClipboardList,
  Clock3,
  Cog,
  Gauge,
  Hash,
  Loader2,
  LucidePen,
  MessageSquare,
  Pencil,
  Plus,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  Tag,
  Trash2,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@geiger/ui";
import { Input } from "@geiger/ui";
import { Textarea } from "@geiger/ui";
import { Badge } from "@geiger/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@geiger/ui";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@geiger/ui";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@geiger/ui";
import { cn } from "@/lib/utils";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import {
  IssueItem,
  IssueSeverityBadge,
  severityIcons,
  statusIcons,
} from "@geiger/ui";
import {
  IssueDialog,
  NewIssueDialog,
} from "@/components/internal/dilouges/issues/newissue_dilouge";
import { useProject } from "@/context/project-context";
import {
  addIssueComment,
  createIssue,
  deleteIssueComment,
  listIssueComments,
  listIssues,
  softDeleteIssue,
  updateIssue,
  updateIssueComment,
} from "@/features/issues/actions";
import { notifyIssueAssigned } from "@/features/issues/notifications";
import {
  DEFAULT_ISSUE_SORT,
  ISSUE_ESTIMATES,
  ISSUE_PRIORITIES,
  ISSUE_SORTS,
  ISSUE_STATUSES,
  ISSUE_TYPES,
  priorityWeight,
  statusLabels,
  statusMeta,
  typeLabels,
  typeMeta,
} from "@/features/issues/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@geiger/ui";
import { getUser } from "@/lib/supabase/user";
import {
  getProfilesByIds,
  listOrgMembers,
  profileFromUser,
} from "@/lib/supabase/profiles";

// Icon per issue type (mirrors the dialog; the metadata-bag `type` field).
const TYPE_ICONS = {
  task: ClipboardList,
  bug: Bug,
  feature: Sparkles,
  improvement: Wrench,
  chore: Cog,
};

function formatDate(value) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString(undefined, {
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
  if (mins < 1) {
    return "just now";
  }
  if (mins < 60) {
    return `${mins}m ago`;
  }
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days}d ago`;
  }
  return formatDate(value);
}

function isOverdue(issue) {
  if (!issue?.dueDate || issue.status === "resolved") {
    return false;
  }

  return new Date(issue.dueDate).getTime() < Date.now();
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

const DETAIL_TABS = [
  { id: "details", label: "Details" },
  { id: "comments", label: "Comments" },
];

// Collapse long descriptions behind a "Show more" toggle past this length.
const DESCRIPTION_CLAMP = 220;

function CommentItem({ comment, author, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.body);
  const [busy, setBusy] = useState(false);

  const authorName = author?.name || "Member";

  const handleSave = async () => {
    const body = draft.trim();
    if (!body || body === comment.body) {
      setEditing(false);
      setDraft(comment.body);
      return;
    }

    setBusy(true);
    const updated = await updateIssueComment(comment.id, body);
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
    const ok = await deleteIssueComment(comment.id);
    setBusy(false);

    if (ok) {
      onDelete(comment.id);
    } else {
      toast.error("Couldn't delete comment");
    }
  };

  const edited =
    comment.updatedAt && comment.updatedAt !== comment.createdAt;

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

function IssueCaseDetails({ issue, members = [], onUpdate, onDelete }) {
  const [activeTab, setActiveTab] = useState("details");
  const [comments, setComments] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [authors, setAuthors] = useState({});
  const [me, setMe] = useState(null);
  const [descExpanded, setDescExpanded] = useState(false);
  const labelInputRef = useRef(null);

  // Resolve the signed-in user once (composer avatar + author fallback).
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
      return listIssueComments(issue.id).then(async (rows) => {
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
  }, [issue.id]);

  // Look up a comment's author, falling back to the signed-in user's profile.
  const resolveAuthor = useCallback(
    (authorId) => {
      if (authors[authorId]) {
        return authors[authorId];
      }
      if (me && authorId === me.id) {
        return me;
      }
      return null;
    },
    [authors, me],
  );

  // Persist a partial change and lift the result up to the screen.
  const patchIssue = useCallback(
    async (patch) => {
      const updated = await updateIssue(issue.id, patch);
      if (updated) {
        onUpdate(updated);

        // Email anyone newly added as an assignee. Diff against the pre-update
        // value so re-saving an unchanged assignee list sends nothing.
        if ("assignees" in patch) {
          const previous = issue.assignees || [];
          const added = (patch.assignees || []).filter(
            (id) => !previous.includes(id),
          );
          notifyIssueAssigned(issue.id, added);
        }
      } else {
        toast.error("Couldn't update issue");
      }
      return updated;
    },
    [issue.id, issue.assignees, onUpdate],
  );

  // Metadata fields share one jsonb bag that's written whole, so always send the
  // full current set alongside the field being changed.
  const patchMeta = useCallback(
    (partial) =>
      patchIssue({
        type: issue.type,
        estimate: issue.estimate,
        startDate: issue.startDate,
        ...partial,
      }),
    [patchIssue, issue.type, issue.estimate, issue.startDate],
  );

  const handleAddComment = async () => {
    const body = draft.trim();
    if (!body) {
      return;
    }

    setPosting(true);
    const created = await addIssueComment(issue.id, body);
    setPosting(false);

    if (created) {
      setComments((current) => [...current, created]);
      setDraft("");

      // Make sure the new comment's author resolves in the list.
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
    if (!label || issue.labels.includes(label)) {
      setNewLabel("");
      return;
    }
    const updated = await patchIssue({ labels: [...issue.labels, label] });
    if (updated) {
      setNewLabel("");
    }
  };

  const handleRemoveLabel = (label) => {
    void patchIssue({ labels: issue.labels.filter((l) => l !== label) });
  };

  const handleDelete = async () => {
    setDeleting(true);
    const ok = await softDeleteIssue(issue.id);
    setDeleting(false);

    if (ok) {
      setConfirmDelete(false);
      onDelete(issue.id);
      toast.success("Issue deleted");
    } else {
      toast.error("Couldn't delete issue");
    }
  };

  const overdue = isOverdue(issue);
  const TypeIcon = TYPE_ICONS[issue.type] || ClipboardList;

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      <div className="border-b border-border bg-gradient-to-b from-surface-subtle/60 to-background p-6 pr-12">
        {/* Top row: ID + actions */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-card px-2 py-1 font-mono text-xs text-muted-foreground">
            <Hash className="h-3 w-3" />
            {issue.id.slice(0, 8)}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditOpen(true)}
              className="text-muted-foreground hover:bg-surface-hover hover:text-foreground"
            >
              <LucidePen className="h-3.5 w-3.5" />
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

        {/* Title with type-icon tile */}
        <div className="flex items-start gap-3">
          <span
            className={cn(
              "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
              typeMeta[issue.type]?.className,
            )}
          >
            <TypeIcon className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold leading-tight text-foreground">
              {issue.title}
            </h2>
            <p className="mt-1 text-xs text-text-secondary">
              Opened {formatDate(issue.createdAt)}
            </p>
          </div>
        </div>

        {/* Indicator pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge
            className={cn(
              "gap-1.5 border px-2 py-1 capitalize",
              statusMeta[issue.status]?.className,
            )}
          >
            {statusIcons[issue.status]}
            {statusLabels[issue.status] || issue.status}
          </Badge>
          <IssueSeverityBadge severity={issue.priority} className="py-1" />
          <Badge
            className={cn(
              "gap-1.5 border px-2 py-1 capitalize",
              typeMeta[issue.type]?.className,
            )}
          >
            <TypeIcon className="h-3 w-3" />
            {typeLabels[issue.type] || issue.type}
          </Badge>
          {issue.estimate ? (
            <Badge className="gap-1.5 border border-border bg-surface-card px-2 py-1 text-muted-foreground">
              <Gauge className="h-3 w-3" />
              {issue.estimate} PTS
            </Badge>
          ) : null}
          {overdue ? (
            <Badge className="gap-1.5 border border-orange-500/20 bg-orange-500/10 px-2 py-1 text-orange-400">
              <CalendarClock className="h-3 w-3" />
              Overdue
            </Badge>
          ) : null}
        </div>

        {issue.description &&
          (() => {
            const isLong = issue.description.length > DESCRIPTION_CLAMP;

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
                  {issue.description}
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
            {/* Quick inline controls */}
            <section className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-text-secondary">
                    <CircleDot className="h-3.5 w-3.5" />
                    Status
                  </Label>
                  <Select
                    value={issue.status}
                    onValueChange={(value) => patchIssue({ status: value })}
                  >
                    <SelectTrigger className="w-full bg-surface-card border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ISSUE_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          <span className="flex items-center gap-2">
                            {statusIcons[status.value]}
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
                    value={issue.priority}
                    onValueChange={(value) => patchIssue({ priority: value })}
                  >
                    <SelectTrigger className="w-full bg-surface-card border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ISSUE_PRIORITIES.map((priority) => (
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
                    value={issue.type}
                    onValueChange={(value) => patchMeta({ type: value })}
                  >
                    <SelectTrigger className="w-full bg-surface-card border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ISSUE_TYPES.map((type) => {
                        const Icon = TYPE_ICONS[type.value] || ClipboardList;
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
                    <Gauge className="h-3.5 w-3.5" />
                    Estimate
                  </Label>
                  <Select
                    value={issue.estimate ? String(issue.estimate) : "none"}
                    onValueChange={(value) =>
                      patchMeta({ estimate: value === "none" ? "" : value })
                    }
                  >
                    <SelectTrigger className="w-full bg-surface-card border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ISSUE_ESTIMATES.map((estimate) => (
                        <SelectItem
                          key={estimate.value || "none"}
                          value={estimate.value || "none"}
                        >
                          {estimate.label}
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
                    value={issue.startDate || ""}
                    onChange={(e) =>
                      patchMeta({ startDate: e.target.value || null })
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
                    value={issue.dueDate || ""}
                    onChange={(e) =>
                      patchIssue({ dueDate: e.target.value || null })
                    }
                    className={cn(
                      "bg-surface-card border-border text-foreground focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1",
                      overdue && "border-orange-500/40 text-orange-400",
                    )}
                  />
                </div>
              </div>
            </section>

            {/* Assignees */}
            <AssigneeSection
              value={issue.assignees || []}
              members={members}
              onChange={(ids) => patchIssue({ assignees: ids })}
            />

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
                {issue.labels.map((label) => (
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
                      issue.labels.length > 0
                    ) {
                      handleRemoveLabel(issue.labels[issue.labels.length - 1]);
                    }
                  }}
                  onBlur={() => void handleAddLabel()}
                  placeholder={
                    issue.labels.length
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
                  value: formatDate(issue.createdAt),
                },
                {
                  icon: Clock3,
                  label: "Updated",
                  value: formatDate(issue.updatedAt),
                },
                {
                  icon: Hash,
                  label: "Issue ID",
                  value: (
                    <span className="font-mono">{issue.id.slice(0, 8)}</span>
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
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading comments…
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
            <div className="flex-1 overflow-hidden rounded-lg">
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

      {/* Edit dialog */}
      <IssueDialog
        issue={issue}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSubmit={async (payload) => {
          const updated = await patchIssue(payload);
          return Boolean(updated);
        }}
      />

      {/* Delete confirmation */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="sm:max-w-md bg-background border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground">Delete issue?</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              “{issue.title}” will be removed. This can’t be undone from here.
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

// Local label used inside the detail sheet (avoids importing the form Label
// where it'd clash visually — kept lightweight here).
function Label({ className, children }) {
  return <span className={className}>{children}</span>;
}

export function WorkflowsScreen() {
  const { project } = useProject();
  const projectId = project?.id;
  const organizationId = project?.organization_id;

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sort, setSort] = useState(DEFAULT_ISSUE_SORT);

  const fetchIssues = useCallback(async () => {
    if (!projectId) {
      return;
    }

    setLoading(true);
    const rows = await listIssues(projectId);
    setIssues(rows);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    void Promise.resolve().then(fetchIssues);
  }, [fetchIssues]);

  // Org members power the assignee picker + list avatars.
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

  const visibleIssues = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = issues.filter((issue) => {
      if (statusFilter !== "all" && issue.status !== statusFilter) {
        return false;
      }
      if (priorityFilter !== "all" && issue.priority !== priorityFilter) {
        return false;
      }
      if (query) {
        const haystack = `${issue.title} ${issue.description}`.toLowerCase();
        if (!haystack.includes(query)) {
          return false;
        }
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
            (priorityWeight[b.priority] || 0) -
            (priorityWeight[a.priority] || 0)
          );
        case "due": {
          const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          return aDue - bDue;
        }
        case "newest":
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return sorted;
  }, [issues, search, statusFilter, priorityFilter, sort]);

  const handleCreateIssue = async (payload) => {
    const created = await createIssue(projectId, payload);

    if (!created) {
      toast.error("Couldn't create issue");
      return false;
    }

    setIssues((current) => [created, ...current]);
    toast.success("Issue created");
    return true;
  };

  const handleIssueUpdated = useCallback((updated) => {
    setIssues((current) =>
      current.map((issue) => (issue.id === updated.id ? updated : issue)),
    );
  }, []);

  const handleIssueDeleted = useCallback((id) => {
    setIssues((current) => current.filter((issue) => issue.id !== id));
  }, []);

  const hasFilters =
    search.trim() || statusFilter !== "all" || priorityFilter !== "all";

  return (
    <MainScreenWrapper>
      <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            Issues
          </h1>
          <p className="mt-1 text-muted-foreground">
            Track and manage issues for this project.
          </p>
        </div>
        <NewIssueDialog onCreate={handleCreateIssue}>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Create New Issue
          </Button>
        </NewIssueDialog>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search issues…"
            className="bg-surface-card border-border pl-9 text-foreground focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full bg-surface-card border-border text-foreground sm:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {ISSUE_STATUSES.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full bg-surface-card border-border text-foreground sm:w-[150px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {ISSUE_PRIORITIES.map((priority) => (
              <SelectItem key={priority.value} value={priority.value}>
                {priority.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full bg-surface-card border-border text-foreground sm:w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ISSUE_SORTS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12 text-text-secondary">
          Loading issues…
        </div>
      ) : issues.length === 0 ? (
        <div className="p-12 text-center text-text-secondary">
          No issues yet. Create your first issue to get started.
        </div>
      ) : visibleIssues.length === 0 ? (
        <div className="p-12 text-center text-text-secondary">
          No issues match your filters.
          {hasFilters ? (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setPriorityFilter("all");
              }}
              className="ml-1 text-primary hover:underline"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      ) : (
        <div className="space-y-2">
          {visibleIssues.map((issue) => (
            <IssueItem
              key={issue.id}
              title={issue.title}
              severity={issue.priority}
              status={issue.status}
              assignees={(issue.assignees || [])
                .map((id) => memberMap[id])
                .filter(Boolean)}
              dueDate={issue.dueDate ? formatDate(issue.dueDate) : undefined}
              sheetContentClassName="w-full p-0 sm:max-w-2xl border-l border-border bg-surface-dialog text-foreground [&>button]:right-5 [&>button]:top-5 [&>button]:text-text-secondary hover:[&>button]:text-foreground"
            >
              <IssueCaseDetails
                issue={issue}
                members={members}
                onUpdate={handleIssueUpdated}
                onDelete={handleIssueDeleted}
              />
            </IssueItem>
          ))}
        </div>
      )}
    </MainScreenWrapper>
  );
}
