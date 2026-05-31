"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { AlertTriangle, Expand, Maximize2, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const ACTIVITY_TYPES = [
  { value: "work", label: "Work" },
  { value: "meeting", label: "Meeting" },
  { value: "task", label: "Task" },
  { value: "personal", label: "Personal" },
  { value: "review", label: "Review" },
  { value: "planning", label: "Planning" },
  { value: "research", label: "Research" },
  { value: "other", label: "Other" },
];

const PRIORITY_LEVELS = [
  { value: "critical", label: "Critical", color: "text-red-400", Icon: AlertTriangle },
  { value: "high", label: "High", color: "text-orange-400", Icon: Expand },
  { value: "medium", label: "Medium", color: "text-yellow-400", Icon: Maximize2 },
  { value: "low", label: "Low", color: "text-green-400", Icon: ArrowUpRight },
];

const STATUS_OPTIONS = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "In Review" },
  { value: "blocked", label: "Blocked" },
  { value: "completed", label: "Completed" },
];

const TAG_PRESETS = [
  { id: "design", label: "Design", color: "bg-purple-500/20 text-purple-300" },
  { id: "development", label: "Development", color: "bg-blue-500/20 text-blue-300" },
  { id: "marketing", label: "Marketing", color: "bg-green-500/20 text-green-300" },
  { id: "urgent", label: "Urgent", color: "bg-red-500/20 text-red-300" },
  { id: "bug", label: "Bug", color: "bg-orange-500/20 text-orange-300" },
  { id: "feature", label: "Feature", color: "bg-cyan-500/20 text-cyan-300" },
  { id: "documentation", label: "Docs", color: "bg-yellow-500/20 text-yellow-300" },
  { id: "testing", label: "Testing", color: "bg-pink-500/20 text-pink-300" },
];

const TEAM_MEMBERS = [];

export function DetailsTab({ formData, handleInputChange, handleToggleTag, handleToggleAssignee }) {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="w-[80%]">
          <Label className="text-sm font-medium text-zinc-300">
            Name
          </Label>
          <Input
            placeholder="e.g. Design review"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            required
            className="bg-[#202020] mt-1.5 border-[#333333] text-white h-9 focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1"
          />
        </div>
        <div className="w-[20%]">
          <Label className="text-sm font-medium text-zinc-300 mb-1.5">Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => handleInputChange("type", value)}
          >
            <SelectTrigger className="bg-[#202020] border-[#333333] text-white h-9 focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed]">
              {ACTIVITY_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value} className="focus:bg-[#2a2a2a]">
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-zinc-300">Description</Label>
        <Textarea
          placeholder="Brief description..."
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          className="bg-[#202020] border-[#333333] text-white min-h-[60px] resize-none text-sm focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1"
        />
      </div>

      <div className="flex gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-zinc-300">Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => handleInputChange("priority", value)}
          >
            <SelectTrigger className="bg-[#202020] border-[#333333] text-white h-9 focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed]">
              {PRIORITY_LEVELS.map((priority) => (
                <SelectItem
                  key={priority.value}
                  value={priority.value}
                  className="focus:bg-[#2a2a2a]"
                >
                  <priority.Icon className="w-3.5 h-3.5 mr-2" />
                  <span className={cn(priority.color, "font-medium")}>{priority.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-zinc-300">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleInputChange("status", value)}
          >
            <SelectTrigger className="bg-[#202020] border-[#333333] text-white h-9 focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed]">
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status.value} value={status.value} className="focus:bg-[#2a2a2a]">
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-zinc-300">
            Progress <span className="text-zinc-500 text-xs">({formData.progress}%)</span>
          </Label>
          <Slider
            min={0}
            max={100}
            value={[formData.progress]}
            onValueChange={([value]) => handleInputChange("progress", value)}
            className="mt-3 [&_[data-slot=slider-range]]:bg-[#ededed] [&_[data-slot=slider-track]]:bg-[#2a2a2a] [&_[data-slot=slider-thumb]]:border-[#ededed]"
          />
        </div>
      </div>

      <Separator className="bg-[#2a2a2a]" />

      <div className="space-y-2">
        <Label className="text-sm font-medium text-zinc-300">Tags</Label>
        <div className="flex flex-wrap gap-1.5">
          {TAG_PRESETS.map((tag) => (
            <Button
              key={tag.id}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleToggleTag(tag.id)}
              className={cn(
                "h-auto rounded px-2.5 py-1 text-xs font-medium transition-all border",
                formData.tags.includes(tag.id)
                  ? "bg-[#ededed] text-[#161616] border-[#ededed]"
                  : "bg-[#202020] border-[#2a2a2a] text-[#737373] hover:border-[#3a3a3a]"
              )}
            >
              {tag.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-zinc-300">Assignees</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between bg-[#202020] border-[#333333] text-white hover:bg-[#252525] h-9 focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1"
            >
              <div className="flex items-center gap-2">
                {formData.assignees.length > 0 ? (
                  <>
                    <div className="flex -space-x-1.5">
                      {formData.assignees.slice(0, 3).map((id) => {
                        const member = TEAM_MEMBERS.find((m) => m.id === id);
                        return (
                          <div
                            key={id}
                            className="w-5 h-5 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[10px] font-medium border border-[#202020]"
                          >
                            {member?.name.charAt(0)}
                          </div>
                        );
                      })}
                    </div>
                    <span className="text-sm">{formData.assignees.length} selected</span>
                  </>
                ) : (
                  <span className="text-[#525252]">Select team members</span>
                )}
              </div>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[var(--radix-dropdown-menu-trigger-width)] bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed]"
            align="start"
          >
            <DropdownMenuLabel>Team Members</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#2a2a2a]" />
            {TEAM_MEMBERS.map((member) => (
              <DropdownMenuCheckboxItem
                key={member.id}
                checked={formData.assignees.includes(member.id)}
                onCheckedChange={() => handleToggleAssignee(member.id)}
                className="focus:bg-[#2a2a2a]"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#2a2a2a] flex items-center justify-center text-xs">
                    {member.name.charAt(0)}
                  </div>
                  <span className="text-sm">{member.name}</span>
                </div>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-zinc-300">Project</Label>
          <Select
            value={formData.projectId || "none"}
            onValueChange={(value) => handleInputChange("projectId", value === "none" ? null : value)}
          >
            <SelectTrigger className="bg-[#202020] border-[#333333] text-white h-9 focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed]">
              <SelectItem value="none" className="focus:bg-[#2a2a2a]">No project</SelectItem>
              <SelectItem value="proj_1" className="focus:bg-[#2a2a2a]">Marketing Website</SelectItem>
              <SelectItem value="proj_2" className="focus:bg-[#2a2a2a]">Mobile App</SelectItem>
              <SelectItem value="proj_3" className="focus:bg-[#2a2a2a]">Dashboard v2</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-zinc-300">Milestone</Label>
          <Select
            value={formData.milestoneId || "none"}
            onValueChange={(value) => handleInputChange("milestoneId", value === "none" ? null : value)}
          >
            <SelectTrigger className="bg-[#202020] border-[#333333] text-white h-9 focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed]">
              <SelectItem value="none" className="focus:bg-[#2a2a2a]">No milestone</SelectItem>
              <SelectItem value="ms_1" className="focus:bg-[#2a2a2a]">MVP Launch</SelectItem>
              <SelectItem value="ms_2" className="focus:bg-[#2a2a2a]">Beta Release</SelectItem>
              <SelectItem value="ms_3" className="focus:bg-[#2a2a2a]">Production Deploy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-zinc-300">Notes</Label>
        <Textarea
          placeholder="Additional notes..."
          value={formData.notes}
          onChange={(e) => handleInputChange("notes", e.target.value)}
          className="bg-[#202020] border-[#333333] text-white min-h-[50px] resize-none text-sm focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1"
        />
      </div>
    </div>
  );
}
