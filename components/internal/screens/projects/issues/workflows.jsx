"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Play, GitBranch } from "lucide-react";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { IssueItem } from "@/components/ui/issue-item";

export function WorkflowsScreen() {

  return (
    <MainScreenWrapper>
      <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#e7e7e7]">Issues</h1>
          <p className="text-[#a3a3a3] mt-1">
            Design and manage your automation Issues.
          </p>
        </div>
        <Button className="bg-white text-black hover:bg-[#e7e7e7]">
            <Plus className="w-4 h-4 mr-2" />
            Create New Issue
          </Button>
      </div>
      
  <div className="space-y-2">
          <IssueItem
            title="API response time exceeding 500ms on /users endpoint"
            severity="critical"
            status="open"
            assignee="Alex M."
            dueDate="Today"
          />
          <IssueItem
            title="Memory leak in websocket connection handler"
            severity="critical"
            status="in_progress"
            assignee="Sarah J."
            dueDate="Tomorrow"
          />
          <IssueItem
            title="Database connection pool exhaustion"
            severity="high"
            status="open"
            assignee="Mike T."
            dueDate="Mar 10"
          />
          <IssueItem
            title="Authentication token refresh failing intermittently"
            severity="high"
            status="in_progress"
            assignee="Lisa K."
            dueDate="Mar 12"
          />
          <IssueItem
            title="Frontend build size exceeds 2MB limit"
            severity="medium"
            status="resolved"
            assignee="Chris P."
            dueDate="Mar 8"
          />
           <IssueItem
            title="Database connection pool exhaustion"
            severity="high"
            status="open"
            assignee="Mike T."
            dueDate="Mar 10"
          />
          <IssueItem
            title="Authentication token refresh failing intermittently"
            severity="high"
            status="in_progress"
            assignee="Lisa K."
            dueDate="Mar 12"
          />
          <IssueItem
            title="Frontend build size exceeds 2MB limit"
            severity="medium"
            status="resolved"
            assignee="Chris P."
            dueDate="Mar 8"
          />
        </div>
      {/* <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-[#2a2a2a] rounded-lg text-[#a3a3a3]">
              <div className="flex flex-col items-center gap-2">
                <GitBranch className="w-12 h-12 opacity-20" />
                 Issues Canvas Placeholder
              </div>  
            </div> */}
    </MainScreenWrapper>
  );
}
