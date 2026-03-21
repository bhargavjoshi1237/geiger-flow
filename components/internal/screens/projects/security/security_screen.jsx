"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Shield, Settings } from "lucide-react";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";

export function SecurityScreen() {
  return (
    <MainScreenWrapper>
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Security</h1>
          <p className="text-secondary mt-1">
            Monitor project security status, access logs, and team permissions.
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Settings className="w-4 h-4 mr-2" />
          Security Settings
        </Button>
      </div>

      <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-border rounded-lg text-muted">
        <div className="flex flex-col items-center gap-2">
          <Shield className="w-12 h-12 opacity-20" />
          <span>Security Placeholder</span>
        </div>
      </div>
    </MainScreenWrapper>
  );
}
