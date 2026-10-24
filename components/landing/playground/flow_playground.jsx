"use client";

import React, { useState } from "react";
import { SidebarProvider, SidebarInset } from "@geiger/ui";
import { ProjectSidebar } from "@/components/internal/sidebar/projects/project_sidebar";
import { ProjectTopbar } from "@/components/internal/topbar/projects/topbar";
import {
  isFullBleedScreen,
  resolveProjectScreen,
} from "@/components/internal/screens/projects/resolve_project_screen";
import { DEMO_PROJECT } from "@/supabase/demo/fixtures";
import { PLAYGROUND_ADDONS, PlaygroundSession } from "./playground_session";
import { ScreenErrorBoundary } from "./screen_error_boundary";

function PlaygroundWorkspace() {
  const [activeTab, setActiveTab] = useState("Overview");

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
    // No NavVisibilityProvider: @geiger/ui falls back to ALL_VISIBLE, which
    // renders the full sidebar without a session. The cost is that
    // Settings → Navigation has nothing to write to.
    <PlaygroundSession>
      <PlaygroundWorkspace />
    </PlaygroundSession>
  );
}

export default FlowPlayground;
