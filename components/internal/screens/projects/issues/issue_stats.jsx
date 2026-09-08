"use client";

import React, { useMemo } from "react";
import {
  CalendarClock,
  CheckCircle2,
  CircleDot,
  ClipboardList,
} from "lucide-react";

import { StatsBar } from "@/components/internal/shared/screen_kit";
import { isDoneStatus } from "@/features/issues/constants";

// "Done" for the stats row means the finished working state.
function isDoneThisWeekStatus(status) {
  return isDoneStatus(status);
}

function isOverdueIssue(issue) {
  if (!issue?.dueDate || isDoneStatus(issue.status)) {
    return false;
  }

  return new Date(issue.dueDate).getTime() < Date.now();
}

// Start of the current calendar week (Monday 00:00 local) for "done this week".
function startOfWeek() {
  const now = new Date();
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return monday;
}

const STAT_META = {
  Total: { icon: ClipboardList },
  Open: { icon: CircleDot },
  Overdue: { icon: CalendarClock },
  "Done this week": { icon: CheckCircle2 },
};

export function IssueStats({ issues = [] }) {
  const stats = useMemo(() => {
    const weekStart = startOfWeek();

    let open = 0;
    let overdue = 0;
    let doneThisWeek = 0;

    for (const issue of issues) {
      if (!isDoneStatus(issue.status)) {
        open += 1;
      }
      if (isOverdueIssue(issue)) {
        overdue += 1;
      }
      if (
        isDoneThisWeekStatus(issue.status) &&
        issue.updatedAt &&
        new Date(issue.updatedAt).getTime() >= weekStart.getTime()
      ) {
        doneThisWeek += 1;
      }
    }

    return { total: issues.length, open, overdue, doneThisWeek };
  }, [issues]);

  const barStats = [
    {
      label: "Total",
      value: String(stats.total),
      footer: `${stats.open} open`,
      icon: STAT_META.Total.icon,
    },
    {
      label: "Open",
      value: String(stats.open),
      footer: "Needs attention",
      icon: STAT_META.Open.icon,
    },
    {
      label: "Overdue",
      value: String(stats.overdue),
      footer: "Past due date",
      icon: STAT_META.Overdue.icon,
    },
    {
      label: "Done this week",
      value: String(stats.doneThisWeek),
      footer: "Completed since Monday",
      icon: STAT_META["Done this week"].icon,
    },
  ];

  return <StatsBar stats={barStats} />;
}
