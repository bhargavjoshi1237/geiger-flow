"use client";

import React from "react";
import { Button } from "@geiger/ui";
import { Plus, FileText } from "lucide-react";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";

export function LogsScreen() {

  return (
    <MainScreenWrapper>
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Advisory</h1>
          <p className="text-muted-foreground mt-1">
            View & analyze advisory logs about the project and members.
          </p>
        </div>
      </div>

      <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-border rounded-lg text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <FileText className="w-12 h-12 opacity-20" />
          <span>Logs View Placeholder</span>
        </div>
      </div>
    </MainScreenWrapper>
  );
}
