"use client";

import React, { Suspense } from "react";
import { use, useCallback, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ProjectSidebar } from "@/components/internal/sidebar/projects/project_sidebar";
import { ProjectTopbar } from "@/components/internal/topbar/projects/topbar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ProjectDetailsScreen } from "@/components/internal/screens/projects/overview/project_details";
import { WorkflowsScreen } from "@/components/internal/screens/projects/issues/workflows";
import { DatasetsScreen } from "@/components/internal/screens/projects/datasets";
import { ObjectivesScreen } from "@/components/internal/screens/projects/objectives/objectives_screen";
import { TasksScreen } from "@/components/internal/screens/projects/tasks/tasks_screen";
import { WorkQueueScreen } from "@/components/internal/screens/projects/work_queue/work_queue_screen";
import { GroundingScreen } from "@/components/internal/screens/projects/grounding/grounding_screen";
import { GoalsScreen } from "@/components/internal/screens/projects/goals/goals_screen";
import { ReportingScreen } from "@/components/internal/screens/reporting/reporting_screen";
import { TeamScreen } from "@/components/internal/screens/projects/team/team";
import { MilestonesScreen } from "@/components/internal/screens/projects/milestones/milestones_screen";
import { ProjectionsScreen } from "@/components/internal/screens/projects/projections/projections_screen";
import { SecurityScreen } from "@/components/internal/screens/projects/security/security_screen";
import { SettingsScreen } from "@/components/internal/screens/projects/settings/settings_screen";
import { VaultScreen } from "@/components/internal/screens/projects/vault/vault_screen";
import { LogsScreen } from "@/components/internal/screens/projects/logs/logs_screen";
import { AssetsScreen } from "@/components/internal/screens/projects/assets/assets_screen";
import { PlanningScreen } from "@/components/internal/screens/projects/planning/planning_screen";
import { ProjectProvider, useProject } from "@/context/project-context";
import { settingsNav } from "@/components/internal/sidebar/projects/sidebar_data";
import { AddonRegistryProvider, useAddonRegistry } from "@/addons/registry";
import { getAddonScreens, getAddonNavItems } from "@/addons/registry";
import "@/addons/sql";
import "@/addons/project-plus";
import "@/addons/forms";
import { useEffect } from "react";

function ProjectLayoutContent({ id }) {
  const { fetchProjectInfo, project, loading } = useProject();
  const { enabledAddons, addonColors } = useAddonRegistry();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (id) {
      fetchProjectInfo(id);
    }
  }, [id, fetchProjectInfo]);

  // Get all search param keys; the first non-"screen" key is the active tab
  const screenParamKeys = [];
  searchParams.forEach((_, key) => {
    screenParamKeys.push(key);
  });
  const currentTab = screenParamKeys[0] || "Overview";

  const setCurrentTab = useCallback(
    (tab) => {
      if (tab === "Overview") {
        router.push(pathname, { scroll: false });
      } else {
        router.push(`${pathname}?${encodeURIComponent(tab)}`, { scroll: false });
      }
    },
    [router, pathname]
  );

  const addonScreens = getAddonScreens(enabledAddons);

  const renderScreen = () => {
    const isSettingsTab = settingsNav.some((item) => item.title === currentTab);
    if (isSettingsTab) {
      return <SettingsScreen activeSettingsTab={currentTab} />;
    }

    if (addonScreens[currentTab]) {
      const AddonScreen = addonScreens[currentTab];
      return <AddonScreen />;
    }

    switch (currentTab) {
      case "Overview":
        return <ProjectDetailsScreen id={id} />;
      case "Issues":
        return <WorkflowsScreen />;
      case "Tasks":
        return <TasksScreen />;
      case "Work Queue":
        return <WorkQueueScreen />;
      case "Grounding":
        return <GroundingScreen />;
      case "Goals":
        return <GoalsScreen />;
      case "Reporting":
        return <ReportingScreen />;
      case "Objectives":
        return <ObjectivesScreen />;
      case "Projections":
        return <ProjectionsScreen />;
      case "Planning":
        return <PlanningScreen />;
      case "Milestones":
        return <MilestonesScreen />;
      case "Team":
        return <TeamScreen />;
      case "Vault":
        return <VaultScreen />;
      case "Assets":
        return <AssetsScreen />;
      case "Logs":
        return <LogsScreen />;
      case "Security":
        return <SecurityScreen />;
      default:
        return <ProjectDetailsScreen id={id} />;
    }
  };

  if (loading || !project) {
    return (
      <div className="flex flex-col h-[100dvh] w-full bg-[#161616] items-center justify-center gap-3">
        <div className="w-5 h-5 rounded-full border-2 border-[#474747] border-t-[#e7e7e7] animate-spin" />
        <span className="text-[#525252] text-sm">Loading project...</span>
      </div>
    );
  }

  return (
    <div className="flex-col h-[100dvh] w-full bg-[#161616] text-[#ededed] font-sans overflow-hidden selection:bg-[#333333] flex">
      <SidebarProvider className="flex-col !flex h-full min-w-0" style={{flexDirection: 'column'}}>
        <ProjectTopbar />
        <div className="flex flex-1 overflow-hidden relative">
          <ProjectSidebar activeTab={currentTab} onTabChange={setCurrentTab} />
          <SidebarInset className="flex-1 flex flex-col h-full bg-transparent overflow-hidden relative border-none">
            <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-white/[0.02] blur-[120px] pointer-events-none rounded-full"></div>
            <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 w-full min-w-0 [&::-webkit-scrollbar]:hidden [&]:-ms-overflow-style:none [&]:scrollbar-width:none">
              {renderScreen()}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}

export default function ProjectPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { id } = params;

  return (
    <ProjectProvider>
      <AddonRegistryProvider>
        <Suspense
          fallback={
            <div className="flex flex-col h-[100dvh] w-full bg-[#161616] items-center justify-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-[#474747] border-t-[#e7e7e7] animate-spin" />
              <span className="text-[#525252] text-sm">Loading...</span>
            </div>
          }
        >
          <ProjectLayoutContent id={id} />
        </Suspense>
      </AddonRegistryProvider>
    </ProjectProvider>
  );
}
