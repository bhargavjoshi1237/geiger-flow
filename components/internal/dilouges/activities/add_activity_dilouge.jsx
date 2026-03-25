"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Edit3, Calendar as CalendarIcon, Clock, ChevronDown } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// --- Inline presets ---

const ACTIVITY_TYPES = [
  { value: "task", label: "Task", color: "#3b82f6" },
  { value: "meeting", label: "Meeting", color: "#8b5cf6" },
  { value: "event", label: "Event", color: "#10b981" },
  { value: "reminder", label: "Reminder", color: "#f59e0b" },
  { value: "deadline", label: "Deadline", color: "#ef4444" },
];

const PRIORITY_LEVELS = [
  { value: "low", label: "Low", color: "#22c55e" },
  { value: "medium", label: "Medium", color: "#f59e0b" },
  { value: "high", label: "High", color: "#f97316" },
  { value: "urgent", label: "Urgent", color: "#ef4444" },
];

const STATUS_OPTIONS = [
  { value: "todo", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "review", label: "In Review" },
  { value: "done", label: "Done" },
  { value: "cancelled", label: "Cancelled" },
];

const TAG_PRESETS = [
  { id: "frontend", label: "Frontend", color: "#3b82f6" },
  { id: "backend", label: "Backend", color: "#8b5cf6" },
  { id: "design", label: "Design", color: "#ec4899" },
  { id: "bug", label: "Bug", color: "#ef4444" },
  { id: "feature", label: "Feature", color: "#10b981" },
  { id: "docs", label: "Docs", color: "#06b6d4" },
  { id: "testing", label: "Testing", color: "#f59e0b" },
];

const TEAM_MEMBERS = [
  { id: "m1", name: "Alex Johnson", initials: "AJ", role: "Developer" },
  { id: "m2", name: "Sarah Chen", initials: "SC", role: "Designer" },
  { id: "m3", name: "Mike Peters", initials: "MP", role: "PM" },
  { id: "m4", name: "Emily Davis", initials: "ED", role: "Developer" },
  { id: "m5", name: "James Wilson", initials: "JW", role: "QA" },
];

const REMINDER_OPTIONS = [
  { value: 0, label: "At time of event" },
  { value: 5, label: "5 minutes before" },
  { value: 15, label: "15 minutes before" },
  { value: 30, label: "30 minutes before" },
  { value: 60, label: "1 hour before" },
  { value: 1440, label: "1 day before" },
];

// --- Form State ---

const INITIAL_FORM = {
  name: "",
  description: "",
  type: "task",
  priority: "medium",
  status: "todo",
  tags: [],
  assignees: [],
  startDate: null,
  startTime: "09:00",
  endDate: null,
  endTime: "10:00",
  allDay: false,
  isPrivate: false,
  reminder: 15,
};

// --- Component ---

export function AddActivityDialog({
  children,
  activity = null,
  open = false,
  onOpenChange = () => {},
  onSave = () => {},
}) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isControlled = open !== false;
  const dialogOpen = isControlled ? open : internalOpen;
  const dialogOnOpenChange = isControlled
    ? onOpenChange
    : (val) => {
        setInternalOpen(val);
        onOpenChange(val);
      };

  useEffect(() => {
    if (activity) {
      setFormData({ ...INITIAL_FORM, ...activity });
    } else if (!dialogOpen) {
      setFormData(INITIAL_FORM);
    }
  }, [activity, dialogOpen]);

  const set = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const toggleTag = (tagId) =>
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter((t) => t !== tagId)
        : [...prev.tags, tagId],
    }));

  const toggleAssignee = (memberId) =>
    setFormData((prev) => ({
      ...prev,
      assignees: prev.assignees.includes(memberId)
        ? prev.assignees.filter((a) => a !== memberId)
        : [...prev.assignees, memberId],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toSave = {
      ...formData,
      id: activity?.id || null,
      createdAt: activity?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await onSave(toSave);
    setLoading(false);
    dialogOnOpenChange(false);
    setFormData(INITIAL_FORM);
  };

  // Helpers
  const typeColor = ACTIVITY_TYPES.find((t) => t.value === formData.type)?.color || "#737373";
  const priorityColor = PRIORITY_LEVELS.find((p) => p.value === formData.priority)?.color || "#737373";

  return (
    <Dialog open={dialogOpen} onOpenChange={dialogOnOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col bg-[#161616] border-[#2a2a2a] text-[#ededed] p-0 shadow-2xl">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#2a2a2a]">
          <DialogTitle className="text-xl flex items-center gap-2 font-semibold">
            {activity ? (
              <><Edit3 className="w-5 h-5 text-blue-500" /> Edit Activity</>
            ) : (
              <><Plus className="w-5 h-5 text-blue-500" /> Add New Activity</>
            )}
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-sm">
            {activity ? "Update the details for this activity." : "Fill in the details to create a new activity."}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Form */}
        <form id="activity-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Section: General */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">General Information</h4>
            <div className="grid grid-cols-[1fr_160px] gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="act-name" className="text-xs text-zinc-300">Activity Name</Label>
                <Input
                  id="act-name"
                  placeholder="e.g., Design Review Meeting"
                  value={formData.name}
                  onChange={(e) => set("name", e.target.value)}
                  className="bg-[#202020] border-[#2a2a2a] focus-visible:ring-1 focus-visible:ring-zinc-700 text-[#ededed] placeholder:text-zinc-600 h-10 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">Type</Label>
                <Select value={formData.type} onValueChange={(v) => set("type", v)}>
                  <SelectTrigger className="bg-[#202020] border-[#2a2a2a] text-[#ededed] h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e1e1e] border-[#2a2a2a]">
                    {ACTIVITY_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value} className="text-sm">
                        <span className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                          {t.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-300">Description</Label>
              <Textarea
                placeholder="Add any additional details, links, or notes..."
                value={formData.description}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
                className="bg-[#202020] border-[#2a2a2a] text-[#ededed] placeholder:text-zinc-600 text-sm resize-none focus-visible:ring-1 focus-visible:ring-zinc-700"
              />
            </div>
          </div>

          <Separator className="bg-[#2a2a2a]" />

          {/* Section: Properties */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Properties & Assignment</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">Priority</Label>
                <Select value={formData.priority} onValueChange={(v) => set("priority", v)}>
                  <SelectTrigger className="bg-[#202020] border-[#2a2a2a] text-[#ededed] h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e1e1e] border-[#2a2a2a]">
                    {PRIORITY_LEVELS.map((p) => (
                      <SelectItem key={p.value} value={p.value} className="text-sm cursor-pointer">
                        <span className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                          {p.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">Status</Label>
                <Select value={formData.status} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger className="bg-[#202020] border-[#2a2a2a] text-[#ededed] h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e1e1e] border-[#2a2a2a]">
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value} className="text-sm cursor-pointer">{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-zinc-300">Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {TAG_PRESETS.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-md text-xs font-medium border transition-all duration-200",
                        formData.tags.includes(tag.id)
                          ? "border-transparent text-white shadow-sm"
                          : "bg-[#202020] border-[#2a2a2a] text-zinc-400 hover:text-zinc-200 hover:border-[#3a3a3a]"
                      )}
                      style={
                        formData.tags.includes(tag.id)
                          ? { backgroundColor: tag.color + "33", color: tag.color, borderColor: tag.color + "66" }
                          : {}
                      }
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-zinc-300">
                  Assignees {formData.assignees.length > 0 && <span className="text-zinc-500">({formData.assignees.length})</span>}
                </Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-between bg-[#202020] border-[#2a2a2a] text-zinc-300 hover:bg-[#252525] hover:text-[#ededed] h-10 text-sm"
                    >
                      <span className="truncate">
                        {formData.assignees.length === 0
                          ? "Select assignees..."
                          : formData.assignees
                              .map((id) => TEAM_MEMBERS.find((m) => m.id === id)?.name)
                              .join(", ")}
                      </span>
                      <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-[#1e1e1e] border-[#2a2a2a] min-w-[240px]" align="start">
                    <DropdownMenuLabel className="text-zinc-400 text-xs uppercase tracking-wider">Team Members</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-[#2a2a2a]" />
                    {TEAM_MEMBERS.map((member) => (
                      <DropdownMenuCheckboxItem
                        key={member.id}
                        checked={formData.assignees.includes(member.id)}
                        onCheckedChange={() => toggleAssignee(member.id)}
                        className="text-sm text-[#ededed] focus:bg-[#2a2a2a] focus:text-white cursor-pointer py-2"
                      >
                        <div className="flex flex-col">
                          <span>{member.name}</span>
                          <span className="text-xs text-zinc-500">{member.role}</span>
                        </div>
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <Separator className="bg-[#2a2a2a]" />

          {/* Section: Schedule */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Schedule</h4>
              <div className="flex items-center gap-2 bg-[#202020] border border-[#2a2a2a] px-3 py-1.5 rounded-md">
                <Label className="text-xs text-zinc-300 cursor-pointer">All Day</Label>
                <Switch
                  checked={formData.allDay}
                  onCheckedChange={(v) => set("allDay", v)}
                  className="data-[state=checked]:bg-blue-500 scale-90"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-xs text-zinc-300">Start Time</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "flex-1 justify-start text-left bg-[#202020] border-[#2a2a2a] hover:bg-[#252525] text-[#ededed] h-10 text-sm font-normal",
                          !formData.startDate && "text-zinc-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-zinc-400" />
                        {formData.startDate ? format(formData.startDate, "MMM d, yyyy") : "Date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-[#1e1e1e] border-[#2a2a2a]" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={(d) => set("startDate", d)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {!formData.allDay && (
                    <div className="relative w-28">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                      <Input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => set("startTime", e.target.value)}
                        className="bg-[#202020] border-[#2a2a2a] text-[#ededed] h-10 text-sm pl-9"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs text-zinc-300">End Time</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "flex-1 justify-start text-left bg-[#202020] border-[#2a2a2a] hover:bg-[#252525] text-[#ededed] h-10 text-sm font-normal",
                          !formData.endDate && "text-zinc-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-zinc-400" />
                        {formData.endDate ? format(formData.endDate, "MMM d, yyyy") : "Date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-[#1e1e1e] border-[#2a2a2a]" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.endDate}
                        onSelect={(d) => set("endDate", d)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {!formData.allDay && (
                    <div className="relative w-28">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                      <Input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => set("endTime", e.target.value)}
                        className="bg-[#202020] border-[#2a2a2a] text-[#ededed] h-10 text-sm pl-9"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center justify-between p-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
                <div className="space-y-0.5">
                  <Label className="text-xs text-zinc-300">Private Activity</Label>
                  <p className="text-[10px] text-zinc-500">Only visible to assignees</p>
                </div>
                <Switch
                  checked={formData.isPrivate}
                  onCheckedChange={(v) => set("isPrivate", v)}
                  className="data-[state=checked]:bg-rose-500 scale-90"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">Alert Reminder</Label>
                <Select value={String(formData.reminder)} onValueChange={(v) => set("reminder", Number(v))}>
                  <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed] h-[46px] text-sm font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e1e1e] border-[#2a2a2a]">
                    {REMINDER_OPTIONS.map((r) => (
                      <SelectItem key={r.value} value={String(r.value)} className="text-sm cursor-pointer">{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-[#2a2a2a] bg-[#1a1a1a] sm:justify-between items-center shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => dialogOnOpenChange(false)}
            className="text-zinc-400 hover:text-white hover:bg-[#252525]"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="activity-form"
            disabled={!formData.name || loading}
            className="bg-white text-black hover:bg-zinc-200 min-w-[130px] font-medium shadow-sm transition-all"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                Saving...
              </span>
            ) : activity ? (
              "Save Changes"
            ) : (
              "Create Activity"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
