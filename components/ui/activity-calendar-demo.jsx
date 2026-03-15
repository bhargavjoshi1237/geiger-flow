"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ActivityCalendar } from "./activity-calendar";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Input } from "./input";
import { Label } from "./label";
import { RefreshCw, Play, Pause, Plus } from "lucide-react";
import { AddActivityDialog } from "@/components/internal/dilouges/activities/add_activity_dilouge";

/**
 * Demo component showing various activity visualization patterns
 */

export function ActivityCalendarDemo() {
  const [activities, setActivities] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(2000);

  // Generate random activity data
  const generateRandomActivity = () => {
    const now = new Date();
    const randomDaysAgo = Math.floor(Math.random() * 30); // Last 30 days
    const randomHour = Math.floor(Math.random() * 24);
    const randomMinute = Math.floor(Math.random() * 60);

    const timestamp = new Date(now);
    timestamp.setDate(timestamp.getDate() - randomDaysAgo);
    timestamp.setHours(randomHour, randomMinute, 0, 0);

    return {
      timestamp: timestamp.toISOString(),
      intensity: Math.ceil(Math.random() * 5),
      type: ['work', 'meeting', 'task', 'personal'][Math.floor(Math.random() * 4)],
      metadata: {
        source: 'demo',
      },
    };
  };

  // Initialize with some sample data
  useEffect(() => {
    const sampleActivities = [];
    for (let i = 0; i < 150; i++) {
      sampleActivities.push(generateRandomActivity());
    }
    setActivities(sampleActivities);
  }, []);

  // Simulate real-time activity
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      const newActivity = {
        timestamp: new Date().toISOString(),
        intensity: Math.ceil(Math.random() * 5),
        type: ['work', 'meeting', 'task', 'personal'][Math.floor(Math.random() * 4)],
        metadata: {
          source: 'realtime',
        },
      };
      
      setActivities(prev => [newActivity, ...prev].slice(0, 1000)); // Keep last 1000
    }, simulationSpeed);

    return () => clearInterval(interval);
  }, [isSimulating, simulationSpeed]);

  const handleDateSelect = (date) => {
    console.log("Selected date:", date);
    const dayActivities = activities.filter(a => {
      const activityDate = new Date(a.timestamp);
      return (
        activityDate.getFullYear() === date.getFullYear() &&
        activityDate.getMonth() === date.getMonth() &&
        activityDate.getDate() === date.getDate()
      );
    });
    console.log(`Found ${dayActivities.length} activities on this day`);
  };

  const handleActivityClick = (activity) => {
    console.log("Activity clicked:", activity);
  };

  const refreshData = () => {
    const newActivities = [];
    for (let i = 0; i < 150; i++) {
      newActivities.push(generateRandomActivity());
    }
    setActivities(newActivities);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="bg-[#202020] border-[#2a2a2a]">
        <CardHeader>
          <CardTitle className="text-[#e7e7e7]">Activity Visualization Demo</CardTitle>
          <CardDescription className="text-[#a3a3a3]">
            This demo shows how to visualize activity patterns across days, weeks, and hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <AddActivityDialog onSave={(activity) => {
              console.log("Adding new activity:", activity);
              setActivities(prev => [activity, ...prev]);
            }}>
              <Button
                className="bg-white text-black hover:bg-[#e7e7e7]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Activity
              </Button>
            </AddActivityDialog>

            <Button
              onClick={() => setIsSimulating(!isSimulating)}
              className="bg-zinc-600 hover:bg-zinc-700"
            >
              {isSimulating ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause Simulation
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Simulation
                </>
              )}
            </Button>

            <Button
              onClick={refreshData}
              variant="outline"
              className="border-[#2a2a2a]"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>

            <div className="flex items-center gap-2 ml-auto">
              <Label htmlFor="speed" className="text-sm text-[#a3a3a3]">
                Speed:
              </Label>
              <Input
                id="speed"
                type="number"
                value={simulationSpeed}
                onChange={(e) => setSimulationSpeed(Math.max(500, parseInt(e.target.value) || 2000))}
                className="w-24 bg-[#0a0a0a] border-[#2a2a2a]"
                placeholder="ms"
              />
              <span className="text-xs text-[#6b6b6b]">ms</span>
            </div>
          </div>

          {isSimulating && (
            <div className="mt-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-[#a3a3a3]">Simulating real-time activity...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Calendar */}
      <ActivityCalendar
        activities={activities}
        onDateSelect={handleDateSelect}
        onActivityClick={handleActivityClick}
        showStats={true}
        title="Team Activity"
        description="Track activity patterns and intensity"
      />

      {/* Activity Patterns Info */}
      <Card className="bg-[#202020] border-[#2a2a2a]">
        <CardHeader>
          <CardTitle className="text-[#e7e7e7]">Activity Patterns</CardTitle>
          <CardDescription className="text-[#a3a3a3]">
            Visual information about your activity data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium text-[#e7e7e7] mb-3">Day View</h4>
              <p className="text-sm text-[#a3a3a3]">
                Shows hourly activity intensity with background shading.
                Darker colors indicate higher activity levels.
              </p>
              <div className="mt-3 space-y-1">
                <div className="text-xs text-[#6b6b6b]">• Light: Minimal activity (1-2 events)</div>
                <div className="text-xs text-[#6b6b6b]">• Medium: Moderate activity (3-4 events)</div>
                <div className="text-xs text-[#6b6b6b]">• Dark: High activity (5+ events)</div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-[#e7e7e7] mb-3">Week View</h4>
              <p className="text-sm text-[#a3a3a3]">
                Displays hourly patterns across the week with activity heatmaps.
                Each time slot shows activity intensity level.
              </p>
              <div className="mt-3 space-y-1">
                <div className="text-xs text-[#6b6b6b]">• Compare patterns across days</div>
                <div className="text-xs text-[#6b6b6b]">• Identify peak hours</div>
                <div className="text-xs text-[#6b6b6b]">• Find gaps and lulls</div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-[#e7e7e7] mb-3">Month View</h4>
              <p className="text-sm text-[#a3a3a3]">
                Provides a high-level overview with daily activity intensity.
                Great for spotting weekly patterns and trends.
              </p>
              <div className="mt-3 space-y-1">
                <div className="text-xs text-[#6b6b6b]">• Track long-term patterns</div>
                <div className="text-xs text-[#6b6b6b]">• Compare weeks and months</div>
                <div className="text-xs text-[#6b6b6b]">• Plan resource allocation</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Structure Info */}
      <Card className="bg-[#202020] border-[#2a2a2a]">
        <CardHeader>
          <CardTitle className="text-[#e7e7e7]">Activity Data Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs text-[#a3a3a3] bg-[#1a1a1a] p-4 rounded-lg overflow-x-auto border border-[#2a2a2a]">
{`{
  timestamp: Date | string,   // When the activity occurred
  intensity?: number,         // 1-5 scale (default: 1)
  count?: number,             // Alternative to intensity
  type?: string,              // Category (work, meeting, etc.)
  metadata?: {                // Additional data
    source: string,
    [key: string]: any
  }
}`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

export default ActivityCalendarDemo;
