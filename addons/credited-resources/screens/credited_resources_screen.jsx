"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bot,
  CalendarClock,
  Layers3,
  ClipboardCheck,
  Goal,
  Milestone,
  Plus,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
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
import { EmptyState } from "@/components/internal/shared/screen_kit";
import { cn } from "@/lib/utils";
import { useProject } from "@/context/project-context";
import {
  createCreditAllocation,
  createCreditPool,
  listCreditAllocations,
  listCreditPools,
  softDeleteCreditAllocation,
  updateCreditAllocation,
} from "@/features/credits/actions";
import { DEFAULT_TARGET_TYPE } from "@/features/credits/constants";

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
  const numeric = Number(value) || 0;
  if (unit === "tokens") {
    if (numeric >= 1_000_000_000_000) return `${Number((numeric / 1_000_000_000_000).toFixed(2))}T`;
    if (numeric >= 1_000_000_000) return `${Number((numeric / 1_000_000_000).toFixed(1))}B`;
  }

  return new Intl.NumberFormat("en").format(numeric);
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
  if (pools.length === 0) {
    return null;
  }

  const tokenPool = pools.find((pool) => pool.id === "pool_tokens") || pools[0];
  const remaining = tokenPool.total - tokenPool.used;
  const watchCount = allocations.filter((allocation) => allocation.status === "watch").length;

  const stats = [
    { label: "Period", value: tokenPool.period || "—" },
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
            const usedPercent = pool.total > 0 ? Math.round((pool.used / pool.total) * 100) : 0;

            return (
              <TableRow key={pool.id} className="border-border hover:bg-surface-active">
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-foreground">{pool.name}</span>
                    <p className="line-clamp-1 text-xs text-text-secondary">
                      {pool.period || "No period"} | {pool.unit}
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
                    {pool.reset || "—"}
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

function AllocationTable({ allocations, pools, onToggleWatch, onDelete }) {
  const getPool = (poolId) => pools.find((pool) => pool.id === poolId) || pools[0];

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
            <TableHead className="w-[64px]" />
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
                    <span className="font-medium text-foreground">{pool?.name || "Credit pool"}</span>
                    <p className="line-clamp-1 text-xs text-text-secondary">{allocation.scope || "Monthly usage planning"}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="inline-flex max-w-[220px] items-center gap-1.5 text-sm text-muted-foreground">
                    <TargetIcon className="h-3.5 w-3.5 shrink-0 text-text-secondary" />
                    <span className="truncate">{allocation.target}</span>
                  </span>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onToggleWatch(allocation)}
                    title="Toggle watch status"
                    className="rounded-md transition hover:opacity-80"
                  >
                    <StatusBadge status={allocation.status} />
                  </button>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatCredits(allocation.planned, pool?.unit)}
                </TableCell>
                <TableCell>
                  <div className="w-[130px] space-y-1.5">
                    <Progress
                      value={usedPercent}
                      className="h-1.5 rounded-full bg-surface-hover [&_[data-slot=progress-indicator]]:bg-primary"
                    />
                    <p className="text-xs text-text-secondary">{formatCredits(allocation.used, pool?.unit)} used</p>
                  </div>
                </TableCell>
                <TableCell className="text-sm font-medium text-foreground">
                  {formatCredits(remaining, pool?.unit)}
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(allocation.id)}
                    className="h-8 w-8 text-text-secondary hover:bg-red-500/10 hover:text-red-400"
                    title="Delete allocation"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
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
  const { project } = useProject();
  const projectId = project?.id;
  const [pools, setPools] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!projectId) {
        if (active) {
          setLoading(false);
        }
        return;
      }

      if (active) {
        setLoading(true);
      }
      return Promise.all([listCreditPools(projectId), listCreditAllocations(projectId)]).then(
        ([poolRows, allocationRows]) => {
          if (!active) {
            return;
          }
          setPools(poolRows ?? []);
          setAllocations(allocationRows ?? []);
          setLoading(false);
        },
      );
    });

    return () => {
      active = false;
    };
  }, [projectId]);

  const ensurePool = useCallback(async () => {
    if (pools.length > 0) {
      return pools[0];
    }

    const optimisticId = crypto.randomUUID();
    const optimistic = {
      id: optimisticId,
      projectId,
      name: "AI token pool",
      period: new Date().toLocaleDateString(undefined, { month: "long", year: "numeric" }),
      unit: "tokens",
      total: 1_000_000_000_000,
      allocated: 0,
      used: 0,
      status: "on_track",
      reset: "1st of next month",
    };
    setPools([optimistic]);

    const created = await createCreditPool(projectId, optimistic);
    if (!created) {
      setPools([]);
      toast.error("Couldn't create the credit pool.");
      return null;
    }

    setPools([created]);
    return created;
  }, [pools, projectId]);

  const addAllocation = useCallback(async () => {
    if (!projectId) {
      toast.error("Open a project before allocating credits.");
      return;
    }

    const pool = await ensurePool();
    if (!pool) {
      return;
    }

    const optimistic = {
      id: crypto.randomUUID(),
      projectId,
      poolId: pool.id,
      target: "New allocation",
      targetType: DEFAULT_TARGET_TYPE,
      scope: "Monthly usage planning",
      planned: 250_000_000_000,
      used: 0,
      status: "draft",
    };
    setAllocations((current) => [optimistic, ...current]);

    const created = await createCreditAllocation(projectId, optimistic);
    if (!created) {
      setAllocations((current) => current.filter((item) => item.id !== optimistic.id));
      toast.error("Couldn't save the allocation.");
      return;
    }

    setAllocations((current) => current.map((item) => (item.id === optimistic.id ? created : item)));
    toast.success("Allocation created");
  }, [ensurePool, projectId]);

  const toggleWatch = useCallback(async (allocation) => {
    const nextStatus = allocation.status === "watch" ? "on_track" : "watch";
    setAllocations((current) =>
      current.map((item) => (item.id === allocation.id ? { ...item, status: nextStatus } : item)),
    );

    const updated = await updateCreditAllocation(allocation.id, { status: nextStatus });
    if (!updated) {
      setAllocations((current) =>
        current.map((item) => (item.id === allocation.id ? allocation : item)),
      );
      toast.error("Couldn't update the allocation.");
      return;
    }

    setAllocations((current) => current.map((item) => (item.id === updated.id ? updated : item)));
  }, []);

  const deleteAllocation = useCallback(async (id) => {
    const previous = allocations.find((item) => item.id === id);
    setAllocations((current) => current.filter((item) => item.id !== id));

    const ok = await softDeleteCreditAllocation(id);
    if (!ok) {
      setAllocations((current) => (previous ? [previous, ...current] : current));
      toast.error("Couldn't delete the allocation.");
      return;
    }

    toast.success("Allocation deleted");
  }, [allocations]);

  const filteredAllocations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return allocations.filter((allocation) => {
      const matchesFilter = activeFilter === "all" || allocation.targetType === activeFilter;
      if (!matchesFilter) return false;
      if (!normalizedQuery) return true;

      const pool = pools.find((item) => item.id === allocation.poolId);
      return [pool?.name, allocation.target, allocation.targetType, allocation.scope, allocation.status]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [activeFilter, allocations, pools, query]);

  if (loading) {
    return (
      <MainScreenWrapper>
        <div className="flex h-[260px] flex-col items-center justify-center gap-3 text-text-secondary">
          <Bot className="h-10 w-10 opacity-30" />
          <p className="text-sm">Loading credited resources…</p>
        </div>
      </MainScreenWrapper>
    );
  }

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

      {pools.length === 0 && allocations.length === 0 ? (
        <EmptyState
          icon={Bot}
          title="No credited resources yet"
          description="Create a credit pool and allocate it across users, tasks, goals, and modules."
          action={
            <Button className="bg-primary text-primary-foreground hover:bg-primary" onClick={addAllocation}>
              <Plus className="mr-2 h-4 w-4" />
              New Allocation
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <CreditStats pools={pools} allocations={allocations} />
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

          <PoolTable pools={pools} />

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
            <AllocationTable
              allocations={filteredAllocations}
              pools={pools}
              onToggleWatch={toggleWatch}
              onDelete={deleteAllocation}
            />
          )}
        </>
      )}

      <UsagePlanAccordion />
    </MainScreenWrapper>
  );
}
