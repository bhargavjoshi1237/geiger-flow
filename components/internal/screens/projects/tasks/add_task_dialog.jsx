"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Edit3 } from "lucide-react";
import { TaskCoreTab } from "./tabs/task_core_tab";
import { cn } from "@/lib/utils";

const INITIAL_FORM_STATE = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  assignees: [],
  stage: "backlog",
  labels: "",
  type: "task",
  progress: 0,
  parentLink: "none",
};

const toCsvString = (value) => {
  if (!Array.isArray(value)) return "";
  return value.join(", ");
};

const toLinesString = (value) => {
  if (!Array.isArray(value)) return "";
  return value
    .map((entry) => entry?.text || "")
    .filter(Boolean)
    .join("\n");
};

const parseList = (value) =>
  (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const buildFormDataFromTask = (task) => ({
  title: task.title || "",
  description: task.description || "",
  status: task.status || "todo",
  priority: task.priority || "medium",
  assignees: Array.isArray(task.assignees) ? task.assignees : [],
  stage: task.stage || "backlog",
  labels: toCsvString(task.labels),
  type: task.type || "task",
  progress: typeof task.progress === "number" ? task.progress : 0,
  parentLink: task.parentLink || "none",
});

export function AddTaskDialog({
  children,
  task = null,
  open,
  onOpenChange,
  onSave = () => {},
  goalOptions = [],
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [saving, setSaving] = useState(false);

  const isControlled = typeof open === "boolean";
  const dialogOpen = isControlled ? open : internalOpen;

  const setDialogOpen = (nextOpen) => {
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }

    if (onOpenChange) {
      onOpenChange(nextOpen);
    }
  };

  useEffect(() => {
    if (dialogOpen && task) {
      void Promise.resolve().then(() =>
        setFormData(buildFormDataFromTask(task)),
      );
      return;
    }

    if (!dialogOpen) {
      void Promise.resolve().then(() => setFormData(INITIAL_FORM_STATE));
    }
  }, [dialogOpen, task]);

  const dialogTitle = useMemo(
    () => (task ? "Update Task" : "Create New Task"),
    [task],
  );

  const handleInputChange = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleToggleAssignee = (memberId) => {
    setFormData((previous) => ({
      ...previous,
      assignees: previous.assignees.includes(memberId)
        ? previous.assignees.filter((assignee) => assignee !== memberId)
        : [...previous.assignees, memberId],
    }));
  };

  const handleSubmit = async () => {
    setSaving(true);

    const now = new Date().toISOString();

    const nextTask = {
      id: task?.id || `task_${Date.now()}`,
      title: formData.title.trim(),
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      assignees: formData.assignees,
      stage: formData.stage,
      labels: parseList(formData.labels),
      type: formData.type,
      progress: formData.progress,
      parentLink: formData.parentLink === "none" ? "" : formData.parentLink,
      activityLog: [
        ...(Array.isArray(task?.activityLog) ? task.activityLog : []),
        {
          at: now,
          action: task ? "updated" : "created",
          message: task ? "Task updated" : "Task created",
        },
      ],
      createdAt: task?.createdAt || now,
      updatedAt: now,
    };

    await onSave(nextTask);
    setSaving(false);
    setDialogOpen(false);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {children ? <DialogTrigger asChild>{children}</DialogTrigger> : null}
      <DialogContent className="sm:max-w-3xl max-h-[88vh] overflow-y-auto bg-surface-dialog border-border text-foreground p-0 gap-0 sm:rounded-lg shadow-xl">
        <DialogHeader className="p-4 border-b border-border ">
          <DialogTitle className="text-base font-medium text-foreground flex items-center gap-2">
            {task ? <Edit3 className="w-4 h-4 text-muted-foreground" /> : <Plus className="w-4 h-4 text-muted-foreground" />}
            {dialogTitle}
          </DialogTitle>
          <DialogDescription className="text-text-secondary text-xs">
            Configure core attributes for this task.
          </DialogDescription>
        </DialogHeader>

        <div className="px-8 py-4 bg-surface-dialog">
          <TaskCoreTab
            formData={formData}
            handleInputChange={handleInputChange}
            handleToggleAssignee={handleToggleAssignee}
            goalOptions={goalOptions}
          />
        </div>

        <DialogFooter className="p-4 border-t border-border bg-surface-dialog gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => setDialogOpen(false)}
            className="border-border-strong text-foreground hover:text-foreground hover:bg-surface-card"
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="bg-primary text-primary-foreground hover:bg-primary/90 min-w-[120px]"
            disabled={!formData.title.trim() || saving}
          >
            {saving ? "Saving..." : task ? "Save Changes" : "Create Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
