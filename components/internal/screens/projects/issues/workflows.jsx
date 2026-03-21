"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Play, GitBranch } from "lucide-react";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { IssueItem } from "@/components/ui/issue-item";

export function WorkflowsScreen() {

  return (
    <MainScreenWrapper>
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Issues</h1>
          <p className="text-secondary mt-1">
            Design and manage your automation Issues.
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Create New Workflow
        </Button>
      </div>

      <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-border rounded-lg text-muted">
              <div className="flex flex-col items-center gap-2">
                <GitBranch className="w-12 h-12 opacity-20" />
                 Issues Canvas Placeholder
              </div>  
            </div> */}
    </MainScreenWrapper>
  );
}
