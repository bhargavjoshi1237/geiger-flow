"use client";

import React from "react";
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function SidebarOption({
  title,
  icon: Icon,
  isActive,
  onClick,
  badge,
  className,
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={onClick}
        isActive={isActive}
        tooltip={title}
        className={cn(
          "transition-all text-sm h-9",
          isActive ? "bg-[#2a2a2a] text-white" : "text-[#a3a3a3]",
          className,
        )}
      >
        {Icon && (
          <Icon
            className={cn(
              "w-4 h-4 shrink-0 transition-colors",
              isActive ? "text-white" : "text-[#737373]",
            )}
          />
        )}
        <span>{title}</span>
        {badge && (
          <SidebarMenuBadge className="text-[#a3a3a3] text-[10px] px-1.5 py-0.5 rounded border border-[#333333] ml-auto">
            {badge}
          </SidebarMenuBadge>
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
