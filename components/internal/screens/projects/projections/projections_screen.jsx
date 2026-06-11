"use client";

import React, { useMemo, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
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
  SlidersHorizontal,
} from "lucide-react";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { SegmentedTabs } from "@/components/internal/shared/segmented_tabs";
import { AddActivityDialog } from "@/components/internal/dilouges/activities/add_activity_dilouge";

const TABS = ["All", "Shared", "Public", "Archived"];
const TAB_KEYS = ["all events", "shared", "public", "archived"];
const TAB_OPTIONS = TABS.map((label, index) => ({ label, value: TAB_KEYS[index] }));

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
  const [currentDate, setCurrentDate]   = useState(new Date());
  const [viewMode, setViewMode]         = useState("month");
  const [searchQuery, setSearchQuery]   = useState("");
  const [fadeKey] = useState(0);
  const [events] = useState([]);

  const today = new Date();
  const displayEvents = useMemo(() => {
    switch (activeTab) {
      case "shared":
        return events.filter((event) => event.visibility === "shared" && !event.archived);
      case "public":
        return events.filter((event) => event.visibility === "public" && !event.archived);
      case "archived":
        return events.filter((event) => event.archived);
      default:
        return events.filter((event) => !event.archived);
    }
  }, [activeTab, events]);

  const handleViewModeChange = (newView) => {
    setViewMode(newView);
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
    ? displayEvents.filter((e) =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : displayEvents;

  const handleEventCreate = (date) => {
    setSelectedCreateDate(date);
    setIsAddActivityOpen(true);
  };

  const handleSaveActivity = async (activity) => {
    setIsAddActivityOpen(false);
    setSelectedCreateDate(null);
  };

  return (
    <MainScreenWrapper className="text-foreground">
    <div className="flex flex-col h-full w-full min-h-screen">
    <div className="hidden sm:flex items-center justify-between border-b border-border pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projections</h1>
          <p className="text-muted-foreground mt-1">
            View and manage project timelines, milestones, and delivery dates.
          </p>
        </div>
        <div className="flex items-center ">
        <SegmentedTabs tabs={TAB_OPTIONS} value={activeTab} onChange={setActiveTab} />
      </div>
      </div>

      <div className="sm:hidden mb-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h1 className="text-[35px] font-semibold leading-none text-foreground tracking-tight">Calendar</h1>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              className="p-2 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface-card transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              className="p-2 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface-card transition-colors"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

        <div className="border border-border rounded-2xl overflow-hidden bg-surface-subtle">
          <div className="border-b border-border">
            <div className="flex flex-col gap-3 px-4 py-3 sm:hidden">
              <SegmentedTabs tabs={TAB_OPTIONS} value={activeTab} onChange={setActiveTab} fullWidth />

              <div className="flex items-center gap-2 justify-between">
                <p className="text-[15px] font-semibold text-foreground leading-tight">
                  {getViewTitle(currentDate, viewMode)}
                </p>
                <p className="text-xs text-text-secondary leading-tight">
                  {getViewSubtitle(currentDate, viewMode)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Select value={viewMode} onValueChange={handleViewModeChange}>
                  <SelectTrigger className="h-9 w-[136px] bg-surface-card border-border text-muted-foreground text-sm rounded-lg focus:ring-0 focus:border-border-strong">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-card border-border">
                    <SelectItem value="month" className="text-muted-foreground focus:bg-surface-hover">Month</SelectItem>
                    <SelectItem value="week"  className="text-muted-foreground focus:bg-surface-hover">Week</SelectItem>
                    <SelectItem value="day"   className="text-muted-foreground focus:bg-surface-hover">Day</SelectItem>
                  </SelectContent>
                </Select>
                <AddActivityDialog onSave={handleSaveActivity}>
                  <Button className="h-9 bg-background text-foreground hover:bg-surface-subtle text-sm font-medium px-3 rounded-lg gap-1.5 shrink-0 flex-1">
                    <Plus className="w-4 h-4" />
                    Add event
                  </Button>
                </AddActivityDialog>
              </div>

              <div className="grid grid-cols-[40px_1fr_40px] border border-border rounded-xl overflow-hidden">
                <Button
                  type="button"
                  className="h-9 flex items-center justify-center text-text-secondary border-r border-border hover:text-foreground hover:bg-surface-card transition-colors"
                  onClick={navigatePrev}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  onClick={goToToday}
                  className="h-9 text-sm font-semibold text-center text-muted-foreground hover:text-foreground hover:bg-surface-card transition-colors"
                >
                  Today
                </Button>
                <Button
                  type="button"
                  className="h-9 flex items-center justify-center text-text-secondary border-l border-border hover:text-foreground hover:bg-surface-card transition-colors"
                  onClick={navigateNext}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="hidden sm:flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">

                  {viewMode !== "month" && (
                    <Button
                      type="button"
                      onClick={() => setViewMode("month")}
                      className="flex mr-4 items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mr-1"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                      <span className="hidden lg:inline">Month</span>
                    </Button>
                  )}

                  <div
                  className="pointer mr-2 flex flex-col items-center justify-center w-11 h-11 rounded-lg border border-border bg-surface-active text-center leading-none">
                    <span className="text-[9px] font-bold text-[#60a5fa] uppercase tracking-widest">
                      {MONTHS[today.getMonth()].slice(0, 3)}
                    </span>
                    <span className="text-[17px] font-bold text-foreground leading-none mt-0.5">
                      {today.getDate()}
                    </span>
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-foreground leading-tight">
                      {getViewTitle(currentDate, viewMode)}
                    </p>
                    <p className="text-xs text-text-secondary leading-tight mt-0.5">
                      {getViewSubtitle(currentDate, viewMode)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                <Button
                  type="button"
                  className="p-1.5 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface-card transition-colors"
                  onClick={navigatePrev}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  className="p-1.5 rounded-lg text-text-secondary hover:text-foreground hover:bg-surface-card transition-colors"
                  onClick={navigateNext}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
                <Select value={viewMode} onValueChange={handleViewModeChange}>
                  <SelectTrigger className="h-9 w-36 bg-surface-card border-border text-muted-foreground text-sm rounded-lg focus:ring-0 focus:border-border-strong">
                    <CalendarDays className="w-3.5 h-3.5 mr-1.5 text-text-secondary" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-surface-card border-border">
                    <SelectItem value="month" className="text-muted-foreground focus:bg-surface-hover">Month</SelectItem>
                    <SelectItem value="week"  className="text-muted-foreground focus:bg-surface-hover">Week</SelectItem>
                    <SelectItem value="day"   className="text-muted-foreground focus:bg-surface-hover">Day</SelectItem>
                  </SelectContent>
                </Select>
                <AddActivityDialog onSave={handleSaveActivity}>
                  <Button className="h-9 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium px-4 rounded-lg gap-1.5">
                    <Plus className="w-4 h-4" />
                  </Button>
                </AddActivityDialog>
              </div>
            </div>
          </div>

          <Calendar
            events={filteredEvents}
            activities={[]}
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
            fadeKey={fadeKey}
          />
        </div>

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
