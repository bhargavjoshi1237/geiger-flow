"use client";

import React, { useState } from "react";
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
import { Label } from "@geiger/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@geiger/ui";
import { Textarea } from "@geiger/ui";
import {
  DECISION_REVERSIBILITY_META,
  DECISION_STATUSES,
  DECISION_STATUS_META,
} from "@/features/decisions/constants";

function buildFormState(decision) {
  return {
    title: decision?.title || "",
    rationale: decision?.rationale || "",
    status: decision?.status || "proposed",
    owner: decision?.owner || "",
    reversibility: decision?.reversibility || "reversible",
    reviewDate: decision?.reviewDate || "",
  };
}

export function AddDecisionDialog({ open, onOpenChange, decision = null, onSave = () => {} }) {
  const [form, setForm] = useState(() => buildFormState(decision));

  const setField = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = () => {
    if (!form.title.trim()) {
      return;
    }

    onSave({
      ...form,
      reviewDate: form.reviewDate || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-surface-card text-foreground sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{decision ? "Edit decision" : "Log decision"}</DialogTitle>
          <DialogDescription>
            Keep the context attached to the project so future teams know why this was decided.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <Label className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground">Decision</span>
            <Input
              value={form.title}
              onChange={(event) => setField("title")(event.target.value)}
              placeholder="What was decided?"
              className="h-9 border-border bg-surface-subtle text-sm text-foreground"
            />
          </Label>

          <Label className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground">Driver / context</span>
            <Textarea
              value={form.rationale}
              onChange={(event) => setField("rationale")(event.target.value)}
              placeholder="Why it mattered and what alternatives were considered..."
              className="min-h-20 border-border bg-surface-subtle text-sm text-foreground"
            />
          </Label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Label className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">Status</span>
              <Select value={form.status} onValueChange={setField("status")}>
                <SelectTrigger className="h-9 w-full border-border bg-surface-subtle text-sm text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-surface-subtle text-foreground">
                  {DECISION_STATUSES.map((status) => (
                    <SelectItem key={status} value={status} className="focus:bg-surface-hover">
                      {DECISION_STATUS_META[status].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Label>

            <Label className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">Reversibility</span>
              <Select value={form.reversibility} onValueChange={setField("reversibility")}>
                <SelectTrigger className="h-9 w-full border-border bg-surface-subtle text-sm text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-surface-subtle text-foreground">
                  {Object.entries(DECISION_REVERSIBILITY_META).map(([value, meta]) => (
                    <SelectItem key={value} value={value} className="focus:bg-surface-hover">
                      {meta.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Label>

            <Label className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">Owner</span>
              <Input
                value={form.owner}
                onChange={(event) => setField("owner")(event.target.value)}
                placeholder="Who owns the consequences?"
                className="h-9 border-border bg-surface-subtle text-sm text-foreground"
              />
            </Label>

            <Label className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">Review date</span>
              <Input
                type="date"
                value={form.reviewDate}
                onChange={(event) => setField("reviewDate")(event.target.value)}
                className="h-9 border-border bg-surface-subtle text-sm text-foreground"
              />
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={!form.title.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary"
          >
            {decision ? "Save changes" : "Log decision"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
