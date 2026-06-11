"use client";

import React from "react";
import { Unplug } from "lucide-react";

export function ConnectivityScreen({ integrations = [] }) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-foreground">Connectivity</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect external services and manage project integrations.
        </p>
      </div>

      {integrations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface-subtle p-10 text-center">
          <Unplug className="mx-auto mb-3 h-6 w-6 text-text-tertiary" />
          <p className="text-sm font-medium text-foreground">No integrations connected</p>
          <p className="mt-1 text-xs text-text-secondary">
            Connectivity data will appear here after backend fetching is connected.
          </p>
        </div>
      ) : null}
    </div>
  );
}
