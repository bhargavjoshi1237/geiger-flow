"use client";

import React from "react";
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
import { Eye, Lock, Calendar as CalendarIcon, BarChart3, Timer, Zap, Shield, Check, Bell, Plus } from "lucide-react";

export function SettingsTab({ formData, handleInputChange }) {
  return (
    <div className="space-y-6">
      {/* Visibility Settings */}
      <div className="space-y-4">
        <Label className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wide">
          <Eye className="w-3.5 h-3.5 inline mr-1.5" />
          Visibility
        </Label>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-[#202020] rounded-lg border border-[#2a2a2a]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#737373]" />
                <Label className="text-sm font-medium text-white">Private</Label>
              </div>
              <p className="text-xs text-[#525252]">
                Only you can see this activity
              </p>
            </div>
            <Switch
              checked={formData.isPrivate}
              onCheckedChange={(checked) => handleInputChange("isPrivate", checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-[#202020] rounded-lg border border-[#2a2a2a]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#737373]" />
                <Label className="text-sm font-medium text-white">
                  Show in Calendar
                </Label>
              </div>
              <p className="text-xs text-[#525252]">
                This activity appears in team calendar
              </p>
            </div>
            <Switch
              checked={formData.isVisibleInCalendar}
              onCheckedChange={(checked) =>
                handleInputChange("isVisibleInCalendar", checked)
              }
            />
          </div>
        </div>
      </div>

      <Separator className="bg-[#2a2a2a]" />

      {/* Time Tracking Settings */}
      <div className="space-y-4">
        <Label className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wide">
          <BarChart3 className="w-3.5 h-3.5 inline mr-1.5" />
          Time Tracking
        </Label>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-[#202020] rounded-lg border border-[#2a2a2a]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-[#737373]" />
                <Label className="text-sm font-medium text-white">
                  Auto Track Time
                </Label>
              </div>
              <p className="text-xs text-[#525252]">
                Automatically track time when activity starts
              </p>
            </div>
            <Switch
              checked={formData.autoTrackTime}
              onCheckedChange={(checked) =>
                handleInputChange("autoTrackTime", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-[#202020] rounded-lg border border-[#2a2a2a]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#737373]" />
                <Label className="text-sm font-medium text-white">Billable</Label>
              </div>
              <p className="text-xs text-[#525252]">
                This activity is billable to client
              </p>
            </div>
            <Switch
              checked={formData.isBillable}
              onCheckedChange={(checked) => handleInputChange("isBillable", checked)}
            />
          </div>
        </div>
      </div>

      <Separator className="bg-[#2a2a2a]" />

      {/* Approval Settings */}
      <div className="space-y-4">
        <Label className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wide">
          <Shield className="w-3.5 h-3.5 inline mr-1.5" />
          Approval
        </Label>
        
        <div className="flex items-center justify-between p-4 bg-[#202020] rounded-lg border border-[#2a2a2a]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#737373]" />
              <Label className="text-sm font-medium text-white">
                Requires Approval
              </Label>
            </div>
            <p className="text-xs text-[#525252]">
              Manager must approve before completion
            </p>
          </div>
          <Switch
            checked={formData.requiresApproval}
            onCheckedChange={(checked) =>
              handleInputChange("requiresApproval", checked)
            }
          />
        </div>
      </div>

      <Separator className="bg-[#2a2a2a]" />

      {/* Reminders */}
      <div className="space-y-4">
        <Label className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wide">
          <Bell className="w-3.5 h-3.5 inline mr-1.5" />
          Reminders
        </Label>
        
        <div className="flex flex-col space-y-2">
          <Label className="text-xs text-[#737373]">Default Reminder</Label>
          <Select
            value={formData.defaultReminder.toString()}
            onValueChange={(value) =>
              handleInputChange("defaultReminder", parseInt(value))
            }
          >
            <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed] h-9 focus-visible:ring-zinc-600 focus-visible:ring-offset-0 focus-visible:ring-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a1a1a] border-[#2a2a2a] text-[#ededed]">
              <SelectItem value="0" className="focus:bg-[#2a2a2a]">
                At time of activity
              </SelectItem>
              <SelectItem value="5" className="focus:bg-[#2a2a2a]">
                5 minutes before
              </SelectItem>
              <SelectItem value="15" className="focus:bg-[#2a2a2a]">
                15 minutes before
              </SelectItem>
              <SelectItem value="30" className="focus:bg-[#2a2a2a]">
                30 minutes before
              </SelectItem>
              <SelectItem value="60" className="focus:bg-[#2a2a2a]">
                1 hour before
              </SelectItem>
              <SelectItem value="1440" className="focus:bg-[#2a2a2a]">
                1 day before
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full bg-[#1a1a1a] border-[#2a2a2a] text-[#a3a3a3] hover:text-[#ededed] h-9"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Add Custom Reminder
        </Button>
      </div>
    </div>
  );
}
