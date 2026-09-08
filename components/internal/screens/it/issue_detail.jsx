"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Link2,
  Repeat,
  Tag,
  Trash2,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Textarea,
} from "@geiger/ui";
import { cn } from "@/lib/utils";
import { issueIdentifier } from "@/features/issues/constants";
import {
  addIssueComment,
  deleteIssueComment,
  listIssueComments,
} from "@/features/issues/actions";
import {
  formatRelative,
  formatShortDate,
  isOverdue,
  labelColor,
} from "./constants";
import { PriorityIcon, StatusIcon, priorityLabel, statusLabel } from "./icons";
import {
  AssigneePicker,
  CyclePicker,
  LabelPicker,
  PriorityPicker,
  ProjectPicker,
  StatusPicker,
} from "./pickers";
import { useTracker } from "./use_tracker";

// Linear's issue view: title + description on the left, an always-visible
// property rail on the right, and the comment thread below the description.
// Title and description save on blur; every property saves on pick.
//
// Below `lg` the rail can't be a column, so it moves above the description as a
// full-width block — same controls, stacked instead of docked.

function PropertyRow({ label, children }) {
  return (
    <div className="flex items-start gap-2 py-1">
      <span className="w-[76px] shrink-0 pt-1 text-[12px] text-[var(--lnr-ink-subtle)]">
        {label}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function PropertyButton({ children, className, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-1.5 rounded-[5px] px-1.5 py-1 text-left text-[13px] text-[var(--lnr-ink-muted)] transition-colors hover:bg-[var(--lnr-hover)] hover:text-[var(--lnr-ink)]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function CommentThread({ issueId }) {
  const { peopleById, me } = useTracker();
  const [comments, setComments] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!issueId) return undefined;
    let cancelled = false;
    void listIssueComments(issueId).then((rows) => {
      if (!cancelled) setComments(rows ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, [issueId]);

  const submit = async (event) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setSending(true);
    const created = await addIssueComment(issueId, body);
    setSending(false);
    if (!created) {
      toast.error("Couldn't post that comment.");
      return;
    }
    setComments((current) => [...current, created]);
    setDraft("");
  };

  const remove = async (id) => {
    const previous = comments;
    setComments((current) => current.filter((comment) => comment.id !== id));
    const ok = await deleteIssueComment(id);
    if (!ok) {
      setComments(previous);
      toast.error("Couldn't delete that comment.");
    }
  };

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-4">
        {comments.map((comment) => {
          const author = peopleById[comment.authorId];
          return (
            <article key={comment.id} className="group flex gap-2.5">
              <Avatar className="mt-0.5 h-6 w-6 shrink-0">
                <AvatarImage src={author?.avatarUrl} alt="" />
                <AvatarFallback className="bg-[var(--lnr-strong)] text-[10px] text-[var(--lnr-ink-muted)]">
                  {author?.initials || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-medium text-[var(--lnr-ink)]">
                    {author?.name || "Unknown"}
                  </span>
                  <span className="text-[11px] text-[var(--lnr-ink-tertiary)]">
                    {formatRelative(comment.createdAt)}
                  </span>
                  {comment.authorId === me?.id ? (
                    <button
                      type="button"
                      onClick={() => remove(comment.id)}
                      aria-label="Delete comment"
                      className="ml-auto opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-[var(--lnr-ink-tertiary)] hover:text-[var(--destructive-text)]" />
                    </button>
                  ) : null}
                </div>
                <p className="mt-0.5 whitespace-pre-wrap text-[13px] leading-relaxed text-[var(--lnr-ink-muted)]">
                  {comment.body}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      <form onSubmit={submit} className="mt-5">
        <div className="rounded-[8px] border border-[var(--lnr-border-strong)] bg-[var(--lnr-panel)] focus-within:border-[var(--lnr-accent)]">
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Leave a comment..."
            rows={3}
            className="resize-none border-0 bg-transparent text-[13px] shadow-none focus-visible:ring-0"
          />
          <div className="flex justify-end p-2 pt-0">
            <Button
              type="submit"
              size="sm"
              disabled={!draft.trim() || sending}
              className="h-7 bg-[var(--lnr-accent)] px-3 text-[12px] text-white hover:bg-[var(--lnr-accent-hover)]"
            >
              Comment
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export function IssueDetail({ issueId, onClose, onNavigate }) {
  const { issues, project, peopleById, projects, cycles, patchIssue, removeIssue, copyIssue } =
    useTracker();

  const index = issues.findIndex((entry) => entry.id === issueId);
  const issue = index >= 0 ? issues[index] : null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [seededId, setSeededId] = useState(null);

  // Seed the local drafts once the issue resolves and again whenever a
  // different one is opened — keyed on the row's id, so saving a title (which
  // changes the row but not its id) never clobbers what is being typed.
  if (issue && seededId !== issue.id) {
    setSeededId(issue.id);
    setTitle(issue.title ?? "");
    setDescription(issue.description ?? "");
  }

  const identifier = useMemo(
    () => (issue ? issueIdentifier(issue, project) : ""),
    [issue, project],
  );

  const set = useCallback(
    (patch) => {
      if (issue) void patchIssue(issue.id, patch, { silent: true });
    },
    [issue, patchIssue],
  );

  if (!issue) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <p className="text-[14px] text-[var(--lnr-ink-subtle)]">This issue no longer exists.</p>
        <Button size="sm" variant="secondary" onClick={onClose}>
          Back to issues
        </Button>
      </div>
    );
  }

  const linkedProject = projects.find((entry) => entry.id === issue.objectiveId);
  const linkedCycle = cycles.find((entry) => entry.id === issue.cycleId);
  const creator = peopleById[issue.createdBy];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex h-[45px] shrink-0 items-center gap-2 border-b border-[var(--lnr-border)] px-2 sm:px-4">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 rounded-[5px] px-1 py-0.5 text-[13px] text-[var(--lnr-ink-subtle)] hover:bg-[var(--lnr-hover)] hover:text-[var(--lnr-ink)]"
        >
          Issues
        </button>
        <span className="text-[var(--lnr-ink-tertiary)]">/</span>
        <span className="text-[13px] font-medium text-[var(--lnr-ink)]">{identifier}</span>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous issue"
            disabled={index <= 0}
            onClick={() => onNavigate?.(issues[index - 1]?.id)}
            className="hidden h-7 w-7 items-center justify-center rounded-[5px] text-[var(--lnr-ink-subtle)] hover:bg-[var(--lnr-hover)] disabled:opacity-30 sm:flex"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next issue"
            disabled={index >= issues.length - 1}
            onClick={() => onNavigate?.(issues[index + 1]?.id)}
            className="hidden h-7 w-7 items-center justify-center rounded-[5px] text-[var(--lnr-ink-subtle)] hover:bg-[var(--lnr-hover)] disabled:opacity-30 sm:flex"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Issue actions"
                className="flex h-7 items-center rounded-[5px] px-2 text-[13px] text-[var(--lnr-ink-subtle)] hover:bg-[var(--lnr-hover)] hover:text-[var(--lnr-ink)]"
              >
                •••
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="linear-scope w-52 border-[var(--lnr-border-strong)] bg-[var(--lnr-elevated)]"
            >
              <DropdownMenuItem
                onSelect={() => {
                  void navigator.clipboard?.writeText(identifier);
                  toast.success("Issue ID copied");
                }}
              >
                <Copy className="h-4 w-4" />
                Copy ID
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  void navigator.clipboard?.writeText(window.location.href);
                  toast.success("Link copied");
                }}
              >
                <Link2 className="h-4 w-4" />
                Copy link
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => copyIssue(issue.id)}>
                <Repeat className="h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[var(--lnr-border)]" />
              <DropdownMenuItem
                variant="destructive"
                className="text-[var(--destructive-text)] focus:bg-red-500/10"
                onSelect={async () => {
                  const ok = await removeIssue(issue.id);
                  if (ok) onClose?.();
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close issue"
            className="flex h-7 w-7 items-center justify-center rounded-[5px] text-[var(--lnr-ink-subtle)] hover:bg-[var(--lnr-hover)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lnr-scrollbar lg:flex-row lg:overflow-hidden">
        <div className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8 lg:overflow-y-auto lg:py-8 lnr-scrollbar">
          <div className="mx-auto max-w-[720px]">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onBlur={() => {
                const next = title.trim();
                if (next && next !== issue.title) set({ title: next });
                else setTitle(issue.title);
              }}
              className="w-full bg-transparent text-[22px] font-medium tracking-[-0.01em] text-[var(--lnr-ink)] outline-none"
            />

            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              onBlur={() => {
                if (description !== issue.description) set({ description });
              }}
              placeholder="Add description..."
              rows={6}
              className="mt-3 resize-none border-0 bg-transparent px-0 text-[14px] leading-relaxed text-[var(--lnr-ink-muted)] shadow-none focus-visible:ring-0"
            />

            <CommentThread issueId={issue.id} />
          </div>
        </div>

        {/* Property rail — stacked above the description below lg, docked from
            lg up. The grid keeps the stacked form from being eight tall rows. */}
        <aside className="order-first grid w-full shrink-0 grid-cols-1 gap-x-4 border-b border-[var(--lnr-border)] px-3 py-3 sm:grid-cols-2 lg:order-none lg:block lg:w-[268px] lg:overflow-y-auto lg:border-b-0 lg:border-l lg:py-4 lnr-scrollbar">
          <PropertyRow label="Status">
            <StatusPicker value={issue.status} onSelect={(status) => set({ status })}>
              <PropertyButton>
                <StatusIcon status={issue.status} />
                {statusLabel(issue.status)}
              </PropertyButton>
            </StatusPicker>
          </PropertyRow>

          <PropertyRow label="Priority">
            <PriorityPicker value={issue.priority} onSelect={(priority) => set({ priority })}>
              <PropertyButton>
                <PriorityIcon priority={issue.priority} />
                {priorityLabel(issue.priority)}
              </PropertyButton>
            </PriorityPicker>
          </PropertyRow>

          <PropertyRow label="Assignees">
            <AssigneePicker
              value={issue.assignees ?? []}
              onSelect={(assignees) => set({ assignees })}
            >
              <PropertyButton>
                {issue.assignees?.length ? (
                  <>
                    <span className="flex -space-x-1.5">
                      {issue.assignees.slice(0, 3).map((id) => (
                        <Avatar key={id} className="h-[18px] w-[18px] ring-2 ring-[var(--lnr-panel)]">
                          <AvatarImage src={peopleById[id]?.avatarUrl} alt="" />
                          <AvatarFallback className="bg-[var(--lnr-strong)] text-[8px] text-[var(--lnr-ink-muted)]">
                            {peopleById[id]?.initials || "?"}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </span>
                    <span className="truncate">
                      {issue.assignees.length === 1
                        ? peopleById[issue.assignees[0]]?.name || "Unknown"
                        : `${issue.assignees.length} assignees`}
                    </span>
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4 text-[var(--lnr-ink-tertiary)]" />
                    Unassigned
                  </>
                )}
              </PropertyButton>
            </AssigneePicker>
          </PropertyRow>

          <PropertyRow label="Labels">
            <LabelPicker value={issue.labels ?? []} onSelect={(labels) => set({ labels })}>
              <PropertyButton className="flex-wrap">
                {issue.labels?.length ? (
                  issue.labels.map((label) => (
                    <span
                      key={label}
                      className="flex items-center gap-1 rounded-full border border-[var(--lnr-border-strong)] px-1.5 py-[1px] text-[11px]"
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: labelColor(label) }}
                      />
                      {label}
                    </span>
                  ))
                ) : (
                  <>
                    <Tag className="h-4 w-4 text-[var(--lnr-ink-tertiary)]" />
                    Add label
                  </>
                )}
              </PropertyButton>
            </LabelPicker>
          </PropertyRow>

          <div className="col-span-full my-3 border-t border-[var(--lnr-border)]" />

          <PropertyRow label="Project">
            <ProjectPicker
              value={issue.objectiveId}
              onSelect={(objectiveId) => set({ objectiveId })}
            >
              <PropertyButton>
                <Box className="h-4 w-4 text-[var(--lnr-ink-tertiary)]" />
                <span className="truncate">{linkedProject?.title || "No project"}</span>
              </PropertyButton>
            </ProjectPicker>
          </PropertyRow>

          <PropertyRow label="Cycle">
            <CyclePicker value={issue.cycleId} onSelect={(cycleId) => set({ cycleId })}>
              <PropertyButton>
                <Repeat className="h-4 w-4 text-[var(--lnr-ink-tertiary)]" />
                <span className="truncate">{linkedCycle?.title || "No cycle"}</span>
              </PropertyButton>
            </CyclePicker>
          </PropertyRow>

          <PropertyRow label="Estimate">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <PropertyButton>
                  {issue.estimate ? `${issue.estimate} points` : "No estimate"}
                </PropertyButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="linear-scope w-40 border-[var(--lnr-border-strong)] bg-[var(--lnr-elevated)]"
              >
                {["", "1", "2", "3", "5", "8", "13"].map((value) => (
                  <DropdownMenuItem key={value || "none"} onSelect={() => set({ estimate: value })}>
                    {value ? `${value} points` : "No estimate"}
                    {issue.estimate === value ? <Check className="ml-auto h-3.5 w-3.5" /> : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </PropertyRow>

          <PropertyRow label="Due date">
            <label className="block">
              <span className="sr-only">Due date</span>
              <input
                type="date"
                value={issue.dueDate ?? ""}
                onChange={(event) => set({ dueDate: event.target.value || null })}
                className={cn(
                  "w-full rounded-[5px] bg-transparent px-1.5 py-1 text-[13px] outline-none hover:bg-[var(--lnr-hover)]",
                  isOverdue(issue)
                    ? "text-[var(--lnr-urgent)]"
                    : "text-[var(--lnr-ink-muted)]",
                )}
              />
            </label>
          </PropertyRow>

          <div className="col-span-full my-3 border-t border-[var(--lnr-border)]" />

          <div className="col-span-full space-y-1 px-1.5 text-[11px] text-[var(--lnr-ink-tertiary)]">
            <p>
              Created {formatShortDate(issue.createdAt)}
              {creator ? ` by ${creator.name}` : ""}
            </p>
            <p>Updated {formatRelative(issue.updatedAt)} ago</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
