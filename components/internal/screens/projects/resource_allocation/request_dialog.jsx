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
import { Plus, UserPlus } from "lucide-react";
import { Field } from "@/components/internal/shared/screen_kit";

const INITIAL_FORM_STATE = {
  requester: "",
  request: "",
  target: "",
  requestedOn: "",
};

function buildFormDataFromRequest(request) {
  return {
    requester: request.requester || "",
    request: request.request || "",
    target: request.target || "",
    requestedOn: request.requestedOn || "",
  };
}

export function RequestDialog({ request = null, open, onOpenChange, onSave = () => {} }) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && request) {
      void Promise.resolve().then(() => setFormData(buildFormDataFromRequest(request)));
      return;
    }

    if (!open) {
      void Promise.resolve().then(() => setFormData(INITIAL_FORM_STATE));
    }
  }, [open, request]);

  const dialogTitle = useMemo(
    () => (request ? "Edit Request" : "New Resource Request"),
    [request],
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
        requester: formData.requester.trim(),
        request: formData.request.trim(),
        target: formData.target.trim(),
        requestedOn: formData.requestedOn,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[88vh] overflow-y-auto bg-surface-dialog border-border text-foreground p-0 gap-0 sm:rounded-lg shadow-xl">
        <DialogHeader className="p-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-base font-medium text-foreground">
            {request ? (
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Plus className="h-4 w-4 text-muted-foreground" />
            )}
            {dialogTitle}
          </DialogTitle>
          <DialogDescription className="text-xs text-text-secondary">
            Ask for extra capacity — requests land in the queue until approved or denied.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 px-6 py-5 bg-surface-dialog sm:grid-cols-2">
            <Field label="Requester" htmlFor="request-requester" className="sm:col-span-2">
              <Input
                id="request-requester"
                required
                placeholder="Who is asking"
                value={formData.requester}
                onChange={(event) => handleInputChange("requester", event.target.value)}
                className="h-9 border-border bg-surface-card text-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
              />
            </Field>

            <Field label="Request" htmlFor="request-body" className="sm:col-span-2">
              <Textarea
                id="request-body"
                required
                rows={3}
                placeholder="What do you need?"
                value={formData.request}
                onChange={(event) => handleInputChange("request", event.target.value)}
                className="border-border bg-surface-card text-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
              />
            </Field>

            <Field label="Target" htmlFor="request-target">
              <Input
                id="request-target"
                placeholder="e.g. Designer, QA tooling"
                value={formData.target}
                onChange={(event) => handleInputChange("target", event.target.value)}
                className="h-9 border-border bg-surface-card text-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
              />
            </Field>

            <Field label="Requested on" htmlFor="request-requested-on">
              <Input
                id="request-requested-on"
                type="date"
                value={formData.requestedOn}
                onChange={(event) => handleInputChange("requestedOn", event.target.value)}
                className="h-9 border-border bg-surface-card text-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
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
              disabled={!formData.requester.trim() || !formData.request.trim() || saving}
              className="min-w-[120px] bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {saving ? "Saving..." : request ? "Save Changes" : "Create Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
