"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Play, GitBranch } from "lucide-react";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { AddActivityDialog } from "@/components/internal/dilouges/activities/add_activity_dilouge";

export function WorkflowsScreen() {
  const handleSaveActivity = async (activity) => {
    console.log("Saving workflow activity:", activity);
    // Add your save logic here
  };

  return (
    <MainScreenWrapper>
      <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#e7e7e7]">Issues</h1>
          <p className="text-[#a3a3a3] mt-1">
            Design and manage your automation Issues.
          </p>
        </div>
        <AddActivityDialog onSave={handleSaveActivity}>
          <Button className="bg-white text-black hover:bg-[#e7e7e7]">
            <Plus className="w-4 h-4 mr-2" />
            Create New Workflow
          </Button>
        </AddActivityDialog>
      </div>

      <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-[#2a2a2a] rounded-lg text-[#a3a3a3]">
              <div className="flex flex-col items-center gap-2">
                <GitBranch className="w-12 h-12 opacity-20" />
                 Issues Canvas Placeholder
              </div>
            </div>
    </MainScreenWrapper>
  );
}
