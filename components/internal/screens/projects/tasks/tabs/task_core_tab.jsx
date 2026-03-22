"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AlertTriangle, Expand, Maximize2, ArrowUpRight } from "lucide-react";

const TASK_TYPES = [
  { value: "task", label: "Task" },
  { value: "issue", label: "Issue" },
  { value: "bug", label: "Bug" },
  { value: "feature", label: "Feature" },
  { value: "improvement", label: "Improvement" },
];

const STATUS_OPTIONS = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "blocked", label: "Blocked" },
  { value: "done", label: "Done" },
];

const STAGE_OPTIONS = [
  { value: "backlog", label: "Backlog", group: null },
  { value: "planning", label: "Planning", group: null },
  { value: "execution", label: "Execution", group: null },
  { value: "testing", label: "Testing", group: null },
  { value: "deployment:pending", label: "Deployment » Pending", group: "Deployment" },
  { value: "deployment:running", label: "Deployment » Running", group: "Deployment" },
  { value: "merge:pending", label: "Merge » Pending", group: "Merge" },
  { value: "merge:done", label: "Merge » Done", group: "Merge" },
  { value: "review", label: "Review", group: null },
  { value: "completed", label: "Completed", group: null },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low", Icon: ArrowUpRight },
  { value: "medium", label: "Medium", Icon: Maximize2 },
  { value: "high", label: "High", Icon: Expand },
  { value: "critical", label: "Critical", Icon: AlertTriangle },
];

const TEAM_MEMBERS = [
  { id: "user_1", name: "Alex" },
  { id: "user_2", name: "Sam" },
  { id: "user_3", name: "Priya" },
  { id: "user_4", name: "Morgan" },
  { id: "user_5", name: "Jordan" },
];

export function TaskCoreTab({ formData, handleInputChange, handleToggleAssignee }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_160px] gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-zinc-300">Title</Label>
          <Input
            value={formData.title}
            onChange={(event) => handleInputChange("title", event.target.value)}
            placeholder="Implement dependency graph for release tasks"
            className="bg-[#202020] border-[#333333] text-white h-9 focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-zinc-300">Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => handleInputChange("type", value)}
          >
            <SelectTrigger className="w-full bg-[#202020] border-[#333333] text-white h-9 focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed]">
              {TASK_TYPES.map((option) => (
                <SelectItem key={option.value} value={option.value} className="focus:bg-[#2a2a2a]">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-zinc-300">Description</Label>
        <Textarea
          value={formData.description}
          onChange={(event) => handleInputChange("description", event.target.value)}
          placeholder="Rich text/markdown ready notes for implementation details and acceptance criteria."
          className="bg-[#202020] border-[#333333] text-white min-h-[88px] resize-none text-sm focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-zinc-300">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleInputChange("status", value)}
          >
            <SelectTrigger className="w-full bg-[#202020] border-[#333333] text-white h-9 focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed]">
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className="focus:bg-[#2a2a2a]">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-zinc-300">Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => handleInputChange("priority", value)}
          >
            <SelectTrigger className="w-full bg-[#202020] border-[#333333] text-white h-9 focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed]">
              {PRIORITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className="focus:bg-[#2a2a2a]">
                  <option.Icon className="w-3.5 h-3.5 mr-2" />
                  <span className={cn(option.color, "font-medium")}>{option.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-zinc-300">Stage</Label>
          <Select
            value={formData.stage}
            onValueChange={(value) => handleInputChange("stage", value)}
          >
            <SelectTrigger className="w-full bg-[#202020] border-[#333333] text-white h-9 focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed]">
              {(() => {
                const ungrouped = STAGE_OPTIONS.filter((o) => !o.group);
                const groups = {};
                STAGE_OPTIONS.filter((o) => o.group).forEach((o) => {
                  if (!groups[o.group]) groups[o.group] = [];
                  groups[o.group].push(o);
                });

                return [
                  ungrouped.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="focus:bg-[#2a2a2a]">
                      {option.label}
                    </SelectItem>
                  )),
                  ...Object.entries(groups).map(([group, items]) => (
                    <SelectGroup key={group}>
                      <SelectLabel className="text-[#737373] text-xs font-semibold uppercase tracking-wide">{group}</SelectLabel>
                      {items.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="focus:bg-[#2a2a2a] pl-6">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )),
                ];
              })()}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-zinc-300">
          Progress <span className="text-[#737373] text-xs">({formData.progress}%)</span>
        </Label>
        <input
          type="range"
          min="0"
          max="100"
          value={formData.progress}
          onChange={(event) => handleInputChange("progress", Number(event.target.value))}
          className="w-full h-1.5 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-[#ededed]"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-zinc-300">Assignees</Label>
        <div className="flex flex-wrap gap-1.5">
          {TEAM_MEMBERS.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => handleToggleAssignee(member.id)}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-medium transition-all border",
                formData.assignees.includes(member.id)
                  ? "bg-[#ededed] text-[#161616] border-[#ededed]"
                  : "bg-[#202020] border-[#2a2a2a] text-[#a3a3a3] hover:border-[#3a3a3a]",
              )}
            >
              {member.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-zinc-300">Labels (comma separated)</Label>
          <Input
            value={formData.labels}
            onChange={(event) => handleInputChange("labels", event.target.value)}
            placeholder="frontend, release, urgent"
            className="bg-[#202020] border-[#333333] text-white h-9 focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-zinc-300">Parent Link</Label>
          <Input
            value={formData.parentLink}
            onChange={(event) => handleInputChange("parentLink", event.target.value)}
            placeholder="goal:Q2-launch"
            className="bg-[#202020] border-[#333333] text-white h-9 focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1"
          />
        </div>
      </div>
    </div>
  );
}
