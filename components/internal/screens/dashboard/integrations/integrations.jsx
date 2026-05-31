"use client";

import React from "react";
import { Plug } from "lucide-react";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";

export function IntegrationsScreen({ integrations = [] }) {
  return (
    <MainScreenWrapper className="flex flex-col gap-10 space-y-0 text-[#e7e7e7]">
      <div className="flex flex-col gap-4 border-b border-[#2a2a2a] pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-[#e7e7e7] tracking-tight">
            Integrations
          </h1>
          <p className="text-[#a3a3a3] text-sm mt-1">
            Connect workspace tools and manage external services.
          </p>
        </div>
      </div>

      {integrations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#2a2a2a] bg-[#202020] p-12 text-center">
          <Plug className="mx-auto mb-3 h-7 w-7 text-[#525252]" />
          <p className="text-sm font-medium text-[#e7e7e7]">No integrations configured</p>
          <p className="mt-1 text-xs text-[#737373]">
            Integration data will load here from the backend.
          </p>
        </div>
      ) : null}
    </MainScreenWrapper>
  );
}
