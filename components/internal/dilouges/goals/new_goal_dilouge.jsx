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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X, Target, Pencil } from "lucide-react";
import {
  GOAL_STATUSES,
  PROGRESS_SOURCE_OPTIONS,
  TRACK_METRIC_OPTIONS,
  TARGET_OPTIONS,
} from "@/features/goals/constants";

const INITIAL_FORM = {
  title: "",
  description: "",
  status: "not_started",
  owner: "You",
  progress: 0,
  targetDate: "",
  progressSource: "tasks_lists",
  trackMetric: "tasks_count",
  target: "dynamic",
  targetValue: "",
  keyResults: [{ label: "", progress: 0, done: false }],
};

export function NewGoalDialog({
  children,
  onCreate,
  editGoal,
  onEdit,
  open,
  onOpenChange,
  statusOptions = GOAL_STATUSES,
}) {
  const isEditMode = !!editGoal;
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  useEffect(() => {
    if (editGoal && isOpen) {
      void Promise.resolve().then(() =>
        setFormData({
          title: editGoal.title || "",
          description: editGoal.description || "",
          status: editGoal.status || "not_started",
          owner: editGoal.owner || "You",
          progress: editGoal.progress || 0,
          targetDate: editGoal.targetDate || "",
          progressSource: editGoal.progressSource || "tasks_lists",
          trackMetric: editGoal.trackMetric || "tasks_count",
          target: editGoal.target || "dynamic",
          targetValue: editGoal.targetValue || "",
          keyResults:
            editGoal.keyResults && editGoal.keyResults.length > 0
              ? editGoal.keyResults.map((kr) => ({ ...kr }))
              : [{ label: "", progress: 0, done: false }],
        })
      );
    } else if (!isOpen) {
      void Promise.resolve().then(() => setFormData(INITIAL_FORM));
    }
  }, [editGoal, isOpen]);

  const set = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleKeyResultChange = (index, value) => {
    setFormData((prev) => {
      const krs = [...prev.keyResults];
      krs[index] = { ...krs[index], label: value };
      return { ...prev, keyResults: krs };
    });
  };

  const handleKeyResultProgress = (index, value) => {
    setFormData((prev) => {
      const krs = [...prev.keyResults];
      const numVal = Math.min(100, Math.max(0, Number(value) || 0));
      krs[index] = { ...krs[index], progress: numVal, done: numVal >= 100 };
      return { ...prev, keyResults: krs };
    });
  };

  const addKeyResult = () => {
    setFormData((prev) => ({
      ...prev,
      keyResults: [...prev.keyResults, { label: "", progress: 0, done: false }],
    }));
  };

  const removeKeyResult = (index) => {
    setFormData((prev) => ({
      ...prev,
      keyResults: prev.keyResults.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const filteredKR = formData.keyResults.filter(
      (kr) => kr.label.trim() !== ""
    );

    if (isEditMode) {
      const updated = {
        ...editGoal,
        ...formData,
        keyResults: filteredKR,
      };
      if (onEdit) {
        await onEdit(updated);
      }
    } else {
      const toSave = {
        id: `g_${Date.now()}`,
        ...formData,
        keyResults: filteredKR,
      };
      if (onCreate) {
        await onCreate(toSave);
      }
    }

    setLoading(false);
    setIsOpen(false);
    setFormData(INITIAL_FORM);
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
              <Target className="w-5 h-5 text-blue-500" />
            )}
            {isEditMode ? "Edit Goal" : "New Goal"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {isEditMode
              ? "Update the goal details and key results."
              : "Define a measurable goal with key results for your project."}
          </DialogDescription>
        </DialogHeader>

        <form
          id="goal-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-6"
        >
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              General Information
            </h4>
            <div className="grid grid-cols-[1fr_160px] gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="goal-title" className="text-xs text-foreground">
                  Goal Title *
                </Label>
                <Input
                  id="goal-title"
                  placeholder="e.g., Improve onboarding conversion rate"
                  value={formData.title}
                  onChange={(e) => set("title", e.target.value)}
                  className="bg-surface-card border-border focus-visible:ring-1 focus-visible:ring-ring text-foreground placeholder:text-text-tertiary h-10 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-foreground">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => set("status", v)}
                >
                  <SelectTrigger className="bg-surface-card border-border text-foreground h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-dialog border-border">
                    {statusOptions.map((s) => (
                      <SelectItem
                        key={s.value}
                        value={s.value}
                        className="text-sm cursor-pointer"
                      >
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-foreground">Description</Label>
              <Textarea
                placeholder="Describe what this goal aims to achieve..."
                value={formData.description}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
                className="bg-surface-card border-border text-foreground placeholder:text-text-tertiary text-sm resize-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="goal-target-date" className="text-xs text-foreground">
                Target Date
              </Label>
              <Input
                id="goal-target-date"
                type="date"
                value={formData.targetDate}
                onChange={(e) => set("targetDate", e.target.value)}
                className="bg-surface-card border-border focus-visible:ring-1 focus-visible:ring-ring text-foreground h-10 text-sm"
              />
            </div>
          </div>

          <Separator className="bg-surface-hover" />

          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Ownership & Progress
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-foreground">Progress Source</Label>
                <Select
                  value={formData.progressSource}
                  onValueChange={(v) => set("progressSource", v)}
                >
                  <SelectTrigger className="bg-surface-card border-border text-foreground h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-dialog border-border">
                    {PROGRESS_SOURCE_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        textValue={option.label}
                        className="text-sm cursor-pointer"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-foreground">Track Metric</Label>
                <Select
                  value={formData.trackMetric}
                  onValueChange={(v) => set("trackMetric", v)}
                >
                  <SelectTrigger className="bg-surface-card border-border text-foreground h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-dialog border-border">
                    {TRACK_METRIC_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        textValue={option.label}
                        className="text-sm cursor-pointer"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-foreground">Target</Label>
                <Select
                  value={formData.target}
                  onValueChange={(v) => set("target", v)}
                >
                  <SelectTrigger className="bg-surface-card border-border text-foreground h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-dialog border-border">
                    {TARGET_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        textValue={option.label}
                        className="text-sm cursor-pointer"
                      >
                        <span className="font-medium">{option.label}</span>
                        <span className="block text-[11px] text-text-secondary">
                          {option.description}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.target === "static" && (
              <div className="space-y-1.5">
                <Label htmlFor="goal-target-value" className="text-xs text-foreground">
                  Static Target Value
                </Label>
                <Input
                  id="goal-target-value"
                  type="number"
                  min={0}
                  value={formData.targetValue}
                  onChange={(e) => set("targetValue", e.target.value)}
                  placeholder="Enter the fixed goal value"
                  className="bg-surface-card border-border focus-visible:ring-1 focus-visible:ring-ring text-foreground placeholder:text-text-tertiary h-10 text-sm"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="goal-owner" className="text-xs text-foreground">Owner</Label>
                <Input
                  id="goal-owner"
                  value={formData.owner}
                  onChange={(e) => set("owner", e.target.value)}
                  placeholder="e.g., You"
                  className="bg-surface-card border-border focus-visible:ring-1 focus-visible:ring-ring text-foreground placeholder:text-text-tertiary h-10 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="goal-progress" className="text-xs text-foreground">
                  Progress (%)
                </Label>
                <Input
                  id="goal-progress"
                  type="number"
                  min={0}
                  max={100}
                  value={formData.progress}
                  onChange={(e) =>
                    set(
                      "progress",
                      Math.min(100, Math.max(0, Number(e.target.value) || 0))
                    )
                  }
                  className="bg-surface-card border-border focus-visible:ring-1 focus-visible:ring-ring text-foreground h-10 text-sm"
                />
              </div>
            </div>
          </div>

          <Separator className="bg-surface-hover" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Key Results
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addKeyResult}
                className="text-muted-foreground hover:text-foreground hover:bg-surface-card h-7 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-2.5">
              {formData.keyResults.map((kr, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border border-border-strong flex items-center justify-center text-[10px] text-text-secondary shrink-0">
                    {idx + 1}
                  </div>
                  <Input
                    value={kr.label}
                    onChange={(e) => handleKeyResultChange(idx, e.target.value)}
                    placeholder="Enter a measurable key result..."
                    className="bg-surface-card border-border focus-visible:ring-1 focus-visible:ring-ring text-foreground placeholder:text-text-tertiary h-9 text-sm flex-1"
                  />
                  {isEditMode && (
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={kr.progress}
                      onChange={(e) =>
                        handleKeyResultProgress(idx, e.target.value)
                      }
                      className="bg-surface-card border-border focus-visible:ring-1 focus-visible:ring-ring text-foreground h-9 text-sm w-16 text-center shrink-0"
                    />
                  )}
                  {formData.keyResults.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeKeyResult(idx)}
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
            form="goal-form"
            disabled={!isValid || loading}
            className="bg-primary text-primary-foreground hover:bg-primary min-w-[120px]"
          >
            {loading
              ? isEditMode
                ? "Saving..."
                : "Creating..."
              : isEditMode
              ? "Save Changes"
              : "Create Goal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
