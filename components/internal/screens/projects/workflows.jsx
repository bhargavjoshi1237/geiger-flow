"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Play } from "lucide-react";

export function WorkflowsScreen() {
  return (
    <div className="space-y-6 w-full px-2 lg:px-0 lg:max-w-[75%] mx-auto">
      <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#e7e7e7]">Workflows</h1>
          <p className="text-[#a3a3a3] mt-1">
            Design and manage your automation workflows.
          </p>
        </div>
        <Button className="bg-white text-black hover:bg-[#e7e7e7]">
          <Plus className="w-4 h-4 mr-2" />
          Create New Workflow
        </Button>
      </div>

      <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-[#2a2a2a] rounded-lg text-[#a3a3a3]">
        Workflow Canvas Placeholder
      </div>
    </div>
  );
}
