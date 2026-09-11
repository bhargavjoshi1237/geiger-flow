"use client";

import React from "react";
import { Plug } from "lucide-react";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { ScreenHeader } from "@/components/internal/shared/screen_kit";

export function IntegrationsScreen({ integrations = [] }) {
  return (
    <MainScreenWrapper className="flex flex-col gap-10 space-y-0 text-foreground">
      <ScreenHeader
        title="Integrations"
        description="Connect workspace tools and manage external services."
      />

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
