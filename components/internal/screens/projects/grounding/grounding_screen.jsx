"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useOptionalProject } from "@/context/project-context";
import { ChatScopeProvider } from "@/lib/chat/scope-context";
import { useUnreadNotifier } from "@/lib/chat/use-unread-notifier";
import { isDemoMode } from "@/supabase/demo/demo-mode";
import { ChatRail } from "./chat_rail";
import { CHAT_NAV, CHAT_TAB_PARAM, DEFAULT_CHAT_TAB } from "./nav";
import { SCREENS } from "./screens";

// The chat workspace, hosted inside Flow's Grounding tab.
//
// This is the whole of Geiger Chat — messages, channels, contacts, calls,
// files, inbox and settings — scoped to the open project. The rail on the left
// switches between those screens; the pop-out button opens the same workspace
// standalone at /chat/<projectId>.
//
// `embedded` is false on that standalone route, where the rail is the only
// navigation and the pop-out button is pointless.
export function GroundingScreen({ projectId: projectIdProp = null, embedded = true }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const project = useOptionalProject()?.project ?? null;
  const projectId = projectIdProp || project?.id || null;

  const [collapsed, setCollapsed] = useState(false);

  // The active chat screen lives in the URL so a refresh or a shared link
  // reopens it. Flow's shell owns the first query key (the Flow tab), so chat
  // parks its own under ?chat=.
  const activeTab = useMemo(() => {
    const tab = searchParams.get(CHAT_TAB_PARAM);
    return CHAT_NAV.some((item) => item.title === tab) ? tab : DEFAULT_CHAT_TAB;
  }, [searchParams]);

  const setActiveTab = useCallback(
    (tab) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === DEFAULT_CHAT_TAB) params.delete(CHAT_TAB_PARAM);
      else params.set(CHAT_TAB_PARAM, tab);
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  // Raises a desktop notification when a message lands while the tab is in the
  // background, and feeds the rail's Inbox badge.
  const { unreadCount } = useUnreadNotifier(projectId);

  const ActiveScreen = SCREENS[activeTab] ?? SCREENS[DEFAULT_CHAT_TAB];

  const openStandalone = () => {
    if (!projectId) return;
    window.open(
      `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/chat/${projectId}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <ChatScopeProvider projectId={projectId}>
      <div className="relative flex h-full min-h-0 w-full overflow-hidden">
        <ChatRail
          activeTab={activeTab}
          onTabChange={setActiveTab}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((c) => !c)}
          unreadCount={unreadCount}
          onOpenStandalone={
            embedded && projectId && !isDemoMode() ? openStandalone : null
          }
        />

        <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-hidden">
            <ActiveScreen onNavigate={setActiveTab} />
          </div>
        </div>
      </div>
    </ChatScopeProvider>
  );
}

export default GroundingScreen;
