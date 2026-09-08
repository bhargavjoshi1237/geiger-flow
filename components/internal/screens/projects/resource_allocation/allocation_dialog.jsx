"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@geiger/ui";
import { Button } from "@geiger/ui";
import { Input } from "@geiger/ui";
import { Textarea } from "@geiger/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@geiger/ui";
import { Edit3, Plus } from "lucide-react";
import { Field } from "@/components/internal/shared/screen_kit";
import { ALLOCATION_STATUSES } from "@/features/resources/constants";

const INITIAL_FORM_STATE = {
  member: "",
  role: "",
  allocation: "50",
  status: "active",
  startsOn: "",
  endsOn: "",
  notes: "",
};

function buildFormDataFromAllocation(allocation) {
  return {
    member: allocation.member || "",
    role: allocation.role || "",
    allocation: String(allocation.allocation ?? 50),
    status: allocation.status || "active",
    startsOn: allocation.startsOn || "",
    endsOn: allocation.endsOn || "",
    notes: allocation.notes || "",
  };
}

export function AllocationDialog({ allocation = null, open, onOpenChange, onSave = () => {} }) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && allocation) {
      void Promise.resolve().then(() => setFormData(buildFormDataFromAllocation(allocation)));
      return;
    }

    if (!open) {
      void Promise.resolve().then(() => setFormData(INITIAL_FORM_STATE));
    }
  }, [open, allocation]);

  const dialogTitle = useMemo(
    () => (allocation ? "Edit Allocation" : "New Allocation"),
    [allocation],
  );

  const handleInputChange = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      await onSave({
        member: formData.member.trim(),
        role: formData.role.trim(),
        allocation: Number(formData.allocation) || 0,
        status: formData.status,
        startsOn: formData.startsOn,
        endsOn: formData.endsOn,
        notes: formData.notes.trim(),
      });
    } finally {
      setSaving(false);
    }
  };

  const percent = Math.min(100, Math.max(0, Number(formData.allocation) || 0));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[88vh] overflow-y-auto bg-surface-dialog border-border text-foreground p-0 gap-0 sm:rounded-lg shadow-xl">
        <DialogHeader className="p-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-base font-medium text-foreground">
            {allocation ? (
              <Edit3 className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Plus className="h-4 w-4 text-muted-foreground" />
            )}
            {dialogTitle}
          </DialogTitle>
          <DialogDescription className="text-xs text-text-secondary">
            Assign a team member to project work and set their capacity.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 px-6 py-5 bg-surface-dialog sm:grid-cols-2">
            <Field label="Member" htmlFor="allocation-member" className="sm:col-span-2">
              <Input
                id="allocation-member"
                required
                placeholder="Full name"
                value={formData.member}
                onChange={(event) => handleInputChange("member", event.target.value)}
                className="h-9 border-border bg-surface-card text-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
              />
            </Field>

            <Field label="Role" htmlFor="allocation-role">
              <Input
                id="allocation-role"
                placeholder="e.g. Backend Engineer"
                value={formData.role}
                onChange={(event) => handleInputChange("role", event.target.value)}
                className="h-9 border-border bg-surface-card text-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
              />
            </Field>

            <Field label="Status" htmlFor="allocation-status">
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger
                  id="allocation-status"
                  className="h-9 w-full border-border bg-surface-card text-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-surface-subtle text-foreground">
                  {ALLOCATION_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label={`Allocation (${percent}%)`} htmlFor="allocation-percent">
              <Input
                id="allocation-percent"
                type="number"
                min={0}
                max={100}
                required
                value={formData.allocation}
                onChange={(event) => handleInputChange("allocation", event.target.value)}
                className="h-9 border-border bg-surface-card text-foreground tabular-nums focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
              />
            </Field>

            <Field label="Starts on" htmlFor="allocation-starts-on">
              <Input
                id="allocation-starts-on"
                type="date"
                value={formData.startsOn}
                onChange={(event) => handleInputChange("startsOn", event.target.value)}
                className="h-9 border-border bg-surface-card text-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
              />
            </Field>

            <Field label="Ends on" htmlFor="allocation-ends-on">
              <Input
                id="allocation-ends-on"
                type="date"
                value={formData.endsOn}
                onChange={(event) => handleInputChange("endsOn", event.target.value)}
                className="h-9 border-border bg-surface-card text-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
              />
            </Field>

            <Field label="Notes" htmlFor="allocation-notes" className="sm:col-span-2">
              <Textarea
                id="allocation-notes"
                rows={3}
                placeholder="Anything worth remembering about this allocation"
                value={formData.notes}
                onChange={(event) => handleInputChange("notes", event.target.value)}
                className="border-border bg-surface-card text-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
              />
            </Field>
          </div>

          <DialogFooter className="gap-2 border-t border-border bg-surface-dialog p-4 sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={saving}
              className="text-muted-foreground hover:bg-surface-card hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.member.trim() || saving}
              className="min-w-[120px] bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {saving ? "Saving..." : allocation ? "Save Changes" : "Create Allocation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
