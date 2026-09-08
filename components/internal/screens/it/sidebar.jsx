"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Box,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Copy,
  ExternalLink,
  Inbox,
  LayoutGrid,
  LogOut,
  Pencil,
  Search,
  Settings,
  SquareStack,
  Target,
  Users,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Kbd,
} from "@geiger/ui";
import { cn } from "@/lib/utils";
import { useTracker } from "./use_tracker";

// Linear's left rail: workspace switcher + compose, the two personal
// destinations, a Workspace section, then an expandable team tree. Selection
// and badges are driven by the tracker store; navigation is `?view=` only.

function NavRow({ icon: Icon, label, count, active, onClick, indent = false, shortcut }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex h-9 w-full items-center gap-2 rounded-[5px] px-2 text-left text-[13px] font-medium transition-colors lg:h-[30px]",
        indent && "pl-[30px]",
        active
          ? "bg-[var(--lnr-selected)] text-[var(--lnr-ink)]"
          : "text-[var(--lnr-ink-subtle)] hover:bg-[var(--lnr-hover)] hover:text-[var(--lnr-ink)]",
      )}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} /> : null}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {count ? (
        <span className="shrink-0 text-[11px] tabular-nums text-[var(--lnr-ink-tertiary)]">
          {count}
        </span>
      ) : null}
      {shortcut ? (
        <Kbd className="hidden shrink-0 opacity-0 transition-opacity group-hover:opacity-100 lg:inline-flex">
          {shortcut}
        </Kbd>
      ) : null}
    </button>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="px-2 pb-1 pt-4 text-[11px] font-medium text-[var(--lnr-ink-tertiary)]">
      {children}
    </p>
  );
}

// Docked at >=lg; below that the shell renders this same panel inside a Sheet,
// so `onNavigate` closes the drawer as well as switching view.
export function ItSidebar({ view, onNavigate, onSearch, onCompose, className }) {
  const { project, projectKey, counts, me } = useTracker();
  const [teamOpen, setTeamOpen] = useState(true);

  return (
    <aside
      className={cn(
        "flex h-full w-full min-w-0 flex-col bg-[var(--lnr-canvas)] pb-2 lg:w-[221px] lg:shrink-0",
        className,
      )}
    >
      {/* Workspace switcher + compose */}
      <div className="flex items-center gap-1 px-2 pt-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-2 rounded-[5px] px-1.5 py-1.5 text-left hover:bg-[var(--lnr-hover)]"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] bg-[var(--lnr-accent)] text-[10px] font-semibold text-white">
                {projectKey.slice(0, 1)}
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[var(--lnr-ink)]">
                {project?.name || "Workspace"}
              </span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[var(--lnr-ink-tertiary)]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="linear-scope w-60 border-[var(--lnr-border-strong)] bg-[var(--lnr-elevated)]"
          >
            <DropdownMenuLabel className="text-[var(--lnr-ink-subtle)]">
              {me?.email || "Signed in"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[var(--lnr-border)]" />
            <DropdownMenuItem onSelect={() => onNavigate("settings")}>
              <Settings className="h-4 w-4" />
              Workspace settings
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onNavigate("members")}>
              <Users className="h-4 w-4" />
              Invite &amp; manage members
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                void navigator.clipboard?.writeText(window.location.href);
              }}
            >
              <Copy className="h-4 w-4" />
              Copy workspace link
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[var(--lnr-border)]" />
            <DropdownMenuItem asChild>
              <Link href={project ? `/project/${project.id}` : "/dashboard"}>
                <LogOut className="h-4 w-4" />
                Back to Geiger Flow
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          type="button"
          onClick={onCompose}
          aria-label="New issue"
          title="New issue"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[5px] border border-[var(--lnr-border-strong)] bg-[var(--lnr-elevated)] text-[var(--lnr-ink-muted)] hover:bg-[var(--lnr-hover)] hover:text-[var(--lnr-ink)]"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      </div>

      <nav className="mt-2 flex-1 overflow-y-auto px-2 lnr-scrollbar">
        <NavRow icon={Search} label="Search" onClick={onSearch} shortcut="⌘K" />
        <NavRow
          icon={Inbox}
          label="Inbox"
          count={counts.open}
          active={view === "inbox"}
          onClick={() => onNavigate("inbox")}
        />
        <NavRow
          icon={CircleDot}
          label="My Issues"
          count={counts.mine}
          active={view === "my-issues"}
          onClick={() => onNavigate("my-issues")}
        />

        <SectionLabel>Workspace</SectionLabel>
        <NavRow
          icon={Target}
          label="Initiatives"
          active={view === "initiatives"}
          onClick={() => onNavigate("initiatives")}
        />
        <NavRow
          icon={Box}
          label="Projects"
          active={view === "projects"}
          onClick={() => onNavigate("projects")}
        />
        <NavRow
          icon={LayoutGrid}
          label="Views"
          active={view === "views"}
          onClick={() => onNavigate("views")}
        />
        <NavRow
          icon={Users}
          label="Members"
          active={view === "members"}
          onClick={() => onNavigate("members")}
        />

        <SectionLabel>Your teams</SectionLabel>
        <button
          type="button"
          onClick={() => setTeamOpen((open) => !open)}
          className="flex h-9 w-full items-center gap-2 rounded-[5px] px-2 text-left text-[13px] font-medium text-[var(--lnr-ink-muted)] hover:bg-[var(--lnr-hover)] lg:h-[30px]"
        >
          {teamOpen ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[var(--lnr-ink-tertiary)]" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[var(--lnr-ink-tertiary)]" />
          )}
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] bg-[var(--lnr-strong)] text-[9px] font-semibold text-[var(--lnr-ink-muted)]">
            {projectKey.slice(0, 1)}
          </span>
          <span className="min-w-0 flex-1 truncate">{projectKey}</span>
        </button>

        {teamOpen ? (
          <>
            <NavRow
              icon={SquareStack}
              label="Issues"
              indent
              active={view === "all-issues"}
              onClick={() => onNavigate("all-issues")}
            />
            <NavRow
              icon={SquareStack}
              label="Triage"
              indent
              count={counts.triage}
              active={view === "triage"}
              onClick={() => onNavigate("triage")}
            />
            <NavRow
              icon={SquareStack}
              label="Cycles"
              indent
              active={view === "cycles"}
              onClick={() => onNavigate("cycles")}
            />
            <NavRow
              icon={SquareStack}
              label="Projects"
              indent
              active={view === "team-projects"}
              onClick={() => onNavigate("team-projects")}
            />
            <NavRow
              icon={SquareStack}
              label="Views"
              indent
              active={view === "team-views"}
              onClick={() => onNavigate("team-views")}
            />
          </>
        ) : null}
      </nav>

      <div className="mt-auto space-y-0.5 px-2 pt-2">
        <NavRow
          icon={Settings}
          label="Settings"
          active={view === "settings"}
          onClick={() => onNavigate("settings")}
        />
        <Link
          href={project ? `/project/${project.id}?Issues` : "/dashboard"}
          className="flex h-9 w-full items-center gap-2 rounded-[5px] px-2 text-[13px] font-medium text-[var(--lnr-ink-subtle)] transition-colors hover:bg-[var(--lnr-hover)] hover:text-[var(--lnr-ink)] lg:h-[30px]"
        >
          <ExternalLink className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          <span className="truncate">Back to project</span>
        </Link>

        <div className="mt-1 flex items-center gap-2 rounded-[5px] px-2 py-1.5">
          <Avatar className="h-5 w-5 shrink-0">
            <AvatarImage src={me?.avatarUrl} alt="" />
            <AvatarFallback className="bg-[var(--lnr-strong)] text-[9px] text-[var(--lnr-ink-muted)]">
              {me?.initials || "?"}
            </AvatarFallback>
          </Avatar>
          <span className="min-w-0 flex-1 truncate text-[12px] text-[var(--lnr-ink-subtle)]">
            {me?.name || "Signed out"}
          </span>
        </div>
      </div>
    </aside>
  );
}
