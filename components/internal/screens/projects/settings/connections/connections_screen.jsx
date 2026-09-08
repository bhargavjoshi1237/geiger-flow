"use client";

import React from "react";
import { Unplug } from "lucide-react";
import { EmptyState } from "@/components/internal/shared/screen_kit";

export function ConnectionsScreen({ connections = [] }) {
  return (
    <div className="my-10 w-full space-y-6">
      {connections.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface-subtle">
          <EmptyState
            icon={Unplug}
            title="No connections configured"
            description="Project connection data will load here from the backend."
          />
        </div>
      ) : null}
    </div>
  );
}
