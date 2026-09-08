"use client";

import React from "react";
import { Input } from "@geiger/ui";
import { Switch } from "@geiger/ui";
import { Field } from "@/components/internal/shared/screen_kit";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@geiger/ui";

const DEADLINE_HEALTH = [
  { value: "on_track", label: "On Track" },
  { value: "at_risk", label: "At Risk" },
  { value: "overdue", label: "Overdue" },
];

const REMINDERS = [
  { value: "1_day", label: "1 day before" },
  { value: "1_week", label: "1 week before" },
  { value: "custom", label: "Custom" },
];

const COLLECTIONS = [
  { value: "core", label: "Core" },
  { value: "release", label: "Release" },
  { value: "maintenance", label: "Maintenance" },
  { value: "research", label: "Research" },
];

const INBOX_MODES = [
  { value: "assigned", label: "Assigned" },
  { value: "mentions", label: "Mentions" },
  { value: "reminders", label: "Reminders" },
  { value: "updates", label: "Updates" },
];

export function TaskPlanningTab({ formData, handleInputChange }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Start Date" htmlFor="task-start-date">
          <Input
            id="task-start-date"
            type="date"
            value={formData.startDate}
            onChange={(event) => handleInputChange("startDate", event.target.value)}
            className="bg-surface-card border-border text-foreground h-9 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1"
          />
        </Field>

        <Field label="Target / Due Date" htmlFor="task-due-date">
          <Input
            id="task-due-date"
            type="date"
            value={formData.dueDate}
            onChange={(event) => handleInputChange("dueDate", event.target.value)}
            className="bg-surface-card border-border text-foreground h-9 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Milestone Link" htmlFor="task-milestone">
          <Input
            id="task-milestone"
            value={formData.milestoneId}
            onChange={(event) => handleInputChange("milestoneId", event.target.value)}
            placeholder="milestone:mvp-stability"
            className="bg-surface-card border-border text-foreground h-9 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1"
          />
        </Field>

        <Field label="Objective Link" htmlFor="task-objective">
          <Input
            id="task-objective"
            value={formData.objectiveId}
            onChange={(event) => handleInputChange("objectiveId", event.target.value)}
            placeholder="objective:reduce-cycle-time"
            className="bg-surface-card border-border text-foreground h-9 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Initiative Link" htmlFor="task-initiative">
          <Input
            id="task-initiative"
            value={formData.initiativeLink}
            onChange={(event) => handleInputChange("initiativeLink", event.target.value)}
            placeholder="initiative:q3-platform"
            className="bg-surface-card border-border text-foreground h-9 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1"
          />
        </Field>

        <Field label="Time Blocking" htmlFor="task-time-block">
          <Input
            id="task-time-block"
            value={formData.timeBlock}
            onChange={(event) => handleInputChange("timeBlock", event.target.value)}
            placeholder="Blocked 3pm-5pm weekdays"
            className="bg-surface-card border-border text-foreground h-9 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Deadline Tracking">
          <Select
            value={formData.deadlineHealth}
            onValueChange={(value) => handleInputChange("deadlineHealth", value)}
          >
            <SelectTrigger className="w-full bg-surface-card border-border text-foreground h-9 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-surface-subtle border-border text-foreground">
              {DEADLINE_HEALTH.map((option) => (
                <SelectItem key={option.value} value={option.value} className="focus:bg-surface-hover">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Reminders">
          <Select
            value={formData.reminderPreset}
            onValueChange={(value) => handleInputChange("reminderPreset", value)}
          >
            <SelectTrigger className="w-full bg-surface-card border-border text-foreground h-9 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-surface-subtle border-border text-foreground">
              {REMINDERS.map((option) => (
                <SelectItem key={option.value} value={option.value} className="focus:bg-surface-hover">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <Field label="Dependencies (comma separated)" htmlFor="task-dependencies">
            <Input
              id="task-dependencies"
              value={formData.dependencies}
              onChange={(event) => handleInputChange("dependencies", event.target.value)}
              placeholder="task_102, issue_44"
              className="bg-surface-card border-border text-foreground h-9 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1"
            />
          </Field>
        </div>
        <Field label="Task Collection">
          <Select
            value={formData.taskCollection}
            onValueChange={(value) => handleInputChange("taskCollection", value)}
          >
            <SelectTrigger className="w-full bg-surface-card border-border text-foreground h-9 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-surface-subtle border-border text-foreground">
              {COLLECTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className="focus:bg-surface-hover">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Blocked By" htmlFor="task-blocked-by">
          <Input
            id="task-blocked-by"
            value={formData.blockedBy}
            onChange={(event) => handleInputChange("blockedBy", event.target.value)}
            placeholder="api-review"
            className="bg-surface-card border-border text-foreground h-9 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1"
          />
        </Field>

        <Field label="Blocking" htmlFor="task-blocking">
          <Input
            id="task-blocking"
            value={formData.blocking}
            onChange={(event) => handleInputChange("blocking", event.target.value)}
            placeholder="feature-rollout"
            className="bg-surface-card border-border text-foreground h-9 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Inbox Channel">
          <Select
            value={formData.inboxMode}
            onValueChange={(value) => handleInputChange("inboxMode", value)}
          >
            <SelectTrigger className="w-full bg-surface-card border-border text-foreground h-9 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-surface-subtle border-border text-foreground">
              {INBOX_MODES.map((option) => (
                <SelectItem key={option.value} value={option.value} className="focus:bg-surface-hover">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface-card mt-6 md:mt-0">
          <div>
            <p className="text-sm font-medium text-foreground">Draft Mode</p>
            <p className="text-xs text-text-secondary">Keep task in inbox until ready</p>
          </div>
          <Switch
            checked={formData.isDraft}
            onCheckedChange={(checked) => handleInputChange("isDraft", checked)}
          />
        </div>
      </div>
    </div>
  );
}
