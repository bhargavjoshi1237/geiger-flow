"use client";

import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { AddActivityDialog } from "@/components/internal/dilouges/activities/add_activity_dilouge";
import { cn } from "@/lib/utils";

const TABS = ["All", "Shared", "Public", "Archived"];
const TAB_KEYS = ["all events", "shared", "public", "archived"];

// ─── Sample events – January 2025 (matching reference screenshot) ──────────────
const SAMPLE_EVENTS = [
  // ═══════════════════════════════════════════════════════════════════════════
  // SINGLE DAY ACTIVITIES (events that occur within one day)
  // ═══════════════════════════════════════════════════════════════════════════
  
  // ── Dec 30 ──────────────────────────────────────────────────────────────────
  { id: "d30-1", title: "Monday standup",         start: "2024-12-30T09:00", end: "2024-12-30T09:30",  type: "standup"    },
  { id: "d30-2", title: "Coffee with Ali",         start: "2024-12-30T11:30", end: "2024-12-30T12:00",  type: "coffee"     },
  { id: "d30-3", title: "Marketing site review",  start: "2024-12-30T14:30", end: "2024-12-30T15:30",  type: "marketing"  },
  { id: "d30-4", title: "Product sync",           start: "2024-12-30T16:00", end: "2024-12-30T17:00",  type: "meeting"    },
  { id: "d30-5", title: "Design review",          start: "2024-12-30T17:00", end: "2024-12-30T18:00",  type: "design"     },
  // ── Dec 31 ──────────────────────────────────────────────────────────────────
  { id: "d31-1", title: "Monday standup",         start: "2024-12-31T09:00", end: "2024-12-31T09:30",  type: "standup"    },
  // ── Jan 2 ───────────────────────────────────────────────────────────────────
  { id: "j2-1",  title: "One-on-one w/ Alex",     start: "2025-01-02T10:00", end: "2025-01-02T10:30",  type: "meeting"    },
  { id: "j2-2",  title: "All-hands meeting",      start: "2025-01-02T16:00", end: "2025-01-02T17:00",  type: "meeting"    },
  { id: "j2-3",  title: "Dinner with the team",   start: "2025-01-02T18:30", end: "2025-01-02T20:00",  type: "personal"   },
  // ── Jan 3 ───────────────────────────────────────────────────────────────────
  { id: "j3-1",  title: "Friday standup",         start: "2025-01-03T09:00", end: "2025-01-03T09:30",  type: "standup"    },
  // ── Jan 5 ───────────────────────────────────────────────────────────────────
  { id: "j5-1",  title: "House inspection",       start: "2025-01-05T10:30", end: "2025-01-05T12:00",  type: "inspection" },
  // ── Jan 6 ───────────────────────────────────────────────────────────────────
  { id: "j6-1",  title: "Monday standup",         start: "2025-01-06T09:00", end: "2025-01-06T09:30",  type: "standup"    },
  { id: "j6-2",  title: "Content planning",       start: "2025-01-06T11:00", end: "2025-01-06T12:00",  type: "planning"   },
  // ── Jan 7 ───────────────────────────────────────────────────────────────────
  { id: "j7-1",  title: "One-on-one w/ Blake",    start: "2025-01-07T10:00", end: "2025-01-07T10:30",  type: "meeting"    },
  { id: "j7-2",  title: "Catch up w/ Ali",        start: "2025-01-07T14:30", end: "2025-01-07T15:00",  type: "coffee"     },
  // ── Jan 8 ───────────────────────────────────────────────────────────────────
  { id: "j8-1",  title: "Deep work",              start: "2025-01-08T09:00", end: "2025-01-08T12:00",  type: "work"       },
  { id: "j8-2",  title: "Design sync",            start: "2025-01-08T10:30", end: "2025-01-08T11:00",  type: "design"     },
  { id: "j8-3",  title: "SEO planning",           start: "2025-01-08T13:30", end: "2025-01-08T14:30",  type: "planning"   },
  { id: "j8-4",  title: "Growth review",          start: "2025-01-08T15:00", end: "2025-01-08T16:00",  type: "meeting"    },
  { id: "j8-5",  title: "1:1 Jamie",              start: "2025-01-08T16:30", end: "2025-01-08T17:00",  type: "meeting"    },
  { id: "j8-6",  title: "Roadmap planning",       start: "2025-01-08T17:00", end: "2025-01-08T18:00",  type: "planning"   },
  // ── Jan 9 ───────────────────────────────────────────────────────────────────
  { id: "j9-1",  title: "Lunch with the crew",    start: "2025-01-09T12:00", end: "2025-01-09T13:00",  type: "lunch"      },
  // ── Jan 10 ──────────────────────────────────────────────────────────────────
  { id: "j10-1", title: "Friday standup",         start: "2025-01-10T09:00", end: "2025-01-10T09:30",  type: "standup"    },
  { id: "j10-2", title: "Olivia x Riley",         start: "2025-01-10T10:00", end: "2025-01-10T10:30",  type: "meeting"    },
  { id: "j10-3", title: "Product demo",           start: "2025-01-10T13:30", end: "2025-01-10T14:30",  type: "meeting"    },
  // ── Jan 11 ──────────────────────────────────────────────────────────────────
  { id: "j11-1", title: "House inspection",       start: "2025-01-11T11:00", end: "2025-01-11T12:30",  type: "inspection" },
  // ── Jan 12 ──────────────────────────────────────────────────────────────────
  { id: "j12-1", title: "Ava's engagement",       start: "2025-01-12T13:00", end: "2025-01-12T15:00",  type: "social"     },
  // ── Jan 13 ──────────────────────────────────────────────────────────────────
  { id: "j13-1", title: "Monday standup",         start: "2025-01-13T09:00", end: "2025-01-13T09:30",  type: "standup"    },
  { id: "j13-2", title: "Team lunch",             start: "2025-01-13T12:15", end: "2025-01-13T13:15",  type: "lunch"      },
  // ── Jan 15 ──────────────────────────────────────────────────────────────────
  { id: "j15-1", title: "Product planning",       start: "2025-01-15T09:30", end: "2025-01-15T10:30",  type: "planning"   },
  // ── Jan 17 ──────────────────────────────────────────────────────────────────
  { id: "j17-1", title: "Friday standup",         start: "2025-01-17T09:00", end: "2025-01-17T09:30",  type: "standup"    },
  { id: "j17-2", title: "Coffee w/ Amélie",       start: "2025-01-17T09:30", end: "2025-01-17T10:00",  type: "coffee"     },
  { id: "j17-3", title: "All-hands meeting",      start: "2025-01-17T16:00", end: "2025-01-17T17:00",  type: "meeting"    },
  { id: "j17-4", title: "Design feedback",        start: "2025-01-17T14:30", end: "2025-01-17T15:30",  type: "design"     },
  { id: "j17-5", title: "Sprint planning",        start: "2025-01-17T11:00", end: "2025-01-17T12:00",  type: "planning"   },
  // ── Jan 18 ──────────────────────────────────────────────────────────────────
  { id: "j18-1", title: "Half marathon",          start: "2025-01-18T07:00", end: "2025-01-18T10:00",  type: "exercise"   },
  // ── Jan 20 ──────────────────────────────────────────────────────────────────
  { id: "j20-1", title: "Monday standup",         start: "2025-01-20T09:00", end: "2025-01-20T09:30",  type: "standup"    },
  { id: "j20-2", title: "Deep work",              start: "2025-01-20T09:15", end: "2025-01-20T12:00",  type: "work"       },
  // ── Jan 21 ──────────────────────────────────────────────────────────────────
  { id: "j21-1", title: "Quarterly review",       start: "2025-01-21T11:30", end: "2025-01-21T12:30",  type: "meeting"    },
  { id: "j21-2", title: "Lunch with Zahir",       start: "2025-01-21T13:00", end: "2025-01-21T14:00",  type: "lunch"      },
  { id: "j21-3", title: "Dinner with family",     start: "2025-01-21T19:00", end: "2025-01-21T21:00",  type: "personal"   },
  // ── Jan 22 ──────────────────────────────────────────────────────────────────
  { id: "j22-1", title: "Deep work",              start: "2025-01-22T09:00", end: "2025-01-22T12:00",  type: "work"       },
  { id: "j22-2", title: "Design sync",            start: "2025-01-22T14:30", end: "2025-01-22T15:00",  type: "design"     },
  // ── Jan 23 ──────────────────────────────────────────────────────────────────
  { id: "j23-1", title: "Amélie coffee",          start: "2025-01-23T10:00", end: "2025-01-23T10:30",  type: "coffee"     },
  // ── Jan 24 ──────────────────────────────────────────────────────────────────
  { id: "j24-1", title: "Friday standup",         start: "2025-01-24T09:00", end: "2025-01-24T09:30",  type: "standup"    },
  { id: "j24-2", title: "Accountant",             start: "2025-01-24T13:45", end: "2025-01-24T14:45",  type: "meeting"    },
  { id: "j24-3", title: "Marketing site review",  start: "2025-01-24T14:30", end: "2025-01-24T15:30",  type: "marketing"  },
  { id: "j24-4", title: "Board prep",             start: "2025-01-24T16:00", end: "2025-01-24T17:00",  type: "planning"   },
  { id: "j24-5", title: "Investor call",          start: "2025-01-24T17:00", end: "2025-01-24T18:00",  type: "meeting"    },
  // ── Jan 27 ──────────────────────────────────────────────────────────────────
  { id: "j27-1", title: "Monday standup",         start: "2025-01-27T09:00", end: "2025-01-27T09:30",  type: "standup"    },
  // ── Jan 28 ──────────────────────────────────────────────────────────────────
  { id: "j28-1", title: "Content planning",       start: "2025-01-28T11:00", end: "2025-01-28T12:00",  type: "planning"   },
  { id: "j28-2", title: "Lunch with Ali",         start: "2025-01-28T12:45", end: "2025-01-28T13:45",  type: "lunch"      },
  // ── Jan 29 ──────────────────────────────────────────────────────────────────
  { id: "j29-1", title: "Product planning",       start: "2025-01-29T09:30", end: "2025-01-29T10:30",  type: "planning"   },
  // ── Jan 30 ──────────────────────────────────────────────────────────────────
  { id: "j30-1", title: "All-hands meeting",      start: "2025-01-30T16:00", end: "2025-01-30T17:00",  type: "meeting"    },
  { id: "j30-2", title: "Team dinner",            start: "2025-01-30T17:30", end: "2025-01-30T19:30",  type: "social"     },
  // ── Jan 31 ──────────────────────────────────────────────────────────────────
  { id: "j31-1", title: "Friday standup",         start: "2025-01-31T09:00", end: "2025-01-31T09:30",  type: "standup"    },
  // ── Feb 2 ───────────────────────────────────────────────────────────────────
  { id: "f2-1",  title: "Monday standup",         start: "2025-02-02T09:00", end: "2025-02-02T09:30",  type: "standup"    },

  // ═══════════════════════════════════════════════════════════════════════════
  // MULTI-DAY ACTIVITIES (events spanning multiple consecutive days)
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Example 1: Team offsite spanning 3 days (Dec 6-8)
  { id: "multi-1", title: "Team Offsite - Strategy", start: "2024-12-06T09:00", end: "2024-12-08T18:00", type: "meeting" },
  
  // Example 2: Product launch week spanning 5 days (Jan 13-17)
  { id: "multi-2", title: "Product Launch Week v2.0", start: "2025-01-13T00:00", end: "2025-01-17T23:59", type: "milestone" },
  
  // Example 3: Conference spanning 2 days (Jan 20-21)
  { id: "multi-3", title: "Tech Conference 2025", start: "2025-01-20T08:00", end: "2025-01-21T20:00", type: "meeting" },
  
  // Example 4: Sprint week spanning 5 days (Jan 6-10)
  { id: "multi-4", title: "Sprint 15 - Development", start: "2025-01-06T09:00", end: "2025-01-10T18:00", type: "work" },
  
  // Example 5: Client workshop spanning 2 days (Jan 23-24)
  { id: "multi-5", title: "Client Workshop - Phase 2", start: "2025-01-23T10:00", end: "2025-01-24T17:00", type: "meeting" },
  
  // Example 6: Company retreat spanning 3 days (Feb 3-5)
  { id: "multi-6", title: "Annual Company Retreat", start: "2025-02-03T07:00", end: "2025-02-05T20:00", type: "social" },

  // ═══════════════════════════════════════════════════════════════════════════
  // MULTI-WEEK ACTIVITIES (long-term projects and recurring events)
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Example 1: Product development phase spanning 4 weeks (Dec 2 - Dec 30)
  { id: "week-1", title: "Q1 Product Development", start: "2024-12-02T09:00", end: "2024-12-30T18:00", type: "deadline" },
  
  // Example 2: Marketing campaign spanning 3 weeks (Jan 6 - Jan 26)
  { id: "week-2", title: "Winter Marketing Campaign", start: "2025-01-06T00:00", end: "2025-01-26T23:59", type: "marketing" },
  
  // Example 3: Beta testing phase spanning 2 weeks (Jan 13 - Jan 27)
  { id: "week-3", title: "Beta Testing - Phase 1", start: "2025-01-13T00:00", end: "2025-01-27T23:59", type: "task" },
  
  // Example 4: Training program spanning 2 weeks (Feb 3 - Feb 14)
  { id: "week-4", title: "New Hire Onboarding Batch 1", start: "2025-02-03T09:00", end: "2025-02-14T17:00", type: "planning" },
];

// ═══════════════════════════════════════════════════════════════════════════
// ACTIVITY DATA - March 15-23, 2026 (Demo for activity visualization)
// ═══════════════════════════════════════════════════════════════════════════
const SAMPLE_ACTIVITIES = [
  // March 15, 2026 (Sunday)
  { timestamp: "2026-03-15T09:00", intensity: 3 },
  { timestamp: "2026-03-15T10:00", intensity: 4 },
  { timestamp: "2026-03-15T11:00", intensity: 2 },
  { timestamp: "2026-03-15T14:00", intensity: 5 },
  { timestamp: "2026-03-15T15:00", intensity: 3 },
  { timestamp: "2026-03-15T16:00", intensity: 1 },
  
  // March 16, 2026 (Monday)
  { timestamp: "2026-03-16T08:00", intensity: 2 },
  { timestamp: "2026-03-16T09:00", intensity: 5 },
  { timestamp: "2026-03-16T10:00", intensity: 4 },
  { timestamp: "2026-03-16T11:00", intensity: 3 },
  { timestamp: "2026-03-16T13:00", intensity: 2 },
  { timestamp: "2026-03-16T14:00", intensity: 5 },
  { timestamp: "2026-03-16T15:00", intensity: 4 },
  { timestamp: "2026-03-16T16:00", intensity: 3 },
  { timestamp: "2026-03-16T17:00", intensity: 2 },
  
  // March 17, 2026 (Tuesday)
  { timestamp: "2026-03-17T09:00", intensity: 3 },
  { timestamp: "2026-03-17T10:00", intensity: 4 },
  { timestamp: "2026-03-17T11:00", intensity: 2 },
  { timestamp: "2026-03-17T14:00", intensity: 5 },
  { timestamp: "2026-03-17T15:00", intensity: 5 },
  { timestamp: "2026-03-17T16:00", intensity: 4 },
  
  // March 18, 2026 (Wednesday)
  { timestamp: "2026-03-18T08:00", intensity: 1 },
  { timestamp: "2026-03-18T09:00", intensity: 4 },
  { timestamp: "2026-03-18T10:00", intensity: 5 },
  { timestamp: "2026-03-18T11:00", intensity: 5 },
  { timestamp: "2026-03-18T12:00", intensity: 2 },
  { timestamp: "2026-03-18T14:00", intensity: 3 },
  { timestamp: "2026-03-18T15:00", intensity: 4 },
  { timestamp: "2026-03-18T16:00", intensity: 2 },
  { timestamp: "2026-03-18T17:00", intensity: 1 },
  
  // March 19, 2026 (Thursday)
  { timestamp: "2026-03-19T09:00", intensity: 3 },
  { timestamp: "2026-03-19T10:00", intensity: 3 },
  { timestamp: "2026-03-19T11:00", intensity: 4 },
  { timestamp: "2026-03-19T13:00", intensity: 5 },
  { timestamp: "2026-03-19T14:00", intensity: 5 },
  { timestamp: "2026-03-19T15:00", intensity: 4 },
  { timestamp: "2026-03-19T16:00", intensity: 3 },
  
  // March 20, 2026 (Friday)
  { timestamp: "2026-03-20T08:00", intensity: 2 },
  { timestamp: "2026-03-20T09:00", intensity: 5 },
  { timestamp: "2026-03-20T10:00", intensity: 4 },
  { timestamp: "2026-03-20T11:00", intensity: 3 },
  { timestamp: "2026-03-20T14:00", intensity: 2 },
  { timestamp: "2026-03-20T15:00", intensity: 1 },
  { timestamp: "2026-03-20T16:00", intensity: 2 },
  { timestamp: "2026-03-20T17:00", intensity: 3 },
  
  // March 21, 2026 (Saturday)
  { timestamp: "2026-03-21T10:00", intensity: 2 },
  { timestamp: "2026-03-21T11:00", intensity: 1 },
  { timestamp: "2026-03-21T14:00", intensity: 3 },
  { timestamp: "2026-03-21T15:00", intensity: 2 },
  
  // March 22, 2026 (Sunday)
  { timestamp: "2026-03-22T09:00", intensity: 1 },
  { timestamp: "2026-03-22T10:00", intensity: 2 },
  { timestamp: "2026-03-22T11:00", intensity: 1 },
  { timestamp: "2026-03-22T15:00", intensity: 2 },
  { timestamp: "2026-03-22T16:00", intensity: 1 },
  
  // March 23, 2026 (Monday)
  { timestamp: "2026-03-23T08:00", intensity: 3 },
  { timestamp: "2026-03-23T09:00", intensity: 5 },
  { timestamp: "2026-03-23T10:00", intensity: 4 },
  { timestamp: "2026-03-23T11:00", intensity: 5 },
  { timestamp: "2026-03-23T13:00", intensity: 3 },
  { timestamp: "2026-03-23T14:00", intensity: 4 },
  { timestamp: "2026-03-23T15:00", intensity: 5 },
  { timestamp: "2026-03-23T16:00", intensity: 4 },
  { timestamp: "2026-03-23T17:00", intensity: 3 },
];

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function formatDateRange(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  const opts = { month: "short", day: "numeric", year: "numeric" };
  return `${firstDay.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${year} – ${lastDay.toLocaleDateString("en-US", opts)}`;
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMonday = (day + 6) % 7;
  d.setDate(d.getDate() - diffToMonday);
  return d;
}

function formatWeekRange(date) {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const startLabel = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const sameYear = start.getFullYear() === end.getFullYear();
  const endLabel = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (sameYear) {
    return `${startLabel} – ${endLabel}`;
  }

  const startWithYear = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${startWithYear} – ${endLabel}`;
}

function getViewTitle(date, viewMode) {
  if (viewMode === "day") {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  if (viewMode === "week") {
    return `Week of ${formatWeekRange(date)}`;
  }

  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function getViewSubtitle(date, viewMode) {
  if (viewMode === "day") {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  if (viewMode === "week") {
    return formatWeekRange(date);
  }

  return formatDateRange(date);
}

export function ProjectionsScreen() {
  const [activeTab, setActiveTab]       = useState("all events");
  const [currentDate, setCurrentDate]   = useState(new Date(2025, 0, 10)); // Jan 10 2025
  const [viewMode, setViewMode]         = useState("month");
  const [searchQuery, setSearchQuery]   = useState("");

  // Real today's date from browser
  const today = new Date();

  const handleViewModeChange = (newView) => {
    setViewMode(newView);
    // Always pivot to the current period when a view is selected.
    setCurrentDate(new Date());
  };

  const navigatePrev = () => {
    const d = new Date(currentDate);

    if (viewMode === "week") {
      d.setDate(d.getDate() - 7);
    } else if (viewMode === "day") {
      d.setDate(d.getDate() - 1);
    } else {
      d.setMonth(d.getMonth() - 1);
    }

    setCurrentDate(d);
  };

  const navigateNext = () => {
    const d = new Date(currentDate);

    if (viewMode === "week") {
      d.setDate(d.getDate() + 7);
    } else if (viewMode === "day") {
      d.setDate(d.getDate() + 1);
    } else {
      d.setMonth(d.getMonth() + 1);
    }

    setCurrentDate(d);
  };

  const goToToday = () => setCurrentDate(new Date());

  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [selectedCreateDate, setSelectedCreateDate] = useState(null);

  const filteredEvents = searchQuery.trim()
    ? SAMPLE_EVENTS.filter((e) =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : SAMPLE_EVENTS;

  const handleEventCreate = (date) => {
    setSelectedCreateDate(date);
    setIsAddActivityOpen(true);
  };

  const handleSaveActivity = async (activity) => {
    console.log("Saving calendar activity:", activity);
    // Add your save logic here
    setIsAddActivityOpen(false);
    setSelectedCreateDate(null);
  };

  return (
    <MainScreenWrapper className="text-[#e7e7e7]">
    <div className="flex flex-col h-full w-full min-h-screen">
      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 pt-6 pb-8">
        <div className="flex items-center justify-between ">
          <h1 className="text-[22px] sm:text-[26px] font-bold text-primary tracking-tight">
            Calendar
          </h1>
          <div className="flex items-center ">
        <div className="flex items-center gap-1.5 justify-center">
          <div className="flex items-center gap-1 bg-surface w-full justify-center rounded-lg p-1 border border-subtle">
            {TABS.map((tab, idx) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(TAB_KEYS[idx])}
                className={cn(
                  "px-4 py-1.5 text-sm w-full font-medium rounded-md transition-all",
                  activeTab === TAB_KEYS[idx]
                    ? "bg-surface-active text-primary shadow-sm"
                    : "text-text-muted hover:text-primary hover:bg-surface-hover"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>
          {/* Desktop: inline search */}
          {/* <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#737373]" />
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-12 h-9 w-60 bg-surface-elevated border-border-default text-text-secondary placeholder:text-text-muted rounded-lg text-sm focus-visible:ring-0 focus-visible:border-emphasis"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-text-muted bg-surface-active border border-border-default px-1.5 py-0.5 rounded pointer-events-none font-mono">
              ⌘K
            </kbd>
          </div> */}
        </div>
        {/* Mobile: full-width search below title */}
        {/* <div className="relative mt-3 sm:hidden">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#737373]" />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-12 h-9 w-full bg-surface-elevated border-border-default text-text-secondary placeholder:text-text-muted rounded-lg text-sm focus-visible:ring-0 focus-visible:border-emphasis"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-text-muted bg-surface-active border border-border-default px-1.5 py-0.5 rounded pointer-events-none font-mono">
            ⌘K
          </kbd>
        </div> */}
      </div>
      
      {/* ── Calendar area ────────────────────────────────────────────────────── */}
      <div className="flex-1 px-3 sm:px-6 pb-3 sm:pb-6 overflow-auto">
        <div className="border border-subtle rounded-2xl overflow-hidden bg-surface">
          {/* Sub-header: month nav + controls */}
          <div className="border-b border-subtle">
            {/* ── Mobile layout ──────────────────────────────────────────────── */}
            <div className="flex flex-col gap-3 px-4 py-3 sm:hidden">
              {/* Row 1: month title + date range */}
              <div>
                <p className="text-[15px] font-semibold text-primary leading-tight">
                  {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                </p>
                <p className="text-xs text-text-muted leading-tight mt-0.5">
                  {formatDateRange(currentDate)}
                </p>
              </div>
              {/* Row 2: view selector + add event + search icon */}
              <div className="flex items-center gap-2">
                <Select value={viewMode} onValueChange={setViewMode}>
                  <SelectTrigger className="h-9 flex-1 bg-surface-elevated border-border-default text-text-secondary text-sm rounded-lg focus:ring-0 focus:border-emphasis">
                    <CalendarDays className="w-3.5 h-3.5 mr-1.5 text-text-muted" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-elevated border-subtle">
                    <SelectItem value="month" className="text-text-secondary focus:bg-surface-hover">Month view</SelectItem>
                    <SelectItem value="week"  className="text-text-secondary focus:bg-surface-hover">Week view</SelectItem>
                    <SelectItem value="day"   className="text-text-secondary focus:bg-surface-hover">Day view</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="h-9 bg-primary text-primary-foreground hover:bg-primary/80 text-sm font-medium px-3 rounded-lg gap-1.5 shrink-0">
                  <Plus className="w-4 h-4" />
                 Add event 
                </Button>
                <button
                  type="button"
                  className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-surface-hover transition-colors shrink-0"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
              {/* Row 3: navigation */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-surface-hover transition-colors"
                  onClick={navigatePrev}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={goToToday}
                  className="flex-1 py-1.5 text-sm font-medium text-center text-text-tertiary hover:text-primary border border-subtle rounded-lg hover:bg-surface-hover transition-colors"
                >
                  Today
                </button>
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-surface-hover transition-colors"
                  onClick={navigateNext}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── Desktop layout ─────────────────────────────────────────────── */}
            <div className="hidden sm:flex items-center justify-between px-5 py-3.5">
              {/* Left: date badge + month info */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {/* mini date badge - always shows real today's date */}
                  <div
                  className="pointer mr-2 flex flex-col items-center justify-center w-11 h-11 rounded-lg border border-border-default bg-accent text-center leading-none">
                    <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">
                      {MONTHS[today.getMonth()].slice(0, 3)}
                    </span>
                    <span className="text-[17px] font-bold text-primary leading-none mt-0.5">
                      {today.getDate()}
                    </span>
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-primary leading-tight">
                      {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </p>
                    <p className="text-xs text-text-muted leading-tight mt-0.5">
                      {formatDateRange(currentDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: view selector + add button */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-surface-hover transition-colors"
                  onClick={navigatePrev}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-surface-hover transition-colors"
                  onClick={navigateNext}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
                <Select value={viewMode} onValueChange={setViewMode}>
                  <SelectTrigger className="h-9 w-36 bg-surface-elevated border-border-default text-text-secondary text-sm rounded-lg focus:ring-0 focus:border-emphasis">
                    <CalendarDays className="w-3.5 h-3.5 mr-1.5 text-text-muted" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-elevated border-subtle">
                    <SelectItem value="month" className="text-text-secondary focus:bg-surface-hover">Month</SelectItem>
                    <SelectItem value="week"  className="text-text-secondary focus:bg-surface-hover">Week</SelectItem>
                    <SelectItem value="day"   className="text-text-secondary focus:bg-surface-hover">Day</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="h-9 bg-primary text-primary-foreground hover:bg-primary/80 text-sm font-medium px-4 rounded-lg gap-1.5">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Calendar grid */}
          <Calendar
            events={filteredEvents}
            activities={SAMPLE_ACTIVITIES}
            showActivity={true}
            selectedDate={currentDate}
            onDateSelect={setCurrentDate}
            view={viewMode}
            onViewChange={setViewMode}
            showHeader={false}
            showViewSwitcher={false}
            defaultViewOnDayClick="day"
            enableCreate
            onEventCreate={handleEventCreate}
            className="border-0 rounded-none bg-transparent p-0"
          />
        </div>

        {/* Controlled Add Activity Dialog for calendar date clicks */}
        <AddActivityDialog
          open={isAddActivityOpen}
          onOpenChange={setIsAddActivityOpen}
          onSave={handleSaveActivity}
          activity={selectedCreateDate ? {
            startDate: selectedCreateDate,
            startTime: selectedCreateDate ? 
              `${String(selectedCreateDate.getHours()).padStart(2, '0')}:${String(selectedCreateDate.getMinutes()).padStart(2, '0')}` 
              : "09:00",
          } : null}
        />

    </div></MainScreenWrapper>
  );
}
