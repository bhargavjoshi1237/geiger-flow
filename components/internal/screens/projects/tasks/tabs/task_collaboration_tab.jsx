"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
        <Label className="text-sm font-medium text-zinc-300">Latest Update</Label>
        <Textarea
          value={formData.latestUpdate}
          onChange={(event) => handleInputChange("latestUpdate", event.target.value)}
          placeholder="Summarize latest status for async updates."
          className="bg-[#202020] border-[#333333] text-white min-h-[70px] resize-none text-sm focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-zinc-300">Comments Seed (one per line)</Label>
        <Textarea
          value={formData.comments}
          onChange={(event) => handleInputChange("comments", event.target.value)}
          placeholder="Waiting on API contract\nNeed review from design"
          className="bg-[#202020] border-[#333333] text-white min-h-[84px] resize-none text-sm focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-zinc-300">Git Branch Link</Label>
          <Input
            value={formData.gitBranch}
            onChange={(event) => handleInputChange("gitBranch", event.target.value)}
            placeholder="feature/task-dependency-graph"
            className="bg-[#202020] border-[#333333] text-white h-9 focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-zinc-300">Commit / PR Links</Label>
          <Input
            value={formData.issues}
            onChange={(event) => handleInputChange("issues", event.target.value)}
            placeholder="PR-428, commit:17ea2b"
            className="bg-[#202020] border-[#333333] text-white h-9 focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-zinc-300">Environment Vault</Label>
          <Input
            value={formData.environmentVault}
            onChange={(event) => handleInputChange("environmentVault", event.target.value)}
            placeholder="vault:production-secrets"
            className="bg-[#202020] border-[#333333] text-white h-9 focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-zinc-300">Agent Session</Label>
          <Input
            value={formData.agentSession}
            onChange={(event) => handleInputChange("agentSession", event.target.value)}
            placeholder="copilot-session-22"
            className="bg-[#202020] border-[#333333] text-white h-9 focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-zinc-300">Project</Label>
          <Input
            value={formData.project}
            onChange={(event) => handleInputChange("project", event.target.value)}
            placeholder="geiger-flow"
            className="bg-[#202020] border-[#333333] text-white h-9 focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-zinc-300">Workspace</Label>
          <Input
            value={formData.workspace}
            onChange={(event) => handleInputChange("workspace", event.target.value)}
            placeholder="product-engineering"
            className="bg-[#202020] border-[#333333] text-white h-9 focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-zinc-300">Role Visibility</Label>
          <Select
            value={formData.roleVisibility}
            onValueChange={(value) => handleInputChange("roleVisibility", value)}
          >
            <SelectTrigger className="w-full bg-[#202020] border-[#333333] text-white h-9 focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed]">
              {ROLE_VISIBILITY.map((option) => (
                <SelectItem key={option.value} value={option.value} className="focus:bg-[#2a2a2a]">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-zinc-300">Assist Panel Prompt</Label>
          <Input
            value={formData.assistPrompt}
            onChange={(event) => handleInputChange("assistPrompt", event.target.value)}
            placeholder="What is blocking this task?"
            className="bg-[#202020] border-[#333333] text-white h-9 focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1"
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg border border-[#2a2a2a] bg-[#202020]">
        <div>
          <p className="text-sm font-medium text-white">Allow Poke</p>
          <p className="text-xs text-[#737373]">Enable quick nudge reminders for assignees</p>
        </div>
        <Switch
          checked={formData.pokeEnabled}
          onCheckedChange={(checked) => handleInputChange("pokeEnabled", checked)}
        />
      </div>
    </div>
  );
}
