"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  PRIORITY_MAP,
  WORKFLOW_STATE_MAP,
  toLinearPriority,
  toLinearStatus,
} from "./constants";

// Linear's workflow glyphs. Every state is the same 14px circle: a 1.5px ring
// plus an inner r=3 circle whose stroke-dasharray is driven to the state's
// completion fraction, which is how Linear renders the "pie" fill.
const STATE_FILL = {
  backlog: 0,
  todo: 0,
  in_progress: 0.5,
  in_review: 0.75,
  done: 1,
  canceled: 0,
  duplicate: 0,
};

const PIE_CIRCUMFERENCE = 2 * Math.PI * 3;

export function StatusIcon({ status, className, style, ...props }) {
  const state = toLinearStatus(status);
  const meta = WORKFLOW_STATE_MAP[state];
  const color = meta?.color ?? "var(--lnr-todo)";
  const fill = STATE_FILL[state] ?? 0;

  return (
    <svg
      viewBox="0 0 14 14"
      width="14"
      height="14"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      style={{ color, ...style }}
      {...props}
    >
      {state === "backlog" ? (
        <circle
          cx="7"
          cy="7"
          r="6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="1.6 1.8"
        />
      ) : state === "done" || state === "canceled" || state === "duplicate" ? (
        <circle cx="7" cy="7" r="7" fill="currentColor" />
      ) : (
        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
      )}

      {fill > 0 && fill < 1 ? (
        <circle
          cx="7"
          cy="7"
          r="3"
          stroke="currentColor"
          strokeWidth="6"
          strokeDasharray={`${PIE_CIRCUMFERENCE * fill} ${PIE_CIRCUMFERENCE}`}
          transform="rotate(-90 7 7)"
        />
      ) : null}

      {state === "done" ? (
        <path
          d="M4 7.2 6.1 9.3 10 5"
          stroke="#fff"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
      {state === "canceled" ? (
        <path
          d="M4.7 4.7 9.3 9.3M9.3 4.7 4.7 9.3"
          stroke="#fff"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      ) : null}
      {state === "duplicate" ? (
        <path d="M4.4 7h5.2" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      ) : null}
    </svg>
  );
}

// Priority is a 3-bar signal meter; Urgent breaks the pattern with a filled
// orange tile, and No priority degrades to three flat dashes.
const PRIORITY_BARS = { high: 3, medium: 2, low: 1, none: 0, urgent: 3 };
const BAR_GEOMETRY = [
  { x: 1.5, y: 8, height: 5 },
  { x: 6, y: 5, height: 8 },
  { x: 10.5, y: 2, height: 11 },
];

export function PriorityIcon({ priority, className, style, ...props }) {
  const value = toLinearPriority(priority);
  const filled = PRIORITY_BARS[value] ?? 0;

  if (value === "urgent") {
    return (
      <svg
        viewBox="0 0 16 16"
        width="16"
        height="16"
        aria-hidden="true"
        className={cn("shrink-0", className)}
        style={{ color: "var(--lnr-urgent)", ...style }}
        {...props}
      >
        <rect x="1" y="1" width="14" height="14" rx="3" fill="currentColor" />
        <rect x="7" y="4" width="2" height="5" rx="1" fill="#fff" />
        <rect x="7" y="10.5" width="2" height="2" rx="1" fill="#fff" />
      </svg>
    );
  }

  if (value === "none") {
    return (
      <svg
        viewBox="0 0 16 16"
        width="16"
        height="16"
        aria-hidden="true"
        className={cn("shrink-0", className)}
        style={{ color: "var(--lnr-ink-tertiary)", ...style }}
        {...props}
      >
        {[3.5, 7, 10.5].map((y) => (
          <rect key={y} x="1.5" y={y} width="13" height="1.5" rx="0.75" fill="currentColor" />
        ))}
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      style={{ color: "var(--lnr-ink-subtle)", ...style }}
      {...props}
    >
      {BAR_GEOMETRY.map((bar, index) => (
        <rect
          key={bar.x}
          x={bar.x}
          y={bar.y}
          width="4"
          height={bar.height}
          rx="1"
          fill="currentColor"
          opacity={index < filled ? 1 : 0.24}
        />
      ))}
    </svg>
  );
}

export function statusLabel(status) {
  return WORKFLOW_STATE_MAP[toLinearStatus(status)]?.label ?? "Backlog";
}

export function priorityLabel(priority) {
  return PRIORITY_MAP[toLinearPriority(priority)]?.label ?? "No priority";
}

// Circular completion ring used by cycles, projects and the roadmap.
export function ProgressRing({ value = 0, size = 14, stroke = 2.5, className }) {
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="var(--lnr-border-strong)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="var(--lnr-accent)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${(circumference * clamped) / 100} ${circumference}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}
