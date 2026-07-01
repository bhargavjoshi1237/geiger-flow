"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Beaker,
  Calculator,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  DollarSign,
  Flame,
  GitPullRequestArrow,
  Lightbulb,
  MessageSquareQuote,
  Plus,
  ReceiptText,
  Search,
  Siren,
  Trash2,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { Badge } from "@geiger/ui";
import { Button } from "@geiger/ui";
import { Input } from "@geiger/ui";
import { Label } from "@geiger/ui";
import { Progress } from "@geiger/ui";
import { Textarea } from "@geiger/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@geiger/ui";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { SegmentedTabs } from "@/components/internal/shared/segmented_tabs";
import { cn } from "@/lib/utils";
import { useProjectBudget } from "@/context/project-budget-context";

const STATUS_CLASS = {
  red: "border-red-500/30 bg-red-500/15 text-red-300",
  amber: "border-amber-500/30 bg-amber-500/15 text-amber-300",
  emerald: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
  blue: "border-blue-500/30 bg-blue-500/15 text-blue-300",
  violet: "border-violet-500/30 bg-violet-500/15 text-violet-300",
  cyan: "border-cyan-500/30 bg-cyan-500/15 text-cyan-300",
  zinc: "border-zinc-500/30 bg-zinc-500/15 text-foreground",
};

function PageHeader({ icon: Icon, title, description, action, accent = "emerald" }) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl border", STATUS_CLASS[accent])}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">{title}</h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
      <Button className="bg-primary text-primary-foreground hover:bg-primary">
        <Plus className="mr-2 h-4 w-4" />
        {action}
      </Button>
    </div>
  );
}

function Metric({ label, value, detail, icon: Icon, tone = "zinc" }) {
  return (
    <div className="rounded-xl border border-border bg-surface-subtle p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
          <p className="mt-1 text-xs text-text-secondary">{detail}</p>
        </div>
        <Icon className={cn("h-4 w-4", STATUS_CLASS[tone]?.split(" ").at(-1) || "text-text-secondary")} />
      </div>
    </div>
  );
}

function StatusBadge({ tone = "zinc", children }) {
  return <Badge className={cn("border px-2 py-0.5 text-[11px]", STATUS_CLASS[tone])}>{children}</Badge>;
}

function Section({ title, detail, children, action }) {
  return (
    <section className="rounded-2xl border border-border bg-surface-card">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          {detail ? <p className="mt-1 text-xs leading-5 text-text-secondary">{detail}</p> : null}
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
      <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-text-secondary" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="!h-9 border-border bg-surface-subtle !pl-10 text-sm text-foreground placeholder:text-text-secondary"
      />
    </div>
  );
}

function FilterTabs({ tabs, active, onChange }) {
  return <SegmentedTabs tabs={tabs} value={active} onChange={onChange} buttonClassName="h-8 text-xs" />;
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

const riskRows = [];

export function RiskRegisterScreen() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("All");
  const rows = useFilteredRows(riskRows, active, query, ["id", "risk", "owner", "mitigation", "impact"]);

  return (
    <MainScreenWrapper className="text-foreground">
      <PageHeader icon={Flame} title="Risk Register" description="Quantify delivery, vendor, security, and scope risks with mitigation owners and financial exposure." action="Add risk" accent="red" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Open exposure" value="0" detail="Weighted project impact" icon={Banknote} tone="amber" />
        <Metric label="High impact" value="2" detail="Needs sponsor attention" icon={Siren} tone="red" />
        <Metric label="Mitigated" value="8" detail="This quarter" icon={CheckCircle2} tone="emerald" />
        <Metric label="Review SLA" value="91%" detail="Risks reviewed on time" icon={Clock3} tone="blue" />
      </div>
      <Section
        title="Risk board"
        detail="Probability is updated during weekly planning and exposure feeds launch readiness."
        action={<SearchBox value={query} onChange={setQuery} placeholder="Search risks" />}
      >
        <div className="flex border-b border-border p-4">
          <FilterTabs tabs={["All", "Open", "Mitigating", "Watching"]} active={active} onChange={setActive} />
        </div>
        <div className="divide-y divide-border">
          {rows.map((row) => (
            <article key={row.id} className="grid gap-4 p-4 lg:grid-cols-[1fr_180px_220px] lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] text-text-tertiary">{row.id}</span>
                  <StatusBadge tone={row.tone}>{row.status}</StatusBadge>
                </div>
                <h3 className="mt-2 text-sm font-semibold text-foreground">{row.risk}</h3>
                <p className="mt-1 text-xs leading-5 text-text-secondary">{row.mitigation}</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary">Probability</p>
                <Progress value={row.probability} className="mt-2 h-1.5 bg-surface-hover [&_[data-slot=progress-indicator]]:bg-red-300" />
                <p className="mt-1 text-xs text-muted-foreground">{row.probability}% chance</p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div><p className="text-text-tertiary">Owner</p><p className="mt-1 text-foreground">{row.owner}</p></div>
                <div><p className="text-text-tertiary">Impact</p><p className="mt-1 text-foreground">{row.impact}</p></div>
                <div><p className="text-text-tertiary">Exposure</p><p className="mt-1 text-foreground">{row.exposure}</p></div>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </MainScreenWrapper>
  );
}

const decisions = [];

export function DecisionLogScreen() {
  const [active, setActive] = useState("All");
  return (
    <MainScreenWrapper className="text-foreground">
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
            <article key={item.id} className="rounded-xl border border-border bg-surface-subtle p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] text-text-tertiary">{item.id}</span>
                    <StatusBadge tone={item.tone}>{item.status}</StatusBadge>
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-text-secondary">{item.driver}</p>
                </div>
                <div className="grid min-w-[280px] grid-cols-3 gap-3 text-xs">
                  <div><p className="text-text-tertiary">Owner</p><p className="mt-1 text-foreground">{item.owner}</p></div>
                  <div><p className="text-text-tertiary">Reversible</p><p className="mt-1 text-foreground">{item.reversibility}</p></div>
                  <div><p className="text-text-tertiary">Review</p><p className="mt-1 text-foreground">{item.review}</p></div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </MainScreenWrapper>
  );
}

const launchGates = [];

export function ReleaseReadinessScreen() {
  return (
    <MainScreenWrapper className="text-foreground">
      <PageHeader icon={ClipboardCheck} title="Release Readiness" description="Coordinate launch gates, evidence, owners, and unresolved blockers before a release leaves the project." action="Add gate" accent="emerald" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Readiness score" value="78%" detail="7 of 10 gates ready" icon={ClipboardCheck} tone="emerald" />
        <Metric label="Blocked gates" value="1" detail="Mobile regression" icon={Siren} tone="red" />
        <Metric label="Sign-offs" value="5/7" detail="Approvers complete" icon={UserRound} tone="blue" />
        <Metric label="Launch window" value="No date" detail="Target release date" icon={Clock3} tone="violet" />
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
        <Section title="Gate checklist" detail="Every gate carries evidence, ownership, and a readiness score.">
          <div className="divide-y divide-border">
            {launchGates.map((gate) => (
              <article key={gate.gate} className="grid gap-4 p-4 md:grid-cols-[1fr_180px] md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{gate.gate}</h3>
                    <StatusBadge tone={gate.tone}>{gate.status}</StatusBadge>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-text-secondary">{gate.evidence}</p>
                  <p className="mt-2 text-xs text-text-tertiary">{gate.area} owned by {gate.owner}</p>
                </div>
                <div>
                  <Progress value={gate.score} className="h-1.5 bg-surface-hover [&_[data-slot=progress-indicator]]:bg-emerald-300" />
                  <p className="mt-1 text-xs text-muted-foreground">{gate.score}% ready</p>
                </div>
              </article>
            ))}
          </div>
        </Section>
        <Section title="Launch command" detail="Focus areas for the next release review.">
          <div className="space-y-3 p-4 text-sm">
            {[].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-xl border border-border bg-surface-subtle p-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />
                <span className="text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </MainScreenWrapper>
  );
}

const feedbackItems = [];

export function FeedbackHubScreen() {
  return (
    <MainScreenWrapper className="text-foreground">
      <PageHeader icon={MessageSquareQuote} title="Customer Feedback Hub" description="Collect user signals, group them into product themes, and link validated needs to project work." action="Add feedback" accent="cyan" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="New signals" value="18" detail="This week" icon={MessageSquareQuote} tone="cyan" />
        <Metric label="Linked work" value="7" detail="Feedback tied to tasks" icon={GitPullRequestArrow} tone="emerald" />
        <Metric label="Top theme" value="No data" detail="0 customer mentions" icon={TrendingUp} tone="violet" />
        <Metric label="Revenue at stake" value="$142k" detail="Impacted ARR" icon={Banknote} tone="amber" />
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_340px]">
        <Section title="Feedback inbox" detail="Prioritize by customer impact, revenue, and planning link.">
          <div className="divide-y divide-border">
            {feedbackItems.map((item) => (
              <article key={item.title} className="p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge tone={item.tone}>{item.status}</StatusBadge>
                      <span className="text-xs text-text-secondary">{item.source}</span>
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-foreground">{item.title}</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs lg:w-[300px]">
                    <div><p className="text-text-tertiary">Theme</p><p className="mt-1 text-foreground">{item.theme}</p></div>
                    <div><p className="text-text-tertiary">Impact</p><p className="mt-1 text-foreground">{item.impact}</p></div>
                    <div><p className="text-text-tertiary">Work</p><p className="mt-1 text-foreground">{item.linked}</p></div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Section>
        <Section title="Theme map" detail="Signals grouped for planning.">
          <div className="space-y-3 p-4">
            {[].map(([theme, value, detail]) => (
              <div key={theme}>
                <div className="flex justify-between text-xs"><span className="text-foreground">{theme}</span><span className="text-text-secondary">{detail}</span></div>
                <Progress value={value} className="mt-2 h-1.5 bg-surface-hover [&_[data-slot=progress-indicator]]:bg-cyan-300" />
              </div>
            ))}
          </div>
        </Section>
      </div>
    </MainScreenWrapper>
  );
}

const experiments = [];

export function ExperimentsScreen() {
  return (
    <MainScreenWrapper className="text-foreground">
      <PageHeader icon={Beaker} title="Experiment Tracker" description="Plan product bets, define hypotheses, monitor confidence, and ship learnings into goals." action="New experiment" accent="violet" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Running" value="3" detail="Live product tests" icon={Beaker} tone="violet" />
        <Metric label="Win rate" value="0%" detail="No experiments" icon={CheckCircle2} tone="emerald" />
        <Metric label="Learning velocity" value="9d" detail="Avg cycle time" icon={Clock3} tone="blue" />
        <Metric label="Activation lift" value="+8%" detail="Current best bet" icon={ArrowUpRight} tone="emerald" />
      </div>
      <Section title="Experiment pipeline" detail="Each test ties a hypothesis to one primary metric and a confidence threshold.">
        <div className="grid grid-cols-1 gap-4 p-4 xl:grid-cols-3">
          {experiments.map((experiment) => (
            <article key={experiment.name} className="rounded-xl border border-border bg-surface-subtle p-4">
              <div className="flex items-center justify-between gap-3">
                <StatusBadge tone={experiment.tone}>{experiment.status}</StatusBadge>
                <span className="text-xs text-text-secondary">{experiment.metric}</span>
              </div>
              <h3 className="mt-4 text-sm font-semibold text-foreground">{experiment.name}</h3>
              <p className="mt-2 min-h-12 text-xs leading-5 text-text-secondary">{experiment.hypothesis}</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border bg-surface-card p-3">
                  <p className="text-xs text-text-secondary">Observed lift</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{experiment.lift}</p>
                </div>
                <div className="rounded-lg border border-border bg-surface-card p-3">
                  <p className="text-xs text-text-secondary">Confidence</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{experiment.confidence}%</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </MainScreenWrapper>
  );
}

const incidents = [];

export function IncidentCenterScreen() {
  return (
    <MainScreenWrapper className="text-foreground">
      <PageHeader icon={Siren} title="Incident Center" description="Coordinate active incidents, response roles, customer communication, and postmortem follow-through." action="Declare incident" accent="red" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Active" value="1" detail="SEV-2 in progress" icon={Siren} tone="red" />
        <Metric label="MTTR" value="38m" detail="Last 30 days" icon={Clock3} tone="emerald" />
        <Metric label="Postmortems" value="4" detail="Completed this quarter" icon={ReceiptText} tone="blue" />
        <Metric label="SLO burn" value="0%" detail="No incidents" icon={ArrowDownRight} tone="amber" />
      </div>
      <Section title="Response timeline" detail="Active and recent incidents with next action ownership.">
        <div className="space-y-3 p-4">
          {incidents.map((incident) => (
            <article key={incident.id} className="grid gap-4 rounded-xl border border-border bg-surface-subtle p-4 lg:grid-cols-[1fr_260px]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] text-text-tertiary">{incident.id}</span>
                  <StatusBadge tone={incident.tone}>{incident.status}</StatusBadge>
                  <span className="text-xs text-text-secondary">{incident.severity}</span>
                </div>
                <h3 className="mt-2 text-sm font-semibold text-foreground">{incident.title}</h3>
                <p className="mt-2 text-xs leading-5 text-text-secondary">{incident.action}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><p className="text-text-tertiary">Commander</p><p className="mt-1 text-foreground">{incident.owner}</p></div>
                <div><p className="text-text-tertiary">Elapsed</p><p className="mt-1 text-foreground">{incident.elapsed}</p></div>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </MainScreenWrapper>
  );
}

function currency(value, compact = false) {
  const amount = Number(value) || 0;
  if (compact && Math.abs(amount) >= 1000) {
    return `${amount < 0 ? "-" : ""}$${Math.abs(amount / 1000).toFixed(1)}k`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getBudgetTone(status) {
  if (status === "Over") return "red";
  if (status === "Watch") return "amber";
  return "emerald";
}

function groupExpenses(expenses) {
  return expenses.reduce((groups, expense) => {
    const key = expense.category || "General";
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(expense);
    return groups;
  }, {});
}

function BudgetInput({ label, value, onChange, prefix = "$", suffix }) {
  return (
    <Label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex h-9 items-center rounded-md border border-border bg-surface-subtle px-3 focus-within:border-border-strong">
        {prefix ? <span className="mr-2 text-xs text-text-secondary">{prefix}</span> : null}
        <Input
          type="number"
          min="0"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 border-0 bg-transparent !px-0 !py-0 text-sm text-foreground shadow-none focus-visible:ring-0"
        />
        {suffix ? <span className="ml-2 text-xs text-text-secondary">{suffix}</span> : null}
      </div>
    </Label>
  );
}

function AddExpenseForm({ onAdd }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Operations");
  const [monthlyCost, setMonthlyCost] = useState(1200);
  const [owner, setOwner] = useState("Project");

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd({
      name: trimmed,
      category,
      monthlyCost,
      owner,
      status: "On Track",
      forecastMultiplier: 1,
      notes: "Manual project expense.",
    });
    setName("");
    setMonthlyCost(1200);
  };

  return (
    <div className="grid gap-3 p-4 md:grid-cols-[1fr_160px_140px_120px_auto] md:items-end">
      <Label className="block space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground">Expense name</span>
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="New vendor, license, service..."
          className="h-9 border-border bg-surface-subtle text-sm text-foreground placeholder:text-text-tertiary"
        />
      </Label>
      <Label className="block space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground">Category</span>
        <Select
          value={category}
          onValueChange={setCategory}
        >
          <SelectTrigger className="h-9 w-full border-border bg-surface-subtle text-sm text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-border bg-surface-subtle text-foreground">
            {["Operations", "Software", "Security", "Quality", "People", "Vendor", "Contingency"].map((item) => (
              <SelectItem key={item} value={item} className="focus:bg-surface-hover">
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Label>
      <BudgetInput label="Monthly" value={monthlyCost} onChange={(value) => setMonthlyCost(Number(value) || 0)} />
      <Label className="block space-y-1.5">
        <span className="text-xs font-medium text-muted-foreground">Owner</span>
        <Input
          value={owner}
          onChange={(event) => setOwner(event.target.value)}
          className="h-9 border-border bg-surface-subtle text-sm text-foreground"
        />
      </Label>
      <Button onClick={submit} className="h-9 bg-primary text-primary-foreground hover:bg-primary">
        <Plus className="mr-2 h-4 w-4" />
        Add
      </Button>
    </div>
  );
}

function ExpenseRow({ expense, onRemove }) {
  const monthly = Number(expense.monthlyCost) || 0;
  const forecast = monthly * (Number(expense.forecastMultiplier) || 1);

  return (
    <article className="grid gap-4 p-4 lg:grid-cols-[1fr_140px_140px_96px] lg:items-center">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">{expense.name}</h3>
          <StatusBadge tone={getBudgetTone(expense.status)}>{expense.status}</StatusBadge>
          <StatusBadge tone={expense.source === "System Architecture" ? "blue" : "zinc"}>{expense.source}</StatusBadge>
        </div>
        <p className="mt-1 text-xs leading-5 text-text-secondary">
          {expense.category} {expense.owner ? `owned by ${expense.owner}` : ""} {expense.notes ? `| ${expense.notes}` : ""}
        </p>
      </div>
      <div>
        <p className="text-xs text-text-tertiary">Monthly</p>
        <p className="mt-1 text-sm font-semibold text-foreground">{currency(monthly)}</p>
      </div>
      <div>
        <p className="text-xs text-text-tertiary">Forecast</p>
        <p className="mt-1 text-sm font-semibold text-foreground">{currency(forecast)}</p>
      </div>
      <div className="flex justify-end">
        {expense.source === "Manual" ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(expense.id)}
            className="h-8 w-8 text-text-secondary hover:bg-red-500/10 hover:text-red-300"
            title="Remove expense"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : (
          <span className="text-xs text-text-tertiary">Canvas</span>
        )}
      </div>
    </article>
  );
}

function InfrastructureGroup({ architectureExpenses }) {
  const [open, setOpen] = useState(true);
  const enabledItems = architectureExpenses.filter((item) => item.enabled);
  const monthly = enabledItems.reduce((sum, item) => sum + item.monthlyCost, 0);
  const groups = groupExpenses(enabledItems);

  return (
    <Section
      title="Infrastructure expense"
      detail="A single budget rollup generated from every costed System Architecture node. Expand it to inspect each node as an item."
      action={
        <Button
          variant="ghost"
          onClick={() => setOpen((value) => !value)}
          className="h-8 gap-2 border border-border bg-surface-subtle text-foreground hover:bg-surface-active hover:text-foreground"
        >
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          {currency(monthly)}
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-4 border-b border-border p-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface-subtle p-3">
          <p className="text-xs text-text-secondary">Monthly infra</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{currency(monthly)}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface-subtle p-3">
          <p className="text-xs text-text-secondary">Costed nodes</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{enabledItems.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface-subtle p-3">
          <p className="text-xs text-text-secondary">Annual run-rate</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{currency(monthly * 12, true)}</p>
        </div>
      </div>
      {open ? (
        <div className="divide-y divide-border">
          {Object.entries(groups).map(([category, items]) => {
            const subtotal = items.reduce((sum, item) => sum + item.monthlyCost, 0);
            return (
              <div key={category}>
                <div className="flex items-center justify-between bg-surface-subtle px-4 py-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{category}</span>
                  <span className="text-xs text-text-secondary">{currency(subtotal)} / mo</span>
                </div>
                {items.map((expense) => (
                  <ExpenseRow key={expense.id} expense={expense} onRemove={() => {}} />
                ))}
              </div>
            );
          })}
        </div>
      ) : null}
    </Section>
  );
}

export function BudgetTrackerScreen() {
  const {
    monthlyBudget,
    setMonthlyBudget,
    manualExpenses,
    architectureExpenses,
    expenses,
    totals,
    upsertManualExpense,
    removeManualExpense,
  } = useProjectBudget();
  const [active, setActive] = useState("All");

  const manualFiltered = manualExpenses.filter((expense) => active === "All" || expense.status === active || expense.category === active);
  const nonInfraMonthly = manualExpenses.reduce((sum, item) => sum + item.monthlyCost, 0);
  const budgetHealth =
    totals.forecast > monthlyBudget ? "Over forecast" : totals.usedPercent > 85 ? "Tight" : "Healthy";

  return (
    <MainScreenWrapper className="text-foreground">
      <PageHeader icon={Banknote} title="Budget Tracker" description="Set the monthly project budget, track actual spend, forecast run-rate, and roll System Architecture nodes into infrastructure expense." action="Add cost line" accent="emerald" />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[360px_1fr]">
        <Section title="Monthly budget" detail="Project-level planning guardrail for current scope.">
          <div className="space-y-4 p-4">
            <BudgetInput label="Approved monthly budget" value={monthlyBudget} onChange={setMonthlyBudget} />
            <Progress
              value={Math.min(100, totals.usedPercent)}
              className="h-2 bg-surface-hover [&_[data-slot=progress-indicator]]:bg-emerald-300"
            />
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-border bg-surface-subtle p-3">
                <p className="text-text-secondary">Remaining</p>
                <p className={cn("mt-1 text-base font-semibold", totals.remaining < 0 ? "text-red-300" : "text-emerald-300")}>
                  {currency(totals.remaining)}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface-subtle p-3">
                <p className="text-text-secondary">Health</p>
                <p className="mt-1 text-base font-semibold text-foreground">{budgetHealth}</p>
              </div>
            </div>
          </div>
        </Section>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Budget used" value={`${totals.usedPercent}%`} detail={`${currency(totals.actual)} of ${currency(monthlyBudget)} committed`} icon={Banknote} tone="emerald" />
          <Metric label="Forecast" value={currency(totals.forecast, true)} detail={`${totals.forecastPercent}% of monthly budget`} icon={TrendingUp} tone="blue" />
          <Metric label="Variance" value={currency(totals.variance, true)} detail={totals.variance > 0 ? "Over current plan" : "Under current plan"} icon={AlertTriangle} tone={totals.variance > 0 ? "amber" : "emerald"} />
          <Metric label="Watch items" value={String(totals.watchItems)} detail={`${currency(totals.annualRunRate, true)} annual run-rate`} icon={Siren} tone={totals.watchItems > 0 ? "red" : "emerald"} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <InfrastructureGroup architectureExpenses={architectureExpenses} />

          <Section
            title="Manual cost lines"
            detail="Vendor, team, reserve, and operational expenses that are not represented as architecture nodes."
            action={<FilterTabs tabs={["All", "On Track", "Watch", "Security", "Quality", "Software"]} active={active} onChange={setActive} />}
          >
            <AddExpenseForm onAdd={upsertManualExpense} />
            <div className="divide-y divide-border border-t border-border">
              {manualFiltered.map((expense) => (
                <ExpenseRow key={expense.id} expense={expense} onRemove={removeManualExpense} />
              ))}
            </div>
          </Section>
        </div>

        <div className="space-y-4">
          <Section title="Budget mix" detail="Where monthly spend is concentrated.">
            <div className="space-y-4 p-4">
              {[
                ["Infrastructure", totals.infrastructure, "[&_[data-slot=progress-indicator]]:bg-blue-300"],
                ["Manual expenses", nonInfraMonthly, "[&_[data-slot=progress-indicator]]:bg-emerald-300"],
                ["Remaining budget", Math.max(0, totals.remaining), "[&_[data-slot=progress-indicator]]:bg-zinc-500"],
              ].map(([label, value, indicatorClass]) => {
                const pct = monthlyBudget > 0 ? Math.min(100, Math.round((value / monthlyBudget) * 100)) : 0;
                return (
                  <div key={label}>
                    <div className="flex justify-between text-xs">
                      <span className="text-foreground">{label}</span>
                      <span className="text-text-secondary">{currency(value)} | {pct}%</span>
                    </div>
                    <Progress value={pct} className={cn("mt-2 h-1.5 bg-surface-hover", indicatorClass)} />
                  </div>
                );
              })}
            </div>
          </Section>

          <Section title="PM finance memo" detail="Generated from current project scope.">
            <div className="space-y-3 p-4">
              <Textarea
                value={`Current monthly committed spend is ${currency(totals.actual)} against a ${currency(monthlyBudget)} budget. Infrastructure contributes ${currency(totals.infrastructure)} across ${architectureExpenses.filter((item) => item.enabled).length} architecture nodes. Forecast is ${currency(totals.forecast)}, leaving ${currency(totals.remaining)} of monthly room before additional scope, vendors, or launch reserves.`}
                readOnly
                className="min-h-40 border-border bg-surface-subtle text-sm leading-6 text-muted-foreground"
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-surface-subtle p-3">
                  <Calculator className="h-4 w-4 text-blue-300" />
                  <p className="mt-2 text-xs text-text-secondary">Forecast gap</p>
                  <p className={cn("mt-1 text-sm font-semibold", totals.variance > 0 ? "text-red-300" : "text-emerald-300")}>
                    {currency(totals.variance)}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-surface-subtle p-3">
                  <DollarSign className="h-4 w-4" />
                  <p className="mt-2 text-xs text-text-secondary">Tracked lines</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{expenses.length}</p>
                </div>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </MainScreenWrapper>
  );
}
