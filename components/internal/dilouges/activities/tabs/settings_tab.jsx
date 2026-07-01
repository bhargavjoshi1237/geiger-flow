"use client";

import React from "react";
import { Label } from "@geiger/ui";
import { Switch } from "@geiger/ui";
import { Separator } from "@geiger/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@geiger/ui";
import { Button } from "@geiger/ui";
import { Eye, Lock, Calendar as CalendarIcon, BarChart3, Timer, Zap, Shield, Check, Bell, Plus } from "lucide-react";

export function SettingsTab({ formData, handleInputChange }) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <Eye className="w-3.5 h-3.5 inline mr-1.5" />
          Visibility
        </Label>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-surface-card rounded-lg border border-border">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-text-secondary" />
                <Label className="text-sm font-medium text-foreground">Private</Label>
              </div>
              <p className="text-xs text-text-tertiary">
                Only you can see this activity
              </p>
            </div>
            <Switch
              checked={formData.isPrivate}
              onCheckedChange={(checked) => handleInputChange("isPrivate", checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-surface-card rounded-lg border border-border">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-text-secondary" />
                <Label className="text-sm font-medium text-foreground">
                  Show in Calendar
                </Label>
              </div>
              <p className="text-xs text-text-tertiary">
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

      <Separator className="bg-surface-hover" />

      <div className="space-y-4">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <BarChart3 className="w-3.5 h-3.5 inline mr-1.5" />
          Time Tracking
        </Label>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-surface-card rounded-lg border border-border">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-text-secondary" />
                <Label className="text-sm font-medium text-foreground">
                  Auto Track Time
                </Label>
              </div>
              <p className="text-xs text-text-tertiary">
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

          <div className="flex items-center justify-between p-4 bg-surface-card rounded-lg border border-border">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-text-secondary" />
                <Label className="text-sm font-medium text-foreground">Billable</Label>
              </div>
              <p className="text-xs text-text-tertiary">
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

      <Separator className="bg-surface-hover" />

      <div className="space-y-4">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <Shield className="w-3.5 h-3.5 inline mr-1.5" />
          Approval
        </Label>
        
        <div className="flex items-center justify-between p-4 bg-surface-card rounded-lg border border-border">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-text-secondary" />
              <Label className="text-sm font-medium text-foreground">
                Requires Approval
              </Label>
            </div>
            <p className="text-xs text-text-tertiary">
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

      <Separator className="bg-surface-hover" />

      <div className="space-y-4">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <Bell className="w-3.5 h-3.5 inline mr-1.5" />
          Reminders
        </Label>
        
        <div className="flex flex-col space-y-2">
          <Label className="text-xs text-text-secondary">Default Reminder</Label>
          <Select
            value={formData.defaultReminder.toString()}
            onValueChange={(value) =>
              handleInputChange("defaultReminder", parseInt(value))
            }
          >
            <SelectTrigger className="bg-surface-subtle border-border text-foreground h-9 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-surface-subtle border-border text-foreground">
              <SelectItem value="0" className="focus:bg-surface-hover">
                At time of activity
              </SelectItem>
              <SelectItem value="5" className="focus:bg-surface-hover">
                5 minutes before
              </SelectItem>
              <SelectItem value="15" className="focus:bg-surface-hover">
                15 minutes before
              </SelectItem>
              <SelectItem value="30" className="focus:bg-surface-hover">
                30 minutes before
              </SelectItem>
              <SelectItem value="60" className="focus:bg-surface-hover">
                1 hour before
              </SelectItem>
              <SelectItem value="1440" className="focus:bg-surface-hover">
                1 day before
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full bg-surface-subtle border-border text-muted-foreground hover:text-foreground h-9"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Add Custom Reminder
        </Button>
      </div>
    </div>
  );
}
