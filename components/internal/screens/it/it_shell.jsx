"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Box,
  CircleDot,
  Inbox,
  LayoutGrid,
  Repeat,
  Settings,
  SquareStack,
  Target,
  Users,
} from "lucide-react";
import {
  CommandPalette,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  useCommandShortcut,
} from "@geiger/ui";
import { issueIdentifier } from "@/features/issues/constants";
import "./linear-theme.css";
import { CreateIssueDialog } from "./create_issue_dialog";
import { IssueDetail } from "./issue_detail";
import { ItSidebar } from "./sidebar";
import { TrackerProvider, useTracker } from "./use_tracker";
import { useItUrl } from "./use_it_url";
import { CyclesView } from "./views/cycles";
import { InboxView } from "./views/inbox";
import { InitiativesView } from "./views/initiatives";
import { AllIssuesView, MyIssuesView, TriageView, ViewsView } from "./views/issues";
import { MembersView } from "./views/members";
import { ProjectsView } from "./views/projects";
import { SettingsView } from "./views/settings";

// The Linear shell for /it/[id]: a left rail over the dark canvas and a single
// rounded content panel that swaps view by `?view=`. Everything inside inherits
// Linear's palette from `.linear-scope`.
//
// Below `lg` the rail collapses into a drawer and each view header grows a menu
// button — `useShellNav()` is how a nested header reaches it without threading
// a prop through every view.

// `g` then a letter jumps to a destination, the way Linear's go-to works.
const GOTO_KEYS = {
  i: "inbox",
  m: "my-issues",
  a: "all-issues",
  t: "triage",
  c: "cycles",
  p: "projects",
  v: "views",
  r: "initiatives",
  s: "settings",
};

const PALETTE_NAV = [
  { title: "Inbox", icon: Inbox },
  { title: "My Issues", icon: CircleDot },
  { title: "All issues", icon: SquareStack },
  { title: "Triage", icon: Inbox },
  { title: "Cycles", icon: Repeat },
  { title: "Projects", icon: Box },
  { title: "Initiatives", icon: Target },
  { title: "Views", icon: LayoutGrid },
  { title: "Members", icon: Users },
  { title: "Settings", icon: Settings },
];

const PALETTE_VIEW_BY_TITLE = {
  Inbox: "inbox",
  "My Issues": "my-issues",
  "All issues": "all-issues",
  Triage: "triage",
  Cycles: "cycles",
  Projects: "projects",
  Initiatives: "initiatives",
  Views: "views",
  Members: "members",
  Settings: "settings",
};

// Lets any nested view header open the mobile drawer without prop-drilling.
const ShellNavContext = createContext({ openMenu: () => {} });

export function useShellNav() {
  return useContext(ShellNavContext);
}

function ShellBody() {
  const tracker = useTracker();
  const { loading, issues, project } = tracker;
  const {
    view,
    issueId,
    cycleId,
    projectId: openProjectId,
    setParams,
    goToView,
    openIssue,
    closeIssue,
  } = useItUrl();

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createDefaults, setCreateDefaults] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const gotoArmed = useRef(false);

  const startCreate = useCallback((defaults = {}) => {
    setCreateDefaults(defaults ?? {});
    setCreateOpen(true);
  }, []);

  // Navigating from the drawer should also dismiss it.
  const navigate = useCallback(
    (destination, extra) => {
      setDrawerOpen(false);
      goToView(destination, extra);
    },
    [goToView],
  );

  const shellNav = useMemo(
    () => ({ openMenu: () => setDrawerOpen(true) }),
    [],
  );

  useCommandShortcut(() => setPaletteOpen(true));

  // `c` opens the composer; `g` arms a go-to sequence. Both stand down while a
  // field, dialog or palette has focus.
  useEffect(() => {
    const handler = (event) => {
      const tag = event.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || event.target?.isContentEditable) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (paletteOpen || createOpen) return;

      const key = event.key.toLowerCase();

      if (gotoArmed.current) {
        gotoArmed.current = false;
        const destination = GOTO_KEYS[key];
        if (destination) {
          event.preventDefault();
          navigate(destination);
        }
        return;
      }

      if (key === "g") {
        gotoArmed.current = true;
        // A stale arm shouldn't swallow the next unrelated keystroke.
        window.setTimeout(() => {
          gotoArmed.current = false;
        }, 1200);
        return;
      }

      if (key === "c") {
        event.preventDefault();
        startCreate({});
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate, startCreate, paletteOpen, createOpen]);

  // The sidebar's compose button dispatches this, as does the old shell's API.
  useEffect(() => {
    const handler = () => startCreate({});
    window.addEventListener("flow:open-create-issue", handler);
    return () => window.removeEventListener("flow:open-create-issue", handler);
  }, [startCreate]);

  const paletteItems = useMemo(
    () =>
      issues.slice(0, 60).map((issue) => ({
        title: issue.title,
        // The identifier rides along as keywords so "FLOW-12" finds the row.
        keywords: issueIdentifier(issue, project),
        group: "Issues",
        issueId: issue.id,
      })),
    [issues, project],
  );

  const content = () => {
    if (issueId) {
      return (
        <IssueDetail issueId={issueId} onClose={closeIssue} onNavigate={openIssue} />
      );
    }

    switch (view) {
      case "inbox":
        return <InboxView />;
      case "my-issues":
        return <MyIssuesView onOpenIssue={openIssue} onCreate={startCreate} />;
      case "triage":
        return <TriageView onOpenIssue={openIssue} onCreate={startCreate} />;
      case "cycles":
        return (
          <CyclesView
            onOpenIssue={openIssue}
            onCreate={startCreate}
            cycleId={cycleId}
            onSelectCycle={(id) => setParams({ cycle: id })}
          />
        );
      case "projects":
      case "team-projects":
        return (
          <ProjectsView
            onOpenIssue={openIssue}
            onCreate={startCreate}
            selectedId={openProjectId}
            onSelect={(id) => setParams({ project: id })}
          />
        );
      case "initiatives":
        return (
          <InitiativesView
            onSelectProject={(id) => navigate("projects", { project: id })}
            onSelectCycle={(id) => navigate("cycles", { cycle: id })}
          />
        );
      case "views":
      case "team-views":
        return <ViewsView onOpenIssue={openIssue} onCreate={startCreate} />;
      case "members":
        return <MembersView onOpenIssue={openIssue} />;
      case "settings":
        return <SettingsView />;
      default:
        return <AllIssuesView onOpenIssue={openIssue} onCreate={startCreate} />;
    }
  };

  return (
    <ShellNavContext.Provider value={shellNav}>
    <div className="linear-scope flex h-[100dvh] w-full overflow-hidden bg-[var(--lnr-canvas)] text-[var(--lnr-ink)]">
      {/* Docked rail from lg up. */}
      <div className="hidden lg:flex">
        <ItSidebar
          view={view}
          onNavigate={navigate}
          onSearch={() => setPaletteOpen(true)}
          onCompose={() => startCreate({})}
        />
      </div>

      {/* Drawer below lg. */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="linear-scope w-[264px] gap-0 border-[var(--lnr-border)] bg-[var(--lnr-canvas)] p-0 sm:max-w-[264px] lg:hidden"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Jump to a view in this tracker.
          </SheetDescription>
          <ItSidebar
            view={view}
            onNavigate={navigate}
            onSearch={() => {
              setDrawerOpen(false);
              setPaletteOpen(true);
            }}
            onCompose={() => {
              setDrawerOpen(false);
              startCreate({});
            }}
          />
        </SheetContent>
      </Sheet>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden border-[var(--lnr-border)] bg-[var(--lnr-panel)] lg:rounded-tl-[8px] lg:border-l lg:border-t">
        {loading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--lnr-border-strong)] border-t-[var(--lnr-ink-subtle)]" />
            <span className="text-[13px] text-[var(--lnr-ink-tertiary)]">Loading workspace…</span>
          </div>
        ) : (
          content()
        )}
      </main>

      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        nav={PALETTE_NAV}
        items={paletteItems}
        placeholder="Search issues, or jump to a view…"
        rootGroupLabel="Navigate"
        recentsKey="geiger:it:palette"
        className="linear-scope border-[var(--lnr-border-strong)] bg-[var(--lnr-elevated)]"
        onSelect={(entry) => {
          setPaletteOpen(false);
          if (entry?.issueId) {
            openIssue(entry.issueId);
            return;
          }
          const destination = PALETTE_VIEW_BY_TITLE[entry?.title];
          if (destination) navigate(destination);
        }}
      />

      <CreateIssueDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaults={createDefaults}
        onCreated={(issue) => openIssue(issue.id)}
      />
    </div>
    </ShellNavContext.Provider>
  );
}

export function ItShell() {
  return (
    <TrackerProvider>
      <ShellBody />
    </TrackerProvider>
  );
}

export default ItShell;
