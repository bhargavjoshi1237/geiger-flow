"use client";

import React, { useState, useMemo, useRef } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { AlertTriangle, Expand, Maximize2, ArrowUpRight, Check, Search, X, Plus, Circle, Zap, AlertOctagon, CircleDot, Archive, ClipboardList, Rocket, FlaskConical, CloudUpload, Server, GitMerge, Eye, Flag, CircleCheck, CheckIcon, ArrowRight, Cloud, GitBranch, Bug } from "lucide-react";

const TASK_TYPES = [
  { value: "task", label: "Task", Icon: Circle },
  { value: "issue", label: "Issue", Icon: AlertTriangle },
  { value: "bug", label: "Bug", Icon: Bug },
  { value: "feature", label: "Feature", Icon: Zap },
  { value: "improvement", label: "Improvement", Icon: Maximize2 },
];

const STATUS_OPTIONS = [
  { value: "todo", label: "To Do", Icon: Circle },
  { value: "in_progress", label: "In Progress", Icon: Zap },
  { value: "blocked", label: "Blocked", Icon: AlertOctagon },
  { value: "done", label: "Done", Icon: CircleDot },
];

const STAGE_OPTIONS = [
  { value: "high", label: "High", Icon: Expand },
  { value: "planning", label: "Planning", Icon: ClipboardList, group: null },
  { value: "execution", label: "Execution", Icon: Rocket, group: null },
  { value: "testing", label: "Testing", Icon: FlaskConical, group: null },
  { value: "deployment:pending", label: "Pending", Icon: CloudUpload, group: "Deployment" },
  { value: "deployment:running", label: "Running", Icon: Server, group: "Deployment" },
  { value: "merge:pending", label: "Pending", Icon: GitMerge, group: "Merge" },
  { value: "merge:done", label: "Done", Icon: CircleCheck, group: "Merge" },
  { value: "review", label: "Review", Icon: Eye, group: null },
  { value: "completed", label: "Completed", Icon: Flag, group: null },
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

export function TaskCoreTab({
  formData,
  handleInputChange,
  handleToggleAssignee,
  goalOptions = [],
}) {
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
            autoFocus
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
                <SelectItem key={option.value} value={option.value} className="!focus:bg-[#2a2a2a]">
                  <option.Icon className="w-3.5 h-3.5 mr-2" />
                  <span className="font-medium">{option.label}</span>
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
            <SelectContent className="!bg-[#1a1a1a] !border-[#2a2a2a] !text-[#ededed]">
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className="!focus:bg-[#2a2a2a]">
                  <option.Icon className="w-3.5 h-3.5 mr-2" />
                  <span className="font-medium">{option.label}</span>
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
            <SelectContent className="!bg-[#1a1a1a] !border-[#2a2a2a] !text-[#ededed]">
              {PRIORITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className="!focus:bg-[#2a2a2a]">
                  <option.Icon className="w-3.5 h-3.5 mr-2" />
                  <span className="font-medium">{option.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-zinc-300">Stage</Label>
          <StageSelect
            value={formData.stage}
            onValueChange={(value) => handleInputChange("stage", value)}
            triggerClassName="w-full bg-[#202020] border-[#333333] text-white h-9 focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-zinc-300 flex items-center justify-between">
          <span>Progress</span>
          <span className="text-[#737373] text-xs font-mono">{formData.progress}%</span>
        </Label>
        <div className="relative pt-1 pb-2">
          <input
            type="range"
            min="0"
            max="100"
            value={formData.progress || 0}
            onChange={(event) => handleInputChange("progress", Number(event.target.value))}
            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-zinc-600 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1e1e1e] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:bg-[#ededed] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md hover:[&::-webkit-slider-thumb]:scale-110 active:[&::-webkit-slider-thumb]:scale-95 transition-all"
            style={{
              background: `linear-gradient(to right, #ededed ${formData.progress || 0}%, #2a2a2a ${formData.progress || 0}%)`
            }}
          />
        </div>
      </div>

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
        <Label className="text-sm font-medium text-zinc-300">Linked Goal</Label>
        <Select
          value={formData.parentLink || "none"}
          onValueChange={(value) => handleInputChange("parentLink", value)}
        >
          <SelectTrigger className="w-full bg-[#202020] border-[#333333] text-white h-9 focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="!bg-[#1a1a1a] !border-[#2a2a2a] !text-[#ededed]">
            <SelectItem value="none" className="!focus:bg-[#2a2a2a]">
              No linked goal
            </SelectItem>
            {goalOptions.map((goal) => (
              <SelectItem
                key={goal.value}
                value={goal.value}
                className="!focus:bg-[#2a2a2a]"
              >
                {goal.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function StageSelect({ value, onValueChange, triggerClassName }) {
  const [open, setOpen] = useState(false);
  const [hoveredGroup, setHoveredGroup] = useState(null);
  const timeoutRef = useRef(null);

  const ungrouped = STAGE_OPTIONS.filter((o) => !o.group);
  const groups = {};
  STAGE_OPTIONS.filter((o) => o.group).forEach((o) => {
    if (!groups[o.group]) groups[o.group] = [];
    groups[o.group].push(o);
  });

  const selected = STAGE_OPTIONS.find((o) => o.value === value);

  const handleHoverEnter = (group) => {
    clearTimeout(timeoutRef.current);
    setHoveredGroup(group);
  };

  const handleHoverLeave = () => {
    timeoutRef.current = setTimeout(() => setHoveredGroup(null), 100);
  };

  const handleSelect = (val) => {
    onValueChange(val);
    setOpen(false);
    setHoveredGroup(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
            triggerClassName
          )}
        >
          <span className="flex items-center gap-2 truncate">
            {selected && <selected.Icon className="w-4 h-4 shrink-0 opacity-70" />}
            <span className="truncate">{selected ? selected.label : "Select stage"}</span>
          </span>
          <svg className="w-4 h-4 opacity-50 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-52 p-1 border border-[#2a2a2a] bg-[#1a1a1a] shadow-xl text-[#ededed] z-50 rounded-md"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {ungrouped.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleSelect(option.value)}
            className={cn(
              "relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none transition-colors hover:bg-[#2a2a2a] hover:text-[#ededed] data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
              value === option.value
                ? "bg-[#2a2a2a] text-[#ededed]"
                : "text-[#ededed]"
            )}
          >
            <option.Icon className="w-3.5 h-3.5 shrink-0" />
            <span className="font-medium flex-1 text-left">{option.label}</span>
          </button>
        ))}

        {Object.entries(groups).map(([group, items]) => {
          const GroupIcon = group === "Deployment" ? Cloud : GitBranch;
          return (
            <div
              key={group}
              className="relative"
              onMouseEnter={() => handleHoverEnter(group)}
              onMouseLeave={handleHoverLeave}
            >
              <button
                type="button"
                className={cn(
                  "relative w-full flex items-center gap-2 rounded-sm py-1.5 pl-2 pr-7 text-sm transition-colors",
                  hoveredGroup === group
                    ? "bg-[#2a2a2a] text-[#ededed]"
                    : "text-[#ededed] hover:bg-[#2a2a2a]"
                )}
              >
                <GroupIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="flex-1 font-medium text-left">{group}</span>
                <ArrowRight className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-50" />
              </button>

              {hoveredGroup === group && (
                <div className="absolute left-full top-0 ml-1 w-40 border border-[#2a2a2a] bg-[#1a1a1a] shadow-xl rounded-md z-50 p-1 text-[#ededed]">
                  {items.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(item.value);
                      }}
                      className={cn(
                        "relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none transition-colors hover:bg-[#2a2a2a] hover:text-[#ededed] data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                        value === item.value
                          ? "bg-[#2a2a2a] text-[#ededed]"
                          : "text-[#ededed]"
                      )}
                    >
                      <item.Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-medium flex-1 text-left">{item.label}</span>
                      <span
                        data-slot="select-item-indicator"
                        className="absolute right-2 flex size-3.5 items-center justify-center"
                      >
                        <CheckIcon className="size-4" />
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

function AssigneeDropdown({ selected, onToggle }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      TEAM_MEMBERS.filter((m) =>
        m.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 h-[30px] rounded-full border border-dashed border-[#474747] text-xs font-medium text-[#a3a3a3] hover:text-zinc-100 hover:border-[#737373] hover:bg-[#202020] transition-all bg-transparent"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Assignee
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-56 p-0 border border-[#2a2a2a] bg-[#161616] shadow-xl text-zinc-200"
      >
        <div className="p-2 border-b border-[#2a2a2a]">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#737373]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search members…"
              className="!pl-8 !pr-3 !py-1 !h-8 bg-[#202020] border-[#2a2a2a] text-white text-xs placeholder:text-[#474747] focus-visible:ring-1 focus-visible:ring-zinc-600 focus-visible:ring-offset-0"
            />
          </div>
        </div>
        <div className="max-h-[200px] overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <p className="text-xs text-[#737373] text-center py-4">No members found</p>
          ) : (
            filtered.map((member) => {
              const isSelected = selected.includes(member.id);
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => onToggle(member.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-xs transition-colors",
                    isSelected
                      ? "bg-[#242424] text-zinc-100"
                      : "text-[#a3a3a3] hover:bg-[#202020] hover:text-zinc-200",
                  )}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback
                      className={cn(
                        "text-[10px] font-semibold",
                        isSelected
                          ? "bg-[#ededed] text-[#161616]"
                          : "bg-[#2a2a2a] text-[#737373]",
                      )}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1 text-left font-medium">{member.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
