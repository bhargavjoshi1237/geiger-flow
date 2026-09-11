"use client";

import React from "react";
import { Unplug } from "lucide-react";
import { EmptyState, SectionCard } from "@/components/internal/shared/screen_kit";

export function ConnectionsScreen({ connections = [] }) {
  return (
    <SectionCard
      title="Connected services"
      description="Repositories, CI providers, and other services wired into this project."
      bare
    >
      {connections.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface-subtle">
          <EmptyState
            icon={Unplug}
            title="No connections yet"
            description="Once a service is connected to this project it will be listed here."
          />
        </div>
      ) : null}
    </SectionCard>
  );
}
