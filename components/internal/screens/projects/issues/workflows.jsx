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

const issues = [];

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
