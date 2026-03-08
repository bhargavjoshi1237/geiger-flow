"use client";

import React, { useState } from "react";
import { AppSidebar } from "@/components/internal/sidebar/sidebar";
import { Topbar } from "@/components/internal/topbar/topbar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { OverviewScreen } from '@/components/internal/screens/dashboard/overview/overview';
import { ProjectsScreen } from '@/components/internal/screens/dashboard/projects/projects';
import { TeamScreen } from '@/components/internal/screens/dashboard/team/team';
import { IntegrationsScreen } from '@/components/internal/screens/dashboard/integrations/integrations';
import { UsageScreen } from '@/components/internal/screens/dashboard/usage/usage';
import { BillingScreen } from '@/components/internal/screens/dashboard/billing/billing';
import { OrganizationSettingsScreen } from '@/components/internal/screens/dashboard/organization_settings/organization_settings';
import { InboxScreen } from '@/components/internal/screens/dashboard/inbox/inbox';

export default function Home() {
  const [currentTab, setCurrentTab] = useState("Overview");

  const renderScreen = () => {
    switch (currentTab) {
      case "Overview":
        return <OverviewScreen />;
      case "Projects":
        return <ProjectsScreen />;
      case "Inbox":
        return <InboxScreen />;
      case "Team":
        return <TeamScreen />;
      case "Integrations":
        return <IntegrationsScreen />;
      case "Usage":
        return <UsageScreen />;
      case "Billing":
        return <BillingScreen />;
      case "Organization settings":
        return <OrganizationSettingsScreen />;
      default:
        return <OverviewScreen />;
    }
  };

  return (
    <div className="flex-col h-[100dvh] w-full bg-[#161616] text-[#ededed] font-sans overflow-hidden selection:bg-[#333333] flex">
      <SidebarProvider className="flex-col !flex h-full min-w-0" style={{flexDirection: 'column'}}>
        <Topbar />
        <div className="flex flex-1 overflow-hidden relative">
          <AppSidebar activeTab={currentTab} onTabChange={setCurrentTab} />
          <SidebarInset className="flex-1 flex flex-col h-full bg-transparent overflow-hidden relative border-none">
            <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-white/[0.02] blur-[120px] pointer-events-none rounded-full"></div>
            <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 w-full min-w-0">
              {renderScreen()}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
