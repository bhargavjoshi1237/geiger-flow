"use client";

import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { SidebarProvider, SidebarInset } from "@geiger/ui";
import { ProjectSidebar } from "@/components/internal/sidebar/projects/project_sidebar";
import { ProjectTopbar } from "@/components/internal/topbar/projects/topbar";
import { ProjectBudgetProvider } from "@/context/project-budget-context";
import { AddonRegistryProvider } from "@/addons/registry";
import {
  isFullBleedScreen,
  resolveProjectScreen,
} from "@/components/internal/screens/projects/resolve_project_screen";
import { setDemoMode, setDemoWriteHandler } from "@/supabase/demo/demo-mode";
import { DEMO_PROJECT } from "@/supabase/demo/fixtures";
import { PlaygroundProjectProvider } from "./playground_project_provider";
import { ScreenErrorBoundary } from "./screen_error_boundary";

// Armed as this module is evaluated, which happens when the lazy playground
// chunk loads and therefore before a single child renders. A screen that mounted
// a tick early would fetch against the real client, get nothing, and sit on an
// empty state forever — so this cannot be an effect.
setDemoMode(true);

// Addons mount their own screens (system-architecture pulls in a React Flow
// canvas). The playground starts from none enabled rather than turning them off
// afterwards, so nothing heavy mounts on a public page. Settings → Add-ons
// still lists them; enabling one simply won't persist.
const PLAYGROUND_ADDONS = [];

function PlaygroundWorkspace() {
  const [activeTab, setActiveTab] = useState("Overview");
  // Set while this playground is mounted. See the deferred reset below.
  const armedRef = useRef(false);

  // Disarm on unmount so the flag can't leak into a later route in the same
  // session — a client-side navigation to a real project would otherwise render
  // fixture data with no session.
  //
  // The reset is deferred by a microtask because React's StrictMode remount runs
  // this cleanup without tearing the tree down. The effect body re-arms on that
  // simulated remount before the microtask drains, so the reset is cancelled; on
  // a genuine unmount nothing re-arms it and the flag clears.
  useEffect(() => {
    armedRef.current = true;
    return () => {
      armedRef.current = false;
      queueMicrotask(() => {
        if (!armedRef.current) setDemoMode(false);
      });
    };
  }, []);

  // Every rejected write funnels here, so the playground owns one message for
  // the whole workspace instead of each screen inventing its own. The fixed id
  // collapses a burst of rejections into a single toast.
  useEffect(() => {
    setDemoWriteHandler(() =>
      toast.error("This is a read-only demo.", {
        id: "playground-read-only",
        description: "Changes aren't saved here. Open the workspace to try it for real.",
      }),
    );
    return () => setDemoWriteHandler(null);
  }, []);

  const fullBleed = isFullBleedScreen(activeTab, PLAYGROUND_ADDONS);

  const screen = resolveProjectScreen(activeTab, {
    id: DEMO_PROJECT.id,
    enabledAddons: PLAYGROUND_ADDONS,
    onViewIssues: () => setActiveTab("Issues"),
  });

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-background font-sans text-foreground selection:bg-surface-strong">
      <SidebarProvider
        className="flex-col !flex h-full min-w-0"
        style={{ flexDirection: "column" }}
      >
        <ProjectTopbar
          // The logo means "back to the dashboard" on a real project page; here
          // it would reload the landing page out from under the embed.
          onLogoClick={() => {}}
        />
        <div className="relative flex flex-1 overflow-hidden">
          <ProjectSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          <SidebarInset className="relative flex h-full flex-1 flex-col overflow-hidden border-none bg-transparent">
            <div className="pointer-events-none absolute right-0 top-0 h-[300px] w-[500px] rounded-full bg-foreground/[0.02] blur-[120px]" />
            <main
              className={`relative z-10 w-full min-w-0 flex-1 [&::-webkit-scrollbar]:hidden [&]:-ms-overflow-style:none [&]:scrollbar-width:none ${
                fullBleed ? "min-h-0 overflow-hidden p-0" : "overflow-y-auto p-4 md:p-8"
              }`}
            >
              {/* Keyed by tab so a screen that threw is retried fresh on the
                  next navigation rather than staying latched. */}
              <ScreenErrorBoundary key={activeTab} title={activeTab}>
                {screen}
              </ScreenErrorBoundary>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}

export function FlowPlayground() {
  return (
    <PlaygroundProjectProvider>
      <ProjectBudgetProvider>
        {/* No NavVisibilityProvider: @geiger/ui falls back to ALL_VISIBLE, which
            renders the full sidebar without a session. The cost is that
            Settings → Navigation has nothing to write to. */}
        <AddonRegistryProvider initialEnabledAddons={PLAYGROUND_ADDONS}>
          <PlaygroundWorkspace />
        </AddonRegistryProvider>
      </ProjectBudgetProvider>
    </PlaygroundProjectProvider>
  );
}

export default FlowPlayground;
