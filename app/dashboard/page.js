'use client';

import React, { useEffect, useState } from 'react';
import { AppSidebar } from '@/components/internal/sidebar/sidebar';
import { Topbar } from '@/components/internal/topbar/topbar';
import { SidebarProvider, SidebarInset } from '@geiger/ui';
import { OverviewScreen } from '@/components/internal/screens/dashboard/overview/overview';
import { ProjectsScreen } from '@/components/internal/screens/dashboard/projects/projects';
import { InboxScreen } from '@/components/internal/screens/dashboard/inbox/inbox';
import { TeamScreen } from '@/components/internal/screens/dashboard/team/team';
import { RolesScreen } from '@/components/internal/screens/dashboard/roles/roles';
import { ReportingScreen } from '@/components/internal/screens/reporting/reporting_screen';
import { IntegrationsScreen } from '@/components/internal/screens/dashboard/integrations/integrations';
import { UsageScreen } from '@/components/internal/screens/dashboard/usage/usage';
import { BillingScreen } from '@/components/internal/screens/dashboard/billing/billing';
import { OrganizationSettingsScreen } from '@/components/internal/screens/dashboard/organization_settings/organization_settings';
import { createClient } from '@/lib/supabase/client';
import {
  ROLE_STORAGE_KEY,
  mergeWorkspaceRoles,
  roleHasPermission,
  tabPermissionKey,
} from '@/lib/rbac';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Projects");
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
      setActiveTab(tab);
    }
  };

  const renderScreen = () => {
    if (!roleHasPermission(workspaceRoles, currentRoleId, tabPermissionKey(activeTab))) {
      return <TeamScreen roles={workspaceRoles} />;
    }

    switch (activeTab) {
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
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background text-foreground font-sans overflow-hidden selection:bg-surface-strong">
        <AppSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          roleId={currentRoleId}
          roles={workspaceRoles}
        />
        <SidebarInset className="flex-1 flex flex-col h-full bg-transparent overflow-hidden relative border-l-0">
          <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-foreground/[0.02] blur-[120px] pointer-events-none rounded-full"></div>
          <Topbar />
          <main className="flex-1 overflow-y-auto p-8 relative z-10 w-full min-w-0">
            {renderScreen()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
