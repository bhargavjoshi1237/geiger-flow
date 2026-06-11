"use client";

import React from "react";
import { Plug } from "lucide-react";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";

export function IntegrationsScreen({ integrations = [] }) {
  return (
    <MainScreenWrapper className="flex flex-col gap-10 space-y-0 text-foreground">
      <div className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
            Integrations
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Connect workspace tools and manage external services.
          </p>
        </div>
      </div>

      {integrations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface-card p-12 text-center">
          <Plug className="mx-auto mb-3 h-7 w-7 text-text-tertiary" />
          <p className="text-sm font-medium text-foreground">No integrations configured</p>
          <p className="mt-1 text-xs text-text-secondary">
            Integration data will load here from the backend.
          </p>
        </div>
      ) : null}
    </MainScreenWrapper>
  );
}
