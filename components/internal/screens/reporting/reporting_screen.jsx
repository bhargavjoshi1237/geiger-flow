"use client";

import React, { useMemo, useState } from "react";
import {
  Archive,
  BarChart3,
  Bell,
  Bookmark,
  CalendarDays,
  Check,
  CheckSquare,
  ChevronDown,
  Clock3,
  Filter,
  FolderKanban,
  LayoutList,
  ListFilter,
  Plus,
  Search,
  Settings,
  Share2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const REPORT_TABS = [
  "All Tasks",
  "Projects Overview",
  "Workloads",
  "Members Report",
  "Timesheets",
  "Check-Ins",
];

const PROJECTS = [
  { id: "demo", name: "Demo Project", color: "bg-orange-400", selected: true },
  { id: "roadmap", name: "Product Roadmap - My Team", color: "bg-amber-400", selected: false },
  { id: "launch", name: "Launch Playbook", color: "bg-fuchsia-500", selected: false },
  { id: "features", name: "Feature Requests", color: "bg-sky-400", selected: false },
];

const TASK_GROUPS = [
  {
    title: "Overdue",
    count: 2,
    tasks: [
      {
        id: "DEM-1",
        title: "Create a New Project",
        project: "Demo Project",
        status: "In Progress",
        list: "Getting Started",
        assignee: "AJ",
        subscribers: "Add",
        dueDate: "May 8, 1:24 AM",
        tag: "High Priority",
        tagTone: "danger",
        checklist: "0/1",
      },
      {
        id: "DEM-8",
        title: "View Help Guides in Docs",
        project: "Demo Project",
        status: "To Do",
        list: "Exploring Nifty",
        assignee: "AJ",
        subscribers: "Add",
        dueDate: "May 10, 1:24 AM",
        tag: "Low Priority",
        tagTone: "success",
        checklist: "0/3",
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
        status: "To Do",
        list: "Exploring Nifty",
        assignee: "AJ",
        subscribers: "Add",
        dueDate: "May 10, 1:24 AM",
        tag: "Low Priority",
        tagTone: "success",
        checklist: "0/3",
      },
    ],
  },
  { title: "Due This Month", count: 2, tasks: [] },
  { title: "Unscheduled", count: 7, tasks: [] },
];

const INSIGHT_CARDS = [
  { label: "Active projects", value: "4", detail: "1 selected", Icon: FolderKanban },
  { label: "Open tasks", value: "12", detail: "3 due soon", Icon: CheckSquare },
  { label: "Tracked time", value: "28h", detail: "This week", Icon: Clock3 },
  { label: "Team load", value: "74%", detail: "Balanced", Icon: Users },
];

const SECONDARY_REPORTS = {
  "Projects Overview": [
    ["Demo Project", "42%", "3 milestones", "On Track"],
    ["Product Roadmap - My Team", "68%", "6 milestones", "At Risk"],
    ["Launch Playbook", "21%", "2 milestones", "Planning"],
  ],
  Workloads: [
    ["AJ", "8 tasks", "32h capacity", "Healthy"],
    ["Priya", "11 tasks", "40h capacity", "High load"],
    ["Sam", "4 tasks", "24h capacity", "Available"],
  ],
  "Members Report": [
    ["AJ", "5 completed", "7 open", "18h tracked"],
    ["Priya", "8 completed", "11 open", "26h tracked"],
    ["Sam", "3 completed", "4 open", "9h tracked"],
  ],
  Timesheets: [
    ["Demo Project", "Create a New Project", "AJ", "02:45"],
    ["Demo Project", "View Help Guides in Docs", "AJ", "01:20"],
    ["Launch Playbook", "Draft launch checklist", "Priya", "03:10"],
  ],
  "Check-Ins": [
    ["Weekly delivery pulse", "3 responses", "Due today", "Open"],
    ["Blocker report", "1 response", "Every Friday", "Open"],
    ["Launch readiness", "8 responses", "Closed", "Archived"],
  ],
};

function ReportTabButton({ tab, activeTab, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-8 whitespace-nowrap border-b-2 px-1 text-sm font-medium transition-colors",
        activeTab === tab
          ? "border-emerald-400 text-emerald-300"
          : "border-transparent text-[#a3a3a3] hover:text-[#ededed]",
      )}
    >
      {tab}
    </button>
  );
}

function ProjectSelector() {
  return (
    <aside className="hidden w-[290px] shrink-0 flex-col rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] lg:flex">
      <div className="flex h-12 items-center justify-between border-b border-[#2a2a2a] px-4">
        <span className="text-sm font-semibold text-[#ededed]">Select Projects: 1 of 4</span>
        <ChevronDown className="h-4 w-4 text-[#a3a3a3]" />
      </div>
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
          <Input
            placeholder="Type to search..."
            className="h-10 border-[#333333] bg-[#202020] pl-10 text-sm text-[#ededed] placeholder:text-[#737373]"
          />
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-[#a3a3a3]">
            <span>General</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </div>
          {PROJECTS.map((project) => (
            <button
              key={project.id}
              type="button"
              className="flex h-8 w-full items-center gap-2 rounded-md px-1.5 text-left text-sm text-[#d4d4d4] hover:bg-[#242424]"
            >
              <span
                className={cn(
                  "flex h-4 w-4 items-center justify-center rounded border border-[#4a4a4a]",
                  project.selected && "border-emerald-400 bg-emerald-500",
                )}
              >
                {project.selected ? <Check className="h-3 w-3 text-white" /> : null}
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

function TaskMeta({ task }) {
  return (
    <div className="mt-1 flex items-center gap-2 text-[11px] text-[#737373]">
      <Archive className="h-3 w-3" />
      <span>{task.project}</span>
      <span className="ml-auto font-mono text-[#a3a3a3]">{task.checklist}</span>
    </div>
  );
}

function PriorityBadge({ task }) {
  return (
    <Badge
      className={cn(
        "border-0 px-2 py-0.5 text-[11px] font-semibold",
        task.tagTone === "danger"
          ? "bg-red-500/90 text-white"
          : "bg-emerald-500/90 text-white",
      )}
    >
      {task.tag}
    </Badge>
  );
}

function AssigneePill({ label }) {
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

function TaskGroup({ group }) {
  return (
    <section className="space-y-0">
      <button
        type="button"
        className="mb-0 flex h-9 min-w-[180px] items-center gap-2 rounded-t-lg border border-[#2a2a2a] bg-[#1a1a1a] px-4 text-left text-sm font-semibold text-[#ededed]"
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
                <TableHead className="w-[38%] text-[#a3a3a3]">Task</TableHead>
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
                          <Badge className="border-[#58607a] bg-[#263047] px-1.5 py-0 text-[10px] text-[#aab4d8]">
                            {task.id}
                          </Badge>
                        </div>
                        <TaskMeta task={task} />
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
                    <AssigneePill label={task.assignee} />
                  </TableCell>
                  <TableCell>
                    <button type="button" className="text-sm text-[#a3a3a3] hover:text-[#ededed]">
                      {task.subscribers}
                    </button>
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

function SecondaryReport({ activeTab }) {
  const rows = SECONDARY_REPORTS[activeTab] || [];

  return (
    <div className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a]">
      <Table>
        <TableHeader>
          <TableRow className="border-[#2a2a2a] bg-[#202020] hover:bg-[#202020]">
            <TableHead className="text-[#a3a3a3]">{activeTab}</TableHead>
            <TableHead className="text-[#a3a3a3]">Metric</TableHead>
            <TableHead className="text-[#a3a3a3]">Scope</TableHead>
            <TableHead className="text-[#a3a3a3]">State</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.join("-")} className="border-[#2a2a2a] hover:bg-[#222222]">
              {row.map((cell, index) => (
                <TableCell key={cell} className={cn(index === 0 ? "font-medium text-[#ededed]" : "text-[#a3a3a3]")}>
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

export function ReportingScreen() {
  const [activeTab, setActiveTab] = useState("All Tasks");
  const selectedProjectCount = useMemo(
    () => PROJECTS.filter((project) => project.selected).length,
    [],
  );

  return (
    <div className="flex h-full min-h-[calc(100dvh-8rem)] flex-col gap-4 text-[#ededed]">
      <div className="flex flex-col gap-4 border-b border-[#2a2a2a] pb-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500 text-white">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#ededed]">Reporting</h1>
              <p className="text-sm text-[#737373]">
                Cross-project task, workload, member, and time reporting.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" className="h-9 border-[#3a3a3a] bg-[#202020] text-[#d4d4d4] hover:bg-[#282828] hover:text-white">
              <LayoutList className="mr-2 h-4 w-4" />
              List
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9 border-[#3a3a3a] bg-[#202020] text-[#d4d4d4] hover:bg-[#282828] hover:text-white">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9 border-[#3a3a3a] bg-[#202020] text-[#d4d4d4] hover:bg-[#282828] hover:text-white">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-5 overflow-x-auto">
          {REPORT_TABS.map((tab) => (
            <ReportTabButton
              key={tab}
              tab={tab}
              activeTab={activeTab}
              onClick={() => setActiveTab(tab)}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        {INSIGHT_CARDS.map((card) => (
          <div key={card.label} className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-[#737373]">{card.label}</p>
                <p className="mt-2 text-2xl font-semibold text-[#ededed]">{card.value}</p>
                <p className="mt-1 text-xs text-[#737373]">{card.detail}</p>
              </div>
              <card.Icon className="h-5 w-5 text-[#737373]" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-1 min-h-0 gap-4">
        <ProjectSelector />
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-1 flex-col gap-2 md:flex-row">
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
                <ListFilter className="mr-2 h-4 w-4" />
                Group by: Due Date
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <button type="button" className="flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300">
              <Bookmark className="h-4 w-4" />
              Save view
            </button>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3 lg:hidden">
            <span className="text-sm font-medium text-[#ededed]">
              {selectedProjectCount} of {PROJECTS.length} projects selected
            </span>
            <Button variant="outline" size="sm" className="h-8 border-[#333333] bg-[#202020] text-[#d4d4d4]">
              Projects
              <ChevronDown className="ml-2 h-3.5 w-3.5" />
            </Button>
          </div>

          {activeTab === "All Tasks" ? (
            <div className="space-y-5">
              {TASK_GROUPS.map((group) => (
                <TaskGroup key={group.title} group={group} />
              ))}
            </div>
          ) : (
            <SecondaryReport activeTab={activeTab} />
          )}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-[#ededed]">
                <CalendarDays className="h-4 w-4 text-[#737373]" />
                Date range
              </div>
              <p className="mt-2 text-sm text-[#737373]">This week, this month, custom range</p>
            </div>
            <div className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-[#ededed]">
                <Bell className="h-4 w-4 text-[#737373]" />
                Check-ins
              </div>
              <p className="mt-2 text-sm text-[#737373]">Team status prompts and response rollups</p>
            </div>
            <div className="rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-[#ededed]">
                <Clock3 className="h-4 w-4 text-[#737373]" />
                Exports
              </div>
              <p className="mt-2 text-sm text-[#737373]">CSV, PDF, and printable reports</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
