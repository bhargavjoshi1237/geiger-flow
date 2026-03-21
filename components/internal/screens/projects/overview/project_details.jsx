"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, Activity, Sparkles, Bug, GitMerge, ChevronRight } from "lucide-react";
import { useProject } from "@/context/project-context";
import { DeadlinesSection } from "@/components/internal/shared/deadlines";
import { useBanner } from "@/context/banner-context";
import { useEffect } from "react";
import { LineChart, Line } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import FilterDropdown from "./filter_dropdown";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { IssueItem } from "@/components/ui/issue-item";

function MetricCard({ title, subtitle, value, data }) {
  const chartData =
    data && data.length > 0
      ? data.map((v, i) => ({ value: v, time: i }))
      : Array.from({ length: 11 }).map((_, i) => ({ value: 0, time: i }));

  const chartConfig = {
    value: {
      label: title,
      color: "#10b981",
    },
  };

  return (
    <Card className="bg-surface-elevated border-subtle text-primary overflow-hidden group hover:border-emphasis transition-all duration-300">
      <CardHeader className="pb-2 space-y-1">
        <div className="flex items-center gap-2 text-text-tertiary">
          <div className="w-5 h-5 rounded bg-surface-active flex items-center justify-center">
            {title === "Productivity" && (
              <Activity className="w-3 h-3 text-text-muted" />
            )}
            {title === "New Features" && (
              <Sparkles className="w-3 h-3 text-text-muted" />
            )}
            {title === "Issues Solved" && (
              <Bug className="w-3 h-3 text-text-muted" />
            )}
            {title === "PR Merged" && (
              <GitMerge className="w-3 h-3 text-text-muted" />
            )}
          </div>
          <span className="text-sm font-medium">{title}</span>
        </div>
        <p className="text-xs text-zinc-500">{subtitle}</p>
        <div className="text-2xl font-bold mt-1">{value}</div>
      </CardHeader>
      <CardContent className="p-0 h-32 relative transition-colors -mb-2">
        <div className="absolute inset-0 flex items-end">
          <ChartContainer
            config={chartConfig}
            className="w-[90%] mx-auto mb-6 h-full"
          >
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
            >
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--color-value)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </div>
        <div className="absolute bottom-2 left-4 text-[10px] text-zinc-600 flex justify-between w-[calc(100%-32px)]">
          <span>Mar 1, 8:06pm</span>
          <span>Mar 1, 9:06pm</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProjectDetailsScreen() {
  const { project } = useProject();
  const { showBanner } = useBanner();
  const [activeIssueTab, setActiveIssueTab] = useState("SECURITY");
  const [filterValue, setFilterValue] = useState("1w");
  
  console.log("Current filter value:", filterValue);

  useEffect(() => {
    if (window.location.pathname === "/") {
      showBanner({
        message: "Geiger is currently in development (Pre-alpha preview).",
        type: "info",
        isSticky: true,
      });
    }
  }, [showBanner]);

  const databaseData = [2, 10, 5, 25, 8, 30, 2, 15, 5, 40, 2];
  const authData = [5, 15, 2, 20, 10, 35, 5, 25, 2, 45, 5];

  return (
    <MainScreenWrapper>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mt-2 gap-4">
        <div className="flex items-center justify-center md:justify-start gap-3 w-full md:w-auto text-center md:text-left">
          <h1 className="text-2xl font-bold text-primary tracking-tight">
            {project?.name}
          </h1>
          <span className="bg-surface text-text-muted text-[9px] px-1.5 py-0.5 rounded border border-subtle font-mono tracking-widest shrink-0">
            NANO
          </span>
        </div>
        <div className="w-full md:w-auto">
          <div className="flex w-full md:w-auto md:gap-0">
            <div className="flex-1 md:flex-none flex flex-col items-center md:pr-8">
              <span className="text-text-muted text-[11px] uppercase tracking-wider font-medium">
                Members
              </span>
              <span className="text-primary font-bold text-2xl mt-0.5">6</span>
            </div>
            <div className="flex-1 md:flex-none flex flex-col items-center border-l border-subtle md:px-8">
              <span className="text-text-muted text-[11px] uppercase tracking-wider font-medium">
                Goals
              </span>
              <span className="text-primary font-bold text-2xl mt-0.5">0</span>
            </div>
            <div className="flex-1 md:flex-none flex flex-col items-center border-l border-subtle md:pl-8">
              <span className="text-text-muted text-[11px] uppercase tracking-wider font-medium">
                Milestones
              </span>
              <span className="text-primary font-bold text-2xl mt-0.5">0</span>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full mt-2 mb-6 md:mb-6">
        <p className="text-zinc-500 text-sm text-center md:text-left">
          Geiger Flow Lightweight creative project manager. Kanban, Timeline
          view, Process, End Node Progress Hiring Templets , Project Templets
          Staging. Milestones. Comments/Discussions , Dropdown Stack of Nodes
        </p>
      </div>
      <div className="pt-4 border-t border-border-default">
        <FilterDropdown
          value={filterValue}
          onValueChange={setFilterValue}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          title="Productivity"
          subtitle="Development activity"
          value="2"
          data={databaseData}
        />
        <MetricCard
          title="New Features"
          subtitle="Feature velocity"
          value="2"
          data={authData}
        />
        <MetricCard
          title="Issues Solved"
          subtitle="Bug resolutions"
          value="0"
          data={[]}
        />
        <MetricCard
          title="PR Merged"
          subtitle="Code contributions"
          value="0"
          data={[]}
        />
      </div>

      {/* Deadlines Section */}
      <DeadlinesSection />

      {/* Top Issues Section */}
      <div className="py-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="px-1">
            <h2 className="text-lg font-semibold text-primary tracking-tight leading-tight">
              Top Issues
            </h2>
            <p className="text-xs text-text-muted">
              Tasks requiring immediate attention
            </p>
          </div>
          <button className="text-xs font-medium text-text-muted hover:text-primary px-3 py-1.5 rounded-lg transition-colors hover:border-emphasis flex items-center gap-2">
          View Issues <ChevronRight className="w-3 h-3" />
        </button>
        </div>
        <div className="space-y-2">
          <IssueItem
            title="API response time exceeding 500ms on /users endpoint"
            severity="critical"
            status="open"
            assignee="Alex M."
            dueDate="Today"
          />
          <IssueItem
            title="Memory leak in websocket connection handler"
            severity="critical"
            status="in_progress"
            assignee="Sarah J."
            dueDate="Tomorrow"
          />
          <IssueItem
            title="Database connection pool exhaustion"
            severity="high"
            status="open"
            assignee="Mike T."
            dueDate="Mar 10"
          />
          <IssueItem
            title="Authentication token refresh failing intermittently"
            severity="high"
            status="in_progress"
            assignee="Lisa K."
            dueDate="Mar 12"
          />
          <IssueItem
            title="Frontend build size exceeds 2MB limit"
            severity="medium"
            status="resolved"
            assignee="Chris P."
            dueDate="Mar 8"
          />
        </div>
      </div>
    </MainScreenWrapper>
  );
}
