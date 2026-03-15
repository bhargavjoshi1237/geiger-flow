"use client";

import React, { useState, useMemo } from "react";
import { Calendar } from "./calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import { Activity, Calendar as CalendarIcon, TrendingUp, Zap } from "lucide-react";

/**
 * Activity Calendar Component
 * A specialized calendar that shows activity patterns and intensity
 * 
 * Activity Data Structure:
 * {
 *   timestamp: Date | string,
 *   intensity?: number (1-5, default 1),
 *   count?: number (alternative to intensity),
 *   type?: string (for categorization),
 *   metadata?: object (additional data)
 * }
 */

export function ActivityCalendar({
  activities = [],
  onDateSelect,
  onActivityClick,
  showStats = true,
  title = "Activity Calendar",
  description = "Visualize activity patterns over time",
  className,
}) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState("month");

  // Calculate statistics
  const stats = useMemo(() => {
    if (!showStats || activities.length === 0) return null;

    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const weekActivities = activities.filter(a => new Date(a.timestamp) >= lastWeek);
    const monthActivities = activities.filter(a => new Date(a.timestamp) >= lastMonth);

    const totalWeek = weekActivities.reduce((sum, a) => sum + (a.intensity || a.count || 1), 0);
    const totalMonth = monthActivities.reduce((sum, a) => sum + (a.intensity || a.count || 1), 0);
    const dailyAverage = totalMonth / 30;

    const mostActiveDay = getMostActiveDay(activities);
    const peakHours = getPeakHours(activities);

    return {
      weekTotal: totalWeek,
      monthTotal: totalMonth,
      dailyAverage: dailyAverage.toFixed(1),
      mostActiveDay,
      peakHours,
      trend: calculateTrend(activities),
    };
  }, [activities, showStats]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    if (onDateSelect) onDateSelect(date);
  };

  return (
    <div className={className}>
      {/* Statistics Cards */}
      {showStats && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-[#202020] border-[#2a2a2a]">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#737373] text-xs">This Week</CardDescription>
              <CardTitle className="text-2xl text-[#e7e7e7] flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                {stats.weekTotal}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-[#202020] border-[#2a2a2a]">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#737373] text-xs">This Month</CardDescription>
              <CardTitle className="text-2xl text-[#e7e7e7] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                {stats.monthTotal}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-[#202020] border-[#2a2a2a]">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#737373] text-xs">Daily Average</CardDescription>
              <CardTitle className="text-2xl text-[#e7e7e7] flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                {stats.dailyAverage}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-[#202020] border-[#2a2a2a]">
            <CardHeader className="pb-2">
              <CardDescription className="text-[#737373] text-xs">Most Active</CardDescription>
              <CardTitle className="text-2xl text-[#e7e7e7] flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-purple-400" />
                {stats.mostActiveDay}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Calendar */}
      <Calendar
        activities={activities}
        showActivity={true}
        activityViewMode="overlay"
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        view={view}
        onViewChange={setView}
        showViewSwitcher={true}
        onEventClick={onActivityClick}
        className=""
      />

      {/* Activity Legend */}
      <div className="mt-4 flex items-center justify-between px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl">
        <span className="text-sm text-[#737373]">Activity Intensity</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#6b6b6b]">Less</span>
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3, 4, 5].map(level => (
              <div
                key={level}
                className={`w-4 h-4 rounded ${
                  level === 0 ? 'bg-zinc-500/10' : `bg-zinc-500/${level * 10}`
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-[#6b6b6b]">More</span>
        </div>
      </div>
    </div>
  );
}

// Utility functions
function getMostActiveDay(activities) {
  const dayCounts = {};
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  activities.forEach(activity => {
    const date = new Date(activity.timestamp);
    const day = date.getDay();
    dayCounts[day] = (dayCounts[day] || 0) + (activity.intensity || activity.count || 1);
  });

  let maxDay = 0;
  let maxCount = 0;
  
  Object.entries(dayCounts).forEach(([day, count]) => {
    if (count > maxCount) {
      maxCount = count;
      maxDay = parseInt(day);
    }
  });

  return dayNames[maxDay];
}

function getPeakHours(activities) {
  const hourCounts = {};
  
  activities.forEach(activity => {
    const date = new Date(activity.timestamp);
    const hour = date.getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + (activity.intensity || activity.count || 1);
  });

  const sorted = Object.entries(hourCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([hour]) => parseInt(hour));

  return sorted;
}

function calculateTrend(activities) {
  const today = new Date();
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const weekBefore = new Date(lastWeek);
  weekBefore.setDate(weekBefore.getDate() - 7);

  const thisWeekActivities = activities.filter(a => {
    const date = new Date(a.timestamp);
    return date >= lastWeek && date < today;
  });

  const lastWeekActivities = activities.filter(a => {
    const date = new Date(a.timestamp);
    return date >= weekBefore && date < lastWeek;
  });

  const thisWeekTotal = thisWeekActivities.reduce((sum, a) => sum + (a.intensity || a.count || 1), 0);
  const lastWeekTotal = lastWeekActivities.reduce((sum, a) => sum + (a.intensity || a.count || 1), 0);

  if (lastWeekTotal === 0) return 0;
  return ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100;
}

export default ActivityCalendar;
