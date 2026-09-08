"use client";

import React, { useMemo } from "react";
import { Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@geiger/ui";
import { PRIORITIES, WORKFLOW_STATES, labelColor } from "../constants";
import { PriorityIcon, StatusIcon } from "../icons";
import { ViewHeader } from "../view_header";
import { useTracker } from "../use_tracker";

// Linear's workspace settings, read-only where the underlying config is
// suite-owned: the workflow, priority scale, label set and members that this
// tracker actually runs on, so the vocabulary is discoverable rather than
// hidden in code.

function Section({ title, description, children }) {
  return (
    <section className="border-b border-[var(--lnr-border)] px-4 py-5 sm:px-6">
      <h3 className="text-[13px] font-medium text-[var(--lnr-ink)]">{title}</h3>
      {description ? (
        <p className="mt-0.5 max-w-xl text-[12px] text-[var(--lnr-ink-subtle)]">
          {description}
        </p>
      ) : null}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Row({ children }) {
  return (
    <div className="flex items-center gap-2.5 rounded-[6px] px-2 py-1.5 hover:bg-[var(--lnr-hover)]">
      {children}
    </div>
  );
}

export function SettingsView() {
  const { project, projectKey, issues, people, cycles, projects } = useTracker();

  const labels = useMemo(
    () => [...new Set(issues.flatMap((issue) => issue.labels ?? []))].sort(),
    [issues],
  );

  const counts = useMemo(() => {
    const byState = {};
    for (const issue of issues) {
      byState[issue.status] = (byState[issue.status] ?? 0) + 1;
    }
    return byState;
  }, [issues]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ViewHeader crumbs={[{ label: "Settings", icon: Settings }]} />

      <div className="flex-1 overflow-y-auto lnr-scrollbar">
        <Section title="Workspace">
          <dl className="grid max-w-xl grid-cols-[110px_1fr] gap-y-2 text-[13px] sm:grid-cols-[140px_1fr]">
            <dt className="text-[var(--lnr-ink-subtle)]">Name</dt>
            <dd className="text-[var(--lnr-ink)]">{project?.name || "—"}</dd>
            <dt className="text-[var(--lnr-ink-subtle)]">Issue prefix</dt>
            <dd className="font-mono text-[var(--lnr-ink)]">{projectKey}-123</dd>
            <dt className="text-[var(--lnr-ink-subtle)]">Issues</dt>
            <dd className="tabular-nums text-[var(--lnr-ink)]">{issues.length}</dd>
            <dt className="text-[var(--lnr-ink-subtle)]">Projects</dt>
            <dd className="tabular-nums text-[var(--lnr-ink)]">{projects.length}</dd>
            <dt className="text-[var(--lnr-ink-subtle)]">Cycles</dt>
            <dd className="tabular-nums text-[var(--lnr-ink)]">{cycles.length}</dd>
          </dl>
        </Section>

        <Section
          title="Workflow"
          description="The states an issue moves through. Counts are live across this workspace."
        >
          <div className="max-w-xl">
            {WORKFLOW_STATES.map((state) => (
              <Row key={state.value}>
                <StatusIcon status={state.value} />
                <span className="flex-1 text-[13px] text-[var(--lnr-ink)]">{state.label}</span>
                <span className="text-[11px] uppercase tracking-wide text-[var(--lnr-ink-tertiary)]">
                  {state.group}
                </span>
                <span className="w-10 text-right text-[12px] tabular-nums text-[var(--lnr-ink-subtle)]">
                  {counts[state.value] ?? 0}
                </span>
              </Row>
            ))}
          </div>
        </Section>

        <Section title="Priorities" description="Ordered highest to lowest.">
          <div className="max-w-xl">
            {PRIORITIES.map((priority) => (
              <Row key={priority.value}>
                <PriorityIcon priority={priority.value} />
                <span className="flex-1 text-[13px] text-[var(--lnr-ink)]">{priority.label}</span>
                <span className="w-10 text-right text-[12px] tabular-nums text-[var(--lnr-ink-subtle)]">
                  {issues.filter((issue) => issue.priority === priority.value).length}
                </span>
              </Row>
            ))}
          </div>
        </Section>

        <Section
          title="Labels"
          description="Labels are created inline from any issue; colours are derived from the name."
        >
          {labels.length === 0 ? (
            <p className="text-[12px] text-[var(--lnr-ink-tertiary)]">No labels used yet.</p>
          ) : (
            <div className="flex max-w-xl flex-wrap gap-1.5">
              {labels.map((label) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 rounded-full border border-[var(--lnr-border-strong)] px-2 py-[2px] text-[12px] text-[var(--lnr-ink-muted)]"
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: labelColor(label) }}
                  />
                  {label}
                  <span className="tabular-nums text-[var(--lnr-ink-tertiary)]">
                    {issues.filter((issue) => (issue.labels ?? []).includes(label)).length}
                  </span>
                </span>
              ))}
            </div>
          )}
        </Section>

        <Section title="Members">
          <div className="max-w-xl">
            {people.map((person) => (
              <Row key={person.id}>
                <Avatar className="h-5 w-5">
                  <AvatarImage src={person.avatarUrl} alt="" />
                  <AvatarFallback className="bg-[var(--lnr-strong)] text-[9px] text-[var(--lnr-ink-muted)]">
                    {person.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 text-[13px] text-[var(--lnr-ink)]">{person.name}</span>
                <span className="text-[12px] text-[var(--lnr-ink-tertiary)]">
                  {person.email}
                </span>
              </Row>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
