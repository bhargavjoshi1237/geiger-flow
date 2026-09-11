import React from "react";
import { Calendar } from "lucide-react";

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

// Milestone-backed deadlines passed down from the owning screen — this shared
// section renders only, it never fetches. Each deadline: { id, title, date,
// owner? }.
export function DeadlinesSection({ deadlines = [] }) {
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
        <ul className="divide-y divide-border rounded-2xl border border-border bg-surface-card">
          {deadlines.map((deadline) => (
            <li
              key={deadline.id}
              className="flex items-center gap-3 px-4 py-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-subtle">
                <Calendar className="h-4 w-4 text-text-secondary" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {deadline.title}
                </p>
                {deadline.owner ? (
                  <p className="mt-0.5 truncate text-xs text-text-secondary">
                    {deadline.owner}
                  </p>
                ) : null}
              </div>
              <span className="shrink-0 text-xs text-text-secondary">
                {formatDate(deadline.date)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
