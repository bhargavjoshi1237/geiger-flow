"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock3,
  GitCommitHorizontal,
  MessageSquareText,
  Plus,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { IssueItem, IssueSeverityBadge } from "@/components/ui/issue-item";

const statusLabels = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
};

const issues = [
  {
    id: "ISS-1482",
    title: "API response time exceeding 500ms on /users endpoint",
    severity: "critical",
    status: "open",
    assignee: "Alex M.",
    dueDate: "Today",
    reporter: "Nora K.",
    createdAt: "Mar 6, 10:12 AM",
    updatedAt: "8 min ago",
    ownerTeam: "Platform API",
    environment: "Production",
    priority: "P0",
    affectedUsers: "42% of active tenants",
    caseSummary:
      "The /users endpoint is regularly breaching the 500ms service target after the latest identity sync rollout.",
    impact:
      "User directory screens are loading slowly for enterprise workspaces and retry volume has increased on mobile clients.",
    reproduction: [
      "Open an enterprise workspace with more than 5,000 users.",
      "Navigate to Settings > Members.",
      "Refresh the page twice within one minute and inspect /users latency.",
    ],
    signals: [
      { label: "p95 latency", value: "742ms" },
      { label: "error rate", value: "1.8%" },
      { label: "first seen", value: "Mar 6, 09:48 AM" },
    ],
    activity: [
      "Alex M. linked trace gf-api-8731 to the case.",
      "Incident channel opened with Platform API and Infra.",
      "Rollback candidate identified for identity sync batching.",
    ],
  },
  {
    id: "ISS-1479",
    title: "Memory leak in websocket connection handler",
    severity: "critical",
    status: "in_progress",
    assignee: "Sarah J.",
    dueDate: "Tomorrow",
    reporter: "Dinesh P.",
    createdAt: "Mar 5, 4:28 PM",
    updatedAt: "21 min ago",
    ownerTeam: "Realtime",
    environment: "Production",
    priority: "P0",
    affectedUsers: "Realtime dashboards",
    caseSummary:
      "Websocket workers retain subscription references after client disconnects, causing steady memory growth.",
    impact:
      "Workers recycle more often during peak hours, briefly dropping live updates until clients reconnect.",
    reproduction: [
      "Start a dashboard session with live project metrics enabled.",
      "Disconnect the browser without closing the tab cleanly.",
      "Observe retained subscription handles in the worker heap snapshot.",
    ],
    signals: [
      { label: "heap growth", value: "+18MB/hr" },
      { label: "restarts", value: "14 today" },
      { label: "first seen", value: "Mar 5, 03:57 PM" },
    ],
    activity: [
      "Sarah J. added cleanup instrumentation to staging.",
      "Heap snapshots attached for workers ws-12 and ws-18.",
      "Patch is in review with Realtime maintainers.",
    ],
  },
  {
    id: "ISS-1468",
    title: "Database connection pool exhaustion",
    severity: "high",
    status: "open",
    assignee: "Mike T.",
    dueDate: "Mar 10",
    reporter: "Priya S.",
    createdAt: "Mar 4, 1:19 PM",
    updatedAt: "1 hr ago",
    ownerTeam: "Data Platform",
    environment: "Production",
    priority: "P1",
    affectedUsers: "Reporting workflows",
    caseSummary:
      "Long-running report queries are holding connections after client cancellation events.",
    impact:
      "Queued reports can stall for several minutes when connection usage spikes during business hours.",
    reproduction: [
      "Run a large weekly report from the analytics workspace.",
      "Cancel the request before it completes.",
      "Check active connections for orphaned report sessions.",
    ],
    signals: [
      { label: "pool usage", value: "96%" },
      { label: "queued jobs", value: "37" },
      { label: "first seen", value: "Mar 4, 12:41 PM" },
    ],
    activity: [
      "Data Platform confirmed leaked cancelled query sessions.",
      "Temporary pool limit increase applied for enterprise cluster.",
      "Cleanup job scheduled every 15 minutes until fixed.",
    ],
  },
  {
    id: "ISS-1457",
    title: "Authentication token refresh failing intermittently",
    severity: "high",
    status: "in_progress",
    assignee: "Lisa K.",
    dueDate: "Mar 12",
    reporter: "Marco R.",
    createdAt: "Mar 3, 9:43 AM",
    updatedAt: "2 hrs ago",
    ownerTeam: "Identity",
    environment: "Production",
    priority: "P1",
    affectedUsers: "SSO accounts",
    caseSummary:
      "Refresh token rotation can fail when identity provider responses arrive after the client retry window.",
    impact:
      "Some SSO users are asked to sign in again while actively working inside the app.",
    reproduction: [
      "Sign in through SSO on a throttled connection.",
      "Keep the app open until token refresh starts.",
      "Watch for retry timeout before provider response returns.",
    ],
    signals: [
      { label: "failure rate", value: "3.2%" },
      { label: "sessions hit", value: "218" },
      { label: "first seen", value: "Mar 3, 09:03 AM" },
    ],
    activity: [
      "Lisa K. reproduced the timeout in staging.",
      "Identity provider SLA data requested from vendor.",
      "Client retry window increase is being tested.",
    ],
  },
  {
    id: "ISS-1439",
    title: "Frontend build size exceeds 2MB limit",
    severity: "medium",
    status: "resolved",
    assignee: "Chris P.",
    dueDate: "Mar 8",
    reporter: "Hannah B.",
    createdAt: "Mar 1, 11:05 AM",
    updatedAt: "Yesterday",
    ownerTeam: "Web App",
    environment: "Preview",
    priority: "P2",
    affectedUsers: "Preview builds",
    caseSummary:
      "The dashboard bundle crossed the configured size budget after charting dependencies were added.",
    impact:
      "Preview deployments were blocked until the bundle was split and the size budget passed again.",
    reproduction: [
      "Run the preview build pipeline.",
      "Inspect the dashboard chunk size in bundle output.",
      "Compare the generated artifact against the 2MB budget.",
    ],
    signals: [
      { label: "largest chunk", value: "1.6MB" },
      { label: "budget", value: "2MB" },
      { label: "resolved", value: "Mar 8" },
    ],
    activity: [
      "Chris P. lazy-loaded secondary analytics charts.",
      "Bundle analyzer report attached to the case.",
      "CI budget check is passing again.",
    ],
  },
  {
    id: "ISS-1418",
    title: "Tooltip text overlaps on small screens",
    severity: "low",
    status: "open",
    assignee: "Jamie L.",
    dueDate: "Mar 18",
    reporter: "Ava C.",
    createdAt: "Feb 28, 3:21 PM",
    updatedAt: "Mar 2",
    ownerTeam: "Design Systems",
    environment: "Mobile web",
    priority: "P3",
    affectedUsers: "Mobile users",
    caseSummary:
      "Tooltips in compact project tables can overflow their viewport on narrow screens.",
    impact:
      "Help text is partially hidden on phones, especially when a row is near the right edge.",
    reproduction: [
      "Open the project table below 390px width.",
      "Tap the help icon beside the Status column.",
      "Observe the tooltip extending beyond the viewport.",
    ],
    signals: [
      { label: "viewport", value: "360px" },
      { label: "components", value: "3" },
      { label: "first seen", value: "Feb 28" },
    ],
    activity: [
      "Jamie L. attached mobile screenshots.",
      "Design Systems marked tooltip collision handling as needed.",
      "Fix is waiting behind table density polish.",
    ],
  },
  {
    id: "ISS-1406",
    title: "Dark mode color mismatch on settings page",
    severity: "low",
    status: "resolved",
    assignee: "Taylor R.",
    dueDate: "Mar 20",
    reporter: "Mina D.",
    createdAt: "Feb 24, 2:36 PM",
    updatedAt: "Mar 1",
    ownerTeam: "Web App",
    environment: "Production",
    priority: "P3",
    affectedUsers: "Settings users",
    caseSummary:
      "A secondary panel on the settings page used the wrong dark surface token.",
    impact:
      "The mismatch was cosmetic but made the settings area look inconsistent in dark mode.",
    reproduction: [
      "Switch the app to dark mode.",
      "Open Project Settings > General.",
      "Compare the custom field panel surface against adjacent panels.",
    ],
    signals: [
      { label: "screens", value: "2" },
      { label: "token", value: "surface-2" },
      { label: "resolved", value: "Mar 1" },
    ],
    activity: [
      "Taylor R. replaced the panel color with the shared token.",
      "Visual check completed across settings tabs.",
      "No regressions found in light mode.",
    ],
  },
];

function InfoTile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-[#333333] bg-[#202020] p-3">
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-[#737373]">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-2 text-sm font-medium text-[#e7e7e7]">{value}</p>
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <section className="space-y-3">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[#737373]">
        {title}
      </h3>
      {children}
    </section>
  );
}

function IssueCaseDetails({ issue }) {
  return (
    <div className="flex h-full flex-col bg-[#1a1a1a] text-[#e7e7e7]">
      <div className="border-b border-[#333333] p-6 pr-12">
        <div className="mb-4 flex items-center gap-2">
          <span className="rounded-md border border-[#333333] bg-[#202020] px-2 py-1 text-xs font-mono text-[#a3a3a3]">
            {issue.id}
          </span>
          <IssueSeverityBadge severity={issue.severity} className="py-1" />
          <span className="rounded-md border border-[#333333] bg-[#202020] px-2 py-1 text-xs text-[#a3a3a3]">
            {statusLabels[issue.status]}
          </span>
        </div>
        <h2 className="text-xl font-semibold leading-tight text-white">
          {issue.title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[#a3a3a3]">
          {issue.caseSummary}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoTile icon={UserRound} label="Assignee" value={issue.assignee} />
          <InfoTile icon={CalendarClock} label="Due" value={issue.dueDate} />
          <InfoTile icon={ShieldAlert} label="Priority" value={issue.priority} />
          <InfoTile icon={Clock3} label="Updated" value={issue.updatedAt} />
        </div>

        <div className="mt-6 space-y-6">
          <DetailSection title="Case Details">
            <div className="rounded-lg border border-[#333333] bg-[#202020] p-4 text-sm text-[#a3a3a3]">
              <div className="grid gap-3 sm:grid-cols-2">
                <p>
                  <span className="block text-[11px] uppercase tracking-wider text-[#737373]">
                    Reporter
                  </span>
                  <span className="text-[#d4d4d4]">{issue.reporter}</span>
                </p>
                <p>
                  <span className="block text-[11px] uppercase tracking-wider text-[#737373]">
                    Owner Team
                  </span>
                  <span className="text-[#d4d4d4]">{issue.ownerTeam}</span>
                </p>
                <p>
                  <span className="block text-[11px] uppercase tracking-wider text-[#737373]">
                    Environment
                  </span>
                  <span className="text-[#d4d4d4]">{issue.environment}</span>
                </p>
                <p>
                  <span className="block text-[11px] uppercase tracking-wider text-[#737373]">
                    Created
                  </span>
                  <span className="text-[#d4d4d4]">{issue.createdAt}</span>
                </p>
              </div>
            </div>
          </DetailSection>

          <DetailSection title="Impact">
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                <div>
                  <p className="text-sm font-medium text-red-200">
                    {issue.affectedUsers}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-red-100/70">
                    {issue.impact}
                  </p>
                </div>
              </div>
            </div>
          </DetailSection>

          <DetailSection title="Signals">
            <div className="grid gap-3 sm:grid-cols-3">
              {issue.signals.map((signal) => (
                <div
                  key={signal.label}
                  className="rounded-lg border border-[#333333] bg-[#202020] p-3"
                >
                  <p className="text-[11px] uppercase tracking-wider text-[#737373]">
                    {signal.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#e7e7e7]">
                    {signal.value}
                  </p>
                </div>
              ))}
            </div>
          </DetailSection>

          <DetailSection title="Reproduction Steps">
            <ol className="space-y-2">
              {issue.reproduction.map((step, index) => (
                <li
                  key={step}
                  className="flex gap-3 rounded-lg border border-[#333333] bg-[#202020] p-3 text-sm text-[#a3a3a3]"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2a2a2a] text-[11px] font-semibold text-[#e7e7e7]">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </DetailSection>

          <DetailSection title="Activity">
            <div className="space-y-3">
              {issue.activity.map((item, index) => (
                <div key={item} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#333333] bg-[#202020]">
                      {index === issue.activity.length - 1 ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <GitCommitHorizontal className="h-3.5 w-3.5 text-[#a3a3a3]" />
                      )}
                    </span>
                    {index < issue.activity.length - 1 && (
                      <span className="h-5 w-px bg-[#333333]" />
                    )}
                  </div>
                  <p className="pt-1 text-sm text-[#a3a3a3]">{item}</p>
                </div>
              ))}
            </div>
          </DetailSection>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-[#333333] p-4">
        <Button className="bg-white text-black hover:bg-[#e7e7e7]">
          <MessageSquareText className="mr-2 h-4 w-4" />
          Add Comment
        </Button>
        <Button
          variant="outline"
          className="border-[#333333] bg-[#202020] text-[#e7e7e7] hover:bg-[#2a2a2a] hover:text-white"
        >
             <UserRound className="mr-2 h-4 w-4" />
          Assign Owner
        </Button>
      </div>
    </div>
  );
}

export function WorkflowsScreen() {
  return (
    <MainScreenWrapper>
      <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#e7e7e7]">Issues</h1>
          <p className="mt-1 text-[#a3a3a3]">
            Design and manage your automation issues.
          </p>
        </div>
        <Button className="bg-white text-black hover:bg-[#e7e7e7]">
          <Plus className="mr-2 h-4 w-4" />
          Create New Issue
        </Button>
      </div>

      <div className="space-y-2">
        {issues.map((issue) => (
          <IssueItem
            key={issue.id}
            title={issue.title}
            severity={issue.severity}
            status={issue.status}
            assignee={issue.assignee}
            dueDate={issue.dueDate}
            sheetContentClassName="w-full p-0 sm:max-w-2xl border-l border-[#333333] bg-[#1a1a1a] text-[#e7e7e7] [&>button]:right-5 [&>button]:top-5 [&>button]:text-[#737373] hover:[&>button]:text-white"
          >
            <IssueCaseDetails issue={issue} />
          </IssueItem>
        ))}
      </div>
    </MainScreenWrapper>
  );
}
