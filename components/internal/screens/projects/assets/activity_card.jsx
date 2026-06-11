"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle,CardDescription } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { recentActivities } from "./data";

export function ActivityCard() {
  return (
    <Card className="bg-surface-subtle border-border text-foreground hover:border-border-strong transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Recent Activity</CardTitle>
          <CardDescription className="text-xs text-text-tertiary flex items-center gap-1">
            <Clock className="w-4 h-4 text-text-tertiary" />
            In Last 24 hours
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentActivities.map((activity, i) => {
          const Icon = activity.icon;
          return (
            <div key={i} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-md bg-surface-active flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-3.5 h-3.5 text-text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">
                  <span className="text-muted-foreground">{activity.action}</span> {activity.file}
                </p>
                <p className="text-xs text-text-tertiary mt-0.5">
                  {activity.user} · {activity.time}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
