"use client";

import React, { useState, useEffect, useRef } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, X, Target, Pencil, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { OBJECTIVE_STATUSES } from "@/features/objectives/constants";

const KEY_RESULT_SUGGESTIONS = [];

const INITIAL_FORM = {
  title: "",
  description: "",
  status: "not_started",
  owner: "You",
  startDate: "",
  targetDate: "",
  keyResults: [{ label: "", progress: 0, done: false }],
};

function SearchableKeyResultSelect({ value, onChange, selectedLabels }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef(null);

  const filtered = KEY_RESULT_SUGGESTIONS.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) => item.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <div className="relative flex-1">
      <Popover open={open} onOpenChange={(v) => {
        setOpen(v);
        if (!v) setSearch("");
      }}>
        <PopoverTrigger asChild>
          <div
            className={cn(
              "flex items-center h-9 w-full rounded-md border bg-surface-card text-sm cursor-text",
              "border-border focus-within:ring-1 focus-within:ring-ring",
              value ? "text-foreground" : "text-text-tertiary"
            )}
            onClick={() => inputRef.current?.focus()}
          >
            <Input
              ref={inputRef}
              value={open ? search : value}
              onChange={(e) => {
                if (!open) setOpen(true);
                setSearch(e.target.value);
                onChange(e.target.value);
              }}
              onFocus={() => {
                if (!open) setOpen(true);
              }}
              placeholder="Search or type a key result..."
              className="border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-full px-3 text-foreground placeholder:text-text-tertiary text-sm p-0"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="bg-surface-dialog border-border text-foreground p-0 w-[--radix-popover-trigger-width] rounded-lg shadow-xl"
          align="start"
          sideOffset={4}
        >
          <div className="px-3 py-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search suggestions..."
                className="!pl-7 !pr-3 !py-1 !h-8 bg-surface-card border-border text-xs text-foreground placeholder:text-text-tertiary focus-visible:ring-1 focus-visible:ring-ring"
                autoFocus
              />
            </div>
          </div>
          <ScrollArea className="max-h-[260px]">
            <div className="py-1">
              {filtered.length === 0 && (
                <div className="px-3 py-6 text-center text-xs text-text-secondary">
                  No suggestions found. Type your own key result above.
                </div>
              )}
              {filtered.map((cat) => (
                <div key={cat.category}>
                  <div className="px-3 pt-2 pb-1">
                    <span className="text-[10px] uppercase tracking-wider text-text-tertiary font-medium">
                      {cat.category}
                    </span>
                  </div>
                  {cat.items.map((item) => {
                    const isSelected = selectedLabels.some(
                      (l) => l.toLowerCase() === item.toLowerCase()
                    );
                    return (
                      <Button
                        key={item}
                        type="button"
                        disabled={isSelected}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs rounded-sm flex items-center gap-2 transition-colors",
                          isSelected
                            ? "text-text-secondary cursor-not-allowed"
                            : "text-foreground hover:bg-surface-active hover:text-foreground cursor-pointer"
                        )}
                        onClick={() => {
                          onChange(item);
                          setSearch("");
                          setOpen(false);
                        }}
                      >
                        {isSelected ? (
                          <Check className="w-3 h-3 text-blue-400 shrink-0" />
                        ) : (
                          <span className="w-3 h-3 shrink-0" />
                        )}
                        <span className="truncate">{item}</span>
                      </Button>
                    );
                  })}
                </div>
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function NewObjectiveDialog({
  children,
  onCreate,
  editObjective,
  onEdit,
  open,
  onOpenChange,
}) {
  const isEditMode = !!editObjective;
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  useEffect(() => {
    if (editObjective && isOpen) {
      void Promise.resolve().then(() =>
        setFormData({
          title: editObjective.title || "",
          description: editObjective.description || "",
          status: editObjective.status || "not_started",
          owner: editObjective.owner || "You",
          startDate: editObjective.startDate || "",
          targetDate: editObjective.targetDate || "",
          keyResults:
            editObjective.keyResults && editObjective.keyResults.length > 0
              ? editObjective.keyResults.map((kr) => ({ ...kr }))
              : [{ label: "", progress: 0, done: false }],
        })
      );
    } else if (!isOpen) {
      void Promise.resolve().then(() => setFormData(INITIAL_FORM));
    }
  }, [editObjective, isOpen]);

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
        ...editObjective,
        ...formData,
        keyResults: filteredKR,
      };
      if (onEdit) {
        await onEdit(updated);
      }
    } else {
      const toSave = {
        id: `obj_${Date.now()}`,
        ...formData,
        keyResults: filteredKR,
        progress: 0,
        goals: [],
      };
      if (onCreate) {
        await onCreate(toSave);
      }
    }

    setLoading(false);
    setIsOpen(false);
    setFormData(INITIAL_FORM);
  };

  const isValid =
    formData.title.trim() !== "" &&
    formData.startDate !== "" &&
    formData.targetDate !== "";

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
            {isEditMode ? "Edit Objective" : "New Objective"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {isEditMode
              ? "Update the objective details and key results."
              : "Define a measurable objective with key results for your project."}
          </DialogDescription>
        </DialogHeader>

        <form
          id="objective-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-6"
        >
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              General Information
            </h4>
            <div className="grid grid-cols-[1fr_160px] gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="obj-title" className="text-xs text-foreground">
                  Objective Title *
                </Label>
                <Input
                  id="obj-title"
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
                    {OBJECTIVE_STATUSES.map((s) => (
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
                placeholder="Describe what this objective aims to achieve..."
                value={formData.description}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
                className="bg-surface-card border-border text-foreground placeholder:text-text-tertiary text-sm resize-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>

          <Separator className="bg-surface-hover" />

          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Timeline & Ownership
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="obj-start" className="text-xs text-foreground">
                  Start Date *
                </Label>
                <Input
                  id="obj-start"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => set("startDate", e.target.value)}
                  className="bg-surface-card border-border focus-visible:ring-1 focus-visible:ring-ring text-foreground h-10 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="obj-target" className="text-xs text-foreground">
                  Target Date *
                </Label>
                <Input
                  id="obj-target"
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => set("targetDate", e.target.value)}
                  className="bg-surface-card border-border focus-visible:ring-1 focus-visible:ring-ring text-foreground h-10 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="obj-owner" className="text-xs text-foreground">Owner</Label>
              <Input
                id="obj-owner"
                value={formData.owner}
                onChange={(e) => set("owner", e.target.value)}
                placeholder="e.g., You"
                className="bg-surface-card border-border focus-visible:ring-1 focus-visible:ring-ring text-foreground placeholder:text-text-tertiary h-10 text-sm"
              />
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
            <p className="text-[11px] text-text-tertiary -mt-2">
              Search from suggestions or type your own measurable key result.
            </p>
            <div className="space-y-2.5">
              {formData.keyResults.map((kr, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border border-border-strong flex items-center justify-center text-[10px] text-text-secondary shrink-0">
                    {idx + 1}
                  </div>
                  <SearchableKeyResultSelect
                    value={kr.label}
                    onChange={(val) => handleKeyResultChange(idx, val)}
                    selectedLabels={formData.keyResults.map((k) => k.label)}
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
            form="objective-form"
            disabled={!isValid || loading}
            className="bg-primary text-primary-foreground hover:bg-primary min-w-[120px]"
          >
            {loading
              ? isEditMode
                ? "Saving..."
                : "Creating..."
              : isEditMode
              ? "Save Changes"
              : "Create Objective"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
