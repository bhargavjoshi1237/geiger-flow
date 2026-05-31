"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Eye,
  Fingerprint,
  KeyRound,
  Lock,
  Search,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { cn } from "@/lib/utils";

const SECURITY_VIEWS = ["Overview", "Access", "Vulnerabilities", "Keys"];

const POLICIES = [];

const VULNERABILITIES = [];

const ACCESS_EVENTS = [];

const API_KEYS = [];

const SEVERITY_CLASS = {
  High: "border-orange-500/25 bg-orange-500/10 text-orange-300",
  Medium: "border-amber-500/25 bg-amber-500/10 text-amber-300",
  Low: "border-blue-500/25 bg-blue-500/10 text-blue-300",
};

const STATUS_CLASS = {
  Open: "border-red-500/25 bg-red-500/10 text-red-300",
  Fixing: "border-blue-500/25 bg-blue-500/10 text-blue-300",
  Resolved: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
  Allowed: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
  Blocked: "border-red-500/25 bg-red-500/10 text-red-300",
  Active: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
  Rotate: "border-amber-500/25 bg-amber-500/10 text-amber-300",
};

function ViewSwitch({ activeView, onChange }) {
  return (
    <div className="flex w-full items-center overflow-x-auto rounded-lg border border-[#2a2a2a] bg-[#202020] p-0.5 xl:w-auto">
      {SECURITY_VIEWS.map((view) => (
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

function SecuritySummary() {
  return (
    <section className="rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-[#ededed]">Security posture is healthy</h2>
              <span className="text-xs font-medium text-emerald-300">
                Live
              </span>
            </div>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-[#a3a3a3]">
              Core protections are enabled. Two vulnerabilities still need owners, and one stale API key should be rotated.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl border border-[#2a2a2a] bg-[#202020] px-4 py-3">
            <p className="text-lg font-semibold text-[#ededed]">3/4</p>
            <p className="text-[11px] text-[#737373]">Policies on</p>
          </div>
          <div className="rounded-xl border border-[#2a2a2a] bg-[#202020] px-4 py-3">
            <p className="text-lg font-semibold text-[#ededed]">2</p>
            <p className="text-[11px] text-[#737373]">Open risks</p>
          </div>
          <div className="rounded-xl border border-[#2a2a2a] bg-[#202020] px-4 py-3">
            <p className="text-lg font-semibold text-[#ededed]">1</p>
            <p className="text-[11px] text-[#737373]">Key to rotate</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function PolicyCard({ policy }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4">
      <div className="flex min-w-0 items-start gap-3">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
            policy.enabled
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
              : "border-[#333333] bg-[#202020] text-[#737373]",
          )}
        >
          {policy.enabled ? <ShieldCheck className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-[#ededed]">{policy.name}</h3>
            <span className="text-xs text-[#a3a3a3]">
              {policy.state}
            </span>
          </div>
          <p className="mt-1 text-xs leading-5 text-[#737373]">{policy.description}</p>
        </div>
      </div>
      <Switch checked={policy.enabled} />
    </div>
  );
}

function VulnerabilityItem({ item }) {
  return (
    <article className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4 transition-colors hover:border-[#3a3a3a]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-[#ededed]">{item.title}</h3>
            <span className="font-mono text-[10px] text-[#737373]">{item.id}</span>
          </div>
          <p className="mt-1 text-xs text-[#737373]">{item.area}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={cn("border px-2 py-0.5 text-[10px]", SEVERITY_CLASS[item.severity])}>
            {item.severity}
          </Badge>
          <Badge className={cn("border px-2 py-0.5 text-[10px]", STATUS_CLASS[item.status])}>
            {item.status}
          </Badge>
          <span className="inline-flex items-center gap-1.5 text-xs text-[#a3a3a3]">
            <UserRound className="h-3.5 w-3.5 text-[#737373]" />
            {item.owner}
          </span>
          <span className="text-xs text-[#737373]">{item.due}</span>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-[#737373] hover:bg-[#242424] hover:text-white">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}

function AccessEvent({ event }) {
  const blocked = event.state === "Blocked";

  return (
    <div className="grid grid-cols-1 gap-2 border-b border-[#2a2a2a] px-4 py-3 last:border-b-0 md:grid-cols-[1.2fr_1fr_1fr_0.7fr_auto] md:items-center">
      <div className="min-w-0">
        <p className={cn("truncate text-sm font-medium", blocked ? "text-red-300" : "text-[#ededed]")}>{event.actor}</p>
        <p className="mt-0.5 truncate text-xs text-[#737373]">{event.action}</p>
      </div>
      <span className="text-xs text-[#a3a3a3]">{event.device}</span>
      <span className="text-xs text-[#737373]">{event.location}</span>
      <span className="text-xs text-[#737373]">{event.time}</span>
      <span className={cn("text-xs font-medium", blocked ? "text-red-300" : "text-emerald-300")}>
        {event.state}
      </span>
    </div>
  );
}

function KeyItem({ apiKey }) {
  return (
    <article className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4 transition-colors hover:border-[#3a3a3a]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#333333] bg-[#202020] text-[#a3a3a3]">
            <KeyRound className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-[#ededed]">{apiKey.name}</h3>
            <p className="mt-0.5 font-mono text-xs text-[#737373]">{apiKey.key}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#a3a3a3]">{apiKey.scopes.join(", ")}</span>
          <span className="text-xs text-[#737373]">Last used {apiKey.lastUsed}</span>
          <Badge className={cn("border px-2 py-0.5 text-[10px]", STATUS_CLASS[apiKey.state])}>
            {apiKey.state}
          </Badge>
        </div>
      </div>
    </article>
  );
}

export function SecurityScreen() {
  const [activeView, setActiveView] = useState("Overview");
  const [query, setQuery] = useState("");

  const filteredVulnerabilities = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return VULNERABILITIES;

    return VULNERABILITIES.filter((item) =>
      [item.id, item.title, item.area, item.owner, item.severity, item.status]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query]);

  const showOverview = activeView === "Overview";
  const showAccess = activeView === "Access" || showOverview;
  const showVulnerabilities = activeView === "Vulnerabilities" || showOverview;
  const showKeys = activeView === "Keys" || showOverview;

  return (
    <MainScreenWrapper className="text-[#e7e7e7]">
      <div className="flex flex-col gap-4 border-b border-[#2a2a2a] pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#e7e7e7] md:text-3xl">Security</h1>
          <p className="mt-1 text-[#a3a3a3]">
            Review access, fix risks, and manage project credentials.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="border-[#2a2a2a] bg-transparent text-[#a3a3a3] hover:bg-[#242424] hover:text-[#e7e7e7]">
            <Eye className="mr-2 h-4 w-4" />
            Audit log
          </Button>
          <Button className="bg-white text-black hover:bg-[#e7e7e7]">
            <Lock className="mr-2 h-4 w-4" />
            Create key
          </Button>
        </div>
      </div>

      <SecuritySummary />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <ViewSwitch activeView={activeView} onChange={setActiveView} />
        <div className="relative w-full lg:w-[320px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#737373]" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search security items"
            className="!h-10 border-[#2a2a2a] bg-[#1a1a1a] !pl-10 !pr-3 text-sm text-[#ededed] placeholder:text-[#737373]"
          />
        </div>
      </div>

      {showAccess ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#ededed]">Access Controls</h2>
              <p className="mt-1 text-sm text-[#737373]">Policies that decide who can enter, merge, and act.</p>
            </div>
            <span className="text-sm font-medium text-emerald-300">
              3 enabled
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {POLICIES.map((policy) => (
              <PolicyCard key={policy.name} policy={policy} />
            ))}
          </div>
        </section>
      ) : null}

      {showVulnerabilities ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#ededed]">Risk Queue</h2>
              <p className="mt-1 text-sm text-[#737373]">Actionable findings with owner, status, and next due date.</p>
            </div>
            <Button variant="ghost" size="sm" className="text-[#737373] hover:bg-[#242424] hover:text-white">
              Export
              <ExternalLink className="ml-2 h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="space-y-2">
            {filteredVulnerabilities.map((item) => (
              <VulnerabilityItem key={item.id} item={item} />
            ))}
          </div>
        </section>
      ) : null}

      {showAccess ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-[#ededed]">Recent Access</h2>
            <p className="mt-1 text-sm text-[#737373]">Recent authentication and sensitive project actions.</p>
          </div>
          <div className="overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#1a1a1a]">
            {ACCESS_EVENTS.map((event) => (
              <AccessEvent key={`${event.actor}-${event.time}`} event={event} />
            ))}
          </div>
        </section>
      ) : null}

      {showKeys ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#ededed]">Keys & Tokens</h2>
              <p className="mt-1 text-sm text-[#737373]">Project credentials and automation tokens that need periodic review.</p>
            </div>
            <span className="text-sm font-medium text-amber-300">
              1 rotate
            </span>
          </div>
          <div className="space-y-2">
            {API_KEYS.map((apiKey) => (
              <KeyItem key={apiKey.name} apiKey={apiKey} />
            ))}
          </div>
        </section>
      ) : null}

      {showOverview ? (
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-[#ededed]">
              <Fingerprint className="h-4 w-4 text-[#737373]" />
              Data protection
            </div>
            <p className="mt-2 text-xs leading-5 text-[#737373]">AES-256 at rest, TLS 1.3 in transit, partial masking on sensitive fields.</p>
          </div>
          <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-[#ededed]">
              <ShieldAlert className="h-4 w-4 text-[#737373]" />
              Compliance
            </div>
            <p className="mt-2 text-xs leading-5 text-[#737373]">SOC 2 Type II and GDPR controls are active. Next audit window opens in September.</p>
          </div>
          <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-[#ededed]">
              <Terminal className="h-4 w-4 text-[#737373]" />
              Automation
            </div>
            <p className="mt-2 text-xs leading-5 text-[#737373]">CI/CD keys are scoped to deploy actions and should be reviewed every 30 days.</p>
          </div>
        </section>
      ) : null}
    </MainScreenWrapper>
  );
}
