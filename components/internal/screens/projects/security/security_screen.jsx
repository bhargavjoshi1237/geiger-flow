"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Shield, Settings } from "lucide-react";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";

export function SecurityScreen() {
  return (
    <MainScreenWrapper>
      <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#e7e7e7]">Security</h1>
          <p className="text-[#a3a3a3] mt-1">
            Monitor project security status, access logs, and team permissions.
          </p>
        </div>  
      </div>

      <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-[#2a2a2a] rounded-lg text-[#a3a3a3]">
        <div className="flex flex-col items-center gap-2">
          <Shield className="w-12 h-12 opacity-20" />
          <span>Security Placeholder</span>
        </div>
      </div>
    </MainScreenWrapper>
  );
}
