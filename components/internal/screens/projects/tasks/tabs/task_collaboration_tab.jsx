"use client";

import React from "react";
import { Input } from "@geiger/ui";
import { Label } from "@geiger/ui";
import { Textarea } from "@geiger/ui";
import { Switch } from "@geiger/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@geiger/ui";

const ROLE_VISIBILITY = [
  { value: "team", label: "Team" },
  { value: "pm_tl", label: "PM + TL" },
  { value: "dev_only", label: "Developers" },
  { value: "private", label: "Private" },
];

export function TaskCollaborationTab({ formData, handleInputChange }) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-foreground">Latest Update</Label>
        <Textarea
          value={formData.latestUpdate}
          onChange={(event) => handleInputChange("latestUpdate", event.target.value)}
          placeholder="Summarize latest status for async updates."
          className="bg-surface-card border-border text-foreground min-h-[70px] resize-none text-sm focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-foreground">Comments Seed (one per line)</Label>
        <Textarea
          value={formData.comments}
          onChange={(event) => handleInputChange("comments", event.target.value)}
          placeholder="Waiting on API contract\nNeed review from design"
          className="bg-surface-card border-border text-foreground min-h-[84px] resize-none text-sm focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">Git Branch Link</Label>
          <Input
            value={formData.gitBranch}
            onChange={(event) => handleInputChange("gitBranch", event.target.value)}
            placeholder="feature/task-dependency-graph"
            className="bg-surface-card border-border text-foreground h-9 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">Commit / PR Links</Label>
          <Input
            value={formData.issues}
            onChange={(event) => handleInputChange("issues", event.target.value)}
            placeholder="PR-428, commit:17ea2b"
            className="bg-surface-card border-border text-foreground h-9 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">Environment Vault</Label>
          <Input
            value={formData.environmentVault}
            onChange={(event) => handleInputChange("environmentVault", event.target.value)}
            placeholder="vault:production-secrets"
            className="bg-surface-card border-border text-foreground h-9 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">Agent Session</Label>
          <Input
            value={formData.agentSession}
            onChange={(event) => handleInputChange("agentSession", event.target.value)}
            placeholder="copilot-session-22"
            className="bg-surface-card border-border text-foreground h-9 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">Project</Label>
          <Input
            value={formData.project}
            onChange={(event) => handleInputChange("project", event.target.value)}
            placeholder="geiger-flow"
            className="bg-surface-card border-border text-foreground h-9 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">Workspace</Label>
          <Input
            value={formData.workspace}
            onChange={(event) => handleInputChange("workspace", event.target.value)}
            placeholder="product-engineering"
            className="bg-surface-card border-border text-foreground h-9 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">Role Visibility</Label>
          <Select
            value={formData.roleVisibility}
            onValueChange={(value) => handleInputChange("roleVisibility", value)}
          >
            <SelectTrigger className="w-full bg-surface-card border-border text-foreground h-9 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-surface-subtle border-border text-foreground">
              {ROLE_VISIBILITY.map((option) => (
                <SelectItem key={option.value} value={option.value} className="focus:bg-surface-hover">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">Assist Panel Prompt</Label>
          <Input
            value={formData.assistPrompt}
            onChange={(event) => handleInputChange("assistPrompt", event.target.value)}
            placeholder="What is blocking this task?"
            className="bg-surface-card border-border text-foreground h-9 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1"
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface-card">
        <div>
          <p className="text-sm font-medium text-foreground">Allow Poke</p>
          <p className="text-xs text-text-secondary">Enable quick nudge reminders for assignees</p>
        </div>
        <Switch
          checked={formData.pokeEnabled}
          onCheckedChange={(checked) => handleInputChange("pokeEnabled", checked)}
        />
      </div>
    </div>
  );
}
