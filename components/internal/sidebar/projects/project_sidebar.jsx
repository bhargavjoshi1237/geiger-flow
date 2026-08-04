"use client";

import React, { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarRail,
  useSidebar,
} from "@geiger/ui";
import { PanelLeft, ChevronLeft, Search, Bell, X } from "lucide-react";
import { SidebarOption } from "../sidebar_option";
import { useProject } from "@/context/project-context";
import { useVisibleProjectNav } from "@/lib/hooks/use-visible-project-nav";
import { Button } from "@geiger/ui";

function MobileSidebarHeader() {
  const { isMobile, toggleSidebar } = useSidebar();
  const { project } = useProject();

  if (!isMobile) {
    return null;
  }

  return (
    <SidebarHeader className="p-0 border-b border-sidebar-border">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded flex items-center justify-center shrink-0">
            <img
              src="/logo1.svg"
              alt=""
              className="geiger-logo w-5 h-5"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.parentElement.innerHTML =
                  '<div class="w-2 h-2 bg-foreground rounded-full"></div>';
              }}
            />
          </div>
          <span className="text-foreground font-semibold text-sm truncate max-w-full">
            {project?.name || "Project"}
          </span>
        </div>
      </div>
    </SidebarHeader>
  );
}

export function ProjectSidebar({
  activeTab = "Overview",
  onTabChange = () => {},
  subMenuMode = "dropdown",
}) {
  const { toggleSidebar } = useSidebar();
  const [activeMenu, setActiveMenu] = useState("main");
  const [expandedItems, setExpandedItems] = useState({});

  // Addon entries merged in, then narrowed to what this user kept in
  // Settings → Navigation. The Settings submenu is filtered on the same pass, so
  // a hidden settings tab disappears with it.
  const { nav: mergedNav, settingsNav } = useVisibleProjectNav();

  const toggleExpand = (title) => {
    setExpandedItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <Sidebar
      collapsible="icon"
      className="bg-sidebar border-r border-sidebar-border text-sidebar-foreground"
    >
      <MobileSidebarHeader />
      <SidebarContent className="space-y-2 relative flex-1 overflow-hidden bg-sidebar">
        <div
          className={`absolute inset-0 w-full h-full bg-sidebar transition-transform duration-300 ease-in-out ${
            activeMenu === "main" ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-full overflow-y-auto overflow-x-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {mergedNav.map((item) => (
                    <SidebarOption
                      key={item.addonId ? `addon-${item.addonId}` : item.title}
                      title={item.title}
                      icon={item.icon}
                      iconColor={item.iconColor}
                      isActive={
                        activeTab === item.title && activeMenu === "main"
                      }
                      subItems={
                        subMenuMode === "dropdown"
                          ? item.hasSubmenu
                            ? settingsNav
                            : item.subItems || null
                          : null
                      }
                      isExpanded={expandedItems[item.title] !== undefined ? expandedItems[item.title] : !!item.subItems?.find((s) => s.title === activeTab)}
                      onToggle={() => toggleExpand(item.title)}
                      activeSubTab={activeTab}
                      onClick={(tabTitle) => {
                        if (tabTitle && typeof tabTitle === "string") {
                          onTabChange(tabTitle);
                        } else if (subMenuMode === "slide" && item.hasSubmenu) {
                          setExpandedItems({});
                          setActiveMenu(item.title.toLowerCase());
                          if (item.title === "Settings") {
                            onTabChange("General");
                          }
                        } else if (item.hasSubmenu) {
                          setExpandedItems({
                            [item.title]: !expandedItems[item.title],
                          });
                        } else if (item.subItems) {
                          setExpandedItems((prev) => ({
                            ...prev,
                            [item.title]: !prev[item.title],
                          }));
                        } else {
                          setExpandedItems({});
                          onTabChange(item.title);
                        }
                      }}
                      badge={item.badge}
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>
        </div>

        {subMenuMode === "slide" && (
          <div
            className={`absolute inset-0 w-full h-full bg-sidebar transition-transform duration-300 ease-in-out flex flex-col ${
              activeMenu === "settings" ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="px-2 pt-3 pb-2 border-b border-sidebar-border mb-2 bg-sidebar">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setActiveMenu("main");
                  onTabChange("Overview");
                }}
                className="flex items-center gap-2 text-sidebar-foreground hover:text-foreground transition-colors text-sm font-medium w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:hidden px-2 py-1 rounded-md hover:bg-sidebar-accent"
              >
                <ChevronLeft className="w-4 h-4" />
                Settings
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setActiveMenu("main");
                  onTabChange("Overview");
                }}
                className="hidden group-data-[collapsible=icon]:flex items-center justify-center w-full text-sidebar-foreground hover:text-foreground rounded-md hover:bg-sidebar-accent p-1"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto px-1 py-1 overflow-x-hidden bg-sidebar [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {settingsNav.map((item) => (
                      <SidebarOption
                        key={item.title}
                        title={item.title}
                        isActive={activeTab === item.title}
                        onClick={() => onTabChange(item.title)}
                      />
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </div>
          </div>
        )}
      </SidebarContent>
      <SidebarFooter className="p-2 border-t border-sidebar-border mt-auto z-10 bg-sidebar">
        <Button
          type="button"
          variant="ghost"
          onClick={toggleSidebar}
          className="flex items-center gap-3 p-2 w-full rounded-lg hover:bg-sidebar-accent transition-all text-sidebar-foreground hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center"
        >
          <PanelLeft className="w-5 h-5 shrink-0" />
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
