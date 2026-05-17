"use client";

import React, { useState, useEffect } from "react";
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
import { AddActivityDialog } from "@/components/internal/dilouges/activities/add_activity_dilouge";
import { cn } from "@/lib/utils";

const PARTICIPANTS = [
  { id: "you",      name: "You",           role: "Project Lead",   avatar: "/avatars/you.png"       },
  { id: "ali",      name: "Ali",           role: "Designer",       avatar: "/avatars/ali.png"       },
  { id: "alex",     name: "Alex",          role: "Engineer",       avatar: "/avatars/alex.png"      },
  { id: "blake",    name: "Blake",         role: "Product",        avatar: "/avatars/blake.png"     },
  { id: "jamie",    name: "Jamie",         role: "Marketing",      avatar: "/avatars/jamie.png"     },
  { id: "amelie",   name: "Amélie",        role: "Design Lead",    avatar: "/avatars/amelie.png"    },
  { id: "olivia",   name: "Olivia",        role: "QA Engineer",    avatar: "/avatars/olivia.png"    },
  { id: "riley",    name: "Riley",         role: "DevOps",         avatar: "/avatars/riley.png"     },
  { id: "zahir",    name: "Zahir",         role: "CTO",            avatar: "/avatars/zahir.png"     },
  { id: "ava",      name: "Ava",           role: "CEO",            avatar: "/avatars/ava.png"       },
];

const TABS = ["All", "Shared", "Public", "Archived"];
const TAB_KEYS = ["all events", "shared", "public", "archived"];

const SAMPLE_EVENTS = [
  
  { id: "d30-1", title: "Monday standup",         start: "2024-12-30T09:00", end: "2024-12-30T09:30",  type: "standup",   visibility: "shared",   owner: "you",      participants: [PARTICIPANTS[0], PARTICIPANTS[2], PARTICIPANTS[4]] },
  { id: "d30-2", title: "Coffee with Ali",         start: "2024-12-30T11:30", end: "2024-12-30T12:00",  type: "coffee",    visibility: "shared",   owner: "you",      participants: [PARTICIPANTS[0], PARTICIPANTS[1]] },
  { id: "d30-3", title: "Marketing site review",  start: "2024-12-30T14:30", end: "2024-12-30T15:30",  type: "marketing", visibility: "public",   owner: "jamie",    participants: [PARTICIPANTS[4], PARTICIPANTS[0], PARTICIPANTS[8]] },
  { id: "d30-4", title: "Product sync",           start: "2024-12-30T16:00", end: "2024-12-30T17:00",  type: "meeting",   visibility: "shared",   owner: "you",      participants: [PARTICIPANTS[0], PARTICIPANTS[3]] },
  { id: "d30-5", title: "Design review",          start: "2024-12-30T17:00", end: "2024-12-30T18:00",  type: "design",    visibility: "public",   owner: "amelie",   participants: [PARTICIPANTS[5], PARTICIPANTS[1], PARTICIPANTS[0]] },
  { id: "d31-1", title: "Monday standup",         start: "2024-12-31T09:00", end: "2024-12-31T09:30",  type: "standup",   visibility: "shared",   owner: "you",      participants: [PARTICIPANTS[0], PARTICIPANTS[2]] },
  { id: "j2-1",  title: "One-on-one w/ Alex",     start: "2025-01-02T10:00", end: "2025-01-02T10:30",  type: "meeting",   visibility: "shared",   owner: "you",      participants: [PARTICIPANTS[0], PARTICIPANTS[2]] },
  { id: "j2-2",  title: "All-hands meeting",      start: "2025-01-02T16:00", end: "2025-01-02T17:00",  type: "meeting",   visibility: "public",   owner: "zahir",    participants: [PARTICIPANTS[8], PARTICIPANTS[9], PARTICIPANTS[0], PARTICIPANTS[2], PARTICIPANTS[3]] },
  { id: "j2-3",  title: "Dinner with the team",   start: "2025-01-02T18:30", end: "2025-01-02T20:00",  type: "personal",  visibility: "public",   owner: "you",      participants: [PARTICIPANTS[0], PARTICIPANTS[1], PARTICIPANTS[2], PARTICIPANTS[5]] },
  { id: "j3-1",  title: "Friday standup",         start: "2025-01-03T09:00", end: "2025-01-03T09:30",  type: "standup",   visibility: "shared",   owner: "you",      participants: [PARTICIPANTS[0], PARTICIPANTS[2], PARTICIPANTS[7]] },
  { id: "j5-1",  title: "House inspection",       start: "2025-01-05T10:30", end: "2025-01-05T12:00",  type: "inspection",visibility: "public",   owner: "you",      participants: [PARTICIPANTS[0]] },
  { id: "j6-1",  title: "Monday standup",         start: "2025-01-06T09:00", end: "2025-01-06T09:30",  type: "standup",   visibility: "shared",   owner: "you",      participants: [PARTICIPANTS[0], PARTICIPANTS[2]] },
  { id: "j6-2",  title: "Content planning",       start: "2025-01-06T11:00", end: "2025-01-06T12:00",  type: "planning",  visibility: "shared",   owner: "you",      participants: [PARTICIPANTS[0], PARTICIPANTS[4]] },
  { id: "j7-1",  title: "One-on-one w/ Blake",    start: "2025-01-07T10:00", end: "2025-01-07T10:30",  type: "meeting",   visibility: "shared",   owner: "you",      participants: [PARTICIPANTS[0], PARTICIPANTS[3]] },
  { id: "j7-2",  title: "Catch up w/ Ali",        start: "2025-01-07T14:30", end: "2025-01-07T15:00",  type: "coffee",    visibility: "shared",   owner: "you",      participants: [PARTICIPANTS[0], PARTICIPANTS[1]] },
  { id: "j8-1",  title: "Deep work",              start: "2025-01-08T09:00", end: "2025-01-08T12:00",  type: "work",      visibility: "shared",   owner: "you",      participants: [PARTICIPANTS[0]] },
  { id: "j8-2",  title: "Design sync",            start: "2025-01-08T10:30", end: "2025-01-08T11:00",  type: "design",    visibility: "public",   owner: "amelie",   participants: [PARTICIPANTS[5], PARTICIPANTS[1]] },
  { id: "j8-3",  title: "SEO planning",           start: "2025-01-08T13:30", end: "2025-01-08T14:30",  type: "planning",  visibility: "shared",   owner: "you",      participants: [PARTICIPANTS[0], PARTICIPANTS[4]] },
  { id: "j8-4",  title: "Growth review",          start: "2025-01-08T15:00", end: "2025-01-08T16:00",  type: "meeting",   visibility: "public",   owner: "zahir",    participants: [PARTICIPANTS[8], PARTICIPANTS[3], PARTICIPANTS[0]] },
  { id: "j8-5",  title: "1:1 Jamie",              start: "2025-01-08T16:30", end: "2025-01-08T17:00",  type: "meeting",   visibility: "shared",   owner: "you",      participants: [PARTICIPANTS[0], PARTICIPANTS[4]] },
  { id: "j8-6",  title: "Roadmap planning",       start: "2025-01-08T17:00", end: "2025-01-08T18:00",  type: "planning",  visibility: "shared",   owner: "you",      participants: [PARTICIPANTS[0], PARTICIPANTS[3]] },
  { id: "j9-1",  title: "Lunch with the crew",    start: "2025-01-09T12:00", end: "2025-01-09T13:00",  type: "lunch",     visibility: "public",   owner: "ali",      participants: [PARTICIPANTS[1], PARTICIPANTS[2], PARTICIPANTS[0], PARTICIPANTS[5]] },
  { id: "j10-1", title: "Friday standup",         start: "2025-01-10T09:00", end: "2025-01-10T09:30",  type: "standup",   visibility: "shared",   owner: "you",      participants: [PARTICIPANTS[0], PARTICIPANTS[2], PARTICIPANTS[7]] },
  { id: "j10-2", title: "Olivia x Riley",         start: "2025-01-10T10:00", end: "2025-01-10T10:30",  type: "meeting",   visibility: "public",   owner: "olivia",   participants: [PARTICIPANTS[6], PARTICIPANTS[7]] },
  { id: "j10-3", title: "Product demo",           start: "2025-01-10T13:30", end: "2025-01-10T14:30",  type: "meeting",   visibility: "public",   owner: "blake",    participants: [PARTICIPANTS[3], PARTICIPANTS[0], PARTICIPANTS[2], PARTICIPANTS[9]] },
  { id: "j11-1", title: "House inspection",       start: "2025-01-11T11:00", end: "2025-01-11T12:30",  type: "inspection",visibility: "public",   owner: "you",      participants: [PARTICIPANTS[0]] },
  { id: "j12-1", title: "Ava's engagement",       start: "2025-01-12T13:00", end: "2025-01-12T15:00",  type: "social",    visibility: "public",   owner: "ava",      participants: [PARTICIPANTS[9], PARTICIPANTS[0], PARTICIPANTS[1]] },
  { id: "j13-1", title: "Monday standup",         start: "2025-01-13T09:00", end: "2025-01-13T09:30",  type: "standup",   visibility: "shared",   owner: "you",      participants: [PARTICIPANTS[0], PARTICIPANTS[2]] },
  { id: "j13-2", title: "Team lunch",             start: "2025-01-13T12:15", end: "2025-01-13T13:15",  type: "lunch",     visibility: "public",   owner: "you",      participants: [PARTICIPANTS[0], PARTICIPANTS[1], PARTICIPANTS[2], PARTICIPANTS[3], PARTICIPANTS[4]] },
  { id: "j15-1", title: "Product planning",       start: "2025-01-15T09:30", end: "2025-01-15T10:30",  type: "planning",  visibility: "shared",   owner: "you",      participants: [PARTICIPANTS[0], PARTICIPANTS[3]] },
  { id: "j17-1", title: "Friday standup",         start: "2025-01-17T09:00", end: "2025-01-17T09:30",  type: "standup",   visibility: "shared",   owner: "you",      participants: [PARTICIPANTS[0], PARTICIPANTS[2], PARTICIPANTS[7]] },
  { id: "j17-2", title: "Coffee w/ Amélie",       start: "2025-01-17T09:30", end: "2025-01-17T10:00",  type: "coffee",    visibility: "shared",   owner: "you",      participants: [PARTICIPANTS[0], PARTICIPANTS[5]] },
  { id: "j17-3", title: "All-hands meeting",      start: "2025-01-17T16:00", end: "2025-01-17T17:00",  type: "meeting",   visibility: "public",   owner: "zahir",    participants: [PARTICIPANTS[8], PARTICIPANTS[9], PARTICIPANTS[0], PARTICIPANTS[2], PARTICIPANTS[3], PARTICIPANTS[6]] },
  { id: "j17-4", title: "Design feedback",        start: "2025-01-17T14:30", end: "2025-01-17T15:30",  type: "design",    visibility: "public",   owner: "amelie",   participants: [PARTICIPANTS[5], PARTICIPANTS[1], PARTICIPANTS[0]] },
  { id: "j17-5", title: "Sprint planning",        start: "2025-01-17T11:00", end: "2025-01-17T12:00",  type: "planning",  visibility: "shared",   owner: "you",      participants: [PARTICIPANTS[0], PARTICIPANTS[2], PARTICIPANTS[7]] },
  { id: "j18-1", title: "Half marathon",          start: "2025-01-18T07:00", end: "2025-01-18T10:00",  type: "exercise",  visibility: "public",   owner: "you",      participants: [PARTICIPANTS[0]] },
  { id: "j20-1", title: "Monday standup",         start: "2025-01-20T09:00", end: "2025-01-20T09:30",  type: "standup",   visibility: "shared",   owner: "you",      participants: [PARTICIPANTS[0], PARTICIPANTS[2]] },
  { id: "j20-2", title: "Deep work",              start: "2025-01-20T09:15", end: "2025-01-20T12:00",  type: "work",      visibility: "shared",   owner: "you",      participants: [PARTICIPANTS[0]] },
  { id: "j21-1", title: "Quarterly review",       start: "2025-01-21T11:30", end: "2025-01-21T12:30",  type: "meeting",   visibility: "public",   owner: "zahir",    participants: [PARTICIPANTS[8], PARTICIPANTS[9], PARTICIPANTS[3], PARTICIPANTS[0]] },
  { id: "j21-2", title: "Lunch with Zahir",       start: "2025-01-21T13:00", end: "2025-01-21T14:00",  type: "lunch",     visibility: "shared",   owner: "you",      participants: [PARTICIPANTS[0], PARTICIPANTS[8]] },
  { id: "j21-3", title: "Dinner with family",     start: "2025-01-21T19:00", end: "2025-01-21T21:00",  type: "personal",  visibility: "shared",   owner: "you",      participants: [PARTICIPANTS[0]] },
  { id: "j22-1", title: "Deep work",              start: "2025-01-22T09:00", end: "2025-01-22T12:00",  type: "work",      visibility: "shared",   owner: "you",      participants: [PARTICIPANTS[0]] },
  { id: "j22-2", title: "Design sync",            start: "2025-01-22T14:30", end: "2025-01-22T15:00",  type: "design",    visibility: "public",   owner: "amelie",   participants: [PARTICIPANTS[5], PARTICIPANTS[1]] },
  { id: "j23-1", title: "Amélie coffee",          start: "2025-01-23T10:00", end: "2025-01-23T10:30",  type: "coffee",    visibility: "shared",   owner: "you",      participants: [PARTICIPANTS[0], PARTICIPANTS[5]] },
  { id: "j24-1", title: "Friday standup",         start: "2025-01-24T09:00", end: "2025-01-24T09:30",  type: "standup",   visibility: "shared",   owner: "you",      participants: [PARTICIPANTS[0], PARTICIPANTS[2], PARTICIPANTS[7]] },
  { id: "j24-2", title: "Accountant",             start: "2025-01-24T13:45", end: "2025-01-24T14:45",  type: "meeting",   visibility: "shared",   owner: "you",      participants: [PARTICIPANTS[0]] },
  { id: "j24-3", title: "Marketing site review",  start: "2025-01-24T14:30", end: "2025-01-24T15:30",  type: "marketing", visibility: "public",   owner: "jamie",    participants: [PARTICIPANTS[4], PARTICIPANTS[0], PARTICIPANTS[1]] },
  { id: "j24-4", title: "Board prep",             start: "2025-01-24T16:00", end: "2025-01-24T17:00",  type: "planning",  visibility: "shared",   owner: "you",      participants: [PARTICIPANTS[0], PARTICIPANTS[9]] },
  { id: "j24-5", title: "Investor call",          start: "2025-01-24T17:00", end: "2025-01-24T18:00",  type: "meeting",   visibility: "public",   owner: "ava",      participants: [PARTICIPANTS[9], PARTICIPANTS[8], PARTICIPANTS[0]] },
  { id: "j27-1", title: "Monday standup",         start: "2025-01-27T09:00", end: "2025-01-27T09:30",  type: "standup",   visibility: "shared",   owner: "you",      participants: [PARTICIPANTS[0], PARTICIPANTS[2]] },
  { id: "j28-1", title: "Content planning",       start: "2025-01-28T11:00", end: "2025-01-28T12:00",  type: "planning",  visibility: "shared",   owner: "you",      participants: [PARTICIPANTS[0], PARTICIPANTS[4]] },
  { id: "j28-2", title: "Lunch with Ali",         start: "2025-01-28T12:45", end: "2025-01-28T13:45",  type: "lunch",     visibility: "shared",   owner: "you",      participants: [PARTICIPANTS[0], PARTICIPANTS[1]] },
  { id: "j29-1", title: "Product planning",       start: "2025-01-29T09:30", end: "2025-01-29T10:30",  type: "planning",  visibility: "shared",   owner: "you",      participants: [PARTICIPANTS[0], PARTICIPANTS[3]] },
  { id: "j30-1", title: "All-hands meeting",      start: "2025-01-30T16:00", end: "2025-01-30T17:00",  type: "meeting",   visibility: "public",   owner: "zahir",    participants: [PARTICIPANTS[8], PARTICIPANTS[9], PARTICIPANTS[0], PARTICIPANTS[2], PARTICIPANTS[3]] },
  { id: "j30-2", title: "Team dinner",            start: "2025-01-30T17:30", end: "2025-01-30T19:30",  type: "social",    visibility: "public",   owner: "you",      participants: [PARTICIPANTS[0], PARTICIPANTS[1], PARTICIPANTS[2], PARTICIPANTS[5]] },
  { id: "j31-1", title: "Friday standup",         start: "2025-01-31T09:00", end: "2025-01-31T09:30",  type: "standup",   visibility: "shared",   owner: "you",      participants: [PARTICIPANTS[0], PARTICIPANTS[2], PARTICIPANTS[7]] },
  { id: "f2-1",  title: "Monday standup",         start: "2025-02-02T09:00", end: "2025-02-02T09:30",  type: "standup",   visibility: "shared",   owner: "you",      participants: [PARTICIPANTS[0], PARTICIPANTS[2]] },

  
  { id: "multi-1", title: "Team Offsite - Strategy", start: "2024-12-06T09:00", end: "2024-12-08T18:00", type: "meeting",  visibility: "public",  owner: "zahir",   participants: [PARTICIPANTS[8], PARTICIPANTS[9], PARTICIPANTS[3], PARTICIPANTS[0]] },
  { id: "multi-2", title: "Product Launch Week v2.0", start: "2025-01-13T00:00", end: "2025-01-17T23:59", type: "milestone", visibility: "public",  owner: "blake",   participants: [PARTICIPANTS[3], PARTICIPANTS[0], PARTICIPANTS[2], PARTICIPANTS[6], PARTICIPANTS[5]] },
  { id: "multi-3", title: "Tech Conference 2025", start: "2025-01-20T08:00", end: "2025-01-21T20:00", type: "meeting",  visibility: "public",  owner: "alex",    participants: [PARTICIPANTS[2], PARTICIPANTS[7], PARTICIPANTS[0]] },
  { id: "multi-4", title: "Sprint 15 - Development", start: "2025-01-06T09:00", end: "2025-01-10T18:00", type: "work",     visibility: "shared",  owner: "you",     participants: [PARTICIPANTS[0], PARTICIPANTS[2], PARTICIPANTS[7]] },
  { id: "multi-5", title: "Client Workshop - Phase 2", start: "2025-01-23T10:00", end: "2025-01-24T17:00", type: "meeting",  visibility: "public",  owner: "blake",   participants: [PARTICIPANTS[3], PARTICIPANTS[0], PARTICIPANTS[5]] },
  { id: "multi-6", title: "Annual Company Retreat", start: "2025-02-03T07:00", end: "2025-02-05T20:00", type: "social",   visibility: "public",  owner: "ava",     participants: [PARTICIPANTS[9], PARTICIPANTS[8], PARTICIPANTS[0], PARTICIPANTS[1], PARTICIPANTS[2], PARTICIPANTS[4]] },

  
  { id: "week-1", title: "Q1 Product Development", start: "2024-12-02T09:00", end: "2024-12-30T18:00", type: "deadline",  visibility: "public",  owner: "blake",   participants: [PARTICIPANTS[3], PARTICIPANTS[0], PARTICIPANTS[2]] },
  { id: "week-2", title: "Winter Marketing Campaign", start: "2025-01-06T00:00", end: "2025-01-26T23:59", type: "marketing", visibility: "public",  owner: "jamie",   participants: [PARTICIPANTS[4], PARTICIPANTS[0]] },
  { id: "week-3", title: "Beta Testing - Phase 1", start: "2025-01-13T00:00", end: "2025-01-27T23:59", type: "task",      visibility: "shared",  owner: "you",     participants: [PARTICIPANTS[0], PARTICIPANTS[6], PARTICIPANTS[7]] },
  { id: "week-4", title: "New Hire Onboarding Batch 1", start: "2025-02-03T09:00", end: "2025-02-14T17:00", type: "planning", visibility: "shared", owner: "you",   participants: [PARTICIPANTS[0], PARTICIPANTS[3]] },

  { id: "arch-1", title: "Q4 Retrospective",      start: "2024-11-15T10:00", end: "2024-11-15T11:30", type: "meeting",  visibility: "shared",  owner: "you",   archived: true, participants: [PARTICIPANTS[0], PARTICIPANTS[3], PARTICIPANTS[8]] },
  { id: "arch-2", title: "Old Product Demo",      start: "2024-11-20T14:00", end: "2024-11-20T15:00", type: "meeting",  visibility: "public",  owner: "blake",  archived: true, participants: [PARTICIPANTS[3], PARTICIPANTS[0], PARTICIPANTS[9]] },
  { id: "arch-3", title: "Legacy Sprint Review",  start: "2024-11-22T09:00", end: "2024-11-22T10:00", type: "standup",  visibility: "shared",  owner: "you",   archived: true, participants: [PARTICIPANTS[0], PARTICIPANTS[2], PARTICIPANTS[7]] },
  { id: "arch-4", title: "Budget Planning 2024",  start: "2024-10-28T11:00", end: "2024-10-28T12:30", type: "planning", visibility: "shared",  owner: "you",   archived: true, participants: [PARTICIPANTS[0], PARTICIPANTS[8]] },
  { id: "arch-5", title: "Halloween Party",       start: "2024-10-31T18:00", end: "2024-10-31T22:00", type: "social",   visibility: "public",  owner: "jamie",  archived: true, participants: [PARTICIPANTS[4], PARTICIPANTS[1], PARTICIPANTS[2], PARTICIPANTS[0]] },
];

const SAMPLE_ACTIVITIES = [
  { timestamp: "2026-03-15T09:00", intensity: 3 },
  { timestamp: "2026-03-15T10:00", intensity: 4 },
  { timestamp: "2026-03-15T11:00", intensity: 2 },
  { timestamp: "2026-03-15T14:00", intensity: 5 },
  { timestamp: "2026-03-15T15:00", intensity: 3 },
  { timestamp: "2026-03-15T16:00", intensity: 1 },
  
  { timestamp: "2026-03-16T08:00", intensity: 2 },
  { timestamp: "2026-03-16T09:00", intensity: 5 },
  { timestamp: "2026-03-16T10:00", intensity: 4 },
  { timestamp: "2026-03-16T11:00", intensity: 3 },
  { timestamp: "2026-03-16T13:00", intensity: 2 },
  { timestamp: "2026-03-16T14:00", intensity: 5 },
  { timestamp: "2026-03-16T15:00", intensity: 4 },
  { timestamp: "2026-03-16T16:00", intensity: 3 },
  { timestamp: "2026-03-16T17:00", intensity: 2 },
  
  { timestamp: "2026-03-17T09:00", intensity: 3 },
  { timestamp: "2026-03-17T10:00", intensity: 4 },
  { timestamp: "2026-03-17T11:00", intensity: 2 },
  { timestamp: "2026-03-17T14:00", intensity: 5 },
  { timestamp: "2026-03-17T15:00", intensity: 5 },
  { timestamp: "2026-03-17T16:00", intensity: 4 },
  
  { timestamp: "2026-03-18T08:00", intensity: 1 },
  { timestamp: "2026-03-18T09:00", intensity: 4 },
  { timestamp: "2026-03-18T10:00", intensity: 5 },
  { timestamp: "2026-03-18T11:00", intensity: 5 },
  { timestamp: "2026-03-18T12:00", intensity: 2 },
  { timestamp: "2026-03-18T14:00", intensity: 3 },
  { timestamp: "2026-03-18T15:00", intensity: 4 },
  { timestamp: "2026-03-18T16:00", intensity: 2 },
  { timestamp: "2026-03-18T17:00", intensity: 1 },
  
  { timestamp: "2026-03-19T09:00", intensity: 3 },
  { timestamp: "2026-03-19T10:00", intensity: 3 },
  { timestamp: "2026-03-19T11:00", intensity: 4 },
  { timestamp: "2026-03-19T13:00", intensity: 5 },
  { timestamp: "2026-03-19T14:00", intensity: 5 },
  { timestamp: "2026-03-19T15:00", intensity: 4 },
  { timestamp: "2026-03-19T16:00", intensity: 3 },
  
  { timestamp: "2026-03-20T08:00", intensity: 2 },
  { timestamp: "2026-03-20T09:00", intensity: 5 },
  { timestamp: "2026-03-20T10:00", intensity: 4 },
  { timestamp: "2026-03-20T11:00", intensity: 3 },
  { timestamp: "2026-03-20T14:00", intensity: 2 },
  { timestamp: "2026-03-20T15:00", intensity: 1 },
  { timestamp: "2026-03-20T16:00", intensity: 2 },
  { timestamp: "2026-03-20T17:00", intensity: 3 },
  
  { timestamp: "2026-03-21T10:00", intensity: 2 },
  { timestamp: "2026-03-21T11:00", intensity: 1 },
  { timestamp: "2026-03-21T14:00", intensity: 3 },
  { timestamp: "2026-03-21T15:00", intensity: 2 },
  
  { timestamp: "2026-03-22T09:00", intensity: 1 },
  { timestamp: "2026-03-22T10:00", intensity: 2 },
  { timestamp: "2026-03-22T11:00", intensity: 1 },
  { timestamp: "2026-03-22T15:00", intensity: 2 },
  { timestamp: "2026-03-22T16:00", intensity: 1 },
  
  { timestamp: "2026-03-23T08:00", intensity: 3 },
  { timestamp: "2026-03-23T09:00", intensity: 5 },
  { timestamp: "2026-03-23T10:00", intensity: 4 },
  { timestamp: "2026-03-23T11:00", intensity: 5 },
  { timestamp: "2026-03-23T13:00", intensity: 3 },
  { timestamp: "2026-03-23T14:00", intensity: 4 },
  { timestamp: "2026-03-23T15:00", intensity: 5 },
  { timestamp: "2026-03-23T16:00", intensity: 4 },
  { timestamp: "2026-03-23T17:00", intensity: 3 },

  { timestamp: "2026-05-15T09:30", name: "Sprint handoff", type: "planning", intensity: 3 },
  { timestamp: "2026-05-15T14:00", name: "Asset QA pass", type: "task", intensity: 2 },
  { timestamp: "2026-05-16T10:00", name: "DAM upload review", type: "meeting", intensity: 4 },
  { timestamp: "2026-05-16T15:30", name: "Metadata cleanup", type: "work", intensity: 2 },
  { timestamp: "2026-05-17T09:00", name: "Release readiness check", type: "deadline", intensity: 5 },
  { timestamp: "2026-05-17T11:30", name: "Design sync", type: "design", intensity: 3 },
  { timestamp: "2026-05-17T16:00", name: "Stakeholder notes", type: "reminder", intensity: 2 },
  { timestamp: "2026-05-18T10:30", name: "Preview deployment", type: "milestone", intensity: 4 },
  { timestamp: "2026-05-18T13:00", name: "Bug triage", type: "task", intensity: 3 },
  { timestamp: "2026-05-19T09:30", name: "Content audit", type: "work", intensity: 2 },
  { timestamp: "2026-05-19T15:00", name: "Calendar feedback", type: "meeting", intensity: 3 },
  { timestamp: "2026-05-20T12:00", name: "Follow-up reminder", type: "reminder", intensity: 1 },
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
  const [currentDate, setCurrentDate]   = useState(new Date(2025, 0, 10));   const [viewMode, setViewMode]         = useState("month");
  const [searchQuery, setSearchQuery]   = useState("");
  const [fadeKey, setFadeKey]                 = useState(0);
  const [displayEvents, setDisplayEvents]     = useState(SAMPLE_EVENTS);

  const today = new Date();

  useEffect(() => {
    let filtered;
    switch (activeTab) {
      case "shared":
        filtered = SAMPLE_EVENTS.filter(
          (e) => e.visibility === "shared" && !e.archived
        );
        break;
      case "public":
        filtered = SAMPLE_EVENTS.filter(
          (e) => e.visibility === "public" && !e.archived
        );
        break;
      case "archived":
        filtered = SAMPLE_EVENTS.filter((e) => e.archived);
        break;
      default:         filtered = SAMPLE_EVENTS.filter((e) => !e.archived);
        break;
    }
    setDisplayEvents(filtered);
    setFadeKey((k) => k + 1);            }, [activeTab]);

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
    console.log("Saving calendar activity:", activity);
    setIsAddActivityOpen(false);
    setSelectedCreateDate(null);
  };

  return (
    <MainScreenWrapper className="text-[#e7e7e7]">
    <div className="flex flex-col h-full w-full min-h-screen">
    <div className="hidden sm:flex items-center justify-between border-b border-[#2a2a2a] pb-6 mb-8"> 
        <div>
          <h1 className="text-3xl font-bold text-[#e7e7e7]">Projections</h1>
          <p className="text-[#a3a3a3] mt-1">
            View and manage project timelines, milestones, and delivery dates.
          </p>
        </div>
        <div className="flex items-center ">
        <div className="flex items-center gap-1.5 justify-center">
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
                    : "text-[#737373] hover:text-white"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>
      </div>

      <div className="sm:hidden mb-4">
        <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-3">
          <h1 className="text-[35px] font-semibold leading-none text-[#e7e7e7] tracking-tight">Calendar</h1>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-2 rounded-lg text-[#737373] hover:text-white hover:bg-[#202020] transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-2 rounded-lg text-[#737373] hover:text-white hover:bg-[#202020] transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
        <div className="border border-[#2a2a2a] rounded-2xl overflow-hidden bg-[#1a1a1a]">
          <div className="border-b border-[#2a2a2a]">
            <div className="flex flex-col gap-3 px-4 py-3 sm:hidden">
              <div className="flex items-center gap-1 bg-[#202020] w-full justify-center rounded-xl p-1 border border-[#2a2a2a]">
                {TABS.map((tab, idx) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(TAB_KEYS[idx])}
                    className={cn(
                      "px-3 py-1.5 text-sm w-full font-medium rounded-lg transition-all",
                      activeTab === TAB_KEYS[idx]
                        ? "bg-[#f5f5f5] text-[#111111] shadow-sm"
                        : "text-[#8a8a8a] hover:text-white"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 justify-between">
                <p className="text-[15px] font-semibold text-white leading-tight">
                  {getViewTitle(currentDate, viewMode)}
                </p>
                <p className="text-xs text-[#737373] leading-tight">
                  {getViewSubtitle(currentDate, viewMode)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Select value={viewMode} onValueChange={handleViewModeChange}>
                  <SelectTrigger className="h-9 w-[136px] bg-[#202020] border-[#333333] text-[#a3a3a3] text-sm rounded-lg focus:ring-0 focus:border-[#474747]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#202020] border-[#2a2a2a]">
                    <SelectItem value="month" className="text-[#a3a3a3] focus:bg-[#2a2a2a]">Month</SelectItem>
                    <SelectItem value="week"  className="text-[#a3a3a3] focus:bg-[#2a2a2a]">Week</SelectItem>
                    <SelectItem value="day"   className="text-[#a3a3a3] focus:bg-[#2a2a2a]">Day</SelectItem>
                  </SelectContent>
                </Select>
                <AddActivityDialog onSave={handleSaveActivity}>
                  <Button className="h-9 bg-[#121214] text-white hover:bg-[#1d1d20] text-sm font-medium px-3 rounded-lg gap-1.5 shrink-0 flex-1">
                    <Plus className="w-4 h-4" />
                    Add event
                  </Button>
                </AddActivityDialog>
              </div>

              <div className="grid grid-cols-[40px_1fr_40px] border border-[#2f2f2f] rounded-xl overflow-hidden">
                <button
                  type="button"
                  className="h-9 flex items-center justify-center text-[#737373] border-r border-[#2f2f2f] hover:text-white hover:bg-[#202020] transition-colors"
                  onClick={navigatePrev}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={goToToday}
                  className="h-9 text-sm font-semibold text-center text-[#a3a3a3] hover:text-white hover:bg-[#202020] transition-colors"
                >
                  Today
                </button>
                <button
                  type="button"
                  className="h-9 flex items-center justify-center text-[#737373] border-l border-[#2f2f2f] hover:text-white hover:bg-[#202020] transition-colors"
                  onClick={navigateNext}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="hidden sm:flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                
                  {viewMode !== "month" && (
                    <button
                      type="button"
                      onClick={() => setViewMode("month")}
                      className="flex mr-4 items-center gap-1.5 text-sm font-medium text-[#a3a3a3] hover:text-white transition-colors mr-1"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                      <span className="hidden lg:inline">Month</span>
                    </button>
                  )}

                  <div
                  className="pointer mr-2 flex flex-col items-center justify-center w-11 h-11 rounded-lg border border-[#333333] bg-[#242424] text-center leading-none">
                    <span className="text-[9px] font-bold text-[#60a5fa] uppercase tracking-widest">
                      {MONTHS[today.getMonth()].slice(0, 3)}
                    </span>
                    <span className="text-[17px] font-bold text-white leading-none mt-0.5">
                      {today.getDate()}
                    </span>
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-white leading-tight">
                      {getViewTitle(currentDate, viewMode)}
                    </p>
                    <p className="text-xs text-[#737373] leading-tight mt-0.5">
                      {getViewSubtitle(currentDate, viewMode)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
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
                  className="p-1.5 rounded-lg text-[#737373] hover:text-white hover:bg-[#202020] transition-colors"
                  onClick={navigateNext}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
                <Select value={viewMode} onValueChange={handleViewModeChange}>
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
                <AddActivityDialog onSave={handleSaveActivity}>
                  <Button className="h-9 bg-white text-black hover:bg-[#e5e5e5] text-sm font-medium px-4 rounded-lg gap-1.5">
                    <Plus className="w-4 h-4" />
                  </Button>
                </AddActivityDialog>
              </div>
            </div>
          </div>

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
