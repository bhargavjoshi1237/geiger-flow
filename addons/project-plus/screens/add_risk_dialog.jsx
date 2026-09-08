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
import { RISK_IMPACTS, RISK_IMPACT_META, RISK_STATUSES, RISK_STATUS_META } from "@/features/risks/constants";

const PROBABILITY_OPTIONS = [10, 20, 30, 40, 50, 60, 70, 80, 90];

function buildFormState(risk) {
  return {
    title: risk?.title || "",
    description: risk?.description || "",
    owner: risk?.owner || "",
    status: risk?.status || "open",
    impact: risk?.impact || "medium",
    probability: risk?.probability ?? 50,
    mitigation: risk?.mitigation || "",
    reviewDate: risk?.reviewDate || "",
  };
}

export function AddRiskDialog({ open, onOpenChange, risk = null, onSave = () => {} }) {
  const [form, setForm] = useState(() => buildFormState(risk));

  const setField = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = () => {
    if (!form.title.trim()) {
      return;
    }

    onSave({
      ...form,
      probability: Number(form.probability) || 0,
      reviewDate: form.reviewDate || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-surface-card text-foreground sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{risk ? "Edit risk" : "Add risk"}</DialogTitle>
          <DialogDescription>
            Quantify the exposure so mitigation owners and reviews stay accountable.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <Label className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground">Risk</span>
            <Input
              value={form.title}
              onChange={(event) => setField("title")(event.target.value)}
              placeholder="What could go wrong?"
              className="h-9 border-border bg-surface-subtle text-sm text-foreground"
            />
          </Label>

          <Label className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground">Context</span>
            <Textarea
              value={form.description}
              onChange={(event) => setField("description")(event.target.value)}
              placeholder="Scope, vendor, delivery or security context..."
              className="min-h-16 border-border bg-surface-subtle text-sm text-foreground"
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
                  {RISK_STATUSES.map((status) => (
                    <SelectItem key={status} value={status} className="focus:bg-surface-hover">
                      {RISK_STATUS_META[status].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Label>

            <Label className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">Impact</span>
              <Select value={form.impact} onValueChange={setField("impact")}>
                <SelectTrigger className="h-9 w-full border-border bg-surface-subtle text-sm text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-surface-subtle text-foreground">
                  {RISK_IMPACTS.map((impact) => (
                    <SelectItem key={impact} value={impact} className="focus:bg-surface-hover">
                      {RISK_IMPACT_META[impact].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Label>

            <Label className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">Probability</span>
              <Select
                value={String(form.probability)}
                onValueChange={(value) => setField("probability")(Number(value))}
              >
                <SelectTrigger className="h-9 w-full border-border bg-surface-subtle text-sm text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-surface-subtle text-foreground">
                  {PROBABILITY_OPTIONS.map((option) => (
                    <SelectItem key={option} value={String(option)} className="focus:bg-surface-hover">
                      {option}%
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
                placeholder="Who mitigates it?"
                className="h-9 border-border bg-surface-subtle text-sm text-foreground"
              />
            </Label>
          </div>

          <Label className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground">Mitigation</span>
            <Textarea
              value={form.mitigation}
              onChange={(event) => setField("mitigation")(event.target.value)}
              placeholder="How is this being contained?"
              className="min-h-16 border-border bg-surface-subtle text-sm text-foreground"
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

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={!form.title.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary"
          >
            {risk ? "Save changes" : "Add risk"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
