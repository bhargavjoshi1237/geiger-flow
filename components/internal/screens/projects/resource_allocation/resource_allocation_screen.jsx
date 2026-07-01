"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  BriefcaseBusiness,
  Calendar,
  CheckCircle2,
  Circle,
  ClipboardList,
  Copy,
  Plus,
  Search,
  UserPlus,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@geiger/ui";
import { Badge } from "@geiger/ui";
import { Button } from "@geiger/ui";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@geiger/ui";
import { Input } from "@geiger/ui";
import { Progress } from "@geiger/ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@geiger/ui";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { cn } from "@/lib/utils";

const INITIAL_ALLOCATIONS = [];

const INITIAL_REQUESTS = [];

const STATUS_META = {
  allocated: {
    label: "Allocated",
    className: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    Icon: CheckCircle2,
  },
  available: {
    label: "Available",
    className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    Icon: Circle,
  },
  at_risk: {
    label: "At Risk",
    className: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    Icon: AlertTriangle,
  },
  review: {
    label: "Review",
    className: "bg-violet-500/15 text-violet-300 border-violet-500/30",
    Icon: ClipboardList,
  },
  open: {
    label: "Open",
    className: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    Icon: BriefcaseBusiness,
  },
  sourcing: {
    label: "Sourcing",
    className: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    Icon: UserPlus,
  },
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "allocated", label: "Allocated" },
  { id: "available", label: "Available" },
  { id: "at_risk", label: "At Risk" },
];

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.review;

  return (
    <Badge className={cn("min-w-[86px] justify-center whitespace-nowrap border px-2", meta.className)}>
      {meta.label}
    </Badge>
  );
}

function AllocationStats({ allocations, requests }) {
  const allocatedCount = allocations.filter((item) => item.status === "allocated").length;
  const availableCount = allocations.filter((item) => item.status === "available").length;
  const riskCount = allocations.filter((item) => item.status === "at_risk").length;
  const averageAllocation = Math.round(
    allocations.reduce((sum, item) => sum + item.allocation, 0) / allocations.length,
  );

  const stats = [
    { label: "Total", value: allocations.length },
    { label: "Allocated", value: allocatedCount },
    { label: "Available", value: availableCount },
    { label: "Requests", value: requests.length },
    { label: "Avg load", value: `${averageAllocation}%` },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {stats.map((item) => (
        <span
          key={item.label}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-subtle px-3 py-1.5 text-xs text-text-secondary"
        >
          {item.label}
          <span className="font-semibold tabular-nums text-foreground">{item.value}</span>
        </span>
      ))}
    </div>
  );
}

function AllocationTable({ allocations }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border bg-surface-subtle">
            <TableHead>Resource</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Linked Work</TableHead>
            <TableHead>Projected Work</TableHead>
            <TableHead>Due</TableHead>
            <TableHead>Load</TableHead>
            <TableHead>Access Level</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allocations.map((resource) => {
            const statusMeta = STATUS_META[resource.status];
            const StatusIcon = statusMeta?.Icon || Circle;

            return (
              <ContextMenu key={resource.id}>
                <ContextMenuTrigger asChild>
                  <TableRow className="border-border hover:bg-surface-active">
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{resource.name}</span>
                          {resource.status === "at_risk" ? (
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-300" />
                          ) : null}
                        </div>
                        <p className="line-clamp-1 text-xs text-text-secondary">{resource.role}</p>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <StatusBadge status={resource.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-foreground">{resource.work}</span>
                        <span className="inline-flex items-center gap-1 text-xs text-text-secondary">
                          <StatusIcon className="h-3 w-3" />
                          {resource.workType}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-foreground">{resource.work}</span>
                        <span className="inline-flex items-center gap-1 text-xs text-text-secondary">
                          <StatusIcon className="h-3 w-3" />
                          {resource.workType}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 text-text-secondary" />
                        {resource.due}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="w-[130px] space-y-1.5">
                        <Progress
                          value={resource.allocation}
                          className="h-1.5 rounded-full bg-surface-hover [&_[data-slot=progress-indicator]]:bg-primary"
                        />
                        <p className="text-xs text-text-secondary">{resource.allocation}%</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="max-w-[150px] truncate text-xs text-muted-foreground">{resource.access}</span>
                    </TableCell>
                  </TableRow>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-52 bg-surface-card border-border shadow-xl">
                  <ContextMenuItem className="text-muted-foreground focus:bg-surface-hover focus:text-foreground cursor-pointer gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Review allocation
                  </ContextMenuItem>
                  <ContextMenuItem className="text-muted-foreground focus:bg-surface-hover focus:text-foreground cursor-pointer gap-2">
                    <UserPlus className="h-3.5 w-3.5" />
                    Create request
                  </ContextMenuItem>
                  <ContextMenuItem className="text-muted-foreground focus:bg-surface-hover focus:text-foreground cursor-pointer gap-2">
                    <Copy className="h-3.5 w-3.5" />
                    Copy linked work
                  </ContextMenuItem>
                  <ContextMenuSeparator className="bg-surface-strong" />
                  <ContextMenuItem className="text-text-secondary focus:bg-surface-hover focus:text-foreground cursor-pointer gap-2">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Mark at risk
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function RequestItem({ item }) {
  const meta = STATUS_META[item.status] || STATUS_META.review;
  const TypeIcon = item.type === "Hiring" ? UserPlus : item.type === "Position" ? BriefcaseBusiness : ClipboardList;

  return (
    <div className="rounded-xl border border-border bg-surface-subtle px-4 py-4 transition-colors hover:border-border-strong">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <TypeIcon className="h-3.5 w-3.5 shrink-0 text-text-secondary" />
            <h3 className="truncate text-sm font-semibold text-foreground">{item.title}</h3>
          </div>
          <p className="text-xs text-text-secondary">
            {item.type} | Owner: {item.owner} | Due {item.due}
          </p>
        </div>
        <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:bg-surface-active hover:text-foreground">
          Review
        </Button>
      </div>
    </div>
  );
}

function RequestQueue({ requests }) {
  return (
    <div className="space-y-2">
      {requests.map((item) => (
        <RequestItem key={item.id} item={item} />
      ))}
    </div>
  );
}

export function ResourceAllocationScreen() {
  const [allocations] = useState(INITIAL_ALLOCATIONS);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [requestCounter, setRequestCounter] = useState(222);

  const filteredAllocations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return allocations.filter((resource) => {
      const matchesFilter = activeFilter === "all" || resource.status === activeFilter;
      if (!matchesFilter) return false;
      if (!normalizedQuery) return true;

      return [
        resource.name,
        resource.role,
        resource.work,
        resource.workType,
        resource.access,
        resource.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [activeFilter, allocations, query]);

  const addRequest = () => {
    const nextId = requestCounter + 1;
    setRequestCounter(nextId);
    setRequests((currentRequests) => [
      {
        id: `req_${nextId}`,
        title: "New resource request",
        type: "Request",
        owner: "Current user",
        status: "review",
        due: "Unscheduled",
      },
      ...currentRequests,
    ]);
  };

  return (
    <MainScreenWrapper>
      <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Resource Allocation</h1>
          <p className="mt-1 text-muted-foreground">
            Assign people to project work and track resource requests.
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary" onClick={addRequest}>
          <Plus className="mr-2 h-4 w-4" />
          New Request
        </Button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <AllocationStats allocations={allocations} requests={requests} />
        <div className="flex flex-col gap-2 lg:items-end">
         
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {FILTERS.map((filter) => (
              <Button
                key={filter.id}
                type="button"
                variant="ghost"
                className={cn(
                  "h-8 rounded-lg border px-3 text-xs",
                  activeFilter === filter.id
                    ? "border-border-strong bg-surface-hover text-foreground"
                    : "border-border bg-surface-subtle text-text-secondary hover:bg-surface-card hover:text-foreground",
                )}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {filteredAllocations.length === 0 ? (
        <div className="flex h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-subtle text-text-secondary">
          <BriefcaseBusiness className="h-10 w-10 opacity-30" />
          <p className="mt-3 text-sm">No resources match your current filters.</p>
        </div>
      ) : (
        <AllocationTable allocations={filteredAllocations} />
      )}
    </MainScreenWrapper>
  );
}
