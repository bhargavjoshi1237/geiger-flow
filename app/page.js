"use client";

import React, { useEffect, useState } from "react";
import { AppSidebar } from "@/components/internal/sidebar/sidebar";
import { Topbar } from "@/components/internal/topbar/topbar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { OverviewScreen } from '@/components/internal/screens/dashboard/overview/overview';
import { ProjectsScreen } from '@/components/internal/screens/dashboard/projects/projects';
import { TeamScreen } from '@/components/internal/screens/dashboard/team/team';
import { RolesScreen } from '@/components/internal/screens/dashboard/roles/roles';
import { IntegrationsScreen } from '@/components/internal/screens/dashboard/integrations/integrations';
import { UsageScreen } from '@/components/internal/screens/dashboard/usage/usage';
import { BillingScreen } from '@/components/internal/screens/dashboard/billing/billing';
import { OrganizationSettingsScreen } from '@/components/internal/screens/dashboard/organization_settings/organization_settings';
import { InboxScreen } from '@/components/internal/screens/dashboard/inbox/inbox';
import { ReportingScreen } from '@/components/internal/screens/reporting/reporting_screen';
import { createClient } from '@/lib/supabase/client';
import {
  ROLE_STORAGE_KEY,
  mergeWorkspaceRoles,
  roleHasPermission,
  tabPermissionKey,
} from '@/lib/rbac';

export default function Home() {
  const [currentTab, setCurrentTab] = useState("Overview");
  const [workspaceRoles, setWorkspaceRoles] = useState([]);
  const [currentRoleId, setCurrentRoleId] = useState("workspace_owner");

  useEffect(() => {
    const loadWorkspaceAccess = async () => {
      let storedRoles = [];

      try {
        storedRoles = JSON.parse(localStorage.getItem(ROLE_STORAGE_KEY) || "[]");
      } catch {
        storedRoles = [];
      }

      try {
        const supabase = createClient();
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;
        const { data: profile } = userId
          ? await supabase
              .from("flow_profiles")
              .select("organization_id, role")
              .eq("id", userId)
              .maybeSingle()
          : { data: null };

        const { data: dbRoles } = profile?.organization_id
          ? await supabase
              .from("flow_workspace_roles")
              .select("*")
              .eq("organization_id", profile.organization_id)
          : { data: null };

        setWorkspaceRoles(
          mergeWorkspaceRoles(
            dbRoles?.length
              ? dbRoles.map((role) => ({
                  id: role.role_key,
                  name: role.name,
                  description: role.description,
                  permissions: role.permissions,
                  system: role.is_system,
                }))
              : storedRoles,
          ),
        );
        setCurrentRoleId(profile?.role || "workspace_owner");
      } catch {
        setWorkspaceRoles(mergeWorkspaceRoles(storedRoles));
      }
    };

    loadWorkspaceAccess();
  }, []);

  const handleTabChange = (tab) => {
    if (roleHasPermission(workspaceRoles, currentRoleId, tabPermissionKey(tab))) {
      setCurrentTab(tab);
    }
  };

  const renderScreen = () => {
    if (!roleHasPermission(workspaceRoles, currentRoleId, tabPermissionKey(currentTab))) {
      return <TeamScreen roles={workspaceRoles} />;
    }

    switch (currentTab) {
      case "Overview":
        return <OverviewScreen />;
      case "Projects":
        return <ProjectsScreen />;
      case "Reporting":
        return <ReportingScreen />;
      case "Inbox":
        return <InboxScreen />;
      case "Team":
        return <TeamScreen roles={workspaceRoles} />;
      case "Roles":
        return (
          <RolesScreen
            roles={workspaceRoles}
            onRolesChange={setWorkspaceRoles}
          />
        );
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
    <div className="flex-col h-[100dvh] w-full bg-background text-foreground font-sans overflow-hidden selection:bg-surface-strong flex">
      <SidebarProvider className="flex-col !flex h-full min-w-0" style={{flexDirection: 'column'}}>
        <Topbar />
        <div className="flex flex-1 overflow-hidden relative">
          <AppSidebar
            activeTab={currentTab}
            onTabChange={handleTabChange}
            roleId={currentRoleId}
            roles={workspaceRoles}
          />
          <SidebarInset className="flex-1 flex flex-col h-full bg-transparent overflow-hidden relative border-none">
            <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-foreground/[0.02] blur-[120px] pointer-events-none rounded-full"></div>
            <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 w-full min-w-0">
              {renderScreen()}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
