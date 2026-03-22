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
import { TaskPlanningTab } from "./tabs/task_planning_tab";
import { TaskCollaborationTab } from "./tabs/task_collaboration_tab";
import { TaskCloudAgentTab } from "./tabs/task_cloud_agent_tab";
import { Cloud } from "lucide-react";
import { cn } from "@/lib/utils";

const INITIAL_FORM_STATE = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  assignees: [],
  startDate: "",
  dueDate: "",
  stage: "backlog",
  labels: "",
  type: "task",
  parentLink: "",
  milestoneId: "",
  objectiveId: "",
  initiativeLink: "",
  dependencies: "",
  blockedBy: "",
  blocking: "",
  progress: 0,
  latestUpdate: "",
  comments: "",
  gitBranch: "",
  issues: "",
  reminderPreset: "1_day",
  project: "",
  workspace: "",
  roleVisibility: "team",
  taskCollection: "core",
  inboxMode: "assigned",
  isDraft: false,
  deadlineHealth: "on_track",
  timeBlock: "",
  pokeEnabled: false,
  assistPrompt: "",
  environmentVault: "",
  agentSession: "",
  agentEnabled: false,
  agentProvider: "codex",
  agentEnvironment: "standard",
  agentModel: "",
  agentSystemPrompt: "",
  agentAccessToken: "",
  agentProfiles: [],
  agentCustomProfiles: [],
  canBranch: true,
  canCommit: true,
  canPR: true,
  canTest: true,
  canReview: false,
  canMerge: false,
  canFork: false,
  canDeploy: false,
  agentRunning: false,
  agentSandbox: true,
  agentAutoPR: true,
  agentMaxDuration: "30",
  agentMaxCost: "5.00",
  agentMaxIterations: "10",
};

const toCsvString = (value) => {
  if (!Array.isArray(value)) {
    return "";
  }

  return value.join(", ");
};

const toLinesString = (value) => {
  if (!Array.isArray(value)) {
    return "";
  }

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

const parseLineList = (value) =>
  (value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const reminderLabelMap = {
  "1_day": "1 day before",
  "1_week": "1 week before",
  custom: "Custom reminder",
};

const buildFormDataFromTask = (task) => ({
  title: task.title || "",
  description: task.description || "",
  status: task.status || "todo",
  priority: task.priority || "medium",
  assignees: Array.isArray(task.assignees) ? task.assignees : [],
  startDate: task.startDate || "",
  dueDate: task.dueDate || "",
  stage: task.stage || "backlog",
  labels: toCsvString(task.labels),
  type: task.type || "task",
  parentLink: task.parentLink || "",
  milestoneId: task.milestoneId || "",
  objectiveId: task.objectiveId || "",
  initiativeLink: task.initiativeLink || "",
  dependencies: toCsvString(task.dependencies),
  blockedBy: toCsvString(task.blockedBy),
  blocking: toCsvString(task.blocking),
  progress: typeof task.progress === "number" ? task.progress : 0,
  latestUpdate: task.latestUpdate || "",
  comments: toLinesString(task.comments),
  gitBranch: task.gitBranch || "",
  issues: toCsvString(task.issues),
  reminderPreset: task.reminders?.[0] || "1_day",
  project: task.project || "",
  workspace: task.workspace || "",
  roleVisibility: task.roleVisibility || "team",
  taskCollection: task.taskCollection || "core",
  inboxMode: task.inbox?.mode || "assigned",
  isDraft: Boolean(task.inbox?.isDraft),
  deadlineHealth: task.deadlineTracking || "on_track",
  timeBlock: task.timeBlock || "",
  pokeEnabled: Boolean(task.inbox?.pokeEnabled),
  assistPrompt: task.assistPanel?.prompt || "",
  environmentVault: task.integrations?.environmentVault || "",
  agentSession: task.integrations?.agentSession || "",
  agentEnabled: Boolean(task.cloudAgent?.enabled),
  agentProvider: task.cloudAgent?.provider || "codex",
  agentEnvironment: task.cloudAgent?.environment || "standard",
  agentModel: task.cloudAgent?.model || "",
  agentSystemPrompt: task.cloudAgent?.systemPrompt || "",
  agentAccessToken: task.cloudAgent?.accessToken || "",
  agentProfiles: task.cloudAgent?.profiles || [],
  agentCustomProfiles: task.cloudAgent?.customProfiles || [],
  canBranch: task.cloudAgent?.capabilities?.canBranch ?? true,
  canCommit: task.cloudAgent?.capabilities?.canCommit ?? true,
  canPR: task.cloudAgent?.capabilities?.canPR ?? true,
  canTest: task.cloudAgent?.capabilities?.canTest ?? true,
  canReview: task.cloudAgent?.capabilities?.canReview ?? false,
  canMerge: task.cloudAgent?.capabilities?.canMerge ?? false,
  canFork: task.cloudAgent?.capabilities?.canFork ?? false,
  canDeploy: task.cloudAgent?.capabilities?.canDeploy ?? false,
  agentRunning: Boolean(task.cloudAgent?.running),
  agentSandbox: task.cloudAgent?.sandbox ?? true,
  agentAutoPR: task.cloudAgent?.autoPR ?? true,
  agentMaxDuration: task.cloudAgent?.limits?.maxDuration || "30",
  agentMaxCost: task.cloudAgent?.limits?.maxCost || "5.00",
  agentMaxIterations: task.cloudAgent?.limits?.maxIterations || "10",
});

export function AddTaskDialog({
  children,
  task = null,
  open,
  onOpenChange,
  onSave = () => {},
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("core");
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
      setActiveTab("core");
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
    const commentLines = parseLineList(formData.comments);

    const nextTask = {
      id: task?.id || `task_${Date.now()}`,
      title: formData.title.trim(),
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      assignees: formData.assignees,
      startDate: formData.startDate || null,
      dueDate: formData.dueDate || null,
      stage: formData.stage,
      labels: parseList(formData.labels),
      type: formData.type,
      parentLink: formData.parentLink || null,
      milestoneId: formData.milestoneId || null,
      objectiveId: formData.objectiveId || null,
      initiativeLink: formData.initiativeLink || null,
      dependencies: parseList(formData.dependencies),
      blockedBy: parseList(formData.blockedBy),
      blocking: parseList(formData.blocking),
      progress: formData.progress,
      latestUpdate: formData.latestUpdate,
      activityLog: [
        ...(Array.isArray(task?.activityLog) ? task.activityLog : []),
        {
          at: now,
          action: task ? "updated" : "created",
          message: task
            ? "Task configuration updated via dialog"
            : "Task created via dialog",
        },
      ],
      comments: commentLines.map((entry, index) => ({
        id: `comment_${index}_${Date.now()}`,
        author: "You",
        text: entry,
        createdAt: now,
      })),
      gitBranch: formData.gitBranch || null,
      issues: parseList(formData.issues),
      reminders: [formData.reminderPreset],
      project: formData.project || null,
      workspace: formData.workspace || null,
      roleVisibility: formData.roleVisibility,
      taskCollection: formData.taskCollection,
      inbox: {
        mode: formData.inboxMode,
        isDraft: formData.isDraft,
        pokeEnabled: formData.pokeEnabled,
      },
      deadlineTracking: formData.deadlineHealth,
      timeBlock: formData.timeBlock || null,
      integrations: {
        environmentVault: formData.environmentVault || null,
        agentSession: formData.agentSession || null,
      },
      assistPanel: {
        prompt: formData.assistPrompt,
        hint: "What is blocking this task?",
      },
      cloudAgent: {
        enabled: formData.agentEnabled,
        provider: formData.agentProvider,
        environment: formData.agentEnvironment,
        model: formData.agentModel || null,
        systemPrompt: formData.agentSystemPrompt || null,
        running: formData.agentRunning,
        sandbox: formData.agentSandbox,
        autoPR: formData.agentAutoPR,
        accessToken: formData.agentAccessToken || null,
        profiles: formData.agentProfiles || [],
        customProfiles: formData.agentCustomProfiles || [],
        capabilities: {
          canBranch: formData.canBranch,
          canCommit: formData.canCommit,
          canPR: formData.canPR,
          canTest: formData.canTest,
          canReview: formData.canReview,
          canMerge: formData.canMerge,
          canFork: formData.canFork,
          canDeploy: formData.canDeploy,
        },
        limits: {
          maxDuration: formData.agentMaxDuration || "30",
          maxCost: formData.agentMaxCost || "5.00",
          maxIterations: formData.agentMaxIterations || "10",
        },
      },
      reminderLabel: reminderLabelMap[formData.reminderPreset] || "Custom reminder",
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
            Configure core attributes, planning flow, and collaboration details for this task.
          </DialogDescription>
        </DialogHeader>

        <div className="flex border-b border-zinc-800 bg-[#1e1e1e]">
          {[{ id: "core", label: "Core" }, { id: "planning", label: "Flow & Time" }, { id: "collab", label: "Collaboration" }, { id: "agent", label: "Cloud Agent", icon: Cloud }].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-1.5",
                activeTab === tab.id
                  ? "border-zinc-100 text-zinc-100 bg-zinc-800/30"
                  : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/20",
              )}
            >
              {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="px-8 py-4 bg-[#1e1e1e]">
          {activeTab === "core" && (
            <TaskCoreTab
              formData={formData}
              handleInputChange={handleInputChange}
              handleToggleAssignee={handleToggleAssignee}
            />
          )}

          {activeTab === "planning" && (
            <TaskPlanningTab
              formData={formData}
              handleInputChange={handleInputChange}
            />
          )}

          {activeTab === "collab" && (
            <TaskCollaborationTab
              formData={formData}
              handleInputChange={handleInputChange}
            />
          )}

          {activeTab === "agent" && (
            <TaskCloudAgentTab
              formData={formData}
              handleInputChange={handleInputChange}
            />
          )}
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
