"use client";

import React from "react";
import { Input } from "@geiger/ui";
import { Label } from "@geiger/ui";
import { Switch } from "@geiger/ui";
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
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">Start Date</Label>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(event) => handleInputChange("startDate", event.target.value)}
            className="bg-surface-card border-border text-foreground h-9 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">Target / Due Date</Label>
          <Input
            type="date"
            value={formData.dueDate}
            onChange={(event) => handleInputChange("dueDate", event.target.value)}
            className="bg-surface-card border-border text-foreground h-9 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">Milestone Link</Label>
          <Input
            value={formData.milestoneId}
            onChange={(event) => handleInputChange("milestoneId", event.target.value)}
            placeholder="milestone:mvp-stability"
            className="bg-surface-card border-border text-foreground h-9 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">Objective Link</Label>
          <Input
            value={formData.objectiveId}
            onChange={(event) => handleInputChange("objectiveId", event.target.value)}
            placeholder="objective:reduce-cycle-time"
            className="bg-surface-card border-border text-foreground h-9 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">Initiative Link</Label>
          <Input
            value={formData.initiativeLink}
            onChange={(event) => handleInputChange("initiativeLink", event.target.value)}
            placeholder="initiative:q3-platform"
            className="bg-surface-card border-border text-foreground h-9 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">Time Blocking</Label>
          <Input
            value={formData.timeBlock}
            onChange={(event) => handleInputChange("timeBlock", event.target.value)}
            placeholder="Blocked 3pm-5pm weekdays"
            className="bg-surface-card border-border text-foreground h-9 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">Deadline Tracking</Label>
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
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">Reminders</Label>
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
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1.5 md:col-span-2">
          <Label className="text-sm font-medium text-foreground">Dependencies (comma separated)</Label>
          <Input
            value={formData.dependencies}
            onChange={(event) => handleInputChange("dependencies", event.target.value)}
            placeholder="task_102, issue_44"
            className="bg-surface-card border-border text-foreground h-9 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">Task Collection</Label>
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
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">Blocked By</Label>
          <Input
            value={formData.blockedBy}
            onChange={(event) => handleInputChange("blockedBy", event.target.value)}
            placeholder="api-review"
            className="bg-surface-card border-border text-foreground h-9 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">Blocking</Label>
          <Input
            value={formData.blocking}
            onChange={(event) => handleInputChange("blocking", event.target.value)}
            placeholder="feature-rollout"
            className="bg-surface-card border-border text-foreground h-9 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">Inbox Channel</Label>
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
        </div>

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
