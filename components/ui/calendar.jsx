import React, { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar as CalendarIcon,
  List,
  Grid3X3,
  Plus,
  Activity,
} from "lucide-react";
import { Input } from "./input";

// Utility functions
const formatTime = (date) => {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatHour = (hour) => {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
};

const isSameDay = (date1, date2) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const isSameMonth = (date1, date2) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  );
};

// weekStartsOn: 0 = Sunday (default), 1 = Monday
const getDaysInMonth = (date, weekStartsOn = 0) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  // For Monday-first: Sun becomes 6, Mon becomes 0, …
  let startingDay = firstDay.getDay();
  if (weekStartsOn === 1) startingDay = (startingDay + 6) % 7;

  const days = [];

  // Previous month trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDay - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthLastDay - i),
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ date: new Date(year, month, i), isCurrentMonth: true });
  }

  // Next month leading days to fill 6 weeks
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
    });
  }

  return days;
};

const getWeekDays = (date) => {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());

  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    days.push(day);
  }
  return days;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Event Types Configuration
export const EVENT_COLORS = {
  default:    { pill: "bg-zinc-500/[0.15] text-blue-300",    dot: "#3b82f6",  special: false },
  standup:    { pill: "bg-indigo-500/[0.15] text-indigo-300", dot: "#6366f1",  special: false },
  meeting:    { pill: "bg-cyan-500/[0.15] text-cyan-300",     dot: "#06b6d4",  special: false },
  coffee:     { pill: "bg-violet-500/[0.15] text-violet-300", dot: "#8b5cf6",  special: false },
  marketing:  { pill: "bg-rose-500/[0.15] text-rose-300",     dot: "#f43f5e",  special: false },
  personal:   { pill: "bg-emerald-500/[0.12] text-emerald-400",dot: "#10b981", special: true  },
  inspection: { pill: "bg-red-500/[0.12] text-red-400",       dot: "#ef4444",  special: true  },
  work:       { pill: "bg-zinc-500/[0.2] text-zinc-300",       dot: "#71717a",  special: false },
  lunch:      { pill: "bg-orange-500/[0.15] text-orange-300",  dot: "#f97316",  special: false },
  planning:   { pill: "bg-zinc-500/[0.15] text-blue-300",      dot: "#3b82f6",  special: false },
  design:     { pill: "bg-purple-500/[0.15] text-purple-300",  dot: "#a855f7",  special: false },
  social:     { pill: "bg-violet-500/[0.12] text-violet-400",  dot: "#8b5cf6",  special: true  },
  exercise:   { pill: "bg-emerald-500/[0.12] text-emerald-400",dot: "#10b981", special: true  },
  task:       { pill: "bg-green-500/[0.15] text-green-300",    dot: "#22c55e",  special: false },
  deadline:   { pill: "bg-red-500/[0.15] text-red-300",        dot: "#ef4444",  special: false },
  milestone:  { pill: "bg-yellow-500/[0.15] text-yellow-300",  dot: "#eab308",  special: false },
  reminder:   { pill: "bg-orange-500/[0.15] text-orange-300",  dot: "#f97316",  special: false },
};

const formatEventTime = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// Activity Intensity Colors
const ACTIVITY_COLORS = {
  0: 'bg-transparent',
  1: 'bg-zinc-500/10',
  2: 'bg-zinc-500/20',
  3: 'bg-zinc-500/30',
  4: 'bg-zinc-500/40',
  5: 'bg-zinc-500/50',
};

// Get activity level for a specific date and time range
const getActivityLevel = (activities, date, startHour = null, endHour = null) => {
  if (!activities || activities.length === 0) return 0;
  
  const checkDate = new Date(date);
  let totalActivity = 0;
  
  const relevantActivities = activities.filter(activity => {
    const activityDate = new Date(activity.timestamp);
    
    // Check if same day
    if (!isSameDay(activityDate, checkDate)) return false;
    
    // If hours specified, check if within range
    if (startHour !== null && endHour !== null) {
      const activityHour = activityDate.getHours();
      return activityHour >= startHour && activityHour < endHour;
    }
    
    return true;
  });
  
  // Sum activity intensities
  totalActivity = relevantActivities.reduce((sum, activity) => {
    return sum + (activity.intensity || activity.count || 1);
  }, 0);
  
  // Normalize to 0-5 scale (adjust maxCount based on your data)
  const maxCount = 20; // Adjust this based on expected maximum activity
  const level = Math.min(5, Math.ceil((totalActivity / maxCount) * 5));
  
  return level;
};

// Get total activity for a date
const getActivityForDate = (activities, date) => {
  return getActivityLevel(activities, date);
};

// Calendar Component
export function Calendar({
  events = [],
  selectedDate = new Date(),
  onDateSelect,
  onEventClick,
  view = "month", // "month", "week", "day"
  onViewChange,
  showViewSwitcher = true,
  showHeader = true,
  defaultViewOnDayClick = "day", // "day" | "week" | "month" - view to switch to when clicking a day
  className,
  eventTypes = ["default", "meeting", "deadline", "task", "milestone", "reminder"],
  onEventCreate,
  enableCreate = false,
  minHour = 0,
  maxHour = 23,
  hourInterval = 1,
  timeFormat = "12h",
  // Activity visualization props
  activities = [], // Array of { timestamp: Date, intensity?: number, count?: number, type?: string }
  showActivity = false, // Enable activity visualization
  activityViewMode = 'overlay', // 'overlay' | 'replace' - show activity as overlay or replace events
  activityColorScheme = 'zinc', // Color scheme for activity: 'zinc', 'blue', 'green', 'purple'
  fadeKey = 0, // Changed externally each time events filter changes (e.g. tab switch)
}) {
  const [currentDate, setCurrentDate] = useState(new Date(selectedDate));
  const [currentView, setCurrentView] = useState(view);
  const [selectedDay, setSelectedDay] = useState(new Date(selectedDate));
  const [dayStripOffset, setDayStripOffset] = useState(0);
  const [dayStripBaseDate, setDayStripBaseDate] = useState(new Date(selectedDate));

  // Per-cell fade tracking: stores map of date-strings → events from previous fadeKey
  const prevDayEventMapRef = React.useRef({});

  useEffect(() => {
    setCurrentDate(new Date(selectedDate));
    setSelectedDay(new Date(selectedDate));
  }, [selectedDate]);

  useEffect(() => {
    setCurrentView(view);
  }, [view]);

  // Go to today on initial mount
  useEffect(() => {
    goToToday();
  }, []);

  const handleViewChange = (newView) => {
    setCurrentView(newView);
    if (onViewChange) onViewChange(newView);
  };

  const navigatePrev = () => {
    const newDate = new Date(currentDate);
    if (currentView === "month") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (currentView === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (currentView === "month") {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (currentView === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDay(today);
    if (onDateSelect) onDateSelect(today);
  };

  const getEventsForDate = (date) => {
    return events.filter((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return date >= eventStart && date <= eventEnd;
    });
  };

  const getEventsForHour = (date, hour) => {
    return events.filter((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      const checkDate = new Date(date);
      checkDate.setHours(hour, 0, 0, 0);
      
      const hourStart = new Date(checkDate);
      const hourEnd = new Date(checkDate);
      hourEnd.setHours(hour + 1);
      
      return (eventStart < hourEnd && eventEnd > hourStart);
    });
  };
  
  // Get activity level for hour
  const getActivityForHour = (date, hour) => {
    return getActivityLevel(activities, date, hour, hour + 1);
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold text-[#e7e7e7]">
          {currentView === "day"
            ? selectedDay.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })
            : currentView === "week"
            ? `${getWeekDays(currentDate)[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${getWeekDays(currentDate)[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
            : `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={goToToday}
          className="text-[#a3a3a3] hover:text-[#e7e7e7] hover:bg-[#2a2a2a]"
        >
          Today
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {showViewSwitcher && (
          <div className="flex items-center bg-[#1a1a1a] rounded-lg p-1 border border-[#2a2a2a]">
            <Button
              variant={currentView === "month" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleViewChange("month")}
              className={cn(
                "h-8 px-3 rounded-md text-sm",
                currentView === "month"
                  ? "bg-[#2a2a2a] text-[#e7e7e7]"
                  : "text-[#a3a3a3] hover:text-[#e7e7e7]"
              )}
            >
              <Grid3X3 className="w-4 h-4 mr-1" />
              Month
            </Button>
            <Button
              variant={currentView === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleViewChange("week")}
              className={cn(
                "h-8 px-3 rounded-md text-sm",
                currentView === "week"
                  ? "bg-[#2a2a2a] text-[#e7e7e7]"
                  : "text-[#a3a3a3] hover:text-[#e7e7e7]"
              )}
            >
              <List className="w-4 h-4 mr-1" />
              Week
            </Button>
            <Button
              variant={currentView === "day" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleViewChange("day")}
              className={cn(
                "h-8 px-3 rounded-md text-sm",
                currentView === "day"
                  ? "bg-[#2a2a2a] text-[#e7e7e7]"
                  : "text-[#a3a3a3] hover:text-[#e7e7e7]"
              )}
            >
              <CalendarIcon className="w-4 h-4 mr-1" />
              Day
            </Button>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={navigatePrev}
            className="h-8 w-8 text-[#a3a3a3] hover:text-[#e7e7e7] hover:bg-[#2a2a2a]"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={navigateNext}
            className="h-8 w-8 text-[#a3a3a3] hover:text-[#e7e7e7] hover:bg-[#2a2a2a]"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate, 1); // Monday-first
    const today = new Date();
    const MON_WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const MON_WEEKDAYS_SHORT = ["M", "T", "W", "T", "F", "S", "S"];
    const MAX_PILLS = 3;

    // ── Per-cell fade tracking ────────────────────────────────────────────
    // Build a map of date-strings → events for every day in the grid
    const dayEventMap = {};
    days.forEach(d => {
      const key = d.date.toISOString().slice(0, 10);
      dayEventMap[key] = getEventsForDate(d.date);
    });

    const currentDateKeys = new Set(Object.keys(dayEventMap).filter(k => dayEventMap[k].length > 0));
    const prevEventMap   = prevDayEventMapRef.current;
    const prevDateKeys   = new Set(Object.keys(prevEventMap).filter(k => prevEventMap[k].length > 0));
    const enteringKeys   = new Set([...currentDateKeys].filter(k => !prevDateKeys.has(k)));
    const leavingKeys    = new Set([...prevDateKeys].filter(k => !currentDateKeys.has(k)));
    // Keep old ref alive so leaving cells can render ghost events, then replace after a tick
    const ghostEventMap = { ...prevEventMap };
    prevDayEventMapRef.current = { ...dayEventMap };

    return (
      <div className="overflow-hidden">
        {/* Per-cell fade keyframes (injected once) */}
        <style>{`
          @keyframes cellFadeIn {
            0%   { opacity: 0; transform: translateY(3px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes cellFadeOut {
            0%   { opacity: 0.6; }
            100% { opacity: 0; }
          }
          .cell-enter { animation: cellFadeIn 350ms ease-out both; }
          .cell-leave { animation: cellFadeOut 250ms ease-in both; }
        `}</style>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-[#2a2a2a] bg-[#1a1a1a]">
          {MON_WEEKDAYS.map((day, idx) => (
            <div
              key={idx}
              className="text-center text-xs font-medium text-[#737373] py-2 sm:py-3 uppercase tracking-wide"
            >
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{MON_WEEKDAYS_SHORT[idx]}</span>
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dateKey = day.date.toISOString().slice(0, 10);
            const dayEvents = dayEventMap[dateKey] || [];
            const isToday = isSameDay(day.date, today);
            const isCurrentMonth = day.isCurrentMonth;
            const activityLevel = showActivity ? getActivityForDate(activities, day.date) : 0;
            const isSelected = isSameDay(day.date, selectedDay);
            const isEntering = enteringKeys.has(dateKey);
            const isLeaving  = leavingKeys.has(dateKey);
            const hasEvents  = dayEvents.length > 0;
            const ghostEvents = (isLeaving && !hasEvents) ? (ghostEventMap[dateKey] || []) : [];
            const showGhost  = isLeaving && !hasEvents && ghostEvents.length > 0;
            const displayEvents = hasEvents ? dayEvents : (showGhost ? ghostEvents : []);
            const overflowCount = displayEvents.length - MAX_PILLS;

            return (
              <ContextMenu key={index}>
                <ContextMenuTrigger asChild>
                  <div
                    onClick={() => {
                      setSelectedDay(day.date);
                      if (defaultViewOnDayClick !== "month" && currentView === "month") {
                        handleViewChange(defaultViewOnDayClick);
                      }
                      if (onDateSelect) onDateSelect(day.date);
                    }}
                    className={cn(
                      "min-h-[92px] sm:min-h-[120px] p-1.5 sm:p-1.5 border-b border-r border-[#2a2a2a] cursor-pointer relative overflow-hidden",
                      "transition-colors hover:bg-[#202020]",
                      ACTIVITY_COLORS[activityLevel],
                      !isCurrentMonth && "opacity-35",
                      index % 7 === 6 && "border-r-0", // last col
                      index >= 35 && "border-b-0",     // last row
                    )}
                  >
                    {/* Date number with HoverCard */}
                    <div className="mb-1 sm:mb-1.5">
                      <HoverCard openDelay={300} closeDelay={100}>
                        <HoverCardTrigger asChild>
                          <span
                            onClick={(e) => e.stopPropagation()}
                            className={cn(
                              "inline-flex items-center justify-center text-xs sm:text-sm font-medium w-6 h-6 sm:w-7 sm:h-7 cursor-default select-none transition-colors",
                              isSelected
                                ? "bg-[#111214] text-white rounded-md"
                                : isToday
                                ? "bg-white text-black font-semibold"
                                : isCurrentMonth
                                ? "text-[#a3a3a3] rounded-full hover:bg-[#202020]"
                                : "text-[#474747]"
                            )}
                          >
                            {day.date.getDate()}
                          </span>
                        </HoverCardTrigger>
                        <HoverCardContent
                          className="w-60 bg-[#161616] border-[#2a2a2a] p-3 shadow-xl"
                          side="top"
                          align="start"
                        >
                          <p className="text-sm font-semibold text-white mb-2">
                            {day.date.toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                          {dayEvents.length === 0 ? (
                            <p className="text-xs text-[#737373]">No events scheduled</p>
                          ) : (
                            <div className="space-y-1.5">
                              {dayEvents.map((ev, i) => {
                                const cs = EVENT_COLORS[ev.type] || EVENT_COLORS.default;
                                return (
                                  <div key={i} className="flex items-center gap-2">
                                    <span
                                      className="w-2 h-2 rounded-full flex-shrink-0"
                                      style={{ backgroundColor: cs.dot }}
                                    />
                                    <span className="text-xs text-[#a3a3a3] truncate flex-1">
                                      {ev.title}
                                    </span>
                                    <span className="text-[10px] text-[#737373] flex-shrink-0">
                                      {formatEventTime(ev.start)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </HoverCardContent>
                      </HoverCard>
                    </div>

                    {/* Mobile: bottom-left activity dots */}
                    {displayEvents.length > 0 && (
                      <div
                        className={cn(
                          "absolute left-2 bottom-1.5 sm:hidden pointer-events-none",
                          isEntering && "cell-enter",
                          showGhost && "cell-leave",
                        )}
                      >
                        <div className="flex items-center gap-[5px]">
                          {displayEvents.slice(0, 3).map((event, i) => {
                            const cs = EVENT_COLORS[event.type] || EVENT_COLORS.default;
                            return (
                              <span
                                key={i}
                                className="w-[7px] h-[7px] rounded-full flex-shrink-0"
                                style={{ backgroundColor: showGhost ? `${cs.dot}66` : cs.dot }}
                              />
                            );
                          })}
                        </div>
                        {displayEvents.length > 3 && (
                          <span className="block text-[10px] text-[#737373] leading-none mt-1">
                            +{displayEvents.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Desktop: event pills */}
                    <div
                      className={cn(
                        "hidden sm:block space-y-[3px]",
                        isEntering && "cell-enter",
                        showGhost && "cell-leave",
                      )}
                    >
                      {displayEvents.slice(0, MAX_PILLS).map((event, i) => {
                        const cs = EVENT_COLORS[event.type] || EVENT_COLORS.default;
                        return (
                          <div
                            key={i}
                            onClick={(e) => {
                              if (showGhost) return;
                              e.stopPropagation();
                              if (onEventClick) onEventClick(event);
                            }}
                            className={cn(
                              "flex items-center gap-1 px-1.5 py-[3px] rounded text-[11px]",
                              "transition-all leading-tight",
                              showGhost ? "cursor-default opacity-60" : "cursor-pointer hover:brightness-125",
                              cs.pill
                            )}
                          >
                            {cs.special && (
                              <span
                                className="w-[5px] h-[5px] rounded-full flex-shrink-0"
                                style={{ backgroundColor: cs.dot }}
                              />
                            )}
                            <span className="truncate flex-1 min-w-0">{event.title}</span>
                            <span className="flex-shrink-0 opacity-60 text-[10px] pl-0.5">
                              {formatEventTime(event.start)}
                            </span>
                          </div>
                        );
                      })}
                      {overflowCount > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            if (showGhost) return;
                            e.stopPropagation();
                            setSelectedDay(day.date);
                            handleViewChange("day");
                            if (onDateSelect) onDateSelect(day.date);
                          }}
                          className={cn(
                            "text-[11px] text-[#737373] px-1.5 py-[2px] transition-colors",
                            showGhost ? "" : "hover:text-[#a3a3a3]"
                          )}
                        >
                          {overflowCount} more...
                        </button>
                      )}
                    </div>

                    {/* Avatar stack: show unique participants for the day */}
                    {(() => {
                      const dayParticipants = displayEvents
                        .filter(e => e.participants && e.participants.length > 0)
                        .flatMap(e => e.participants || []);
                      const uniqueParticipants = dayParticipants.filter(
                        (p, i, arr) => arr.findIndex(x => x.id === p.id) === i
                      );
                      const visibleCount = Math.min(uniqueParticipants.length, 3);
                      if (visibleCount === 0) return null;

                      return (
                        <div
                          className={cn(
                            "absolute bottom-1 left-1.5 hidden sm:flex z-10",
                            isEntering && "cell-enter",
                            showGhost && "cell-leave",
                          )}
                        >
                          <div className="flex -space-x-1.5">
                            {uniqueParticipants.slice(0, 3).map((p, i) => (
                              <HoverCard key={p.id} openDelay={200} closeDelay={50}>
                                <HoverCardTrigger asChild>
                                  <div
                                    className={cn(
                                      "relative flex items-center justify-center rounded-full",
                                      "ring-1 ring-[#1a1a1a] cursor-default shrink-0 overflow-hidden",
                                      i === 0 ? "w-[18px] h-[18px]" : "w-[16px] h-[16px]"
                                    )}
                                  >
                                    {p.avatar ? (
                                      <img
                                        src={p.avatar}
                                        alt={p.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <span className="text-[7px] font-semibold text-white leading-none select-none bg-gradient-to-br from-zinc-600 to-zinc-800 w-full h-full flex items-center justify-center rounded-full">
                                        {(p.name || "?").charAt(0).toUpperCase()}
                                      </span>
                                    )}
                                  </div>
                                </HoverCardTrigger>
                                <HoverCardContent
                                  className="w-auto bg-[#161616] border-[#2a2a2a] p-2 shadow-xl"
                                  side="top"
                                  align="start"
                                >
                                  <p className="text-xs font-medium text-white">{p.name}</p>
                                  {p.role && <p className="text-[10px] text-[#737373]">{p.role}</p>}
                                </HoverCardContent>
                              </HoverCard>
                            ))}
                            {uniqueParticipants.length > 3 && (
                              <div
                                className="relative z-10 flex items-center justify-center w-[16px] h-[16px] rounded-full ring-1 ring-[#1a1a1a] bg-zinc-700/80 text-[7px] font-medium text-zinc-300"
                              >
                                +{uniqueParticipants.length - 3}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </ContextMenuTrigger>

                <ContextMenuContent className="w-52 bg-[#202020] border-[#333333] shadow-xl">
                  <ContextMenuItem
                    className="text-[#a3a3a3] focus:bg-[#2a2a2a] focus:text-white cursor-pointer gap-2"
                    onClick={() => {
                      if (enableCreate && onEventCreate) onEventCreate(day.date);
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add event
                  </ContextMenuItem>
                  <ContextMenuItem
                    className="text-[#a3a3a3] focus:bg-[#2a2a2a] focus:text-white cursor-pointer gap-2"
                    onClick={() => {
                      setSelectedDay(day.date);
                      handleViewChange("day");
                      if (onDateSelect) onDateSelect(day.date);
                    }}
                  >
                    <CalendarIcon className="w-3.5 h-3.5" />
                    View day
                  </ContextMenuItem>
                  <ContextMenuItem
                    className="text-[#a3a3a3] focus:bg-[#2a2a2a] focus:text-white cursor-pointer gap-2"
                    onClick={() => {
                      setSelectedDay(day.date);
                      handleViewChange("week");
                      if (onDateSelect) onDateSelect(day.date);
                    }}
                  >
                    <List className="w-3.5 h-3.5" />
                    View week
                  </ContextMenuItem>
                  <ContextMenuSeparator className="bg-[#333333]" />
                  <ContextMenuItem
                    className="text-[#737373] focus:bg-[#2a2a2a] focus:text-white cursor-pointer gap-2"
                    onClick={() => {
                      navigator.clipboard?.writeText(
                        day.date.toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      );
                    }}
                  >
                    Copy date
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate);
    const today = new Date();
    const hours = [];
    
    for (let h = minHour; h <= maxHour; h += hourInterval) {
      hours.push(h);
    }

    return (
      <div className="flex flex-col h-full">
        {/* Week day headers */}
        <div className="grid grid-cols-8 border-b border-[#2a2a2a]">
          <div className="w-16"></div>
          {weekDays.map((day, index) => {
            const isToday = isSameDay(day, today);
            return (
              <div
                key={index}
                className={cn(
                  "text-center py-3 cursor-pointer hover:bg-[#1a1a1a]/50",
                  isToday && "bg-[#1a1a1a]"
                )}
                onClick={() => {
                  setSelectedDay(day);
                  // Switch to day view when clicking on a day in week view
                  if (defaultViewOnDayClick === "day" && currentView === "week") {
                    handleViewChange("day");
                  }
                  if (onDateSelect) onDateSelect(day);
                }}
              >
                <div className="text-xs text-[#6b6b6b] uppercase">
                  {WEEKDAYS[day.getDay()]}
                </div>
                <div
                  className={cn(
                    "text-lg font-medium mt-1 w-8 h-8 mx-auto flex items-center justify-center rounded-full",
                    isToday
                      ? "bg-zinc-500 text-white"
                      : "text-[#e7e7e7]"
                  )}
                >
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time slots */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-8">
            {/* Time column */}
            <div className="border-r border-[#2a2a2a]">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-16 text-xs text-[#6b6b6b] text-right pr-2 pt-1 flex items-center justify-center border-b border-[#2a2a2a]/50"
                >
                  {timeFormat === "12h" ? formatHour(hour) : `${hour}:00`}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day, dayIndex) => {
              const isToday = isSameDay(day, today);
              return (
                <div
                  key={dayIndex}
                  className={cn(
                    "border-r border-[#2a2a2a] last:border-r-0",
                    isToday && "bg-zinc-500/5"
                  )}
                >
                  {hours.map((hour) => {
                    const hourEvents = getEventsForHour(day, hour);
                    const activityLevel = showActivity ? getActivityForHour(day, hour) : 0;
                    return (
                      <div
                        key={hour}
                        className={cn(
                          "h-16 border-b border-[#2a2a2a]/50 relative group",
                          ACTIVITY_COLORS[activityLevel]
                        )}
                        onClick={() => {
                          const clickedDate = new Date(day);
                          clickedDate.setHours(hour, 0, 0, 0);
                          setSelectedDay(clickedDate);
                          if (onDateSelect) onDateSelect(clickedDate);
                        }}
                      >
                        {hourEvents.map((event, i) => {
                          const color = EVENT_COLORS[event.type] || EVENT_COLORS.default;
                          const startHour = new Date(event.start).getHours();
                          const endHour = new Date(event.end).getHours();
                          const duration = endHour - startHour || 1;
                          
                          return (
                            <div
                              key={i}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onEventClick) onEventClick(event);
                              }}
                              className={cn(
                                "absolute left-1 right-1 z-10 rounded px-2 py-1 text-xs cursor-pointer overflow-hidden",
                                color.bg,
                                color.border,
                                color.text,
                                duration > 1 ? "h-full" : "h-8 top-1"
                              )}
                              style={{
                                top: duration > 1 ? "2px" : undefined,
                                height: duration > 1 ? "calc(100% - 4px)" : undefined,
                              }}
                            >
                              <div className="font-medium truncate">{event.title}</div>
                              {duration <= 1 && (
                                <div className="text-[10px] opacity-75 truncate">
                                  {formatTime(new Date(event.start))} - {formatTime(new Date(event.end))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        
                        {/* Add event button on hover */}
                        {enableCreate && hourEvents.length === 0 && (
                          <div className="hidden group-hover:flex items-center justify-center h-full">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onEventCreate) {
                                  const createDate = new Date(day);
                                  createDate.setHours(hour, 0, 0, 0);
                                  onEventCreate(createDate);
                                }
                              }}
                            >
                              +
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const today = new Date();
    const hours = [];
    
    for (let h = minHour; h <= maxHour; h += hourInterval) {
      hours.push(h);
    }

    const dayEvents = events.filter((event) => {
      const eventStart = new Date(event.start);
      return isSameDay(eventStart, selectedDay);
    });

    // Generate 10 days centered around base date for horizontal strip
    const getDaysStrip = (centerDate) => {
      const days = [];
      const start = new Date(centerDate);
      start.setDate(start.getDate() - 4); // Show 4 days before
      for (let i = 0; i < 14; i++) {
        const day = new Date(start);
        day.setDate(start.getDate() + i);
        days.push(day);
      }
      return days;
    };

    const stripCenterDate = new Date(dayStripBaseDate);
    stripCenterDate.setDate(stripCenterDate.getDate() + dayStripOffset);
    const visibleDays = getDaysStrip(stripCenterDate);

    const handleDayStripClick = (day) => {
      setSelectedDay(day);
      // Don't change strip position - keep dayStripBaseDate and offset as-is
      if (onDateSelect) onDateSelect(day);
    };

    const handleScrollPrev = () => {
      setDayStripOffset(prev => prev - 10);
    };

    const handleScrollNext = () => {
      setDayStripOffset(prev => prev + 10);
    };

    return (
      <div className="flex flex-col h-full">
        {/* Day header */}
        <div className="text-center py-4 border-b border-[#2a2a2a]">
          <div className="text-sm text-[#6b6b6b] uppercase">
            {WEEKDAYS[selectedDay.getDay()]}
          </div>
          <div
            className={cn(
              "text-4xl font-bold mt-2 w-16 h-16 mx-auto flex items-center justify-center rounded-2xl",
              isSameDay(selectedDay, today)
                ? "bg-zinc-500 text-white"
                : "text-[#e7e7e7]"
            )}
          >
            {selectedDay.getDate()}
          </div>
          <div className="text-lg text-[#a3a3a3] mt-1">
            {MONTHS[selectedDay.getMonth()]} {selectedDay.getFullYear()}
          </div>
        </div>

        {/* Horizontal day navigation strip */}
        <div className="border-b border-[#2a2a2a] py-3 px-4">
          <div className="flex items-center gap-2">
            {/* Left scroll arrow */}
            <button
              onClick={handleScrollPrev}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-[#a3a3a3] hover:text-[#e7e7e7] hover:bg-[#2a2a2a] transition-colors"
              title="Previous 10 days"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Day strip - 10 days horizontal */}
            <div className="flex-1 flex gap-1.5 overflow-hidden">
              {visibleDays.map((day, idx) => {
                const isSelected = isSameDay(day, selectedDay);
                const isToday = isSameDay(day, today);
                const dayActivity = showActivity ? getActivityForDate(activities, day) : 0;
                
                return (
                  <button
                    key={idx}
                    onClick={() => handleDayStripClick(day)}
                    className={cn(
                      "flex-1 min-w-0 flex flex-col items-center justify-center rounded-lg",
                      "hover:bg-[#2a2a2a] transition-colors",
                      isSelected && "bg-[#2a2a2a] border border-[#474747]",
                      ACTIVITY_COLORS[dayActivity]
                    )}
                  >
                    {/* <div className="text-[9px] font-medium text-[#737373] uppercase">
                      {WEEKDAYS[day.getDay()].slice(0, 3)}
                    </div> */}
                    <div
                      className={cn(
                        "text-sm font-semibold mt-0.5 w-7 h-7 flex items-center justify-center rounded-lg",
                        isToday && "bg-zinc-500 text-white",
                        !isToday && !isSelected && "text-[#e7e7e7]",
                        isSelected && !isToday && "text-white"
                      )}
                    >
                      {day.getDate()}
                    </div>
                    {/* {dayActivity > 0 && (
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full mt-0.5",
                        dayActivity >= 4 ? "bg-green-500" : dayActivity >= 2 ? "bg-yellow-500" : "bg-zinc-500"
                      )} />
                    )} */}
                  </button>
                );
              })}
            </div>

            {/* Right scroll arrow */}
            <button
              onClick={handleScrollNext}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-[#a3a3a3] hover:text-[#e7e7e7] hover:bg-[#2a2a2a] transition-colors"
              title="Next 10 days"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Events list */}
        <div className="flex-1 overflow-y-auto mt-6">
          <div className="space-y-2">
            {hours.map((hour) => {
              const hourEvents = getEventsForHour(selectedDay, hour);
              const activityLevel = showActivity ? getActivityForHour(selectedDay, hour) : 0;
              
              return (
                <div
                  key={hour}
                  className="flex gap-4 min-h-[60px] border-b border-[#2a2a2a]/30 px-8"
                >
                  <div className="w-16 flex-shrink-0 pt-2">
                    <span className="text-sm text-[#6b6b6b]">
                      {timeFormat === "12h" ? formatHour(hour) : `${hour}:00`}
                    </span>
                  </div>
                  <div className={cn("w-full relative rounded-lg p-1", ACTIVITY_COLORS[activityLevel])}>
                    {hourEvents.length === 0 ? (
                      <div 
                        className={cn(
                          "h-12 rounded-lg border border-dashed border-[#2a2a2a] cursor-pointer hover:border-[#474747] hover:bg-[#1a1a1a]/30 transition-all",
                          enableCreate && "group"
                        )}
                        onClick={() => {
                          if (enableCreate && onEventCreate) {
                            const createDate = new Date(selectedDay);
                            createDate.setHours(hour, 0, 0, 0);
                            onEventCreate(createDate);
                          }
                        }}
                      >
                        {enableCreate && (
                          <div className="hidden group-hover:flex items-center justify-center h-full text-[#6b6b6b] text-sm">
                            Click to add event
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {hourEvents.map((event, i) => {
                          const color = EVENT_COLORS[event.type] || EVENT_COLORS.default;
                          const startTime = formatTime(new Date(event.start));
                          const endTime = formatTime(new Date(event.end));
                          
                          return (
                            <div
                              key={i}
                              onClick={() => {
                                if (onEventClick) onEventClick(event);
                              }}
                              className={cn(
                                "rounded-lg p-3 cursor-pointer transition-all hover:scale-[1.01]",
                                color.bg,
                                color.border,
                                "border-l-4"
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-[#e7e7e7]">
                                  {event.title}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-[#a3a3a3]">
                                  <Clock className="w-3 h-3" />
                                  {startTime} - {endTime}
                                </div>
                              </div>
                              {event.description && (
                                <div className="text-sm text-[#a3a3a3] mt-1">
                                  {event.description}
                                </div>
                              )}
                              {event.location && (
                                <div className="text-xs text-[#6b6b6b] mt-2 flex items-center gap-1">
                                  📍 {event.location}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Render activity summary widget
  const renderActivitySummary = () => {
    if (!showActivity) return null;
    
    // Calculate total activity for visible period
    let daysToCheck = [];
    if (currentView === 'day') {
      daysToCheck = [selectedDay];
    } else if (currentView === 'week') {
      daysToCheck = getWeekDays(currentDate);
    } else {
      daysToCheck = getDaysInMonth(currentDate, 1).map(d => d.date);
    }
    
    const totalActivity = daysToCheck.reduce((sum, date) => {
      return sum + getActivityForDate(activities, date);
    }, 0);
    
    const avgActivity = totalActivity / daysToCheck.length;
    const activityLabel = avgActivity > 4 ? 'Very High' : avgActivity > 3 ? 'High' : avgActivity > 2 ? 'Moderate' : avgActivity > 1 ? 'Low' : 'Minimal';
    
    return (
      <div className="px-6 py-3 border-t border-[#2a2a2a] bg-[#1a1a1a] rounded-b-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#a3a3a3]" />
            <span className="text-sm text-[#a3a3a3]">Activity Level:</span>
            <span className="text-sm font-semibold text-[#e7e7e7]">{activityLabel}</span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(level => (
              <div
                key={level}
                className={cn(
                  "w-4 h-4 rounded",
                  level <= Math.round(avgActivity) ? ACTIVITY_COLORS[level] : 'bg-zinc-500/10'
                )}
                title={`Level ${level}`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden", className)}>
      <div className="p-6">
        {showHeader && renderHeader()}
        
        <div className={cn(showHeader && "mt-4")}>
          {currentView === "month" && renderMonthView()}
          {currentView === "week" && renderWeekView()}
          {currentView === "day" && renderDayView()}
        </div>
      </div>
      {renderActivitySummary()}
    </div>
  );
}

// Timeline Component
export function Timeline({
  events = [],
  onEventClick,
  onEventCreate,
  enableCreate = false,
  startDate = new Date(),
  daysToShow = 14,
  className,
}) {
  const [currentStartDate, setCurrentStartDate] = useState(new Date(startDate));
  
  const days = useMemo(() => {
    const result = [];
    for (let i = 0; i < daysToShow; i++) {
      const day = new Date(currentStartDate);
      day.setDate(currentStartDate.getDate() + i);
      result.push(day);
    }
    return result;
  }, [currentStartDate, daysToShow]);

  const today = new Date();

  const getEventsForDate = (date) => {
    return events.filter((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return isSameDay(date, eventStart) || isSameDay(date, eventEnd) ||
             (date > eventStart && date < eventEnd);
    });
  };

  const navigatePrev = () => {
    const newDate = new Date(currentStartDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentStartDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentStartDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentStartDate(newDate);
  };

  const goToToday = () => {
    setCurrentStartDate(new Date());
  };

  return (
    <div className={cn("bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-[#e7e7e7]">
          {days[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} -{" "}
          {days[days.length - 1].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </h2>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToToday}
            className="text-[#a3a3a3] hover:text-[#e7e7e7] hover:bg-[#2a2a2a]"
          >
            Today
          </Button>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={navigatePrev}
              className="h-8 w-8 text-[#a3a3a3] hover:text-[#e7e7e7] hover:bg-[#2a2a2a]"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={navigateNext}
              className="h-8 w-8 text-[#a3a3a3] hover:text-[#e7e7e7] hover:bg-[#2a2a2a]"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Day headers */}
          <div className="grid grid-cols-[80px_repeat(14,1fr)] gap-1 mb-2">
            <div></div>
            {days.map((day, index) => {
              const isToday = isSameDay(day, today);
              return (
                <div
                  key={index}
                  className={cn(
                    "text-center py-2 rounded-lg",
                    isToday ? "bg-zinc-500/20" : ""
                  )}
                >
                  <div className="text-xs text-[#6b6b6b] uppercase">
                    {WEEKDAYS[day.getDay()]}
                  </div>
                  <div
                    className={cn(
                      "text-lg font-medium",
                      isToday ? "text-blue-400" : "text-[#e7e7e7]"
                    )}
                  >
                    {day.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Timeline rows */}
          <div className="space-y-1">
            {days.map((day, dayIndex) => {
              const dayEvents = getEventsForDate(day);
              const isToday = isSameDay(day, today);
              
              return (
                <div
                  key={dayIndex}
                  className={cn(
                    "grid grid-cols-[80px_repeat(14,1fr)] gap-1 py-1 rounded-lg",
                    isToday && "bg-zinc-500/20"
                  )}
                >
                  {/* Day label */}
                  <div className="flex items-center">
                    <span className="text-sm text-[#6b6b6b]">
                      {day.toLocaleDateString("en-US", { weekday: "short" })}
                    </span>
                  </div>
                  
                  {/* Events */}
                  <div className="col-span-14 flex gap-1 flex-wrap">
                    {dayEvents.length === 0 ? (
                      <div className="text-xs text-[#3a3a3a] px-2 py-1">
                        No events
                      </div>
                    ) : (
                      dayEvents.map((event, i) => {
                        const color = EVENT_COLORS[event.type] || EVENT_COLORS.default;
                        return (
                          <div
                            key={i}
                            onClick={() => {
                              if (onEventClick) onEventClick(event);
                            }}
                            className={cn(
                              "text-xs px-2 py-1 rounded-full cursor-pointer transition-all hover:scale-105",
                              color.bg,
                              color.text,
                              "border border-current/30"
                            )}
                          >
                            {event.title}
                          </div>
                        );
                      })
                    )}
                    
                    {/* Add button */}
                    {enableCreate && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-[#6b6b6b] hover:text-[#e7e7e7]"
                        onClick={() => {
                          if (onEventCreate) onEventCreate(day);
                        }}
                      >
                        +
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Event Modal Component
export function EventModal({
  isOpen,
  onClose,
  event,
  onSave,
  onDelete,
  mode = "view", // "view", "create", "edit"
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start: "",
    end: "",
    type: "default",
    location: "",
  });

  useEffect(() => {
    if (event && mode !== "create") {
      setFormData({
        title: event.title || "",
        description: event.description || "",
        start: event.start ? new Date(event.start).toISOString().slice(0, 16) : "",
        end: event.end ? new Date(event.end).toISOString().slice(0, 16) : "",
        type: event.type || "default",
        location: event.location || "",
      });
    } else if (mode === "create") {
      const now = new Date();
      setFormData({
        title: "",
        description: "",
        start: now.toISOString().slice(0, 16),
        end: new Date(now.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16),
        type: "default",
        location: "",
      });
    }
  }, [event, mode, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave({
        ...formData,
        start: new Date(formData.start),
        end: new Date(formData.end),
      });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <h3 className="text-xl font-semibold text-[#e7e7e7] mb-4">
          {mode === "create" ? "Create Event" : mode === "edit" ? "Edit Event" : "Event Details"}
        </h3>

        {mode === "view" ? (
          <div className="space-y-4">
            <div>
              <h4 className="text-2xl font-bold text-[#e7e7e7]">{event?.title}</h4>
              <div className="flex items-center gap-2 mt-2 text-[#a3a3a3]">
                <Clock className="w-4 h-4" />
                {event?.start && formatTime(new Date(event.start))} - {event?.end && formatTime(new Date(event.end))}
              </div>
            </div>
            
            {event?.description && (
              <div className="text-[#a3a3a3]">{event.description}</div>
            )}
            
            {event?.location && (
              <div className="text-[#a3a3a3] flex items-center gap-2">
                📍 {event.location}
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => onClose()}
                className="flex-1"
              >
                Close
              </Button>
              {onDelete && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    onDelete(event);
                    onClose();
                  }}
                  className="flex-1"
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-[#a3a3a3] mb-1 block">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Event title"
                className="bg-[#0a0a0a] border-[#2a2a2a]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-[#a3a3a3] mb-1 block">Start</label>
                <Input
                  type="datetime-local"
                  value={formData.start}
                  onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                  className="bg-[#0a0a0a] border-[#2a2a2a]"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-[#a3a3a3] mb-1 block">End</label>
                <Input
                  type="datetime-local"
                  value={formData.end}
                  onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                  className="bg-[#0a0a0a] border-[#2a2a2a]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-[#a3a3a3] mb-1 block">Type</label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="bg-[#0a0a0a] border-[#2a2a2a]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="milestone">Milestone</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-[#a3a3a3] mb-1 block">Location</label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Meeting room or video link"
                className="bg-[#0a0a0a] border-[#2a2a2a]"
              />
            </div>

            <div>
              <label className="text-sm text-[#a3a3a3] mb-1 block">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Event description"
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-3 text-[#e7e7e7] placeholder:text-[#6b6b6b] focus:outline-none focus:border-[#474747]"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-[#2a2a2a] text-[#a3a3a3] hover:text-[#e7e7e7] hover:bg-[#2a2a2a]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-zinc-600 hover:bg-zinc-700"
              >
                {mode === "create" ? "Create" : "Save"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Calendar;
