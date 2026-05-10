"use client";

import React, { useState } from "react";
import {
  Archive,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Filter,
  LayoutList,
  ListFilter,
  NotebookText,
  Plus,
  Search,
  Settings,
  Timer,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Tasks", Icon: BriefcaseBusiness },
  { label: "Created by Me", Icon: FileText },
  { label: "Calendar", Icon: CalendarDays },
  { label: "Files", Icon: Archive },
  { label: "Notes", Icon: NotebookText },
  { label: "Time", Icon: Timer },
];

const PROJECTS = [
  { name: "Demo Project", color: "bg-orange-400" },
  { name: "Product Roadmap - My Team", color: "bg-amber-400" },
  { name: "Launch Playbook", color: "bg-fuchsia-500" },
  { name: "Feature Requests", color: "bg-sky-400" },
];

const TASK_GROUPS = [
  {
    title: "Overdue",
    count: 3,
    tasks: [
      {
        id: "DEM-1",
        title: "Create a New Project",
        project: "Demo Project",
        checklist: "0/1",
        status: "In Progress",
        list: "Getting Started",
        assignee: "AJ",
        subscriber: "Add",
        dueDate: "May 8, 1:24 AM",
        tag: "High Priority",
        tone: "danger",
      },
      {
        id: "DEM-17",
        title: "Test",
        project: "Demo Project",
        checklist: "",
        status: "To Do",
        list: "Exploring Nifty",
        assignee: "AJ",
        subscriber: "AJ",
        dueDate: "May 9, 12:00 AM",
        tag: "High Priority",
        tone: "danger",
      },
      {
        id: "DEM-8",
        title: "View Help Guides in Docs",
        project: "Demo Project",
        checklist: "0/3",
        status: "To Do",
        list: "Exploring Nifty",
        assignee: "AJ",
        subscriber: "Add",
        dueDate: "May 10, 1:24 AM",
        tag: "Low Priority",
        tone: "success",
      },
    ],
  },
  {
    title: "Due Today",
    count: 1,
    tasks: [
      {
        id: "DEM-8",
        title: "View Help Guides in Docs",
        project: "Demo Project",
        checklist: "0/3",
        status: "To Do",
        list: "Exploring Nifty",
        assignee: "AJ",
        subscriber: "Add",
        dueDate: "May 10, 1:24 AM",
        tag: "Low Priority",
        tone: "success",
      },
    ],
  },
  { title: "Due This Month", count: 2, tasks: [] },
];

const CREATED_ROWS = [
  ["Project permissions review", "Feature Requests", "In Review", "May 14"],
  ["Roadmap intake template", "Product Roadmap - My Team", "To Do", "May 18"],
  ["Launch content checklist", "Launch Playbook", "In Progress", "May 21"],
];

const FILE_ROWS = [
  ["Release brief.pdf", "Launch Playbook", "Edited today", "1.2 MB"],
  ["Customer feedback.csv", "Feature Requests", "Edited yesterday", "840 KB"],
  ["Roadmap Q2.fig", "Product Roadmap - My Team", "Edited May 6", "5.8 MB"],
];

const NOTE_ROWS = [
  ["Daily blockers", "Demo Project", "Updated 20m ago", "Private"],
  ["Launch risks", "Launch Playbook", "Updated yesterday", "Team"],
  ["Feature review notes", "Feature Requests", "Updated May 7", "Team"],
];

const TIME_ROWS = [
  ["Create a New Project", "Demo Project", "02:45", "Today"],
  ["View Help Guides in Docs", "Demo Project", "01:20", "Today"],
  ["Launch checklist", "Launch Playbook", "03:10", "This week"],
];

const HOURS = [
  "7:00 AM",
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
];

function ProjectScopePanel() {
  return (
    <aside className="hidden w-[250px] shrink-0 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] xl:block">
      <div className="flex h-12 items-center justify-between border-b border-[#2a2a2a] px-4">
        <span className="text-sm font-semibold text-[#ededed]">Select Projects: All Projects</span>
        <ChevronDown className="h-4 w-4 text-[#a3a3a3]" />
      </div>
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
          <Input
            placeholder="Type to search..."
            className="h-10 border-[#3a3a3a] bg-[#202020] pl-10 text-sm text-[#ededed] placeholder:text-[#737373]"
          />
        </div>
        <div className="mt-4 space-y-1">
          <div className="flex items-center gap-2 px-1 text-xs font-medium text-[#a3a3a3]">
            <span className="flex h-4 w-4 items-center justify-center rounded bg-emerald-500">
              <Check className="h-3 w-3 text-white" />
            </span>
            <span>General</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </div>
          {PROJECTS.map((project) => (
            <button
              key={project.name}
              type="button"
              className="flex h-8 w-full items-center gap-2 rounded-md px-5 text-left text-sm text-[#d4d4d4] hover:bg-[#242424]"
            >
              <span className="flex h-4 w-4 items-center justify-center rounded bg-emerald-500">
                <Check className="h-3 w-3 text-white" />
              </span>
              <span className={cn("h-4 w-4 rounded-[4px]", project.color)} />
              <span className="truncate">{project.name}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

function AssigneeControl({ label }) {
  return (
    <div className="flex items-center gap-1">
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-300 text-[11px] font-bold text-sky-950">
        {label}
      </span>
      <button
        type="button"
        className="flex h-6 w-6 items-center justify-center rounded-md border border-dashed border-[#525252] text-[#a3a3a3] hover:border-[#737373] hover:text-[#ededed]"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function PriorityBadge({ task }) {
  return (
    <Badge
      className={cn(
        "border-0 px-2 py-0.5 text-[11px] font-semibold",
        task.tone === "danger" ? "bg-red-500/90 text-white" : "bg-emerald-500/90 text-white",
      )}
    >
      {task.tag}
    </Badge>
  );
}

function AddTaskRow() {
  return (
    <TableRow className="border-[#2a2a2a] bg-[#202020]/50 hover:bg-[#242424]">
      <TableCell>
        <button type="button" className="flex items-center gap-2 text-sm text-[#a3a3a3] hover:text-[#ededed]">
          <Plus className="h-4 w-4" />
          Add a Task
        </button>
      </TableCell>
      <TableCell>
        <button type="button" className="flex items-center gap-1 text-sm text-[#a3a3a3]">
          Select status...
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </TableCell>
      <TableCell>
        <button type="button" className="flex items-center gap-1 text-sm text-[#a3a3a3]">
          Select list...
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </TableCell>
      <TableCell />
      <TableCell />
      <TableCell />
      <TableCell />
    </TableRow>
  );
}

function WorkTaskGroup({ group }) {
  return (
    <section>
      <button
        type="button"
        className="flex h-9 min-w-[150px] items-center gap-2 rounded-t-lg border border-[#2a2a2a] bg-[#1a1a1a] px-4 text-left text-sm font-semibold text-[#ededed]"
      >
        {group.title}
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#a3a3a3] px-1.5 text-[11px] font-bold text-[#161616]">
          {group.count}
        </span>
      </button>
      {group.tasks.length > 0 ? (
        <div className="overflow-hidden rounded-b-lg rounded-tr-lg border border-[#2a2a2a] bg-[#1a1a1a]">
          <Table>
            <TableHeader>
              <TableRow className="border-[#2a2a2a] bg-[#202020] hover:bg-[#202020]">
                <TableHead className="w-[34%] text-[#a3a3a3]">Task</TableHead>
                <TableHead className="text-[#a3a3a3]">Status</TableHead>
                <TableHead className="text-[#a3a3a3]">List</TableHead>
                <TableHead className="text-[#a3a3a3]">Assignees</TableHead>
                <TableHead className="text-[#a3a3a3]">Subscribers</TableHead>
                <TableHead className="text-[#a3a3a3]">Due Date</TableHead>
                <TableHead className="text-[#a3a3a3]">Tags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {group.tasks.map((task) => (
                <TableRow key={`${group.title}-${task.id}-${task.title}`} className="border-[#2a2a2a] hover:bg-[#222222]">
                  <TableCell>
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 rounded border border-[#525252]" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-[#ededed]">{task.title}</span>
                          <span className="ml-auto text-[11px] text-[#a3a3a3]">{task.checklist}</span>
                          <Badge className="border-[#58607a] bg-[#263047] px-1.5 py-0 text-[10px] text-[#aab4d8]">
                            {task.id}
                          </Badge>
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#737373]">
                          <Archive className="h-3 w-3" />
                          <span>{task.project}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <button type="button" className="flex items-center gap-1 text-sm text-[#d4d4d4]">
                      {task.status}
                      <ChevronDown className="h-3.5 w-3.5 text-[#737373]" />
                    </button>
                  </TableCell>
                  <TableCell>
                    <button type="button" className="flex items-center gap-1 text-sm text-[#d4d4d4]">
                      {task.list}
                      <ChevronDown className="h-3.5 w-3.5 text-[#737373]" />
                    </button>
                  </TableCell>
                  <TableCell>
                    <AssigneeControl label={task.assignee} />
                  </TableCell>
                  <TableCell>
                    {task.subscriber === "Add" ? (
                      <button type="button" className="text-sm text-[#a3a3a3] hover:text-[#ededed]">
                        Add
                      </button>
                    ) : (
                      <AssigneeControl label={task.subscriber} />
                    )}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-red-400">{task.dueDate}</TableCell>
                  <TableCell>
                    <PriorityBadge task={task} />
                  </TableCell>
                </TableRow>
              ))}
              <AddTaskRow />
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="h-10 rounded-b-lg rounded-tr-lg border border-[#2a2a2a] bg-[#1a1a1a]" />
      )}
    </section>
  );
}

function SimplePersonalTable({ activeTab }) {
  const rowsByTab = {
    "Created by Me": CREATED_ROWS,
    Files: FILE_ROWS,
    Notes: NOTE_ROWS,
    Time: TIME_ROWS,
    Calendar: [
      ["Today", "View Help Guides in Docs", "10:00 AM", "Demo Project"],
      ["Today", "Planning sync", "2:30 PM", "Launch Playbook"],
      ["Tomorrow", "Roadmap review", "11:00 AM", "Product Roadmap - My Team"],
    ],
  };
  const rows = rowsByTab[activeTab] || [];

  return (
    <div className="overflow-hidden rounded-lg border border-[#2a2a2a] bg-[#1a1a1a]">
      <Table>
        <TableHeader>
          <TableRow className="border-[#2a2a2a] bg-[#202020] hover:bg-[#202020]">
            <TableHead className="text-[#a3a3a3]">{activeTab}</TableHead>
            <TableHead className="text-[#a3a3a3]">Project</TableHead>
            <TableHead className="text-[#a3a3a3]">Status</TableHead>
            <TableHead className="text-[#a3a3a3]">Detail</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.join("-")} className="border-[#2a2a2a] hover:bg-[#222222]">
              {row.map((cell, index) => (
                <TableCell key={`${cell}-${index}`} className={index === 0 ? "font-medium text-[#ededed]" : "text-[#a3a3a3]"}>
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function DayCalendar() {
  return (
    <aside className="hidden w-[285px] shrink-0 border-l border-[#2a2a2a] bg-[#161616] pl-5 2xl:block">
      <div className="mb-3 flex items-center justify-between">
        <button type="button" className="flex items-center gap-1 text-sm font-semibold text-[#ededed]">
          Calendar
          <ChevronRight className="h-4 w-4 text-[#737373]" />
        </button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-7 w-7 border-[#3a3a3a] bg-[#202020] text-[#d4d4d4]">
            <Settings className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" className="h-7 border-[#3a3a3a] bg-[#202020] text-[#d4d4d4]">
            <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
            Hide
          </Button>
        </div>
      </div>
      <div className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a]">
        <div className="flex h-12 items-center justify-between border-b border-[#2a2a2a] px-3">
          <button type="button" className="flex items-center gap-1 text-sm font-semibold text-[#ededed]">
            Sunday May 10
            <ChevronDown className="h-4 w-4 text-[#737373]" />
          </button>
          <div className="flex items-center gap-1">
            <button type="button" className="flex h-6 w-6 items-center justify-center rounded-md border border-[#2a2a2a] text-[#737373]">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button type="button" className="flex h-6 w-6 items-center justify-center rounded-md border border-[#2a2a2a] text-[#737373]">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500 text-[11px] font-bold text-white">
              D
            </span>
            <span className="flex h-6 w-6 items-center justify-center rounded-md border border-[#2a2a2a] text-[11px] font-bold text-[#a3a3a3]">
              A
            </span>
          </div>
        </div>
        <div className="max-h-[660px] overflow-hidden p-3">
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-[52px_1fr]">
              <div className="pt-1 text-right text-xs text-[#8a8fae]">{hour}</div>
              <div className="relative ml-3 h-[76px] border-t border-[#4b5068]">
                <div className="absolute left-0 right-0 top-1/2 border-t border-[#34384d]" />
                {hour === "10:00 AM" ? (
                  <div className="absolute left-2 right-2 top-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-200">
                    Help guides review
                  </div>
                ) : null}
                {hour === "2:00 PM" ? (
                  <div className="absolute left-2 right-2 top-2 rounded-md border border-sky-500/30 bg-sky-500/10 px-2 py-1 text-xs text-sky-200">
                    Planning sync
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export function WorkQueueScreen() {
  const [activeTab, setActiveTab] = useState("Tasks");

  return (
    <div className="flex h-full min-h-[calc(100dvh-8rem)] flex-col gap-4 text-[#ededed]">
      <div className="flex flex-col gap-3 border-b border-[#2a2a2a] pb-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-300 text-sm font-bold text-sky-950">
              AJ
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#ededed]">Work Queue</h1>
              <p className="text-sm text-[#737373]">Your assigned work, created items, files, notes, and time entries.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="h-9 border-[#3a3a3a] bg-[#202020] text-[#d4d4d4] hover:bg-[#282828] hover:text-white">
              <LayoutList className="mr-2 h-4 w-4" />
              List
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9 border-[#3a3a3a] bg-[#202020] text-[#d4d4d4] hover:bg-[#282828] hover:text-white">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex gap-5 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => setActiveTab(tab.label)}
              className={cn(
                "flex h-8 items-center gap-1.5 whitespace-nowrap border-b-2 px-1 text-sm font-medium transition-colors",
                activeTab === tab.label
                  ? "border-emerald-400 text-emerald-300"
                  : "border-transparent text-[#a3a3a3] hover:text-[#ededed]",
              )}
            >
              <tab.Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-4">
        <ProjectScopePanel />
        <main className="min-w-0 flex-1 space-y-5">
          <div>
            <h2 className="text-2xl font-semibold text-[#ededed]">Hey, Aadit</h2>
            <p className="mt-2 text-sm font-medium text-[#8a8fae]">
              You have <span className="rounded bg-[#4b5068] px-1.5 py-0.5 text-[#ededed]">1 task</span> for today,
              and <span className="rounded bg-[#4b5068] px-1.5 py-0.5 text-[#ededed]">3 tasks</span> are overdue now.
            </p>
          </div>

          <div className="flex flex-col gap-2 xl:flex-row">
            <Button variant="outline" className="h-10 justify-start border-[#3a3a3a] bg-[#202020] text-[#d4d4d4] hover:bg-[#282828] hover:text-white">
              <Filter className="mr-2 h-4 w-4" />
              Filter by
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
            <div className="relative min-w-[240px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
              <Input
                placeholder="Search..."
                className="h-10 border-[#3a3a3a] bg-[#202020] pl-10 text-sm text-[#ededed] placeholder:text-[#737373]"
              />
            </div>
            <Button variant="outline" className="h-10 justify-start border-[#3a3a3a] bg-[#202020] text-[#d4d4d4] hover:bg-[#282828] hover:text-white">
              Show Completed
            </Button>
            <Button variant="outline" className="h-10 justify-start border-[#3a3a3a] bg-[#202020] text-[#d4d4d4] hover:bg-[#282828] hover:text-white">
              <ListFilter className="mr-2 h-4 w-4" />
              Group by: Due Date
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {activeTab === "Tasks" ? (
            <div className="space-y-5">
              {TASK_GROUPS.map((group) => (
                <WorkTaskGroup key={group.title} group={group} />
              ))}
            </div>
          ) : (
            <SimplePersonalTable activeTab={activeTab} />
          )}
        </main>
        <DayCalendar />
      </div>
    </div>
  );
}
