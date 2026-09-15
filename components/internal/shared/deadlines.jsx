import React from "react";
import { Calendar, ChevronRight, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage, Button } from "@geiger/ui";
import { cn } from "@/lib/utils";

// Urgency is derived by the owning screen from days-left; each entry drives the
// badge, the progress accent, and nothing else.
const URGENCY_META = {
  critical: {
    label: "Critical",
    badgeClass: "border-red-500/30 bg-red-500/10 text-red-300",
    barClass: "bg-red-400",
  },
  high: {
    label: "High",
    badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    barClass: "bg-amber-400",
  },
  medium: {
    label: "Medium",
    badgeClass: "border-blue-500/30 bg-blue-500/10 text-blue-300",
    barClass: "bg-blue-400",
  },
  low: {
    label: "Low",
    badgeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    barClass: "bg-emerald-400",
  },
};

function formatDate(value) {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function initials(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "—";
  }
  return parts.slice(0, 2).map((part) => part[0]).join("");
}

// Milestone-backed deadlines passed down from the owning screen — this shared
// section renders only, it never fetches. Each deadline:
// { id, title, date, owner?, ownerAvatarUrl?, progress, doneTasks, totalTasks, urgency, timeLeft }.
export function DeadlinesSection({ deadlines = [], onViewSchedule }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-lg font-semibold text-foreground tracking-tight leading-tight">
            Upcoming Deadlines
          </h2>
          <p className="text-xs text-text-secondary">
            Tasks requiring immediate attention
          </p>
        </div>
        {onViewSchedule ? (
          <Button variant="ghost" size="sm" onClick={onViewSchedule}>
            View Schedule <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        ) : null}
      </div>

      {deadlines.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface-card p-10 text-center">
          <Calendar className="mx-auto mb-3 h-6 w-6 text-text-tertiary" />
          <p className="text-sm font-medium text-foreground">No deadlines yet</p>
          <p className="mt-1 text-xs text-text-secondary">
            Milestones with target dates will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {deadlines.map((deadline) => {
            const urgency = URGENCY_META[deadline.urgency] || URGENCY_META.low;
            const progress = Math.max(0, Math.min(100, deadline.progress ?? 0));

            return (
              <div
                key={deadline.id}
                className="flex flex-col rounded-xl border border-border bg-surface-card transition-colors hover:border-border-strong"
              >
                <div className="space-y-4 p-5 pb-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "rounded border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                        urgency.badgeClass,
                      )}
                    >
                      {urgency.label} Priority
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">
                      {progress}%
                    </span>
                  </div>
                  <p className="truncate text-base font-medium text-foreground">
                    {deadline.title}
                  </p>
                </div>

                <div className="flex-1 space-y-3 p-5 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      Time Left
                    </span>
                    <span className="text-foreground">{deadline.timeLeft || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      Due Date
                    </span>
                    <span className="text-foreground">{formatDate(deadline.date)}</span>
                  </div>

                  <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-surface-hover">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", urgency.barClass)}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-border p-5 py-3">
                  {deadline.owner ? (
                    <div className="flex min-w-0 items-center gap-2">
                      <Avatar className="h-6 w-6 bg-surface-strong ring-1 ring-ring">
                        {deadline.ownerAvatarUrl ? (
                          <AvatarImage
                            src={deadline.ownerAvatarUrl}
                            alt={deadline.owner}
                          />
                        ) : null}
                        <AvatarFallback className="bg-surface-strong text-[9px] font-medium uppercase text-foreground">
                          {initials(deadline.owner)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate text-xs text-text-secondary">
                        {deadline.owner}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-text-tertiary">Unassigned</span>
                  )}
                  <span className="shrink-0 text-[11px] text-text-secondary">
                    {deadline.doneTasks ?? 0}/{deadline.totalTasks ?? 0} tasks
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
