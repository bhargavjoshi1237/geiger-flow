"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@geiger/ui";
import { Input } from "@geiger/ui";
import { Button } from "@geiger/ui";
import { Label } from "@geiger/ui";
import { Textarea } from "@geiger/ui";
import { Separator } from "@geiger/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@geiger/ui";
import { Plus, X, Flag, Pencil } from "lucide-react";
import { MILESTONE_TASK_STATUSES } from "@/features/milestones/constants";

function newTaskId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `mt_${Math.round(performance.now())}_${Math.floor(Math.random() * 1e6)}`;
}

function emptyTask() {
  return { id: newTaskId(), title: "", status: "todo", assignee: "" };
}

const INITIAL_FORM = {
  title: "",
  description: "",
  owner: "You",
  targetDate: "",
  tasks: [emptyTask()],
};

export function NewMilestoneDialog({
  children,
  onCreate,
  editMilestone,
  onEdit,
  open,
  onOpenChange,
}) {
  const isEditMode = !!editMilestone;
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  useEffect(() => {
    if (editMilestone && isOpen) {
      void Promise.resolve().then(() =>
        setFormData({
          title: editMilestone.title || "",
          description: editMilestone.description || "",
          owner: editMilestone.owner || "You",
          targetDate: editMilestone.targetDate || "",
          tasks:
            editMilestone.tasks && editMilestone.tasks.length > 0
              ? editMilestone.tasks.map((t) => ({ ...t }))
              : [emptyTask()],
        })
      );
    } else if (!isOpen) {
      void Promise.resolve().then(() => setFormData({ ...INITIAL_FORM, tasks: [emptyTask()] }));
    }
  }, [editMilestone, isOpen]);

  const set = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const setTask = (index, patch) => {
    setFormData((prev) => {
      const tasks = [...prev.tasks];
      tasks[index] = { ...tasks[index], ...patch };
      return { ...prev, tasks };
    });
  };

  const addTask = () =>
    setFormData((prev) => ({ ...prev, tasks: [...prev.tasks, emptyTask()] }));

  const removeTask = (index) =>
    setFormData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index),
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const filteredTasks = formData.tasks
      .filter((t) => t.title.trim() !== "")
      .map((t) => ({ ...t, title: t.title.trim(), assignee: t.assignee.trim() }));

    const payload = { ...formData, tasks: filteredTasks };

    if (isEditMode) {
      if (onEdit) {
        await onEdit({ ...editMilestone, ...payload });
      }
    } else if (onCreate) {
      await onCreate(payload);
    }

    setLoading(false);
    setIsOpen(false);
    setFormData({ ...INITIAL_FORM, tasks: [emptyTask()] });
  };

  const isValid = formData.title.trim() !== "";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col bg-background border-border text-foreground p-0 shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-xl flex items-center gap-2 font-semibold">
            {isEditMode ? (
              <Pencil className="w-5 h-5 text-blue-500" />
            ) : (
              <Flag className="w-5 h-5 text-blue-500" />
            )}
            {isEditMode ? "Edit Milestone" : "New Milestone"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {isEditMode
              ? "Update the milestone details and its task collection."
              : "Group a set of delivery tasks into a milestone and track its health."}
          </DialogDescription>
        </DialogHeader>

        <form
          id="milestone-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-6"
        >
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              General Information
            </h4>
            <div className="space-y-1.5">
              <Label htmlFor="ms-title" className="text-xs text-foreground">
                Milestone Title *
              </Label>
              <Input
                id="ms-title"
                placeholder="e.g., Public Beta Launch"
                value={formData.title}
                onChange={(e) => set("title", e.target.value)}
                className="bg-surface-card border-border focus-visible:ring-1 focus-visible:ring-ring text-foreground placeholder:text-text-tertiary h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-foreground">Description</Label>
              <Textarea
                placeholder="Describe what this milestone delivers..."
                value={formData.description}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
                className="bg-surface-card border-border text-foreground placeholder:text-text-tertiary text-sm resize-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="ms-owner" className="text-xs text-foreground">
                  Owner
                </Label>
                <Input
                  id="ms-owner"
                  value={formData.owner}
                  onChange={(e) => set("owner", e.target.value)}
                  placeholder="e.g., You"
                  className="bg-surface-card border-border focus-visible:ring-1 focus-visible:ring-ring text-foreground placeholder:text-text-tertiary h-10 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ms-target" className="text-xs text-foreground">
                  Target Date
                </Label>
                <Input
                  id="ms-target"
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => set("targetDate", e.target.value)}
                  className="bg-surface-card border-border focus-visible:ring-1 focus-visible:ring-ring text-foreground h-10 text-sm"
                />
              </div>
            </div>
          </div>

          <Separator className="bg-surface-hover" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Tasks
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addTask}
                className="text-muted-foreground hover:text-foreground hover:bg-surface-card h-7 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-2.5">
              {formData.tasks.map((task, idx) => (
                <div key={task.id} className="flex items-center gap-2">
                  <Input
                    value={task.title}
                    onChange={(e) => setTask(idx, { title: e.target.value })}
                    placeholder="Task name..."
                    className="bg-surface-card border-border focus-visible:ring-1 focus-visible:ring-ring text-foreground placeholder:text-text-tertiary h-9 text-sm flex-1"
                  />
                  <Input
                    value={task.assignee}
                    onChange={(e) => setTask(idx, { assignee: e.target.value })}
                    placeholder="Assignee"
                    className="bg-surface-card border-border focus-visible:ring-1 focus-visible:ring-ring text-foreground placeholder:text-text-tertiary h-9 text-sm w-28 shrink-0"
                  />
                  <Select
                    value={task.status}
                    onValueChange={(v) => setTask(idx, { status: v })}
                  >
                    <SelectTrigger className="bg-surface-card border-border text-foreground h-9 text-sm w-32 shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-surface-dialog border-border">
                      {MILESTONE_TASK_STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value} className="text-sm cursor-pointer">
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.tasks.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTask(idx)}
                      className="w-8 h-8 text-text-tertiary hover:text-red-400 hover:bg-surface-card shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </form>

        <DialogFooter className="px-6 py-4 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-foreground hover:bg-surface-card"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="milestone-form"
            disabled={!isValid || loading}
            className="bg-primary text-primary-foreground hover:bg-primary min-w-[120px]"
          >
            {loading
              ? isEditMode
                ? "Saving..."
                : "Creating..."
              : isEditMode
              ? "Save Changes"
              : "Create Milestone"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
