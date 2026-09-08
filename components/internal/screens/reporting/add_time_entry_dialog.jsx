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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@geiger/ui";
import { Switch } from "@geiger/ui";
import { Textarea } from "@geiger/ui";
import { Field } from "@/components/internal/shared/screen_kit";
import { statusLabels } from "@/features/tasks/constants";

function todayIso() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;

  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export function AddTimeEntryDialog({
  open,
  onOpenChange,
  tasks = [],
  defaultOwner = "",
  onSave = () => {},
}) {
  const [title, setTitle] = useState("");
  const [taskId, setTaskId] = useState("none");
  const [workedOn, setWorkedOn] = useState(todayIso);
  const [hours, setHours] = useState("1");
  const [minutes, setMinutes] = useState("0");
  const [billable, setBillable] = useState(true);
  const [notes, setNotes] = useState("");

  const submit = () => {
    if (!title.trim()) {
      return;
    }

    onSave({
      title: title.trim(),
      taskId: taskId === "none" ? null : taskId,
      workedOn,
      minutes: (Number(hours) || 0) * 60 + (Number(minutes) || 0),
      billable,
      notes: notes.trim(),
      owner: defaultOwner,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Log time</DialogTitle>
          <DialogDescription>
            Record effort against the project so timesheets and workload stay honest.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <Field label="What did you work on?" htmlFor="time-title">
            <Input
              id="time-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Time entry description"
              className="h-9 border-border bg-surface-subtle text-sm text-foreground"
            />
          </Field>

          {tasks.length > 0 ? (
            <Field label="Task">
              <Select value={taskId} onValueChange={setTaskId}>
                <SelectTrigger className="h-9 w-full border-border bg-surface-subtle text-sm text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border bg-surface-subtle text-foreground">
                  <SelectItem value="none" className="focus:bg-surface-hover">
                    No linked task
                  </SelectItem>
                  {tasks.map((task) => (
                    <SelectItem key={task.id} value={task.id} className="focus:bg-surface-hover">
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          ) : null}

          <div className="grid grid-cols-3 gap-4">
            <Field label="Date" htmlFor="time-date">
              <Input
                id="time-date"
                type="date"
                value={workedOn}
                onChange={(event) => setWorkedOn(event.target.value)}
                className="h-9 border-border bg-surface-subtle text-sm text-foreground"
              />
            </Field>
            <Field label="Hours" htmlFor="time-hours">
              <Input
                id="time-hours"
                type="number"
                min="0"
                value={hours}
                onChange={(event) => setHours(event.target.value)}
                className="h-9 border-border bg-surface-subtle text-sm text-foreground"
              />
            </Field>
            <Field label="Minutes" htmlFor="time-minutes">
              <Input
                id="time-minutes"
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(event) => setMinutes(event.target.value)}
                className="h-9 border-border bg-surface-subtle text-sm text-foreground"
              />
            </Field>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-surface-subtle px-3 py-2.5">
            <span className="text-xs font-medium text-muted-foreground">Billable</span>
            <Switch
              checked={billable}
              onCheckedChange={setBillable}
              className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-surface-strong"
            >
              <Switch.Thumb className="data-[state=checked]:bg-background data-[state=unchecked]:bg-muted-foreground" />
            </Switch>
          </div>

          <Field label="Notes" htmlFor="time-notes">
            <Textarea
              id="time-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional context for the timesheet..."
              className="min-h-16 border-border bg-surface-subtle text-sm text-foreground"
            />
          </Field>

          {tasks.length > 0 && taskId !== "none" ? (
            <p className="text-xs text-text-secondary">
              Linked task status:{" "}
              <span className="font-medium text-foreground">
                {statusLabels[tasks.find((task) => task.id === taskId)?.status] || "—"}
              </span>
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={!title.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Log time
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
