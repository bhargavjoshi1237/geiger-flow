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
import { Textarea } from "@geiger/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@geiger/ui";
import { CalendarDays, Pencil, Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { Field } from "@/components/internal/shared/screen_kit";
import {
  PROJECTION_KINDS,
  PROJECTION_VISIBILITIES,
  DEFAULT_PROJECTION_KIND,
  DEFAULT_PROJECTION_VISIBILITY,
  toDayKey,
} from "@/features/projections/constants";

const INITIAL_FORM = {
  title: "",
  description: "",
  kind: DEFAULT_PROJECTION_KIND,
  startsOn: toDayKey(),
  endsOn: "",
  visibility: DEFAULT_PROJECTION_VISIBILITY,
  owner: "You",
};

export function NewProjectionDialog({
  children,
  onCreate,
  editProjection,
  onEdit,
  onDelete,
  onToggleArchive,
  open,
  onOpenChange,
  initialDate,
}) {
  const isEditMode = !!editProjection;
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [internalOpen, setInternalOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  useEffect(() => {
    if (isEditMode && isOpen) {
      void Promise.resolve().then(() =>
        setFormData({
          title: editProjection.title || "",
          description: editProjection.description || "",
          kind: editProjection.kind || DEFAULT_PROJECTION_KIND,
          startsOn: editProjection.startsOn || toDayKey(),
          endsOn: editProjection.endsOn || "",
          visibility: editProjection.visibility || DEFAULT_PROJECTION_VISIBILITY,
          owner: editProjection.owner || "You",
        })
      );
    } else if (isOpen) {
      void Promise.resolve().then(() => {
        setConfirmingDelete(false);
        setFormData({
          ...INITIAL_FORM,
          startsOn: initialDate || toDayKey(),
        });
      });
    }
  }, [isEditMode, editProjection, initialDate, isOpen]);

  const set = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleClose = () => {
    setIsOpen(false);
    setConfirmingDelete(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEditMode) {
      if (onEdit) {
        await onEdit({ ...editProjection, ...formData });
      }
    } else if (onCreate) {
      await onCreate(formData);
    }

    handleClose();
  };

  const isValid =
    formData.title.trim() !== "" && formData.startsOn.trim() !== "";

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col bg-background border-border text-foreground p-0 shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <DialogTitle className="text-xl flex items-center gap-2 font-semibold">
            {isEditMode ? (
              <Pencil className="w-5 h-5 text-blue-500" />
            ) : (
              <CalendarDays className="w-5 h-5 text-blue-500" />
            )}
            {isEditMode ? "Edit Event" : "New Event"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            {isEditMode
              ? "Update this projection's details, span and visibility."
              : "Place a milestone, release, review or deadline on the calendar."}
          </DialogDescription>
        </DialogHeader>

        <form
          id="projection-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
        >
          <Field label="Title *" htmlFor="pr-title">
            <Input
              id="pr-title"
              placeholder="e.g., Public Beta Release"
              value={formData.title}
              onChange={(e) => set("title", e.target.value)}
              className="bg-surface-card border-border focus-visible:ring-1 focus-visible:ring-ring text-foreground placeholder:text-text-tertiary h-10 text-sm"
            />
          </Field>

          <Field label="Description" htmlFor="pr-description">
            <Textarea
              id="pr-description"
              placeholder="What does this event mark?"
              value={formData.description}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
              className="bg-surface-card border-border text-foreground placeholder:text-text-tertiary text-sm resize-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Kind">
              <Select
                value={formData.kind}
                onValueChange={(value) => set("kind", value)}
              >
                <SelectTrigger className="bg-surface-card border-border text-foreground h-10 text-sm w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface-dialog border-border">
                  {PROJECTION_KINDS.map((kind) => (
                    <SelectItem
                      key={kind.value}
                      value={kind.value}
                      className="text-sm cursor-pointer"
                    >
                      {kind.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Visibility">
              <Select
                value={formData.visibility}
                onValueChange={(value) => set("visibility", value)}
              >
                <SelectTrigger className="bg-surface-card border-border text-foreground h-10 text-sm w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface-dialog border-border">
                  {PROJECTION_VISIBILITIES.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-sm cursor-pointer"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Date *" htmlFor="pr-start">
              <Input
                id="pr-start"
                type="date"
                value={formData.startsOn}
                onChange={(e) => set("startsOn", e.target.value)}
                className="bg-surface-card border-border focus-visible:ring-1 focus-visible:ring-ring text-foreground h-10 text-sm"
              />
            </Field>
            <Field label="End Date" htmlFor="pr-end">
              <Input
                id="pr-end"
                type="date"
                min={formData.startsOn || undefined}
                value={formData.endsOn}
                onChange={(e) => set("endsOn", e.target.value)}
                className="bg-surface-card border-border focus-visible:ring-1 focus-visible:ring-ring text-foreground h-10 text-sm"
              />
            </Field>
          </div>

          <Field label="Owner" htmlFor="pr-owner">
            <Input
              id="pr-owner"
              value={formData.owner}
              onChange={(e) => set("owner", e.target.value)}
              placeholder="e.g., You"
              className="bg-surface-card border-border focus-visible:ring-1 focus-visible:ring-ring text-foreground placeholder:text-text-tertiary h-10 text-sm"
            />
          </Field>
        </form>

        <DialogFooter className="px-6 py-4 border-t border-border gap-2">
          {isEditMode ? (
            <>
              {confirmingDelete ? (
                <>
                  <span className="text-xs text-muted-foreground mr-auto self-center">
                    Delete this event?
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setConfirmingDelete(false)}
                    className="text-muted-foreground hover:text-foreground hover:bg-surface-card"
                  >
                    Keep
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onDelete?.(editProjection.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    Confirm delete
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onToggleArchive?.(editProjection)}
                    className="mr-auto text-text-secondary hover:text-foreground hover:bg-surface-card gap-1.5"
                  >
                    {editProjection.archivedAt ? (
                      <>
                        <ArchiveRestore className="w-3.5 h-3.5" />
                        Restore
                      </>
                    ) : (
                      <>
                        <Archive className="w-3.5 h-3.5" />
                        Archive
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setConfirmingDelete(true)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-1.5 mr-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleClose}
                    className="text-muted-foreground hover:text-foreground hover:bg-surface-card"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    form="projection-form"
                    disabled={!isValid}
                    className="bg-primary text-primary-foreground hover:bg-primary min-w-[100px]"
                  >
                    Save Changes
                  </Button>
                </>
              )}
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground hover:bg-surface-card"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="projection-form"
                disabled={!isValid}
                className="bg-primary text-primary-foreground hover:bg-primary min-w-[120px]"
              >
                Create Event
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
