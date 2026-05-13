"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Beaker,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Flame,
  GitPullRequestArrow,
  Lightbulb,
  MessageSquareQuote,
  Plus,
  ReceiptText,
  Search,
  Siren,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { cn } from "@/lib/utils";

const STATUS_CLASS = {
  red: "border-red-500/30 bg-red-500/15 text-red-300",
  amber: "border-amber-500/30 bg-amber-500/15 text-amber-300",
  emerald: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
  blue: "border-blue-500/30 bg-blue-500/15 text-blue-300",
  violet: "border-violet-500/30 bg-violet-500/15 text-violet-300",
  cyan: "border-cyan-500/30 bg-cyan-500/15 text-cyan-300",
  zinc: "border-zinc-500/30 bg-zinc-500/15 text-zinc-300",
};

function PageHeader({ icon: Icon, title, description, action, accent = "emerald" }) {
  return (
    <div className="flex flex-col gap-4 border-b border-[#2a2a2a] pb-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl border", STATUS_CLASS[accent])}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#e7e7e7] md:text-3xl">{title}</h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-[#a3a3a3]">{description}</p>
        </div>
      </div>
      <Button className="bg-white text-black hover:bg-[#e7e7e7]">
        <Plus className="mr-2 h-4 w-4" />
        {action}
      </Button>
    </div>
  );
}

function Metric({ label, value, detail, icon: Icon, tone = "zinc" }) {
  return (
    <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-[#a3a3a3]">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-[#e7e7e7]">{value}</p>
          <p className="mt-1 text-xs text-[#737373]">{detail}</p>
        </div>
        <Icon className={cn("h-4 w-4", STATUS_CLASS[tone]?.split(" ").at(-1) || "text-[#737373]")} />
      </div>
    </div>
  );
}

function StatusBadge({ tone = "zinc", children }) {
  return <Badge className={cn("border px-2 py-0.5 text-[11px]", STATUS_CLASS[tone])}>{children}</Badge>;
}

function Section({ title, detail, children, action }) {
  return (
    <section className="rounded-2xl border border-[#2a2a2a] bg-[#202020]">
      <div className="flex flex-col gap-3 border-b border-[#2a2a2a] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-[#ededed]">{title}</h2>
          {detail ? <p className="mt-1 text-xs leading-5 text-[#737373]">{detail}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function SearchBox({ value, onChange, placeholder }) {
  return (
    <div className="relative w-full sm:w-[300px]">
      <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#737373]" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="!h-9 border-[#2a2a2a] bg-[#1a1a1a] !pl-10 text-sm text-[#ededed] placeholder:text-[#737373]"
      />
    </div>
  );
}

function FilterTabs({ tabs, active, onChange }) {
  return (
    <div className="flex w-full items-center overflow-x-auto rounded-lg border border-[#2a2a2a] bg-[#1a1a1a] p-0.5 sm:w-auto">
      {tabs.map((tab) => (
        <Button
          key={tab}
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange(tab)}
          className={cn(
            "h-7 rounded-md px-3 text-xs",
            active === tab ? "bg-[#2a2a2a] text-white" : "text-[#737373] hover:bg-transparent hover:text-[#a3a3a3]",
          )}
        >
          {tab}
        </Button>
      ))}
    </div>
  );
}

function useFilteredRows(rows, active, query, fields) {
  return useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesTab = active === "All" || row.stage === active || row.status === active || row.type === active;
      if (!matchesTab) return false;
      if (!normalized) return true;
      return fields.some((field) => String(row[field] || "").toLowerCase().includes(normalized));
    });
  }, [active, fields, query, rows]);
}

const riskRows = [
  { id: "RSK-12", risk: "Staging data drift can delay release validation", owner: "Priya Shah", probability: 68, impact: "High", exposure: "$18k", mitigation: "Automated nightly refresh with data contract checks", status: "Mitigating", tone: "amber" },
  { id: "RSK-09", risk: "Vendor launch-week SLA is not contractually confirmed", owner: "Sam Lee", probability: 44, impact: "Medium", exposure: "$9k", mitigation: "Escalate procurement approval and add fallback support path", status: "Open", tone: "red" },
  { id: "RSK-05", risk: "Mobile regression matrix reduced after schedule compression", owner: "Riley Park", probability: 31, impact: "Medium", exposure: "$6k", mitigation: "Analytics-led device coverage and targeted smoke suite", status: "Watching", tone: "blue" },
];

export function RiskRegisterScreen() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("All");
  const rows = useFilteredRows(riskRows, active, query, ["id", "risk", "owner", "mitigation", "impact"]);

  return (
    <MainScreenWrapper className="text-[#e7e7e7]">
      <PageHeader icon={Flame} title="Risk Register" description="Quantify delivery, vendor, security, and scope risks with mitigation owners and financial exposure." action="Add risk" accent="red" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Open exposure" value="$33k" detail="Weighted project impact" icon={Banknote} tone="amber" />
        <Metric label="High impact" value="2" detail="Needs sponsor attention" icon={Siren} tone="red" />
        <Metric label="Mitigated" value="8" detail="This quarter" icon={CheckCircle2} tone="emerald" />
        <Metric label="Review SLA" value="91%" detail="Risks reviewed on time" icon={Clock3} tone="blue" />
      </div>
      <Section
        title="Risk board"
        detail="Probability is updated during weekly planning and exposure feeds launch readiness."
        action={<SearchBox value={query} onChange={setQuery} placeholder="Search risks" />}
      >
        <div className="flex border-b border-[#2a2a2a] p-4">
          <FilterTabs tabs={["All", "Open", "Mitigating", "Watching"]} active={active} onChange={setActive} />
        </div>
        <div className="divide-y divide-[#2a2a2a]">
          {rows.map((row) => (
            <article key={row.id} className="grid gap-4 p-4 lg:grid-cols-[1fr_180px_220px] lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] text-[#525252]">{row.id}</span>
                  <StatusBadge tone={row.tone}>{row.status}</StatusBadge>
                </div>
                <h3 className="mt-2 text-sm font-semibold text-[#ededed]">{row.risk}</h3>
                <p className="mt-1 text-xs leading-5 text-[#737373]">{row.mitigation}</p>
              </div>
              <div>
                <p className="text-xs text-[#737373]">Probability</p>
                <Progress value={row.probability} className="mt-2 h-1.5 bg-[#2a2a2a] [&_[data-slot=progress-indicator]]:bg-red-300" />
                <p className="mt-1 text-xs text-[#a3a3a3]">{row.probability}% chance</p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div><p className="text-[#525252]">Owner</p><p className="mt-1 text-[#ededed]">{row.owner}</p></div>
                <div><p className="text-[#525252]">Impact</p><p className="mt-1 text-[#ededed]">{row.impact}</p></div>
                <div><p className="text-[#525252]">Exposure</p><p className="mt-1 text-[#ededed]">{row.exposure}</p></div>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </MainScreenWrapper>
  );
}

const decisions = [
  { id: "DEC-31", title: "Keep saved views local until report queries stabilize", driver: "Reporting query contract is still moving", owner: "Aadit Joshi", status: "Accepted", stage: "Accepted", tone: "emerald", reversibility: "High", review: "May 30" },
  { id: "DEC-30", title: "Use role-based access for vault entries", driver: "Individual exceptions were creating audit gaps", owner: "Sam Lee", status: "Proposed", stage: "Proposed", tone: "blue", reversibility: "Medium", review: "May 15" },
  { id: "DEC-22", title: "Revisit custom field schema after beta", driver: "Beta needs flexibility before typed constraints", owner: "Priya Shah", status: "Revisit", stage: "Revisit", tone: "amber", reversibility: "Low", review: "Jun 3" },
];

export function DecisionLogScreen() {
  const [active, setActive] = useState("All");
  return (
    <MainScreenWrapper className="text-[#e7e7e7]">
      <PageHeader icon={Lightbulb} title="Decision Log" description="Record what the team decided, why it mattered, who owns the consequences, and when it should be revisited." action="Log decision" accent="amber" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Accepted" value="14" detail="Current quarter" icon={ClipboardCheck} tone="emerald" />
        <Metric label="Pending review" value="3" detail="Need decision meeting" icon={Clock3} tone="blue" />
        <Metric label="Revisit soon" value="2" detail="Before beta freeze" icon={AlertTriangle} tone="amber" />
        <Metric label="Avg age" value="11d" detail="Proposal to acceptance" icon={TrendingUp} tone="violet" />
      </div>
      <Section title="Decision timeline" detail="Filter by decision state and keep context attached to project work." action={<FilterTabs tabs={["All", "Proposed", "Accepted", "Revisit"]} active={active} onChange={setActive} />}>
        <div className="space-y-3 p-4">
          {decisions.filter((item) => active === "All" || item.stage === active).map((item) => (
            <article key={item.id} className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] text-[#525252]">{item.id}</span>
                    <StatusBadge tone={item.tone}>{item.status}</StatusBadge>
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-[#ededed]">{item.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-[#737373]">{item.driver}</p>
                </div>
                <div className="grid min-w-[280px] grid-cols-3 gap-3 text-xs">
                  <div><p className="text-[#525252]">Owner</p><p className="mt-1 text-[#ededed]">{item.owner}</p></div>
                  <div><p className="text-[#525252]">Reversible</p><p className="mt-1 text-[#ededed]">{item.reversibility}</p></div>
                  <div><p className="text-[#525252]">Review</p><p className="mt-1 text-[#ededed]">{item.review}</p></div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </MainScreenWrapper>
  );
}

const launchGates = [
  { gate: "Rollback runbook", owner: "Alex Morgan", area: "Ops", score: 100, status: "Ready", tone: "emerald", evidence: "Runbook approved and dry-run completed" },
  { gate: "Support macros", owner: "Priya Shah", area: "Support", score: 70, status: "In Review", tone: "blue", evidence: "Copy review pending for enterprise escalation paths" },
  { gate: "Mobile regression", owner: "Riley Park", area: "QA", score: 45, status: "Blocked", tone: "red", evidence: "Needs latest staging build before final pass" },
  { gate: "Comms plan", owner: "Sam Lee", area: "GTM", score: 88, status: "Ready", tone: "emerald", evidence: "Launch notes and customer mail approved" },
];

export function ReleaseReadinessScreen() {
  return (
    <MainScreenWrapper className="text-[#e7e7e7]">
      <PageHeader icon={ClipboardCheck} title="Release Readiness" description="Coordinate launch gates, evidence, owners, and unresolved blockers before a release leaves the project." action="Add gate" accent="emerald" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Readiness score" value="78%" detail="7 of 10 gates ready" icon={ClipboardCheck} tone="emerald" />
        <Metric label="Blocked gates" value="1" detail="Mobile regression" icon={Siren} tone="red" />
        <Metric label="Sign-offs" value="5/7" detail="Approvers complete" icon={UserRound} tone="blue" />
        <Metric label="Launch window" value="May 24" detail="Target release date" icon={Clock3} tone="violet" />
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
        <Section title="Gate checklist" detail="Every gate carries evidence, ownership, and a readiness score.">
          <div className="divide-y divide-[#2a2a2a]">
            {launchGates.map((gate) => (
              <article key={gate.gate} className="grid gap-4 p-4 md:grid-cols-[1fr_180px] md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-[#ededed]">{gate.gate}</h3>
                    <StatusBadge tone={gate.tone}>{gate.status}</StatusBadge>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-[#737373]">{gate.evidence}</p>
                  <p className="mt-2 text-xs text-[#525252]">{gate.area} owned by {gate.owner}</p>
                </div>
                <div>
                  <Progress value={gate.score} className="h-1.5 bg-[#2a2a2a] [&_[data-slot=progress-indicator]]:bg-emerald-300" />
                  <p className="mt-1 text-xs text-[#a3a3a3]">{gate.score}% ready</p>
                </div>
              </article>
            ))}
          </div>
        </Section>
        <Section title="Launch command" detail="Focus areas for the next release review.">
          <div className="space-y-3 p-4 text-sm">
            {["Unblock staging mobile build", "Attach support macro approval", "Confirm final incident owner rotation"].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
                <span className="text-[#d4d4d4]">{item}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </MainScreenWrapper>
  );
}

const feedbackItems = [
  { title: "Bulk task updates are too slow for weekly PM rituals", source: "6 enterprise accounts", theme: "Speed", impact: "High", status: "Triaged", tone: "blue", linked: "TASK-42" },
  { title: "CSV exports needed for audit packs", source: "Admin interviews", theme: "Reporting", impact: "High", status: "Linked", tone: "emerald", linked: "REP-19" },
  { title: "Calendar view should surface blocked work", source: "Beta notes", theme: "Planning", impact: "Medium", status: "New", tone: "amber", linked: "Unlinked" },
];

export function FeedbackHubScreen() {
  return (
    <MainScreenWrapper className="text-[#e7e7e7]">
      <PageHeader icon={MessageSquareQuote} title="Customer Feedback Hub" description="Collect user signals, group them into product themes, and link validated needs to project work." action="Add feedback" accent="cyan" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="New signals" value="18" detail="This week" icon={MessageSquareQuote} tone="cyan" />
        <Metric label="Linked work" value="7" detail="Feedback tied to tasks" icon={GitPullRequestArrow} tone="emerald" />
        <Metric label="Top theme" value="Speed" detail="6 customer mentions" icon={TrendingUp} tone="violet" />
        <Metric label="Revenue at stake" value="$142k" detail="Impacted ARR" icon={Banknote} tone="amber" />
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_340px]">
        <Section title="Feedback inbox" detail="Prioritize by customer impact, revenue, and planning link.">
          <div className="divide-y divide-[#2a2a2a]">
            {feedbackItems.map((item) => (
              <article key={item.title} className="p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge tone={item.tone}>{item.status}</StatusBadge>
                      <span className="text-xs text-[#737373]">{item.source}</span>
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-[#ededed]">{item.title}</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs lg:w-[300px]">
                    <div><p className="text-[#525252]">Theme</p><p className="mt-1 text-[#ededed]">{item.theme}</p></div>
                    <div><p className="text-[#525252]">Impact</p><p className="mt-1 text-[#ededed]">{item.impact}</p></div>
                    <div><p className="text-[#525252]">Work</p><p className="mt-1 text-[#ededed]">{item.linked}</p></div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Section>
        <Section title="Theme map" detail="Signals grouped for planning.">
          <div className="space-y-3 p-4">
            {[
              ["Speed", 78, "6 mentions"],
              ["Reporting", 55, "4 mentions"],
              ["Planning", 42, "3 mentions"],
            ].map(([theme, value, detail]) => (
              <div key={theme}>
                <div className="flex justify-between text-xs"><span className="text-[#ededed]">{theme}</span><span className="text-[#737373]">{detail}</span></div>
                <Progress value={value} className="mt-2 h-1.5 bg-[#2a2a2a] [&_[data-slot=progress-indicator]]:bg-cyan-300" />
              </div>
            ))}
          </div>
        </Section>
      </div>
    </MainScreenWrapper>
  );
}

const experiments = [
  { name: "Shorter onboarding checklist", hypothesis: "Fewer starter steps improves activation without lowering project quality.", metric: "Activation", lift: "+8.1%", status: "Running", tone: "violet", confidence: 71 },
  { name: "Inline reporting export CTA", hypothesis: "Admins export more reports when action sits beside saved views.", metric: "Exports", lift: "+3.4%", status: "Designing", tone: "blue", confidence: 38 },
  { name: "Default grouped task list", hypothesis: "Grouping by due date improves weekly task completion.", metric: "Completion", lift: "+11%", status: "Won", tone: "emerald", confidence: 95 },
];

export function ExperimentsScreen() {
  return (
    <MainScreenWrapper className="text-[#e7e7e7]">
      <PageHeader icon={Beaker} title="Experiment Tracker" description="Plan product bets, define hypotheses, monitor confidence, and ship learnings into goals." action="New experiment" accent="violet" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Running" value="3" detail="Live product tests" icon={Beaker} tone="violet" />
        <Metric label="Win rate" value="42%" detail="Last 12 experiments" icon={CheckCircle2} tone="emerald" />
        <Metric label="Learning velocity" value="9d" detail="Avg cycle time" icon={Clock3} tone="blue" />
        <Metric label="Activation lift" value="+8%" detail="Current best bet" icon={ArrowUpRight} tone="emerald" />
      </div>
      <Section title="Experiment pipeline" detail="Each test ties a hypothesis to one primary metric and a confidence threshold.">
        <div className="grid grid-cols-1 gap-4 p-4 xl:grid-cols-3">
          {experiments.map((experiment) => (
            <article key={experiment.name} className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4">
              <div className="flex items-center justify-between gap-3">
                <StatusBadge tone={experiment.tone}>{experiment.status}</StatusBadge>
                <span className="text-xs text-[#737373]">{experiment.metric}</span>
              </div>
              <h3 className="mt-4 text-sm font-semibold text-[#ededed]">{experiment.name}</h3>
              <p className="mt-2 min-h-12 text-xs leading-5 text-[#737373]">{experiment.hypothesis}</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-[#2a2a2a] bg-[#202020] p-3">
                  <p className="text-xs text-[#737373]">Observed lift</p>
                  <p className="mt-1 text-lg font-semibold text-[#ededed]">{experiment.lift}</p>
                </div>
                <div className="rounded-lg border border-[#2a2a2a] bg-[#202020] p-3">
                  <p className="text-xs text-[#737373]">Confidence</p>
                  <p className="mt-1 text-lg font-semibold text-[#ededed]">{experiment.confidence}%</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </MainScreenWrapper>
  );
}

const incidents = [
  { id: "INC-27", title: "Webhook delivery latency above threshold", severity: "SEV-2", owner: "Sam Lee", status: "Active", tone: "red", elapsed: "38m", action: "Scale queue workers and notify enterprise consumers" },
  { id: "INC-24", title: "Asset thumbnails regenerated slowly", severity: "SEV-3", owner: "Riley Park", status: "Monitoring", tone: "amber", elapsed: "2h", action: "Watch media queue drain and attach postmortem notes" },
  { id: "INC-19", title: "Search indexing gap after deploy", severity: "SEV-3", owner: "Aadit Joshi", status: "Resolved", tone: "emerald", elapsed: "Done", action: "Postmortem actions filed for deploy checklist" },
];

export function IncidentCenterScreen() {
  return (
    <MainScreenWrapper className="text-[#e7e7e7]">
      <PageHeader icon={Siren} title="Incident Center" description="Coordinate active incidents, response roles, customer communication, and postmortem follow-through." action="Declare incident" accent="red" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Active" value="1" detail="SEV-2 in progress" icon={Siren} tone="red" />
        <Metric label="MTTR" value="38m" detail="Last 30 days" icon={Clock3} tone="emerald" />
        <Metric label="Postmortems" value="4" detail="Completed this quarter" icon={ReceiptText} tone="blue" />
        <Metric label="SLO burn" value="12%" detail="Monthly error budget" icon={ArrowDownRight} tone="amber" />
      </div>
      <Section title="Response timeline" detail="Active and recent incidents with next action ownership.">
        <div className="space-y-3 p-4">
          {incidents.map((incident) => (
            <article key={incident.id} className="grid gap-4 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-4 lg:grid-cols-[1fr_260px]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] text-[#525252]">{incident.id}</span>
                  <StatusBadge tone={incident.tone}>{incident.status}</StatusBadge>
                  <span className="text-xs text-[#737373]">{incident.severity}</span>
                </div>
                <h3 className="mt-2 text-sm font-semibold text-[#ededed]">{incident.title}</h3>
                <p className="mt-2 text-xs leading-5 text-[#737373]">{incident.action}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><p className="text-[#525252]">Commander</p><p className="mt-1 text-[#ededed]">{incident.owner}</p></div>
                <div><p className="text-[#525252]">Elapsed</p><p className="mt-1 text-[#ededed]">{incident.elapsed}</p></div>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </MainScreenWrapper>
  );
}

const budgetLines = [
  { category: "Cloud preview environments", owner: "Alex Morgan", budget: 9200, actual: 7800, forecast: 10400, status: "Watch", tone: "amber" },
  { category: "Design contractor allocation", owner: "Priya Shah", budget: 6500, actual: 3900, forecast: 6100, status: "On Track", tone: "emerald" },
  { category: "Security audit reserve", owner: "Sam Lee", budget: 12000, actual: 3000, forecast: 11800, status: "On Track", tone: "emerald" },
  { category: "QA device lab", owner: "Riley Park", budget: 4800, actual: 5200, forecast: 5900, status: "Over", tone: "red" },
];

function currency(value) {
  return `$${Math.round(value / 100) / 10}k`;
}

export function BudgetTrackerScreen() {
  const totalBudget = budgetLines.reduce((sum, item) => sum + item.budget, 0);
  const totalForecast = budgetLines.reduce((sum, item) => sum + item.forecast, 0);
  const used = Math.round((budgetLines.reduce((sum, item) => sum + item.actual, 0) / totalBudget) * 100);

  return (
    <MainScreenWrapper className="text-[#e7e7e7]">
      <PageHeader icon={Banknote} title="Budget Tracker" description="Track budget, actuals, forecast variance, and vendor spend before project costs become a surprise." action="Add cost line" accent="emerald" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Budget used" value={`${used}%`} detail="$19.9k of $32.5k committed" icon={Banknote} tone="emerald" />
        <Metric label="Forecast" value={currency(totalForecast)} detail="Expected at completion" icon={TrendingUp} tone="blue" />
        <Metric label="Variance" value="+4%" detail="Over current plan" icon={AlertTriangle} tone="amber" />
        <Metric label="Watch items" value="2" detail="Cloud and QA need action" icon={Siren} tone="red" />
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_330px]">
        <Section title="Cost lines" detail="Live project budget with owner, actuals, forecast, and variance.">
          <div className="divide-y divide-[#2a2a2a]">
            {budgetLines.map((line) => {
              const variance = line.forecast - line.budget;
              const progress = Math.min(100, Math.round((line.actual / line.budget) * 100));
              return (
                <article key={line.category} className="grid gap-4 p-4 lg:grid-cols-[1fr_180px_220px] lg:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-[#ededed]">{line.category}</h3>
                      <StatusBadge tone={line.tone}>{line.status}</StatusBadge>
                    </div>
                    <p className="mt-1 text-xs text-[#737373]">Owned by {line.owner}</p>
                  </div>
                  <div>
                    <Progress value={progress} className="h-1.5 bg-[#2a2a2a] [&_[data-slot=progress-indicator]]:bg-emerald-300" />
                    <p className="mt-1 text-xs text-[#a3a3a3]">{currency(line.actual)} actual of {currency(line.budget)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div><p className="text-[#525252]">Forecast</p><p className="mt-1 text-[#ededed]">{currency(line.forecast)}</p></div>
                    <div><p className="text-[#525252]">Variance</p><p className={cn("mt-1", variance > 0 ? "text-red-300" : "text-emerald-300")}>{variance > 0 ? "+" : ""}{currency(variance)}</p></div>
                  </div>
                </article>
              );
            })}
          </div>
        </Section>
        <Section title="Forecast note" detail="PM-facing finance memo for the next steering review.">
          <div className="space-y-3 p-4">
            <Textarea
              value={"Cloud previews and QA lab costs are trending above plan. Security reserve still absorbs audit risk, but preview cleanup should run before the next beta cycle."}
              readOnly
              className="min-h-36 border-[#2a2a2a] bg-[#1a1a1a] text-sm leading-6 text-[#a3a3a3]"
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-3">
                <p className="text-xs text-[#737373]">Next review</p>
                <p className="mt-1 text-sm font-semibold text-[#ededed]">May 17</p>
              </div>
              <div className="rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] p-3">
                <p className="text-xs text-[#737373]">Approval gap</p>
                <p className="mt-1 text-sm font-semibold text-amber-300">$1.4k</p>
              </div>
            </div>
          </div>
        </Section>
      </div>
    </MainScreenWrapper>
  );
}
