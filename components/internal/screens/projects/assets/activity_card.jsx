"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@geiger/ui";
import { Clock, CloudUpload } from "lucide-react";
import { typeIcons, typeColors } from "./data";

// activities: [{ id, mediaType, file, user, time }] — derived in assets_screen
// from the created_at ordering of the fetched rows (newest first).
export function ActivityCard({ activities = [] }) {
  return (
    <Card className="bg-surface-subtle border-border text-foreground hover:border-border-strong transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <CardDescription className="text-xs text-text-tertiary flex items-center gap-1">
            <Clock className="w-4 h-4 text-text-tertiary" />
            Latest uploads
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <div className="rounded-md border border-dashed border-border p-4 text-center">
            <CloudUpload className="mx-auto h-5 w-5 text-text-tertiary" />
            <p className="mt-3 text-sm text-muted-foreground">
              No activity yet. Uploaded assets will show up here.
            </p>
          </div>
        ) : (
          activities.map((activity) => {
            const Icon = typeIcons[activity.mediaType];
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-md bg-surface-active flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className={"w-3.5 h-3.5 " + (typeColors[activity.mediaType] ?? "text-text-secondary")} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">
                    <span className="text-muted-foreground">{activity.action}</span> {activity.file}
                  </p>
                  <p className="text-xs text-text-tertiary mt-0.5 truncate">
                    {activity.user} · {activity.time}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
