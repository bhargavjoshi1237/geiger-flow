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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit3 } from "lucide-react";
import { DetailsTab } from "./tabs/details_tab";
import { ScheduleTab } from "./tabs/schedule_tab";
import { SettingsTab } from "./tabs/settings_tab";

const INITIAL_FORM_STATE = {
  // Basic Info
  name: "",
  description: "",
  type: "task",
  
  // Scheduling
  startDate: null,
  startTime: "09:00",
  endDate: null,
  endTime: "10:00",
  allDay: false,
  duration: 60,
  
  // Priority & Status
  priority: "medium",
  status: "todo",
  progress: 0,
  
  // Assignment
  assignees: [],
  teamId: null,
  
  // Tags & Labels
  tags: [],
  
  // Recurrence
  recurrence: "none",
  recurrenceEnd: null,
  recurrenceCount: 10,
  
  // Settings
  isPrivate: false,
  isBillable: true,
  requiresApproval: false,
  autoTrackTime: true,
  isVisibleInCalendar: true,
  
  // Reminders
  reminders: [],
  defaultReminder: 15,
  
  // Connections
  projectId: null,
  milestoneId: null,
  parentActivityId: null,
  dependencies: [],
  
  // Notes
  notes: "",
  
  // Attachments (references)
  attachmentUrls: [],
};

export function AddActivityDialog({
  children,
  activity = null,
  open = false,
  onOpenChange = () => {},
  onSave = () => {},
}) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [internalOpen, setInternalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [loading, setLoading] = useState(false);

  // Use controlled open if provided, otherwise use internal state
  const isControlled = open !== false;
  const dialogOpen = isControlled ? open : internalOpen;
  const dialogOnOpenChange = isControlled
    ? onOpenChange
    : (open) => {
        setInternalOpen(open);
        onOpenChange(open);
      };

  // Reset form when dialog opens/closes or activity changes
  useEffect(() => {
    if (activity) {
      setFormData({
        ...INITIAL_FORM_STATE,
        ...activity,
      });
    } else if (!dialogOpen) {
      setFormData(INITIAL_FORM_STATE);
      setActiveTab("details");
    }
  }, [activity, dialogOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleToggleTag = (tagId) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter((t) => t !== tagId)
        : [...prev.tags, tagId],
    }));
  };

  const handleToggleAssignee = (memberId) => {
    setFormData((prev) => ({
      ...prev,
      assignees: prev.assignees.includes(memberId)
        ? prev.assignees.filter((a) => a !== memberId)
        : [...prev.assignees, memberId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const activityToSave = {
      ...formData,
      id: activity?.id || null,
      createdAt: activity?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await onSave(activityToSave);
    setLoading(false);
    dialogOnOpenChange(false);
    setFormData(INITIAL_FORM_STATE);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={dialogOnOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto bg-[#161616] border-[#2a2a2a] text-[#ededed]">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-xl flex items-center gap-2">
            {activity ? (
              <>
                <Edit3 className="w-4 h-4 text-[#737373]" />
                Edit Activity
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 text-[#737373]" />
                Add New Activity
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-sm">
            {activity
              ? "Update the details and settings for this activity."
              : "Create a new activity with all necessary details."}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-[#202020]">
            <TabsTrigger
              value="details"
              className="data-[state=active]:bg-[#2a2a2a] data-[state=active]:text-white text-sm font-medium"
            >
              Details
            </TabsTrigger>
            <TabsTrigger
              value="schedule"
              className="data-[state=active]:bg-[#2a2a2a] data-[state=active]:text-white text-sm font-medium"
            >
              Schedule
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-[#2a2a2a] data-[state=active]:text-white text-sm font-medium"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4 py-4">
            <DetailsTab 
              formData={formData}
              handleInputChange={handleInputChange}
              handleToggleTag={handleToggleTag}
              handleToggleAssignee={handleToggleAssignee}
            />
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-4 py-4">
            <ScheduleTab 
              formData={formData}
              handleInputChange={handleInputChange}
            />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4 py-4">
            <SettingsTab 
              formData={formData}
              handleInputChange={handleInputChange}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter className="sm:justify-end gap-2 shrink-0 pt-2 border-t border-[#2a2a2a]">
          <Button
            type="button"
            variant="outline"
            onClick={() => dialogOnOpenChange(false)}
            className="text-zinc-400 hover:text-white hover:bg-[#202020] border-[#2a2a2a]"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!formData.name || loading}
            className="bg-[#ededed] text-[#161616] hover:bg-zinc-300 min-w-[120px]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">&#9696;</span>
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
