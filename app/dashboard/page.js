'use client';

import React, { useState } from 'react';
import { AppSidebar } from '@/components/internal/sidebar/sidebar';
import { Topbar } from '@/components/internal/topbar/topbar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { OverviewScreen } from '@/components/internal/screens/dashboard/overview/overview';
import { ProjectsScreen } from '@/components/internal/screens/dashboard/projects/projects';
import { TeamScreen } from '@/components/internal/screens/dashboard/team/team';
import { IntegrationsScreen } from '@/components/internal/screens/dashboard/integrations/integrations';
import { UsageScreen } from '@/components/internal/screens/dashboard/usage/usage';
import { BillingScreen } from '@/components/internal/screens/dashboard/billing/billing';
import { OrganizationSettingsScreen } from '@/components/internal/screens/dashboard/organization_settings/organization_settings';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Projects");

  const renderScreen = () => {
    switch (activeTab) {
      case "Overview":
        return <OverviewScreen />;
      case "Projects":
        return <ProjectsScreen />;
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
    <SidebarProvider>
      <div className="flex h-screen w-full bg-[#161616] text-[#ededed] font-sans overflow-hidden selection:bg-[#333333]">
        <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <SidebarInset className="flex-1 flex flex-col h-full bg-transparent overflow-hidden relative border-l-0">
          <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-white/[0.02] blur-[120px] pointer-events-none rounded-full"></div>
          <Topbar />
          <main className="flex-1 overflow-y-auto p-8 relative z-10 w-full min-w-0">
            {renderScreen()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
