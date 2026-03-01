"use client";

import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { PanelLeft } from "lucide-react";
import { SidebarOption } from "../sidebar_option";
import { projectNav } from "./sidebar_data";

export function ProjectSidebar({
  activeTab = "Overview",
  onTabChange = () => {},
}) {
  const { toggleSidebar } = useSidebar();

  return (
    <Sidebar
      collapsible="icon"
      className="bg-[#202020] border-r border-[#2a2a2a] text-[#a3a3a3]"
    >
      <SidebarContent className="px-1 py-1 space-y-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {projectNav.map((item) => (
                <SidebarOption
                  key={item.title}
                  title={item.title}
                  icon={item.icon}
                  isActive={activeTab === item.title}
                  onClick={() => onTabChange(item.title)}
                  badge={item.badge}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-2 border-t border-[#2a2a2a] mt-auto">
        <button
          onClick={toggleSidebar}
          className="flex items-center gap-3 p-2 w-full rounded-lg hover:bg-[#2a2a2a] transition-all text-[#a3a3a3] hover:text-white group-data-[collapsible=icon]:justify-center"
        >
          <PanelLeft className="w-5 h-5 shrink-0" />
        </button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
