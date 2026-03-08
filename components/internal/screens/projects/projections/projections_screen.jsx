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
import { cn } from "@/lib/utils";

const TABS = ["All", "Shared", "Public", "Archived"];
const TAB_KEYS = ["all events", "shared", "public", "archived"];

// ─── Sample events – January 2025 (matching reference screenshot) ──────────────
const SAMPLE_EVENTS = [
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

export function ProjectionsScreen() {
  const [activeTab, setActiveTab]       = useState("all events");
  const [currentDate, setCurrentDate]   = useState(new Date(2025, 0, 10)); // Jan 10 2025
  const [viewMode, setViewMode]         = useState("month");
  const [searchQuery, setSearchQuery]   = useState("");

  // Real today's date from browser
  const today = new Date();

  const navigatePrev = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };

  const navigateNext = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };

  const goToToday = () => setCurrentDate(new Date());

  const filteredEvents = searchQuery.trim()
    ? SAMPLE_EVENTS.filter((e) =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : SAMPLE_EVENTS;

  return (
    <div className="flex flex-col h-full w-full min-h-screen bg-[#161616]">
      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] sm:text-[26px] font-bold text-white tracking-tight">
            Calendar
          </h1>
          {/* Desktop: inline search */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#737373]" />
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-12 h-9 w-60 bg-[#202020] border-[#333333] text-[#a3a3a3] placeholder:text-[#737373] rounded-lg text-sm focus-visible:ring-0 focus-visible:border-[#474747]"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#737373] bg-[#2a2a2a] border border-[#333333] px-1.5 py-0.5 rounded pointer-events-none font-mono">
              ⌘K
            </kbd>
          </div>
        </div>
        {/* Mobile: full-width search below title */}
        <div className="relative mt-3 sm:hidden">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#737373]" />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-12 h-9 w-full bg-[#202020] border-[#333333] text-[#a3a3a3] placeholder:text-[#737373] rounded-lg text-sm focus-visible:ring-0 focus-visible:border-[#474747]"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#737373] bg-[#2a2a2a] border border-[#333333] px-1.5 py-0.5 rounded pointer-events-none font-mono">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 px-4 sm:px-6 pb-3">
        <div className="flex items-center gap-1.5 pb-1 justify-center">
          <div className="flex items-center gap-1 bg-[#1a1a1a] w-full justify-center rounded-lg p-1 border border-[#2a2a2a]">
            {TABS.map((tab, idx) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(TAB_KEYS[idx])}
                className={cn(
                  "px-4 py-1.5 text-sm w-full font-medium rounded-md transition-all",
                  activeTab === TAB_KEYS[idx]
                    ? "bg-[#2a2a2a] text-white shadow-sm"
                    : "text-[#737373] hover:text-white hover:bg-[#202020]"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Calendar area ────────────────────────────────────────────────────── */}
      <div className="flex-1 px-3 sm:px-6 pb-3 sm:pb-6 overflow-auto">
        <div className="border border-[#2a2a2a] rounded-2xl overflow-hidden bg-[#1a1a1a]">
          {/* Sub-header: month nav + controls */}
          <div className="border-b border-[#2a2a2a]">
            {/* ── Mobile layout ──────────────────────────────────────────────── */}
            <div className="flex flex-col gap-3 px-4 py-3 sm:hidden">
              {/* Row 1: month title + date range */}
              <div>
                <p className="text-[15px] font-semibold text-white leading-tight">
                  {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                </p>
                <p className="text-xs text-[#737373] leading-tight mt-0.5">
                  {formatDateRange(currentDate)}
                </p>
              </div>
              {/* Row 2: view selector + add event + search icon */}
              <div className="flex items-center gap-2">
                <Select value={viewMode} onValueChange={setViewMode}>
                  <SelectTrigger className="h-9 flex-1 bg-[#202020] border-[#333333] text-[#a3a3a3] text-sm rounded-lg focus:ring-0 focus:border-[#474747]">
                    <CalendarDays className="w-3.5 h-3.5 mr-1.5 text-[#737373]" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#202020] border-[#2a2a2a]">
                    <SelectItem value="month" className="text-[#a3a3a3] focus:bg-[#2a2a2a]">Month view</SelectItem>
                    <SelectItem value="week"  className="text-[#a3a3a3] focus:bg-[#2a2a2a]">Week view</SelectItem>
                    <SelectItem value="day"   className="text-[#a3a3a3] focus:bg-[#2a2a2a]">Day view</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="h-9 bg-white text-black hover:bg-[#e5e5e5] text-sm font-medium px-3 rounded-lg gap-1.5 shrink-0">
                  <Plus className="w-4 h-4" />
                  Add event
                </Button>
                <button
                  type="button"
                  className="p-2 rounded-lg text-[#737373] hover:text-white hover:bg-[#202020] transition-colors shrink-0"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
              {/* Row 3: navigation */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-[#737373] hover:text-white hover:bg-[#202020] transition-colors"
                  onClick={navigatePrev}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={goToToday}
                  className="flex-1 py-1.5 text-sm font-medium text-center text-[#a3a3a3] hover:text-white border border-[#2a2a2a] rounded-lg hover:bg-[#202020] transition-colors"
                >
                  Today
                </button>
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-[#737373] hover:text-white hover:bg-[#202020] transition-colors"
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
                  <div className="flex flex-col items-center justify-center w-11 h-11 rounded-lg border border-[#333333] bg-[#242424] text-center leading-none">
                    <span className="text-[9px] font-bold text-[#60a5fa] uppercase tracking-widest">
                      {MONTHS[today.getMonth()].slice(0, 3)}
                    </span>
                    <span className="text-[17px] font-bold text-white leading-none mt-0.5">
                      {today.getDate()}
                    </span>
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-white leading-tight">
                      {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </p>
                    <p className="text-xs text-[#737373] leading-tight mt-0.5">
                      {formatDateRange(currentDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Center: nav controls */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-[#737373] hover:text-white hover:bg-[#202020] transition-colors"
                  onClick={navigatePrev}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={goToToday}
                  className="px-3.5 py-1.5 text-sm font-medium text-[#a3a3a3] hover:text-white border border-[#2a2a2a] rounded-lg hover:bg-[#202020] transition-colors"
                >
                  Today
                </button>
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-[#737373] hover:text-white hover:bg-[#202020] transition-colors"
                  onClick={navigateNext}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Right: view selector + add button */}
              <div className="flex items-center gap-2">
                <Select value={viewMode} onValueChange={setViewMode}>
                  <SelectTrigger className="h-9 w-36 bg-[#202020] border-[#333333] text-[#a3a3a3] text-sm rounded-lg focus:ring-0 focus:border-[#474747]">
                    <CalendarDays className="w-3.5 h-3.5 mr-1.5 text-[#737373]" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#202020] border-[#2a2a2a]">
                    <SelectItem value="month" className="text-[#a3a3a3] focus:bg-[#2a2a2a]">Month</SelectItem>
                    <SelectItem value="week"  className="text-[#a3a3a3] focus:bg-[#2a2a2a]">Week</SelectItem>
                    <SelectItem value="day"   className="text-[#a3a3a3] focus:bg-[#2a2a2a]">Day</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="h-9 bg-white text-black hover:bg-[#e5e5e5] text-sm font-medium px-4 rounded-lg gap-1.5">
                  <Plus className="w-4 h-4" />
                  Add event
                </Button>
              </div>
            </div>
          </div>

          {/* Calendar grid */}
          <Calendar
            events={filteredEvents}
            selectedDate={currentDate}
            onDateSelect={setCurrentDate}
            view={viewMode}
            onViewChange={setViewMode}
            showHeader={false}
            showViewSwitcher={false}
            defaultViewOnDayClick="month"
            enableCreate
            className="border-0 rounded-none bg-transparent p-0"
          />
        </div>
      </div>
    </div>
  );
}
