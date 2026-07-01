"use client";

import React, { useState, useMemo, useRef } from "react";
import { Input } from "@geiger/ui";
import { Label } from "@geiger/ui";
import { Button } from "@geiger/ui";
import { Slider } from "@geiger/ui";
import { Textarea } from "@geiger/ui";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@geiger/ui";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@geiger/ui";
import {
  Avatar,
  AvatarFallback,
} from "@geiger/ui";
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

const TEAM_MEMBERS = [];

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
          <Label className="text-sm font-medium text-foreground">Title</Label>
          <Input
            value={formData.title}
            onChange={(event) => handleInputChange("title", event.target.value)}
            placeholder="Implement dependency graph for release tasks"
            className="bg-surface-card border-border text-foreground h-9 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1"
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => handleInputChange("type", value)}
          >
            <SelectTrigger className="w-full bg-surface-card border-border text-foreground h-9 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-surface-subtle border-border text-foreground">
              {TASK_TYPES.map((option) => (
                <SelectItem key={option.value} value={option.value} className="!focus:bg-surface-hover">
                  <option.Icon className="w-3.5 h-3.5 mr-2" />
                  <span className="font-medium">{option.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-foreground">Description</Label>
        <Textarea
          value={formData.description}
          onChange={(event) => handleInputChange("description", event.target.value)}
          placeholder="Rich text/markdown ready notes for implementation details and acceptance criteria."
          className="bg-surface-card border-border text-foreground min-h-[88px] resize-none text-sm focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleInputChange("status", value)}
          >
            <SelectTrigger className="w-full bg-surface-card border-border text-foreground h-9 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="!bg-surface-subtle !border-border !text-foreground">
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className="!focus:bg-surface-hover">
                  <option.Icon className="w-3.5 h-3.5 mr-2" />
                  <span className="font-medium">{option.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => handleInputChange("priority", value)}
          >
            <SelectTrigger className="w-full bg-surface-card border-border text-foreground h-9 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="!bg-surface-subtle !border-border !text-foreground">
              {PRIORITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className="!focus:bg-surface-hover">
                  <option.Icon className="w-3.5 h-3.5 mr-2" />
                  <span className="font-medium">{option.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-foreground">Stage</Label>
          <StageSelect
            value={formData.stage}
            onValueChange={(value) => handleInputChange("stage", value)}
            triggerClassName="w-full bg-surface-card border-border text-foreground h-9 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-foreground flex items-center justify-between">
          <span>Progress</span>
          <span className="text-text-secondary text-xs font-mono">{formData.progress}%</span>
        </Label>
        <div className="relative pt-1 pb-2">
          <Slider
            min={0}
            max={100}
            value={[formData.progress || 0]}
            onValueChange={([value]) => handleInputChange("progress", value)}
            className="[&_[data-slot=slider-range]]:bg-primary [&_[data-slot=slider-track]]:bg-surface-hover [&_[data-slot=slider-thumb]]:border-foreground"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-foreground">Labels (comma separated)</Label>
        <Input
          value={formData.labels}
          onChange={(event) => handleInputChange("labels", event.target.value)}
          placeholder="frontend, release, urgent"
          className="bg-surface-card border-border text-foreground h-9 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium text-foreground">Linked Goal</Label>
        <Select
          value={formData.parentLink || "none"}
          onValueChange={(value) => handleInputChange("parentLink", value)}
        >
          <SelectTrigger className="w-full bg-surface-card border-border text-foreground h-9 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="!bg-surface-subtle !border-border !text-foreground">
            <SelectItem value="none" className="!focus:bg-surface-hover">
              No linked goal
            </SelectItem>
            {goalOptions.map((goal) => (
              <SelectItem
                key={goal.value}
                value={goal.value}
                className="!focus:bg-surface-hover"
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
        <Button
          type="button"
          variant="outline"
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
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-52 p-1 border border-border bg-surface-subtle shadow-xl text-foreground z-50 rounded-md"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {ungrouped.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant="ghost"
            onClick={() => handleSelect(option.value)}
            className={cn(
              "relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none transition-colors hover:bg-surface-hover hover:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
              value === option.value
                ? "bg-surface-hover text-foreground"
                : "text-foreground"
            )}
          >
            <option.Icon className="w-3.5 h-3.5 shrink-0" />
            <span className="font-medium flex-1 text-left">{option.label}</span>
          </Button>
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
              <Button
                type="button"
                variant="ghost"
                className={cn(
                  "relative w-full flex items-center gap-2 rounded-sm py-1.5 pl-2 pr-7 text-sm transition-colors",
                  hoveredGroup === group
                    ? "bg-surface-hover text-foreground"
                    : "text-foreground hover:bg-surface-hover"
                )}
              >
                <GroupIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="flex-1 font-medium text-left">{group}</span>
                <ArrowRight className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-50" />
              </Button>

              {hoveredGroup === group && (
                <div className="absolute left-full top-0 ml-1 w-40 border border-border bg-surface-subtle shadow-xl rounded-md z-50 p-1 text-foreground">
                  {items.map((item) => (
                    <Button
                      key={item.value}
                      type="button"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(item.value);
                      }}
                      className={cn(
                        "relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none transition-colors hover:bg-surface-hover hover:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                        value === item.value
                          ? "bg-surface-hover text-foreground"
                          : "text-foreground"
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
                    </Button>
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
        <Button
          type="button"
          variant="outline"
          className="flex items-center gap-1.5 px-3 py-1.5 h-[30px] rounded-full border border-dashed border-border-strong text-xs font-medium text-muted-foreground hover:text-foreground hover:border-border-strong hover:bg-surface-card transition-all bg-transparent"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Assignee
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-56 p-0 border border-border bg-background shadow-xl text-foreground"
      >
        <div className="p-2 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search members…"
              className="!pl-8 !pr-3 !py-1 !h-8 bg-surface-card border-border text-foreground text-xs placeholder:text-text-tertiary focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
            />
          </div>
        </div>
        <div className="max-h-[200px] overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <p className="text-xs text-text-secondary text-center py-4">No members found</p>
          ) : (
            filtered.map((member) => {
              const isSelected = selected.includes(member.id);
              return (
                <Button
                  key={member.id}
                  type="button"
                  variant="ghost"
                  onClick={() => onToggle(member.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-xs transition-colors",
                    isSelected
                      ? "bg-surface-active text-foreground"
                      : "text-muted-foreground hover:bg-surface-card hover:text-foreground",
                  )}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback
                      className={cn(
                        "text-[10px] font-semibold",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-surface-hover text-text-secondary",
                      )}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1 text-left font-medium">{member.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </Button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
