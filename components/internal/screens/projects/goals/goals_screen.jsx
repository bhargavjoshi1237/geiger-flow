"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Target } from "lucide-react";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";

export function GoalsScreen() {

  return (
    <MainScreenWrapper>
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Goals</h1>
          <p className="text-secondary mt-1">
            Define and track key business goals for this project.
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Define New Goal
        </Button>
      </div>

      <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-border rounded-lg text-muted">
        <div className="flex flex-col items-center gap-2">
          <Target className="w-12 h-12 opacity-20" />
          <span>Goals Are Mainly Assigned As Collection Of Tasks On A Team or Colection of People.</span>
        </div>
      </div>
    </MainScreenWrapper>
  );
}