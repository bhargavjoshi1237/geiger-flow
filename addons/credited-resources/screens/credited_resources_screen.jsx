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
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { cn } from "@/lib/utils";

const CREDIT_POOLS = [
  {
    id: "pool_tokens",
    name: "AI Token Credits",
    period: "May 2026",
    reset: "May 31",
    unit: "tokens",
    total: 10_000_000_000_000,
    allocated: 7_600_000_000_000,
    used: 4_250_000_000_000,
    status: "on_track",
  },
  {
    id: "pool_agent_runs",
    name: "Agent Run Credits",
    period: "May 2026",
    reset: "May 31",
    unit: "runs",
    total: 18_000,
    allocated: 12_500,
    used: 9_100,
    status: "watch",
  },
  {
    id: "pool_review_compute",
    name: "Review Compute",
    period: "May 2026",
    reset: "May 31",
    unit: "minutes",
    total: 4_000,
    allocated: 3_050,
    used: 2_300,
    status: "on_track",
  },
];

const INITIAL_ALLOCATIONS = [
  {
    id: "alloc_101",
    poolId: "pool_tokens",
    target: "Sam Lee",
    targetType: "User",
    scope: "Vault permission audit",
    planned: 1_200_000_000_000,
    used: 790_000_000_000,
    status: "on_track",
  },
  {
    id: "alloc_102",
    poolId: "pool_tokens",
    target: "Custom fields rollout",
    targetType: "Milestone",
    scope: "Builder implementation",
    planned: 2_000_000_000_000,
    used: 1_420_000_000_000,
    status: "on_track",
  },
  {
    id: "alloc_103",
    poolId: "pool_agent_runs",
    target: "Release readiness",
    targetType: "Goal",
    scope: "Regression automation",
    planned: 4_500,
    used: 3_900,
    status: "watch",
  },
  {
    id: "alloc_104",
    poolId: "pool_review_compute",
    target: "Security review queue",
    targetType: "Module",
    scope: "Access checks",
    planned: 1_100,
    used: 720,
    status: "on_track",
  },
];

const USAGE_PLAN = [
  {
    range: "May 1-7",
    focus: "Setup and discovery",
    planned: "1.8T tokens",
    used: "1.2T",
    status: "on_track",
  },
  {
    range: "May 8-14",
    focus: "Build support",
    planned: "2.4T tokens",
    used: "2.1T",
    status: "on_track",
  },
  {
    range: "May 15-21",
    focus: "QA and review",
    planned: "3.0T tokens",
    used: "Planned",
    status: "watch",
  },
  {
    range: "May 22-31",
    focus: "Buffer before reset",
    planned: "2.8T tokens",
    used: "Planned",
    status: "draft",
  },
];

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
    className: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
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
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-1.5 text-xs text-[#737373]"
        >
          {item.label}
          <span className="font-semibold tabular-nums text-[#e7e7e7]">{item.value}</span>
        </span>
      ))}
    </div>
  );
}

function PoolTable({ pools }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#202020]">
      <Table>
        <TableHeader>
          <TableRow className="border-[#2a2a2a] bg-[#1a1a1a]">
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
              <TableRow key={pool.id} className="border-[#2a2a2a] hover:bg-[#242424]">
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-[#ededed]">{pool.name}</span>
                    <p className="line-clamp-1 text-xs text-[#737373]">
                      {pool.period} | {pool.unit}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <StatusBadge status={pool.status} />
                </TableCell>
                <TableCell className="text-sm font-medium text-[#ededed]">
                  {formatCredits(pool.total, pool.unit)}
                </TableCell>
                <TableCell className="text-sm text-[#a3a3a3]">
                  {formatCredits(pool.allocated, pool.unit)}
                </TableCell>
                <TableCell>
                  <div className="w-[130px] space-y-1.5">
                    <Progress
                      value={usedPercent}
                      className="h-1.5 rounded-full bg-[#2a2a2a] [&_[data-slot=progress-indicator]]:bg-[#ededed]"
                    />
                    <p className="text-xs text-[#737373]">{formatCredits(pool.used, pool.unit)} used</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5 text-sm text-[#a3a3a3]">
                    <CalendarClock className="h-3.5 w-3.5 text-[#737373]" />
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
    <div className="overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#202020]">
      <Table>
        <TableHeader>
          <TableRow className="border-[#2a2a2a] bg-[#1a1a1a]">
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
              <TableRow key={allocation.id} className="border-[#2a2a2a] hover:bg-[#242424]">
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-[#ededed]">{pool.name}</span>
                    <p className="line-clamp-1 text-xs text-[#737373]">{allocation.scope}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="inline-flex max-w-[220px] items-center gap-1.5 text-sm text-[#a3a3a3]">
                    <TargetIcon className="h-3.5 w-3.5 shrink-0 text-[#737373]" />
                    <span className="truncate">{allocation.target}</span>
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <StatusBadge status={allocation.status} />
                </TableCell>
                <TableCell className="text-sm text-[#a3a3a3]">
                  {formatCredits(allocation.planned, pool.unit)}
                </TableCell>
                <TableCell>
                  <div className="w-[130px] space-y-1.5">
                    <Progress
                      value={usedPercent}
                      className="h-1.5 rounded-full bg-[#2a2a2a] [&_[data-slot=progress-indicator]]:bg-[#ededed]"
                    />
                    <p className="text-xs text-[#737373]">{formatCredits(allocation.used, pool.unit)} used</p>
                  </div>
                </TableCell>
                <TableCell className="text-sm font-medium text-[#ededed]">
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
    <Accordion type="single" collapsible className="overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#202020]">
      <AccordionItem value="usage-plan" className="border-0">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex w-full items-center justify-between gap-4 pr-2">
            <div className="min-w-0 text-left">
              <h2 className="text-sm font-semibold text-[#e7e7e7]">Usage Plan</h2>
              <p className="mt-1 text-xs font-normal text-[#737373]">Plan consumption before the next credit reset.</p>
            </div>
            <span className="hidden shrink-0 items-center rounded-md border border-[#333333] bg-[#1a1a1a] px-2 py-0.5 text-xs font-medium text-[#a3a3a3] sm:inline-flex">
              {USAGE_PLAN.length} windows
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="space-y-2">
            {USAGE_PLAN.map((item) => (
              <div key={item.range} className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3">
                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#e7e7e7]">{item.range}</p>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="text-xs text-[#737373]">{item.focus}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#a3a3a3]">
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
      <div className="flex flex-col gap-4 border-b border-[#2a2a2a] pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#e7e7e7] md:text-3xl">Credited Resources</h1>
          <p className="mt-1 text-[#a3a3a3]">
            Manage limited org credits across people, tasks, goals, and usage windows.
          </p>
        </div>
        <Button className="bg-white text-black hover:bg-[#e7e7e7]" onClick={addAllocation}>
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
                  ? "border-[#3a3a3a] bg-[#2a2a2a] text-white"
                  : "border-[#2a2a2a] bg-[#1a1a1a] text-[#737373] hover:bg-[#202020] hover:text-[#e7e7e7]",
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
          <h2 className="text-sm font-semibold text-[#e7e7e7]">Allocations</h2>
          <p className="mt-1 text-xs text-[#737373]">Credits assigned to users and project work.</p>
        </div>
        <div className="relative w-full lg:w-[320px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search allocations"
            className="!pl-10 !pr-4 bg-[#1a1a1a] border-[#2a2a2a] text-white text-sm placeholder:text-[#737373] focus-visible:ring-0 focus-visible:border-[#474747]"
          />
        </div>
      </div>

      {filteredAllocations.length === 0 ? (
        <div className="flex h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-[#2a2a2a] bg-[#1a1a1a] text-[#737373]">
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
