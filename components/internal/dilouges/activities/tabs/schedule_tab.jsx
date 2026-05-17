"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Clock, Calendar as CalendarIcon, Timer, Repeat, Plus } from "lucide-react";
import { format } from "date-fns";

const DURATION_PRESETS = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
  { value: 180, label: "3 hours" },
  { value: 240, label: "4 hours" },
  { value: 480, label: "Full day" },
];

const RECURRENCE_OPTIONS = [
  { value: "none", label: "No repeat" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
  { value: "custom", label: "Custom..." },
];

export function ScheduleTab({ formData, handleInputChange }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-[#202020] rounded-lg border border-[#2a2a2a]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#737373]" />
            <Label className="text-sm font-medium text-white">All Day</Label>
          </div>
          <p className="text-xs text-[#525252]">
            This activity takes the whole day
          </p>
        </div>
        <Switch
          checked={formData.allDay}
          onCheckedChange={(checked) => handleInputChange("allDay", checked)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col space-y-2">
          <Label className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wide">
            Start Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-start text-left font-normal bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed] hover:bg-[#202020] h-9 focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.startDate
                  ? format(new Date(formData.startDate), "PPP")
                  : "Pick date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed]">
              <Calendar
                mode="single"
                selected={formData.startDate ? new Date(formData.startDate) : undefined}
                onSelect={(date) => handleInputChange("startDate", date)}
                className="bg-[#1a1a1a] text-[#ededed]"
              />
            </PopoverContent>
          </Popover>
        </div>

        {!formData.allDay && (
          <div className="flex flex-col space-y-2">
            <Label className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wide">
              Start Time
            </Label>
            <Input
              type="time"
              value={formData.startTime}
              onChange={(e) => handleInputChange("startTime", e.target.value)}
              className="bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed] h-9 focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col space-y-2">
          <Label className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wide">
            End Date
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-start text-left font-normal bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed] hover:bg-[#202020] h-9 focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.endDate
                  ? format(new Date(formData.endDate), "PPP")
                  : "Pick date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed]">
              <Calendar
                mode="single"
                selected={formData.endDate ? new Date(formData.endDate) : undefined}
                onSelect={(date) => handleInputChange("endDate", date)}
                className="bg-[#1a1a1a] text-[#ededed]"
              />
            </PopoverContent>
          </Popover>
        </div>

        {!formData.allDay && (
          <div className="flex flex-col space-y-2">
            <Label className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wide">
              End Time
            </Label>
            <Input
              type="time"
              value={formData.endTime}
              onChange={(e) => handleInputChange("endTime", e.target.value)}
              className="bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed] h-9 focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1"
            />
          </div>
        )}
      </div>

      <div className="flex flex-col space-y-2">
        <Label className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wide">
          <Timer className="w-3.5 h-3.5 inline mr-1.5" />
          Estimated Duration
        </Label>
        <Select
          value={formData.duration.toString()}
          onValueChange={(value) => handleInputChange("duration", parseInt(value))}
        >
          <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed] h-9 focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1">
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed]">
            {DURATION_PRESETS.map((preset) => (
              <SelectItem
                key={preset.value}
                value={preset.value.toString()}
                className="focus:bg-[#2a2a2a]"
              >
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator className="bg-[#2a2a2a]" />

      <div className="flex flex-col space-y-3">
        <Label className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wide">
          <Repeat className="w-3.5 h-3.5 inline mr-1.5" />
          Recurrence
        </Label>
        <Select
          value={formData.recurrence}
          onValueChange={(value) => handleInputChange("recurrence", value)}
        >
          <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed] h-9 focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1">
            <SelectValue placeholder="Repeat" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed]">
            {RECURRENCE_OPTIONS.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="focus:bg-[#2a2a2a]"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {formData.recurrence !== "none" && (
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="flex flex-col space-y-2">
              <Label className="text-xs text-[#737373]">End After (occurrences)</Label>
              <Input
                type="number"
                min="1"
                value={formData.recurrenceCount}
                onChange={(e) => handleInputChange("recurrenceCount", parseInt(e.target.value))}
                className="bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed] h-9 focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1"
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Label className="text-xs text-[#737373]">Or End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed] hover:bg-[#202020] h-9 focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.recurrenceEnd
                      ? format(new Date(formData.recurrenceEnd), "PP")
                      : "No end"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed]">
                  <Calendar
                    mode="single"
                    selected={formData.recurrenceEnd ? new Date(formData.recurrenceEnd) : undefined}
                    onSelect={(date) => handleInputChange("recurrenceEnd", date)}
                    className="bg-[#1a1a1a] text-[#ededed]"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
