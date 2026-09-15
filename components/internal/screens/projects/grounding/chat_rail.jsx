"use client";

import React from "react";
import { PanelLeft } from "lucide-react";
import { Button, Tooltip, TooltipContent, TooltipTrigger } from "@geiger/ui";
import { cn } from "@/lib/utils";
import { CHAT_NAV } from "./nav";

// Secondary navigation for the chat workspace.
//
// Deliberately not built on the Sidebar primitive: the Grounding screen already
// renders inside Flow's SidebarProvider, and a nested provider would fight over
// the same collapse state. It is styled to the same tokens as the project
// sidebar (sidebar surface, sidebar-accent active row, 36px rows) so the two
// read as one navigation system — see components/internal/sidebar/sidebar_option.jsx.
export function ChatRail({ activeTab, onTabChange, collapsed, onToggleCollapsed, unreadCount = 0 }) {
  return (
    <nav
      aria-label="Chat"
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-linear",
        collapsed ? "w-12" : "w-[15rem]",
      )}
    >
      <div className="flex w-full min-w-0 flex-1 flex-col gap-1 overflow-y-auto p-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="flex w-full min-w-0 flex-col gap-1">
          {CHAT_NAV.map(({ title, icon: Icon }) => {
            const active = activeTab === title;
            const badge = title === "Inbox" && unreadCount > 0 ? unreadCount : null;

            const button = (
              <Button
                type="button"
                variant="ghost"
                onClick={() => onTabChange(title)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-9 w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm transition-all",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  collapsed && "justify-center",
                  active
                    ? "bg-sidebar-accent font-medium text-foreground"
                    : "text-sidebar-foreground",
                )}
              >
                <Icon
                  className={cn(
                    "size-4 shrink-0 transition-colors",
                    active ? "text-foreground" : "text-sidebar-foreground/70",
                  )}
                />
                {!collapsed && <span className="min-w-0 flex-1 truncate">{title}</span>}
                {!collapsed && badge ? (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                    {badge > 99 ? "99+" : badge}
                  </span>
                ) : null}
                {collapsed && badge ? (
                  <span className="absolute right-1 top-1 size-2 rounded-full bg-primary" />
                ) : null}
              </Button>
            );

            return (
              <li key={title} className="group/menu-item relative">
                {collapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>{button}</TooltipTrigger>
                    <TooltipContent side="right" align="center">
                      {title}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  button
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Collapse control, in a bordered footer like the project sidebar's own. */}
      <div className="z-10 mt-auto border-t border-sidebar-border bg-sidebar p-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expand chat navigation" : "Collapse chat navigation"}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg p-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed && "justify-center",
          )}
        >
          <PanelLeft className="h-5 w-5 shrink-0" />
        </Button>
      </div>
    </nav>
  );
}
