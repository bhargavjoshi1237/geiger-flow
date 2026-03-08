"use client";

import React from "react";
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export function SidebarOption({
  title,
  icon: Icon,
  isActive,
  onClick,
  badge,
  className,
  subItems,
  isExpanded,
  onToggle,
  activeSubTab,
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        type="button"
        onClick={subItems ? onToggle : () => onClick?.()}
        isActive={isActive}
        tooltip={title}
        className={cn(
          "transition-all text-sm h-9",
          // Highlight parent when its dropdown is open OR when it is directly active
          isExpanded || (isActive && !subItems)
            ? "bg-sidebar-accent text-white"
            : "text-sidebar-foreground",
          className,
        )}
      >
        {Icon && (
          <Icon
            className={cn(
              "w-4 h-4 shrink-0 transition-colors",
              isExpanded || isActive
                ? "text-white"
                : "text-sidebar-foreground/70",
            )}
          />
        )}
        <span>{title}</span>
        {subItems && (
          <ChevronDown
            className={cn(
              "ml-auto w-4 h-4 transition-transform duration-200",
              isExpanded && "rotate-180",
            )}
          />
        )}
        {badge && !subItems && (
          <SidebarMenuBadge className="mr-2 text-[#a3a3a3] text-[10px] px-1.5 py-0.5 rounded border border-[#333333] ml-auto">
            {badge}
          </SidebarMenuBadge>
        )}
      </SidebarMenuButton>

      {subItems && isExpanded && (
        <ul className="flex flex-col gap-0.5 pt-2 w-[95%]">
          {subItems.map((sub) => (
            <li key={sub.title}>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onClick(sub.title);
                }}
                className={cn(
                  "relative w-full flex items-center px-4 h-[35px] rounded-md text-sm leading-none transition-colors gap-2",
                  activeSubTab === sub.title
                    ? "bg-sidebar-accent text-white font-medium"
                    : "text-sidebar-foreground/70 hover:text-white hover:bg-sidebar-accent/50",
                )}
              >
                {sub.icon && (
                  <sub.icon
                    className={cn(
                      "w-4 h-4 shrink-0 transition-colors",
                      activeSubTab === sub.title
                        ? "text-white"
                        : "text-sidebar-foreground/70",
                    )}
                  />
                )}
                <p className="">{sub.title}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </SidebarMenuItem>
  );
}
