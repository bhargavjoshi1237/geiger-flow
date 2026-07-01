"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bot,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  Goal,
  Layers3,
  Milestone,
  Plus,
  Search,
  UserRound,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@geiger/ui";
import { Badge } from "@geiger/ui";
import { Button } from "@geiger/ui";
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

const CREDIT_POOLS = [];

const INITIAL_ALLOCATIONS = [];

const USAGE_PLAN = [];

const STATUS_META = {
  on_track: {
    label: "On Track",
    className: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  },
  watch: {
    label: "Watch",
    className: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
  draft: {
    label: "Planned",
    className: "bg-zinc-500/15 text-foreground border-zinc-500/30",
  },
};

const TARGET_ICONS = {
  User: UserRound,
  Task: ClipboardCheck,
  Goal,
  Milestone,
  Module: Layers3,
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "User", label: "Users" },
  { id: "Task", label: "Tasks" },
  { id: "Goal", label: "Goals" },
  { id: "Milestone", label: "Milestones" },
  { id: "Module", label: "Modules" },
];

function formatCredits(value, unit) {
  if (unit === "tokens") {
    if (value >= 1_000_000_000_000) return `${Number((value / 1_000_000_000_000).toFixed(2))}T`;
    if (value >= 1_000_000_000) return `${Number((value / 1_000_000_000).toFixed(1))}B`;
  }

  return new Intl.NumberFormat("en").format(value);
}

function getPool(poolId) {
  return CREDIT_POOLS.find((pool) => pool.id === poolId) || CREDIT_POOLS[0];
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.draft;

  return (
    <Badge className={cn("min-w-[78px] justify-center whitespace-nowrap border px-2", meta.className)}>
      {meta.label}
    </Badge>
  );
}

function CreditStats({ pools, allocations }) {
  const tokenPool = pools.find((pool) => pool.id === "pool_tokens") || pools[0];
  const remaining = tokenPool.total - tokenPool.used;
  const watchCount = allocations.filter((allocation) => allocation.status === "watch").length;

  const stats = [
    { label: "Period", value: tokenPool.period },
    { label: "Budget", value: formatCredits(tokenPool.total, tokenPool.unit) },
    { label: "Used", value: formatCredits(tokenPool.used, tokenPool.unit) },
    { label: "Left", value: formatCredits(remaining, tokenPool.unit) },
    { label: "Allocations", value: allocations.length },
    { label: "Watch", value: watchCount },
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

function PoolTable({ pools }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border bg-surface-subtle">
            <TableHead>Credit Resource</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Allocated</TableHead>
            <TableHead>Used</TableHead>
            <TableHead>Reset</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pools.map((pool) => {
            const usedPercent = Math.round((pool.used / pool.total) * 100);

            return (
              <TableRow key={pool.id} className="border-border hover:bg-surface-active">
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-foreground">{pool.name}</span>
                    <p className="line-clamp-1 text-xs text-text-secondary">
                      {pool.period} | {pool.unit}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <StatusBadge status={pool.status} />
                </TableCell>
                <TableCell className="text-sm font-medium text-foreground">
                  {formatCredits(pool.total, pool.unit)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatCredits(pool.allocated, pool.unit)}
                </TableCell>
                <TableCell>
                  <div className="w-[130px] space-y-1.5">
                    <Progress
                      value={usedPercent}
                      className="h-1.5 rounded-full bg-surface-hover [&_[data-slot=progress-indicator]]:bg-primary"
                    />
                    <p className="text-xs text-text-secondary">{formatCredits(pool.used, pool.unit)} used</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                    <CalendarClock className="h-3.5 w-3.5 text-text-secondary" />
                    {pool.reset}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function AllocationTable({ allocations }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border bg-surface-subtle">
            <TableHead>Allocation</TableHead>
            <TableHead>Target</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Planned</TableHead>
            <TableHead>Used</TableHead>
            <TableHead>Remaining</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allocations.map((allocation) => {
            const pool = getPool(allocation.poolId);
            const TargetIcon = TARGET_ICONS[allocation.targetType] || Layers3;
            const usedPercent = allocation.planned > 0 ? Math.round((allocation.used / allocation.planned) * 100) : 0;
            const remaining = allocation.planned - allocation.used;

            return (
              <TableRow key={allocation.id} className="border-border hover:bg-surface-active">
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-foreground">{pool.name}</span>
                    <p className="line-clamp-1 text-xs text-text-secondary">{allocation.scope}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="inline-flex max-w-[220px] items-center gap-1.5 text-sm text-muted-foreground">
                    <TargetIcon className="h-3.5 w-3.5 shrink-0 text-text-secondary" />
                    <span className="truncate">{allocation.target}</span>
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <StatusBadge status={allocation.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatCredits(allocation.planned, pool.unit)}
                </TableCell>
                <TableCell>
                  <div className="w-[130px] space-y-1.5">
                    <Progress
                      value={usedPercent}
                      className="h-1.5 rounded-full bg-surface-hover [&_[data-slot=progress-indicator]]:bg-primary"
                    />
                    <p className="text-xs text-text-secondary">{formatCredits(allocation.used, pool.unit)} used</p>
                  </div>
                </TableCell>
                <TableCell className="text-sm font-medium text-foreground">
                  {formatCredits(remaining, pool.unit)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function UsagePlanAccordion() {
  return (
    <Accordion type="single" collapsible className="overflow-hidden rounded-2xl border border-border bg-surface-card">
      <AccordionItem value="usage-plan" className="border-0">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex w-full items-center justify-between gap-4 pr-2">
            <div className="min-w-0 text-left">
              <h2 className="text-sm font-semibold text-foreground">Usage Plan</h2>
              <p className="mt-1 text-xs font-normal text-text-secondary">Plan consumption before the next credit reset.</p>
            </div>
            <span className="hidden shrink-0 items-center rounded-md border border-border bg-surface-subtle px-2 py-0.5 text-xs font-medium text-muted-foreground sm:inline-flex">
              {USAGE_PLAN.length} windows
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="space-y-2">
            {USAGE_PLAN.map((item) => (
              <div key={item.range} className="rounded-xl border border-border bg-surface-subtle px-4 py-3">
                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{item.range}</p>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="text-xs text-text-secondary">{item.focus}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>Plan: {item.planned}</span>
                    <span>Used: {item.used}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export function CreditedResourcesScreen() {
  const [allocations, setAllocations] = useState(INITIAL_ALLOCATIONS);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [allocationCounter, setAllocationCounter] = useState(104);

  const filteredAllocations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return allocations.filter((allocation) => {
      const matchesFilter = activeFilter === "all" || allocation.targetType === activeFilter;
      if (!matchesFilter) return false;
      if (!normalizedQuery) return true;

      const pool = getPool(allocation.poolId);
      return [pool.name, allocation.target, allocation.targetType, allocation.scope, allocation.status]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [activeFilter, allocations, query]);

  const addAllocation = () => {
    const nextId = allocationCounter + 1;
    setAllocationCounter(nextId);
    setAllocations((currentAllocations) => [
      {
        id: `alloc_${nextId}`,
        poolId: "pool_tokens",
        target: "New allocation",
        targetType: "Task",
        scope: "Monthly usage planning",
        planned: 250_000_000_000,
        used: 0,
        status: "draft",
      },
      ...currentAllocations,
    ]);
  };

  return (
    <MainScreenWrapper>
      <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Credited Resources</h1>
          <p className="mt-1 text-muted-foreground">
            Manage limited org credits across people, tasks, goals, and usage windows.
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary" onClick={addAllocation}>
          <Plus className="mr-2 h-4 w-4" />
          New Allocation
        </Button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <CreditStats pools={CREDIT_POOLS} allocations={allocations} />
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

      <PoolTable pools={CREDIT_POOLS} />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Allocations</h2>
          <p className="mt-1 text-xs text-text-secondary">Credits assigned to users and project work.</p>
        </div>
        <div className="relative w-full lg:w-[320px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search allocations"
            className="!pl-10 !pr-4 bg-surface-subtle border-border text-foreground text-sm placeholder:text-text-secondary focus-visible:ring-0 focus-visible:border-border-strong"
          />
        </div>
      </div>

      {filteredAllocations.length === 0 ? (
        <div className="flex h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-subtle text-text-secondary">
          <Bot className="h-10 w-10 opacity-30" />
          <p className="mt-3 text-sm">No credit allocations match your current filters.</p>
        </div>
      ) : (
        <AllocationTable allocations={filteredAllocations} />
      )}

      <UsagePlanAccordion />
    </MainScreenWrapper>
  );
}
