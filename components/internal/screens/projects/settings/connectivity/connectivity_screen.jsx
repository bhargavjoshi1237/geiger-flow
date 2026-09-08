"use client";

import React from "react";
import { Unplug } from "lucide-react";
import {
  EmptyState,
  SectionCard,
} from "@/components/internal/shared/screen_kit";

export function ConnectivityScreen({ integrations = [] }) {
  return (
    <SectionCard
      title="Connectivity"
      description="Connect external services and manage project integrations."
      bare
    >
      {integrations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface-subtle">
          <EmptyState
            icon={Unplug}
            title="No integrations connected"
            description="Connectivity data will appear here after backend fetching is connected."
          />
        </div>
      ) : null}
    </SectionCard>
  );
}
