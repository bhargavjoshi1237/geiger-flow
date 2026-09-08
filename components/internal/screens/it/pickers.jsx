"use client";

import React, { useMemo, useState } from "react";
import { Box, Check, Search, Tag, User } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@geiger/ui";
import { cn } from "@/lib/utils";
import { PRIORITIES, WORKFLOW_STATES, labelColor } from "./constants";
import { PriorityIcon, StatusIcon } from "./icons";
import { useTracker } from "./use_tracker";

// Linear's property pickers: a searchable command list in a popover, shared by
// the row context menu, the bulk bar and the issue detail sidebar so a status
// change looks and behaves identically wherever it is made.

function PickerList({ options, selected, onSelect, placeholder }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options;
    return options.filter((option) => option.label.toLowerCase().includes(needle));
  }, [options, query]);

  const selectedSet = new Set(Array.isArray(selected) ? selected : [selected]);

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 border-b border-[var(--lnr-border)] px-2.5 py-2">
        <Search className="h-3.5 w-3.5 shrink-0 text-[var(--lnr-ink-tertiary)]" />
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-[13px] text-[var(--lnr-ink)] outline-none placeholder:text-[var(--lnr-ink-tertiary)]"
        />
      </div>
      <div className="max-h-64 overflow-y-auto p-1 lnr-scrollbar">
        {filtered.length === 0 ? (
          <p className="px-2 py-4 text-center text-[12px] text-[var(--lnr-ink-tertiary)]">
            No results
          </p>
        ) : (
          filtered.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className="flex w-full items-center gap-2 rounded-[5px] px-2 py-1.5 text-left text-[13px] text-[var(--lnr-ink-muted)] hover:bg-[var(--lnr-hover)]"
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                {option.icon}
              </span>
              <span className="min-w-0 flex-1 truncate">{option.label}</span>
              {selectedSet.has(option.value) ? (
                <Check className="h-3.5 w-3.5 shrink-0 text-[var(--lnr-ink)]" />
              ) : null}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function PickerPopover({ children, content, align = "start", width = "w-56" }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align={align}
        className={cn(
          "linear-scope border-[var(--lnr-border-strong)] bg-[var(--lnr-elevated)] p-0",
          width,
        )}
      >
        {content(() => setOpen(false))}
      </PopoverContent>
    </Popover>
  );
}

export function StatusPicker({ children, value, onSelect, align }) {
  return (
    <PickerPopover
      align={align}
      content={(close) => (
        <PickerList
          placeholder="Change status..."
          selected={value}
          options={WORKFLOW_STATES.map((state) => ({
            value: state.value,
            label: state.label,
            icon: <StatusIcon status={state.value} />,
          }))}
          onSelect={(next) => {
            onSelect(next);
            close();
          }}
        />
      )}
    >
      {children}
    </PickerPopover>
  );
}

export function PriorityPicker({ children, value, onSelect, align }) {
  return (
    <PickerPopover
      align={align}
      content={(close) => (
        <PickerList
          placeholder="Set priority..."
          selected={value}
          options={PRIORITIES.map((priority) => ({
            value: priority.value,
            label: priority.label,
            icon: <PriorityIcon priority={priority.value} />,
          }))}
          onSelect={(next) => {
            onSelect(next);
            close();
          }}
        />
      )}
    >
      {children}
    </PickerPopover>
  );
}

export function AssigneePicker({ children, value = [], onSelect, align }) {
  const { people } = useTracker();
  return (
    <PickerPopover
      align={align}
      content={() => (
        <PickerList
          placeholder="Assign to..."
          selected={value}
          options={[
            {
              value: "__none__",
              label: "No assignee",
              icon: <User className="h-3.5 w-3.5 text-[var(--lnr-ink-tertiary)]" />,
            },
            ...people.map((person) => ({
              value: person.id,
              label: person.name,
              icon: (
                <Avatar className="h-4 w-4">
                  <AvatarImage src={person.avatarUrl} alt="" />
                  <AvatarFallback className="bg-[var(--lnr-strong)] text-[8px] text-[var(--lnr-ink-muted)]">
                    {person.initials}
                  </AvatarFallback>
                </Avatar>
              ),
            })),
          ]}
          onSelect={(next) => {
            if (next === "__none__") {
              onSelect([]);
              return;
            }
            onSelect(
              value.includes(next)
                ? value.filter((id) => id !== next)
                : [...value, next],
            );
          }}
        />
      )}
    >
      {children}
    </PickerPopover>
  );
}

export function LabelPicker({ children, value = [], onSelect, align }) {
  const { issues } = useTracker();
  const [draft, setDraft] = useState("");
  const known = useMemo(
    () => [...new Set(issues.flatMap((issue) => issue.labels ?? []))].sort(),
    [issues],
  );

  return (
    <PickerPopover
      align={align}
      content={() => (
        <div className="flex flex-col">
          <form
            className="flex items-center gap-2 border-b border-[var(--lnr-border)] px-2.5 py-2"
            onSubmit={(event) => {
              event.preventDefault();
              const next = draft.trim();
              if (!next || value.includes(next)) return;
              onSelect([...value, next]);
              setDraft("");
            }}
          >
            <Tag className="h-3.5 w-3.5 shrink-0 text-[var(--lnr-ink-tertiary)]" />
            <input
              autoFocus
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Add label..."
              className="w-full bg-transparent text-[13px] text-[var(--lnr-ink)] outline-none placeholder:text-[var(--lnr-ink-tertiary)]"
            />
          </form>
          <div className="max-h-64 overflow-y-auto p-1 lnr-scrollbar">
            {known.length === 0 ? (
              <p className="px-2 py-4 text-center text-[12px] text-[var(--lnr-ink-tertiary)]">
                Type to create the first label
              </p>
            ) : (
              known.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() =>
                    onSelect(
                      value.includes(label)
                        ? value.filter((entry) => entry !== label)
                        : [...value, label],
                    )
                  }
                  className="flex w-full items-center gap-2 rounded-[5px] px-2 py-1.5 text-left text-[13px] text-[var(--lnr-ink-muted)] hover:bg-[var(--lnr-hover)]"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: labelColor(label) }}
                  />
                  <span className="min-w-0 flex-1 truncate">{label}</span>
                  {value.includes(label) ? (
                    <Check className="h-3.5 w-3.5 shrink-0 text-[var(--lnr-ink)]" />
                  ) : null}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    >
      {children}
    </PickerPopover>
  );
}

export function ProjectPicker({ children, value, onSelect, align }) {
  const { projects } = useTracker();
  return (
    <PickerPopover
      align={align}
      content={(close) => (
        <PickerList
          placeholder="Add to project..."
          selected={value}
          options={[
            {
              value: "__none__",
              label: "No project",
              icon: <Box className="h-3.5 w-3.5 text-[var(--lnr-ink-tertiary)]" />,
            },
            ...projects.map((project) => ({
              value: project.id,
              label: project.title,
              icon: <Box className="h-3.5 w-3.5 text-[var(--lnr-accent)]" />,
            })),
          ]}
          onSelect={(next) => {
            onSelect(next === "__none__" ? null : next);
            close();
          }}
        />
      )}
    >
      {children}
    </PickerPopover>
  );
}

export function CyclePicker({ children, value, onSelect, align }) {
  const { cycles } = useTracker();
  return (
    <PickerPopover
      align={align}
      content={(close) => (
        <PickerList
          placeholder="Add to cycle..."
          selected={value}
          options={[
            {
              value: "__none__",
              label: "No cycle",
              icon: <Box className="h-3.5 w-3.5 text-[var(--lnr-ink-tertiary)]" />,
            },
            ...cycles.map((cycle) => ({
              value: cycle.id,
              label: cycle.title,
              icon: <Box className="h-3.5 w-3.5 text-[var(--lnr-started)]" />,
            })),
          ]}
          onSelect={(next) => {
            onSelect(next === "__none__" ? null : next);
            close();
          }}
        />
      )}
    >
      {children}
    </PickerPopover>
  );
}
