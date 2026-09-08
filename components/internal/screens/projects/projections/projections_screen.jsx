"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Calendar } from "@geiger/ui";
import { Button } from "@geiger/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@geiger/ui";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Loader2,
} from "lucide-react";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import {
  EmptyState,
  ScreenHeader,
  SearchInput,
  StatsBar,
  Toolbar,
} from "@/components/internal/shared/screen_kit";
import { SegmentedTabs } from "@geiger/ui";
import { NewProjectionDialog } from "@/components/internal/dilouges/projections/new_projection_dilouge";
import { useProject } from "@/context/project-context";
import { DEFAULT_PROJECTION_KIND, DEFAULT_PROJECTION_VISIBILITY, toDayKey } from "@/features/projections/constants";
import {
  listProjections,
  createProjection,
  updateProjection,
  softDeleteProjection,
} from "@/features/projections/actions";

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
  const { project } = useProject();
  const projectId = project?.id;

  const [activeTab, setActiveTab]       = useState("all events");
  const [currentDate, setCurrentDate]   = useState(new Date());
  const [viewMode, setViewMode]         = useState("month");
  const [searchQuery, setSearchQuery]   = useState("");
  const [fadeKey] = useState(0);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [initialDate, setInitialDate] = useState(null);

  useEffect(() => {
    if (!projectId) {
      return;
    }
    let active = true;
    void Promise.resolve().then(async () => {
      setLoading(true);
      const rows = await listProjections(projectId);
      if (active) {
        setEvents(rows);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [projectId]);

  const today = new Date();
  const displayEvents = useMemo(() => {
    switch (activeTab) {
      case "shared":
        return events.filter((event) => event.visibility === "shared" && !event.archivedAt);
      case "public":
        return events.filter((event) => event.visibility === "public" && !event.archivedAt);
      case "archived":
        return events.filter((event) => event.archivedAt);
      default:
        return events.filter((event) => !event.archivedAt);
    }
  }, [activeTab, events]);

  const filteredEvents = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return displayEvents;
    }
    return displayEvents.filter((event) =>
      `${event.title} ${event.owner}`.toLowerCase().includes(normalizedQuery)
    );
  }, [displayEvents, searchQuery]);

  const stats = useMemo(() => {
    const shared = events.filter((event) => event.visibility === "shared" && !event.archivedAt).length;
    const publik = events.filter((event) => event.visibility === "public" && !event.archivedAt).length;
    const archived = events.filter((event) => event.archivedAt).length;
    return [
      { label: "Total events", value: String(events.length), footer: `${filteredEvents.length} shown` },
      { label: "Shared", value: String(shared), footer: "Visible to the team" },
      { label: "Public", value: String(publik), footer: "Visible to everyone" },
      { label: "Archived", value: String(archived), footer: "Hidden from the calendar" },
    ];
  }, [events, filteredEvents]);

  // Adapt camelCase view models to the Calendar's shape ({ title, start, end,
  // type }). All-day spans run start -> end-of-day so multi-day projections
  // overlap every cell they cover, across month boundaries too.
  const calendarEvents = useMemo(
    () =>
      filteredEvents.map((projection) => ({
        ...projection,
        type: projection.kind,
        start: `${projection.startsOn || toDayKey()}T09:00:00`,
        end: `${projection.endsOn || projection.startsOn || toDayKey()}T23:59:59`,
      })),
    [filteredEvents]
  );

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

  const openCreateDialog = (date) => {
    setEditingEvent(null);
    setInitialDate(date ? toDayKey(date) : toDayKey());
    setIsDialogOpen(true);
  };

  const openEditDialog = (calendarEvent) => {
    setEditingEvent(calendarEvent);
    setIsDialogOpen(true);
  };

  const handleClearFilters = () => {
    setActiveTab("all events");
    setSearchQuery("");
  };

  const handleCreateEvent = async (input) => {
    if (!projectId) {
      return;
    }

    const optimistic = {
      id: crypto.randomUUID(),
      projectId,
      title: input.title?.trim() || "",
      description: input.description?.trim() || "",
      kind: input.kind || DEFAULT_PROJECTION_KIND,
      startsOn: input.startsOn || toDayKey(),
      endsOn: input.endsOn || null,
      visibility: input.visibility || DEFAULT_PROJECTION_VISIBILITY,
      archivedAt: null,
      owner: input.owner?.trim() || "",
    };

    const previous = events;
    setEvents((prev) => [optimistic, ...prev]);

    const created = await createProjection(projectId, optimistic);
    if (!created) {
      setEvents(previous);
      toast.error("Failed to create event");
      return;
    }

    setEvents((prev) => prev.map((e) => (e.id === created.id ? created : e)));
    toast.success("Event created");
  };

  const handleSaveEdit = async (updated) => {
    const previous = events;
    setEditingEvent(null);
    setIsDialogOpen(false);
    setEvents((prev) =>
      prev.map((e) => (e.id === updated.id ? { ...e, ...updated } : e))
    );

    const saved = await updateProjection(updated.id, updated);
    if (!saved) {
      setEvents(previous);
      toast.error("Failed to update event");
      return;
    }

    setEvents((prev) => prev.map((e) => (e.id === saved.id ? saved : e)));
    toast.success("Event updated");
  };

  const handleDeleteEvent = async (id) => {
    const previous = events;
    setEditingEvent(null);
    setIsDialogOpen(false);
    setEvents((prev) => prev.filter((e) => e.id !== id));

    const ok = await softDeleteProjection(id);
    if (!ok) {
      setEvents(previous);
      toast.error("Failed to delete event");
      return;
    }

    toast.success("Event deleted");
  };

  const handleToggleArchive = async (projection) => {
    const archiving = !projection.archivedAt;
    const archivedAt = archiving ? new Date().toISOString() : null;

    const previous = events;
    setEditingEvent(null);
    setIsDialogOpen(false);
    setEvents((prev) =>
      prev.map((e) => (e.id === projection.id ? { ...e, archivedAt } : e))
    );

    const saved = await updateProjection(projection.id, { archivedAt });
    if (!saved) {
      setEvents(previous);
      toast.error(archiving ? "Failed to archive event" : "Failed to restore event");
      return;
    }

    setEvents((prev) => prev.map((e) => (e.id === saved.id ? saved : e)));
    toast.success(archiving ? "Event archived" : "Event restored");
  };

  return (
    <MainScreenWrapper className="text-foreground">
    <div className="flex flex-col h-full w-full min-h-screen">
      <ScreenHeader
        title="Projections"
        description="View and manage project timelines, milestones, and delivery dates."
        actions={
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => openCreateDialog(new Date())}
          >
            <Plus className="h-4 w-4" /> New Event
          </Button>
        }
      />

      <StatsBar stats={stats} />

      <Toolbar>
        <SegmentedTabs tabs={TAB_OPTIONS} value={activeTab} onChange={setActiveTab} />
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search projections, owners…"
        />
      </Toolbar>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-subtle px-6 py-16 text-sm text-text-secondary">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading projections…
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface-subtle">
          <EmptyState
            icon={CalendarDays}
            title="No projections yet"
            description="Map your first milestone, release, review or deadline onto the calendar."
            action={
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => openCreateDialog(new Date())}
              >
                <Plus className="h-4 w-4" /> Add event
              </Button>
            }
          />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface-subtle">
          <EmptyState
            icon={Search}
            title="Nothing matches this filter"
            description="No projections match the current tab or search."
            action={
              <Button variant="ghost" onClick={handleClearFilters}>
                Clear filters
              </Button>
            }
          />
        </div>
      ) : (
        <div className="border border-border rounded-2xl overflow-hidden bg-surface-subtle">
          <div className="border-b border-border">
            <div className="flex flex-col gap-3 px-4 py-3 sm:hidden">
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
                <Button
                  type="button"
                  onClick={() => openCreateDialog(new Date())}
                  className="h-9 bg-background text-foreground hover:bg-surface-subtle text-sm font-medium px-3 rounded-lg gap-1.5 shrink-0 flex-1"
                >
                  <Plus className="w-4 h-4" />
                  Add event
                </Button>
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
                <Button
                  type="button"
                  onClick={() => openCreateDialog(new Date())}
                  className="h-9 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium px-4 rounded-lg gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <Calendar
            events={calendarEvents}
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
            onEventCreate={openCreateDialog}
            onEventClick={openEditDialog}
            className="border-0 rounded-none bg-transparent p-0"
            fadeKey={fadeKey}
          />
        </div>
      )}

      <NewProjectionDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingEvent(null);
            setInitialDate(null);
          }
        }}
        onCreate={handleCreateEvent}
        editProjection={editingEvent}
        onEdit={handleSaveEdit}
        onDelete={handleDeleteEvent}
        onToggleArchive={handleToggleArchive}
        initialDate={initialDate}
      />

    </div></MainScreenWrapper>
  );
}
