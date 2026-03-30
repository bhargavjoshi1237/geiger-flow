"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Flag, Calendar, CheckCircle2, Circle, Plus } from "lucide-react";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";

const mockMilestones = [
  {
    id: 1,
    title: "Phase 1: Foundation",
    description: "Initial setup and core infrastructure",
    dueDate: "2026-03-15",
    progress: 75,
    status: "in-progress",
    tasks: 12,
    completedTasks: 9,
  },
  {
    id: 2,
    title: "Phase 2: Development",
    description: "Feature implementation and testing",
    dueDate: "2026-04-30",
    progress: 30,
    status: "in-progress",
    tasks: 24,
    completedTasks: 7,
  },
  {
    id: 3,
    title: "Phase 3: Launch",
    description: "Production deployment and monitoring",
    dueDate: "2026-05-15",
    progress: 0,
    status: "pending",
    tasks: 8,
    completedTasks: 0,
  },
];

export function MilestonesScreen() {
  return (
    <MainScreenWrapper>
      <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#e7e7e7]">Milestones</h1>
          <p className="text-[#a3a3a3] mt-1">
            Track key checkpoints in the project and their progress.
          </p>
        </div>
        <Button className="bg-white text-black hover:bg-[#e7e7e7]">
          <Plus className="w-4 h-4 mr-2" />
          New Milestone
        </Button>
      </div>

      <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-[#2a2a2a] rounded-lg text-[#a3a3a3]">
        <div className="flex flex-col items-center gap-2">
          <Flag className="w-12 h-12 opacity-20" />
          <span>Milestones Placeholder</span>
        </div>
      </div>
    </MainScreenWrapper>
  );
}
