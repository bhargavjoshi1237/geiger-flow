"use client";

import React, { useMemo, useState } from "react";
import { Box, Repeat, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatShortDate } from "../constants";
import { cycleStats } from "../grouping";
import { ProgressRing } from "../icons";
import { HeaderButton, ViewHeader } from "../view_header";
import { projectStats } from "./projects";
import { useTracker } from "../use_tracker";

// Linear's roadmap: every project and cycle laid out as a bar across a shared
// timeline, so overlapping work and slipping target dates are visible at a
// glance. Range is quarters or months; today is a vertical marker.
//
// The chart scrolls horizontally rather than reflowing — a Gantt has no useful
// narrow form. `--lnr-roadmap-label` is the frozen label column's width; the
// today marker offsets by it, so the two can never drift apart.

const MS_PER_DAY = 86400000;

function buildTimeline(items, months) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + months - 1, 1);
  const span = Math.max(1, end - start);

  const columns = [];
  for (let index = 0; index < months; index += 1) {
    const at = new Date(start.getFullYear(), start.getMonth() + index, 1);
    columns.push({
      key: at.toISOString(),
      label: at.toLocaleDateString("en-US", { month: "short" }),
      year: at.getFullYear(),
      left: ((at - start) / span) * 100,
    });
  }

  const bars = items.map((item) => {
    const from = item.start ? new Date(item.start) : start;
    const to = item.end ? new Date(item.end) : new Date(from.getTime() + 30 * MS_PER_DAY);
    const left = Math.max(0, ((from - start) / span) * 100);
    const right = Math.min(100, ((to - start) / span) * 100);
    return { ...item, left, width: Math.max(2, right - left), overdue: to < now && item.progress < 100 };
  });

  return { columns, bars, todayLeft: ((now - start) / span) * 100 };
}

export function InitiativesView({ onSelectProject, onSelectCycle }) {
  const { projects, cycles, issues } = useTracker();
  const [months, setMonths] = useState(6);

  const items = useMemo(() => {
    const fromProjects = projects.map((project) => {
      const stats = projectStats(project, issues);
      return {
        id: `project:${project.id}`,
        entityId: project.id,
        kind: "project",
        title: project.title,
        start: project.startDate || project.createdAt,
        end: project.targetDate,
        progress: stats.progress,
        detail: `${stats.completed}/${stats.total} issues`,
      };
    });

    const fromCycles = cycles.map((cycle) => {
      const stats = cycleStats(cycle, issues);
      return {
        id: `cycle:${cycle.id}`,
        entityId: cycle.id,
        kind: "cycle",
        title: cycle.title,
        start: cycle.createdAt,
        end: cycle.targetDate,
        progress: stats.progress,
        detail: `${stats.completed}/${stats.total} issues`,
      };
    });

    return [...fromProjects, ...fromCycles].sort(
      (a, b) => new Date(a.start) - new Date(b.start),
    );
  }, [projects, cycles, issues]);

  const { columns, bars, todayLeft } = useMemo(
    () => buildTimeline(items, months),
    [items, months],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ViewHeader
        crumbs={[{ label: "Initiatives", icon: Target }]}
        actions={
          <>
            {[3, 6, 12].map((value) => (
              <HeaderButton
                key={value}
                label={`${value}m`}
                active={months === value}
                onClick={() => setMonths(value)}
              />
            ))}
          </>
        }
      />

      {bars.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <Target className="h-6 w-6 text-[var(--lnr-ink-tertiary)]" />
          <p className="text-[14px] font-medium text-[var(--lnr-ink)]">Nothing on the roadmap</p>
          <p className="max-w-sm text-[13px] text-[var(--lnr-ink-subtle)]">
            Projects and cycles with target dates are laid out here as a timeline.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto lnr-scrollbar">
          <div className="relative min-w-[560px] [--lnr-roadmap-label:150px] sm:min-w-[760px] sm:[--lnr-roadmap-label:240px]">
            {/* Month scale */}
            <div className="sticky top-0 z-10 flex h-8 border-b border-[var(--lnr-border)] bg-[var(--lnr-panel)]">
              <div className="w-[var(--lnr-roadmap-label)] shrink-0 border-r border-[var(--lnr-border)]" />
              <div className="relative flex-1">
                {columns.map((column) => (
                  <span
                    key={column.key}
                    className="absolute top-0 flex h-8 items-center border-l border-[var(--lnr-border)] pl-2 text-[11px] text-[var(--lnr-ink-tertiary)]"
                    style={{ left: `${column.left}%` }}
                  >
                    {column.label}
                  </span>
                ))}
              </div>
            </div>

            {bars.map((bar) => (
              <div
                key={bar.id}
                className="flex border-b border-[var(--lnr-border)] hover:bg-[var(--lnr-hover)]"
              >
                <button
                  type="button"
                  onClick={() =>
                    bar.kind === "project"
                      ? onSelectProject(bar.entityId)
                      : onSelectCycle(bar.entityId)
                  }
                  className="flex w-[var(--lnr-roadmap-label)] shrink-0 items-center gap-2 border-r border-[var(--lnr-border)] px-3 py-2.5 text-left"
                >
                  {bar.kind === "project" ? (
                    <Box className="h-3.5 w-3.5 shrink-0 text-[var(--lnr-accent)]" />
                  ) : (
                    <Repeat className="h-3.5 w-3.5 shrink-0 text-[var(--lnr-started)]" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] text-[var(--lnr-ink)]">
                      {bar.title}
                    </span>
                    <span className="block text-[11px] text-[var(--lnr-ink-tertiary)]">
                      {bar.detail}
                    </span>
                  </span>
                  <ProgressRing value={bar.progress} size={14} />
                </button>

                <div className="relative flex-1 py-2.5">
                  {columns.map((column) => (
                    <span
                      key={column.key}
                      className="absolute inset-y-0 border-l border-[var(--lnr-border)]"
                      style={{ left: `${column.left}%` }}
                    />
                  ))}
                  <div
                    title={`${bar.title} · ${bar.progress}%${
                      bar.end ? ` · ends ${formatShortDate(bar.end)}` : ""
                    }`}
                    className={cn(
                      "relative h-5 overflow-hidden rounded-full border",
                      bar.overdue
                        ? "border-[var(--lnr-urgent)] bg-[color-mix(in_srgb,var(--lnr-urgent)_18%,transparent)]"
                        : "border-[var(--lnr-border-strong)] bg-[var(--lnr-elevated)]",
                    )}
                    style={{ marginLeft: `${bar.left}%`, width: `${bar.width}%` }}
                  >
                    <span
                      className="absolute inset-y-0 left-0 bg-[var(--lnr-accent)] opacity-70"
                      style={{ width: `${bar.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Today marker */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 w-px bg-[var(--lnr-accent)]"
              style={{
                left: `calc(
                  var(--lnr-roadmap-label) +
                  (100% - var(--lnr-roadmap-label)) * ${todayLeft / 100}
                )`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
