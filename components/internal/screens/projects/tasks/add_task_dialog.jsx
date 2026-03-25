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
});

export function AddTaskDialog({
  children,
  task = null,
  open,
  onOpenChange,
  onSave = () => {},
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
      setFormData(buildFormDataFromTask(task));
      return;
    }

    if (!dialogOpen) {
      setFormData(INITIAL_FORM_STATE);
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
      <DialogContent className="sm:max-w-3xl max-h-[88vh] overflow-y-auto bg-[#1e1e1e] border-zinc-800 text-zinc-100 p-0 gap-0 sm:rounded-lg shadow-xl">
        <DialogHeader className="p-4 border-b border-zinc-800 ">
          <DialogTitle className="text-base font-medium text-zinc-100 flex items-center gap-2">
            {task ? <Edit3 className="w-4 h-4 text-zinc-400" /> : <Plus className="w-4 h-4 text-zinc-400" />}
            {dialogTitle}
          </DialogTitle>
          <DialogDescription className="text-zinc-500 text-xs">
            Configure core attributes for this task.
          </DialogDescription>
        </DialogHeader>

        <div className="px-8 py-4 bg-[#1e1e1e]">
          <TaskCoreTab
            formData={formData}
            handleInputChange={handleInputChange}
            handleToggleAssignee={handleToggleAssignee}
          />
        </div>

        <DialogFooter className="p-4 border-t border-zinc-800 bg-[#1e1e1e] gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => setDialogOpen(false)}
            className="border-zinc-700 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="bg-zinc-100 text-black hover:bg-zinc-300 min-w-[120px]"
            disabled={!formData.title.trim() || saving}
          >
            {saving ? "Saving..." : task ? "Save Changes" : "Create Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
