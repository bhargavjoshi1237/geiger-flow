"use client";

import React from "react";
import { ListFilter, Menu, Plus, SlidersHorizontal, X } from "lucide-react";
import {
  Checkbox,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Switch,
} from "@geiger/ui";
import { cn } from "@/lib/utils";
import {
  GROUPING_OPTIONS,
  ORDERING_OPTIONS,
  PRIORITIES,
  ROW_PROPERTIES,
  WORKFLOW_STATES,
} from "./constants";
import { PriorityIcon, StatusIcon } from "./icons";
import { useShellNav } from "./it_shell";
import { useTracker } from "./use_tracker";

// The two-row chrome above every issue surface: breadcrumb + tabs + actions,
// then the filter bar (only rendered once a filter is active, as in Linear).

export function ViewHeader({ crumbs = [], tabs, activeTab, onTab, actions, children }) {
  const { openMenu } = useShellNav();

  return (
    <header className="flex min-h-[45px] shrink-0 flex-wrap items-center gap-x-2 gap-y-1 border-b border-[var(--lnr-border)] px-2 py-1.5 sm:px-4 lg:flex-nowrap lg:py-0">
      <button
        type="button"
        onClick={openMenu}
        aria-label="Open navigation"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[5px] text-[var(--lnr-ink-subtle)] hover:bg-[var(--lnr-hover)] hover:text-[var(--lnr-ink)] lg:hidden"
      >
        <Menu className="h-4 w-4" />
      </button>

      <nav className="flex min-w-0 items-center gap-1.5 text-[13px]">
        {crumbs.map((crumb, index) => (
          <React.Fragment key={crumb.label}>
            {index > 0 ? (
              <span
                className={cn(
                  "text-[var(--lnr-ink-tertiary)]",
                  index < crumbs.length - 1 && "hidden sm:inline",
                )}
              >
                /
              </span>
            ) : null}
            <button
              type="button"
              onClick={crumb.onClick}
              disabled={!crumb.onClick}
              className={cn(
                "flex items-center gap-1.5 truncate rounded px-1 py-0.5",
                index === crumbs.length - 1
                  ? "font-medium text-[var(--lnr-ink)]"
                  : "hidden text-[var(--lnr-ink-subtle)] sm:flex",
                crumb.onClick && "hover:bg-[var(--lnr-hover)]",
              )}
            >
              {crumb.icon ? <crumb.icon className="h-3.5 w-3.5" /> : null}
              {crumb.label}
            </button>
          </React.Fragment>
        ))}
      </nav>

      {tabs?.length ? (
        <div className="order-last flex w-full items-center gap-0.5 overflow-x-auto lnr-scrollbar lg:order-none lg:ml-3 lg:w-auto lg:overflow-visible">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => onTab?.(tab.value)}
              className={cn(
                "shrink-0 rounded-[5px] px-2 py-1 text-[13px] transition-colors",
                tab.value === activeTab
                  ? "bg-[var(--lnr-selected)] font-medium text-[var(--lnr-ink)]"
                  : "text-[var(--lnr-ink-subtle)] hover:bg-[var(--lnr-hover)] hover:text-[var(--lnr-ink)]",
              )}
            >
              {tab.label}
              {tab.count != null ? (
                <span className="ml-1.5 tabular-nums text-[var(--lnr-ink-tertiary)]">
                  {tab.count}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}

      <div className="ml-auto flex shrink-0 items-center gap-1">{actions ?? children}</div>
    </header>
  );
}

// With an icon the label collapses below `sm` — the icon carries the meaning
// and `aria-label` keeps it announced.
export function HeaderButton({ icon: Icon, label, onClick, active, ...props }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "flex h-7 items-center gap-1.5 rounded-[5px] px-2 text-[13px] transition-colors",
        active
          ? "bg-[var(--lnr-selected)] text-[var(--lnr-ink)]"
          : "text-[var(--lnr-ink-subtle)] hover:bg-[var(--lnr-hover)] hover:text-[var(--lnr-ink)]",
      )}
      {...props}
    >
      {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" /> : null}
      <span className={cn(Icon && "hidden sm:inline")}>{label}</span>
    </button>
  );
}

// --- Filter bar ------------------------------------------------------------

const FILTER_FIELDS = [
  { key: "status", label: "Status" },
  { key: "priority", label: "Priority" },
  { key: "assignee", label: "Assignee" },
  { key: "label", label: "Label" },
  { key: "project", label: "Project" },
  { key: "cycle", label: "Cycle" },
];

function optionsFor(key, tracker) {
  switch (key) {
    case "status":
      return WORKFLOW_STATES.map((state) => ({
        value: state.value,
        label: state.label,
        icon: <StatusIcon status={state.value} />,
      }));
    case "priority":
      return PRIORITIES.map((priority) => ({
        value: priority.value,
        label: priority.label,
        icon: <PriorityIcon priority={priority.value} />,
      }));
    case "assignee":
      return [
        { value: "unassigned", label: "No assignee" },
        ...tracker.people.map((person) => ({ value: person.id, label: person.name })),
      ];
    case "label":
      return [...new Set(tracker.issues.flatMap((issue) => issue.labels ?? []))].map(
        (label) => ({ value: label, label }),
      );
    case "project":
      return tracker.projects.map((project) => ({
        value: project.id,
        label: project.title,
      }));
    case "cycle":
      return tracker.cycles.map((cycle) => ({ value: cycle.id, label: cycle.title }));
    default:
      return [];
  }
}

export function FilterBar({ filters, onChange }) {
  const tracker = useTracker();
  const active = Object.entries(filters).filter(([, values]) => values?.length);

  const toggle = (key, value) => {
    const current = filters[key] ?? [];
    const next = current.includes(value)
      ? current.filter((entry) => entry !== value)
      : [...current, value];
    onChange({ ...filters, [key]: next });
  };

  return (
    <div className="flex min-h-[41px] shrink-0 flex-wrap items-center gap-1.5 border-b border-[var(--lnr-border)] px-2 py-1.5 sm:px-4">
      {active.map(([key, values]) => {
        const field = FILTER_FIELDS.find((entry) => entry.key === key);
        const options = optionsFor(key, tracker);
        const labels = values
          .map((value) => options.find((option) => option.value === value)?.label ?? value)
          .filter(Boolean);

        return (
          <div
            key={key}
            className="flex items-center overflow-hidden rounded-[5px] border border-[var(--lnr-border-strong)] bg-[var(--lnr-elevated)] text-[12px]"
          >
            <span className="px-2 py-1 text-[var(--lnr-ink-subtle)]">{field?.label ?? key}</span>
            <span className="border-l border-[var(--lnr-border-strong)] px-1.5 py-1 text-[var(--lnr-ink-tertiary)]">
              {values.length > 1 ? "is any of" : "is"}
            </span>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="max-w-[220px] truncate border-l border-[var(--lnr-border-strong)] px-2 py-1 text-[var(--lnr-ink)] hover:bg-[var(--lnr-hover)]"
                >
                  {labels.length > 2 ? `${labels.length} selected` : labels.join(", ")}
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="linear-scope w-56 border-[var(--lnr-border-strong)] bg-[var(--lnr-elevated)] p-1"
              >
                <FilterOptionList
                  options={options}
                  selected={values}
                  onToggle={(value) => toggle(key, value)}
                />
              </PopoverContent>
            </Popover>
            <button
              type="button"
              aria-label={`Remove ${field?.label ?? key} filter`}
              onClick={() => onChange({ ...filters, [key]: [] })}
              className="border-l border-[var(--lnr-border-strong)] px-1.5 py-1 text-[var(--lnr-ink-tertiary)] hover:bg-[var(--lnr-hover)] hover:text-[var(--lnr-ink)]"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        );
      })}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex h-6 items-center gap-1 rounded-[5px] px-1.5 text-[12px] text-[var(--lnr-ink-subtle)] hover:bg-[var(--lnr-hover)] hover:text-[var(--lnr-ink)]"
          >
            {active.length ? <Plus className="h-3 w-3" /> : <ListFilter className="h-3 w-3" />}
            {active.length ? "Add filter" : "Filter"}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="linear-scope w-48 border-[var(--lnr-border-strong)] bg-[var(--lnr-elevated)]"
        >
          {FILTER_FIELDS.map((field) => (
            <FilterFieldMenu
              key={field.key}
              field={field}
              options={optionsFor(field.key, tracker)}
              selected={filters[field.key] ?? []}
              onToggle={(value) => toggle(field.key, value)}
            />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {active.length ? (
        <button
          type="button"
          onClick={() => onChange({})}
          className="ml-auto rounded-[5px] px-2 py-1 text-[12px] text-[var(--lnr-ink-subtle)] hover:bg-[var(--lnr-hover)] hover:text-[var(--lnr-ink)]"
        >
          Reset
        </button>
      ) : null}
    </div>
  );
}

function FilterFieldMenu({ field, options, selected, onToggle }) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        {field.label}
        {selected.length ? (
          <span className="ml-auto text-[11px] text-[var(--lnr-ink-tertiary)]">
            {selected.length}
          </span>
        ) : null}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="linear-scope max-h-72 w-56 overflow-y-auto border-[var(--lnr-border-strong)] bg-[var(--lnr-elevated)] lnr-scrollbar">
        {options.length === 0 ? (
          <p className="px-2 py-3 text-center text-[12px] text-[var(--lnr-ink-tertiary)]">
            Nothing to filter by yet
          </p>
        ) : (
          options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={selected.includes(option.value)}
              onSelect={(event) => {
                // Keep the menu open so several values can be picked at once.
                event.preventDefault();
                onToggle(option.value);
              }}
            >
              {option.icon}
              <span className="truncate">{option.label}</span>
            </DropdownMenuCheckboxItem>
          ))
        )}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

function FilterOptionList({ options, selected, onToggle }) {
  if (!options.length) {
    return (
      <p className="px-2 py-3 text-center text-[12px] text-[var(--lnr-ink-tertiary)]">
        Nothing to filter by yet
      </p>
    );
  }

  return (
    <div className="max-h-64 overflow-y-auto lnr-scrollbar">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onToggle(option.value)}
          className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-[13px] text-[var(--lnr-ink-muted)] hover:bg-[var(--lnr-hover)]"
        >
          <Checkbox checked={selected.includes(option.value)} className="pointer-events-none" />
          {option.icon}
          <span className="truncate">{option.label}</span>
        </button>
      ))}
    </div>
  );
}

// --- Display options -------------------------------------------------------

export function DisplayMenu({ display, onChange }) {
  const set = (patch) => onChange({ ...display, ...patch });
  const setProperty = (id, value) =>
    onChange({ ...display, properties: { ...display.properties, [id]: value } });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-7 items-center gap-1.5 rounded-[5px] border border-[var(--lnr-border-strong)] px-2 text-[13px] text-[var(--lnr-ink-muted)] hover:bg-[var(--lnr-hover)] hover:text-[var(--lnr-ink)]"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:inline">Display</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="linear-scope w-[min(280px,calc(100vw-2rem))] border-[var(--lnr-border-strong)] bg-[var(--lnr-elevated)] p-2"
      >
        <div className="mb-2 grid grid-cols-2 gap-1">
          {["list", "board"].map((layout) => (
            <button
              key={layout}
              type="button"
              onClick={() => set({ layout })}
              className={cn(
                "rounded-[5px] border px-2 py-1.5 text-[12px] capitalize transition-colors",
                display.layout === layout
                  ? "border-[var(--lnr-accent)] bg-[var(--lnr-accent-soft)] text-[var(--lnr-ink)]"
                  : "border-[var(--lnr-border-strong)] text-[var(--lnr-ink-subtle)] hover:bg-[var(--lnr-hover)]",
              )}
            >
              {layout}
            </button>
          ))}
        </div>

        <SelectRow
          label="Grouping"
          value={display.grouping}
          options={GROUPING_OPTIONS}
          onChange={(grouping) => set({ grouping })}
        />
        <SelectRow
          label="Ordering"
          value={display.ordering}
          options={ORDERING_OPTIONS}
          onChange={(ordering) => set({ ordering })}
        />

        <DropdownMenuSeparator className="my-2 bg-[var(--lnr-border)]" />

        <ToggleRow
          label="Show sub-issues"
          checked={display.showSubIssues}
          onChange={(showSubIssues) => set({ showSubIssues })}
        />
        <ToggleRow
          label="Show completed"
          checked={display.showCompleted}
          onChange={(showCompleted) => set({ showCompleted })}
        />

        <DropdownMenuSeparator className="my-2 bg-[var(--lnr-border)]" />
        <DropdownMenuLabel className="px-1 py-1 text-[11px] font-medium text-[var(--lnr-ink-tertiary)]">
          Display properties
        </DropdownMenuLabel>
        <div className="flex flex-wrap gap-1">
          {ROW_PROPERTIES.map((property) => (
            <button
              key={property.id}
              type="button"
              onClick={() => setProperty(property.id, !display.properties[property.id])}
              className={cn(
                "rounded-[5px] border px-2 py-1 text-[12px] transition-colors",
                display.properties[property.id]
                  ? "border-[var(--lnr-border-strong)] bg-[var(--lnr-selected)] text-[var(--lnr-ink)]"
                  : "border-[var(--lnr-border)] text-[var(--lnr-ink-tertiary)] hover:bg-[var(--lnr-hover)]",
              )}
            >
              {property.label}
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SelectRow({ label, value, options, onChange }) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="text-[13px] text-[var(--lnr-ink-muted)]">
        {label}
        <span className="ml-auto pr-1 text-[12px] text-[var(--lnr-ink)]">
          {options.find((option) => option.value === value)?.label ?? value}
        </span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="linear-scope w-44 border-[var(--lnr-border-strong)] bg-[var(--lnr-elevated)]">
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={option.value === value}
            onSelect={() => onChange(option.value)}
          >
            {option.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-sm px-1 py-1">
      <span className="text-[13px] text-[var(--lnr-ink-muted)]">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
