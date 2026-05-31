"use client";

import React from "react";
import { Unplug } from "lucide-react";

export function ConnectionsScreen({ connections = [] }) {
  return (
    <div className="my-10 w-full space-y-6">
      {connections.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
          <Unplug className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">No connections configured</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Project connection data will load here from the backend.
          </p>
        </div>
      ) : null}
    </div>
  );
}
