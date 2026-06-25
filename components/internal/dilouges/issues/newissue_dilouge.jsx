"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Bug,
  CalendarClock,
  CalendarDays,
  CircleDot,
  ClipboardList,
  Cog,
  Gauge,
  Loader2,
  Pencil,
  Sparkles,
  Tag,
  Wrench,
  X,
} from "lucide-react";
import { severityIcons, statusIcons } from "@/components/ui/issue-item";
import {
  DEFAULT_ISSUE_PRIORITY,
  DEFAULT_ISSUE_STATUS,
  DEFAULT_ISSUE_TYPE,
  ISSUE_ESTIMATES,
  ISSUE_PRIORITIES,
  ISSUE_STATUSES,
  ISSUE_TYPES,
} from "@/features/issues/constants";

// Reuse the status glyphs the list/badges already use, plus lucide icons for
// the metadata-bag fields (type).
const TYPE_ICONS = {
  task: ClipboardList,
  bug: Bug,
  feature: Sparkles,
  improvement: Wrench,
  chore: Cog,
};

const EMPTY_FORM = {
  title: "",
  description: "",
  type: DEFAULT_ISSUE_TYPE,
  status: DEFAULT_ISSUE_STATUS,
  priority: DEFAULT_ISSUE_PRIORITY,
  estimate: "",
  startDate: "",
  dueDate: "",
  labels: [],
};

const buildFormFromIssue = (issue) => ({
  title: issue.title || "",
  description: issue.description || "",
  type: issue.type || DEFAULT_ISSUE_TYPE,
  status: issue.status || DEFAULT_ISSUE_STATUS,
  priority: issue.priority || DEFAULT_ISSUE_PRIORITY,
  estimate: issue.estimate ? String(issue.estimate) : "",
  startDate: issue.startDate || "",
  dueDate: issue.dueDate || "",
  labels: Array.isArray(issue.labels) ? issue.labels : [],
});

const fieldLabelClass =
  "text-xs font-medium uppercase tracking-wider text-text-secondary";
const controlClass =
  "bg-surface-card border-border text-foreground focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1";
const selectTriggerClass =
  "w-full bg-surface-card border-border text-foreground";

// Reusable create/edit dialog for issues.
//   - Uncontrolled (with a `children` trigger) for "Create New Issue".
//   - Controlled (`open` / `onOpenChange`, pass an `issue`) for editing.
// `onSubmit(payload)` should return false to keep the dialog open on failure.
export function IssueDialog({
  children,
  issue = null,
  open,
  onOpenChange,
  onSubmit,
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [labelDraft, setLabelDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const labelInputRef = useRef(null);

  const isControlled = typeof open === "boolean";
  const dialogOpen = isControlled ? open : internalOpen;
  const isEditing = Boolean(issue);

  const setDialogOpen = (next) => {
    if (!isControlled) {
      setInternalOpen(next);
    }
    if (onOpenChange) {
      onOpenChange(next);
    }
  };

  const setField = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));

  const addLabel = (raw) => {
    const value = raw.trim();
    if (!value) {
      return;
    }
    setForm((current) =>
      current.labels.includes(value)
        ? current
        : { ...current, labels: [...current.labels, value] },
    );
    setLabelDraft("");
  };

  const removeLabel = (label) =>
    setForm((current) => ({
      ...current,
      labels: current.labels.filter((existing) => existing !== label),
    }));

  useEffect(() => {
    if (dialogOpen && issue) {
      void Promise.resolve().then(() => {
        setForm(buildFormFromIssue(issue));
        setLabelDraft("");
      });
      return;
    }
    if (!dialogOpen) {
      void Promise.resolve().then(() => {
        setForm(EMPTY_FORM);
        setLabelDraft("");
      });
    }
  }, [dialogOpen, issue]);

  const title = useMemo(
    () => (isEditing ? "Edit Issue" : "Create New Issue"),
    [isEditing],
  );

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Fold in a half-typed label that wasn't committed with Enter.
      const pending = labelDraft.trim();
      const labels =
        pending && !form.labels.includes(pending)
          ? [...form.labels, pending]
          : form.labels;

      const payload = {
        title: form.title.trim(),
        description: form.description,
        type: form.type,
        status: form.status,
        priority: form.priority,
        estimate: form.estimate,
        startDate: form.startDate,
        dueDate: form.dueDate,
        labels,
      };

      const result = onSubmit ? await onSubmit(payload) : true;
      if (result === false) {
        return;
      }

      setForm(EMPTY_FORM);
      setDialogOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent className="sm:max-w-2xl max-h-[90vh] gap-0 overflow-hidden p-0 bg-background border-border text-foreground shadow-xl sm:rounded-xl">
        <DialogHeader className="space-y-0 border-b border-border bg-surface-subtle/50 p-4">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <Pencil className="h-4 w-4 text-muted-foreground" />
            ) : (
              <CircleDot className="h-4 w-4 text-primary" />
            )}
            <DialogTitle className="text-base font-medium text-foreground">
              {title}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="max-h-[64vh] space-y-5 overflow-y-auto p-5">
          {/* Title + Type */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_180px]">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="issue-title" className={fieldLabelClass}>
                Title *
              </Label>
              <Input
                id="issue-title"
                placeholder="e.g. Login fails on expired session"
                value={form.title}
                onChange={(e) => setField("title", e.target.value)}
                required
                className={controlClass}
              />
            </div>

            <div className="flex flex-col space-y-2">
              <Label className={fieldLabelClass}>Type</Label>
              <Select
                value={form.type}
                onValueChange={(value) => setField("type", value)}
              >
                <SelectTrigger className={selectTriggerClass}>
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
          </div>

          {/* Description */}
          <div className="flex flex-col space-y-2">
            <Label htmlFor="issue-description" className={fieldLabelClass}>
              Description
            </Label>
            <Textarea
              id="issue-description"
              placeholder="Add context, reproduction steps, expected vs actual, or impact…"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              rows={4}
              className={controlClass}
            />
          </div>

          {/* Properties */}
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
              Properties
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col space-y-2">
                <Label className={fieldLabelClass}>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) => setField("status", value)}
                >
                  <SelectTrigger className={selectTriggerClass}>
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

              <div className="flex flex-col space-y-2">
                <Label className={fieldLabelClass}>Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(value) => setField("priority", value)}
                >
                  <SelectTrigger className={selectTriggerClass}>
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

              <div className="flex flex-col space-y-2">
                <Label className={fieldLabelClass}>Estimate</Label>
                <Select
                  value={form.estimate || "none"}
                  onValueChange={(value) =>
                    setField("estimate", value === "none" ? "" : value)
                  }
                >
                  <SelectTrigger className={selectTriggerClass}>
                    <span className="flex items-center gap-2">
                      <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
                      <SelectValue />
                    </span>
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
            </div>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="issue-start-date" className={fieldLabelClass}>
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Start date
                </span>
              </Label>
              <Input
                id="issue-start-date"
                type="date"
                value={form.startDate}
                onChange={(e) => setField("startDate", e.target.value)}
                className={controlClass}
              />
            </div>

            <div className="flex flex-col space-y-2">
              <Label htmlFor="issue-due-date" className={fieldLabelClass}>
                <span className="flex items-center gap-1.5">
                  <CalendarClock className="h-3.5 w-3.5" />
                  Due date
                </span>
              </Label>
              <Input
                id="issue-due-date"
                type="date"
                value={form.dueDate}
                onChange={(e) => setField("dueDate", e.target.value)}
                className={controlClass}
              />
            </div>
          </div>

          {/* Labels */}
          <div className="flex flex-col space-y-2">
            <Label htmlFor="issue-labels" className={fieldLabelClass}>
              <span className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" />
                Labels
              </span>
            </Label>
            <div
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                  e.preventDefault();
                  labelInputRef.current?.focus();
                }
              }}
              className="flex min-h-[48px] cursor-text flex-wrap items-center gap-1.5 rounded-md border border-border bg-surface-card px-2.5 py-2 focus-within:ring-1 focus-within:ring-ring"
            >
              {form.labels.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 rounded bg-surface-hover px-2 py-1 text-xs text-foreground"
                >
                  {label}
                  <button
                    type="button"
                    onClick={() => removeLabel(label)}
                    className="text-text-secondary hover:text-red-400"
                    aria-label={`Remove ${label}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                ref={labelInputRef}
                id="issue-labels"
                value={labelDraft}
                onChange={(e) => setLabelDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addLabel(labelDraft);
                  } else if (
                    e.key === "Backspace" &&
                    !labelDraft &&
                    form.labels.length > 0
                  ) {
                    removeLabel(form.labels[form.labels.length - 1]);
                  }
                }}
                onBlur={() => addLabel(labelDraft)}
                placeholder={
                  form.labels.length ? "Add label…" : "Type a label and press Enter"
                }
                className="h-7 min-w-[140px] flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-text-tertiary"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-surface-subtle/50 p-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setDialogOpen(false)}
            className="text-muted-foreground hover:text-foreground hover:bg-surface-hover"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!form.title.trim() || loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                {isEditing ? "Saving" : "Creating"}
              </>
            ) : isEditing ? (
              "Save Changes"
            ) : (
              "Create Issue"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Backwards-compatible alias — the create-flow trigger wraps a child button and
// forwards the payload to `onCreate`.
export function NewIssueDialog({ children, onCreate }) {
  return <IssueDialog onSubmit={onCreate}>{children}</IssueDialog>;
}
