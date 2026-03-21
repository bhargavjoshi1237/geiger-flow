"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, CheckSquare } from "lucide-react";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";

export function TasksScreen() {

  return (
    <MainScreenWrapper>
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Tasks</h1>
          <p className="text-secondary mt-1">
            Manage and track your project tasks.
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Create New Task
        </Button>
      </div>

      <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-border rounded-lg text-muted">
        <div className="flex flex-col items-center gap-2">
          <CheckSquare className="w-12 h-12 opacity-50 text-muted-foreground" />
          <span className="text-muted-foreground">
            Tasks List Placeholder
          </span>
        </div>
      </div>
    </MainScreenWrapper>
  );
}