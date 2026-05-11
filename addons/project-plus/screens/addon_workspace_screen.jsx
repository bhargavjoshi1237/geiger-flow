"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { cn } from "@/lib/utils";
import { Search, Plus, ArrowUpRight, CheckCircle2, Clock3, UserRound } from "lucide-react";

const TONE_CLASS = {
  red: "text-red-300",
  orange: "text-orange-300",
  amber: "text-amber-300",
  blue: "text-blue-300",
  violet: "text-violet-300",
  emerald: "text-emerald-300",
  zinc: "text-zinc-300",
};

const TONE_DOT_CLASS = {
  red: "bg-red-300",
  orange: "bg-orange-300",
  amber: "bg-amber-300",
  blue: "bg-blue-300",
  violet: "bg-violet-300",
  emerald: "bg-emerald-300",
  zinc: "bg-zinc-300",
};

function ViewSwitch({ views, activeView, onChange }) {
  return (
    <div className="flex w-full items-center overflow-x-auto rounded-lg border border-[#2a2a2a] bg-[#202020] p-0.5 xl:w-auto">
      {views.map((view) => (
        <Button
          key={view}
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange(view)}
          className={cn(
            "h-7 rounded-md px-3 text-xs",
            activeView === view
              ? "bg-[#2a2a2a] text-white"
              : "text-[#737373] hover:bg-transparent hover:text-[#a3a3a3]",
          )}
        >
          {view}
        </Button>
      ))}
    </div>
  );
}

function MetricCard({ metric }) {
  const Icon = metric.icon || CheckCircle2;

  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-[#a3a3a3]">{metric.label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-[#e7e7e7]">{metric.value}</p>
          <p className="mt-1 text-xs text-[#737373]">{metric.detail}</p>
        </div>
        <Icon className="h-4 w-4 text-[#737373]" />
      </div>
    </div>
  );
}

function WorkItem({ item }) {
  const tone = item.statusTone || "zinc";

  return (
    <article className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4 transition-colors hover:border-[#3a3a3a]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-[#ededed]">{item.title}</h3>
            {item.code ? (
              <span className="font-mono text-[10px] text-[#525252]">
                {item.code}
              </span>
            ) : null}
          </div>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#737373]">{item.description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#737373]">
            <span className="inline-flex items-center gap-1.5">
              <UserRound className="h-3.5 w-3.5" />
              {item.owner}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5" />
              {item.due}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:w-[430px]">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-[#525252]">Status</p>
            <p className={cn("mt-1 inline-flex items-center gap-1.5 text-sm font-medium", TONE_CLASS[tone])}>
              <span className={cn("h-1.5 w-1.5 rounded-full", TONE_DOT_CLASS[tone])} />
              {item.status}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-[#525252]">{item.signalLabel || "Signal"}</p>
            <p className="mt-1 text-sm font-medium text-[#ededed]">{item.signal}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-[#525252]">Progress</p>
            <div className="mt-2 space-y-1">
              <Progress
                value={item.progress}
                className="h-1.5 bg-[#2a2a2a] [&_[data-slot=progress-indicator]]:bg-[#ededed]"
              />
              <p className="text-xs text-[#737373]">{item.progress}%</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function AddonWorkspaceScreen({ config }) {
  const [activeView, setActiveView] = useState(config.views?.[0] || "All");
  const [query, setQuery] = useState("");
  const Icon = config.icon;

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return config.items.filter((item) => {
      const matchesView = activeView === "All" || item.view === activeView;
      if (!matchesView) return false;
      if (!normalizedQuery) return true;

      return [item.title, item.description, item.owner, item.status, item.signal, item.code]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [activeView, config.items, query]);

  return (
    <MainScreenWrapper className="text-[#e7e7e7]">
      <div className="flex flex-col gap-4 border-b border-[#2a2a2a] pb-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] text-[#a3a3a3]">
            {Icon ? <Icon className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#e7e7e7] md:text-3xl">{config.title}</h1>
            <p className="mt-1 text-[#a3a3a3]">{config.description}</p>
          </div>
        </div>
        <Button className="bg-white text-black hover:bg-[#e7e7e7]">
          <Plus className="mr-2 h-4 w-4" />
          {config.actionLabel || "Add item"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {config.metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      <div className="rounded-2xl border border-[#2a2a2a] bg-[#202020]">
        <div className="flex flex-col gap-3 border-b border-[#2a2a2a] p-4 xl:flex-row xl:items-center xl:justify-between">
          <ViewSwitch views={config.views || ["All"]} activeView={activeView} onChange={setActiveView} />
          <div className="relative w-full xl:w-[320px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#737373]" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={config.searchPlaceholder || "Search"}
              className="!h-10 border-[#2a2a2a] bg-[#1a1a1a] !pl-10 !pr-3 text-sm text-[#ededed] placeholder:text-[#737373]"
            />
          </div>
        </div>

        <div className="space-y-3 p-4">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => <WorkItem key={item.code || item.title} item={item} />)
          ) : (
            <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-[#2a2a2a] text-sm text-[#737373]">
              No items match your filters.
            </div>
          )}
        </div>
      </div>
    </MainScreenWrapper>
  );
}
