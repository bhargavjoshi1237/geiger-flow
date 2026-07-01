"use client";

import React, { Suspense } from "react";
import { use, useCallback, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FolderX } from "lucide-react";
import { Button } from "@geiger/ui";
import { ProjectSidebar } from "@/components/internal/sidebar/projects/project_sidebar";
import { ProjectTopbar } from "@/components/internal/topbar/projects/topbar";
import { SidebarProvider, SidebarInset } from "@geiger/ui";
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
import { ResourceAllocationScreen } from "@/components/internal/screens/projects/resource_allocation/resource_allocation_screen";
import { MilestonesScreen } from "@/components/internal/screens/projects/milestones/milestones_screen";
import { ProjectionsScreen } from "@/components/internal/screens/projects/projections/projections_screen";
import { SecurityScreen } from "@/components/internal/screens/projects/security/security_screen";
import { SettingsScreen } from "@/components/internal/screens/projects/settings/settings_screen";
import { VaultScreen } from "@/components/internal/screens/projects/vault/vault_screen";
import { LogsScreen } from "@/components/internal/screens/projects/logs/logs_screen";
import { AssetsScreen } from "@/components/internal/screens/projects/assets/assets_screen";
import { PlanningScreen } from "@/components/internal/screens/projects/planning/planning_screen";
import { ExternalsScreen } from "@/components/internal/screens/projects/externals/externals_screen";
import { OfficeScreen } from "@/components/internal/screens/projects/office/office_screen";
import { ProjectProvider, useProject } from "@/context/project-context";
import { ProjectBudgetProvider } from "@/context/project-budget-context";
import { settingsNav } from "@/components/internal/sidebar/projects/sidebar_data";
import { getProjectExternalLinksStorageKey } from "@/components/internal/externals/external_links";
import { AddonRegistryProvider, useAddonRegistry } from "@/addons/registry";
import { getAddonScreens, getAddonScreenOptions } from "@/addons/registry";
import "@/addons/sql";
import "@/addons/project-plus";
import "@/addons/forms";
import "@/addons/credited-resources";
import "@/addons/system-architecture";
import { useEffect } from "react";

function ProjectLayoutContent({ id }) {
  const { fetchProjectInfo, project, loading, notFound } = useProject();
  const { enabledAddons } = useAddonRegistry();
  const [externalLinks, setExternalLinks] = React.useState(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const storedLinks = JSON.parse(
        localStorage.getItem(getProjectExternalLinksStorageKey(id)) || "[]",
      );

      return Array.isArray(storedLinks) ? storedLinks : [];
    } catch {
      return [];
    }
  });
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (id) {
      fetchProjectInfo(id);
    }
  }, [id, fetchProjectInfo]);

  useEffect(() => {
    localStorage.setItem(
      getProjectExternalLinksStorageKey(id),
      JSON.stringify(externalLinks),
    );
  }, [id, externalLinks]);

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
  const addonScreenOptions = getAddonScreenOptions(enabledAddons);
  const isFullBleedScreen = Boolean(addonScreenOptions[currentTab]?.fullBleed);

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
        return <ProjectDetailsScreen id={id} externalLinks={externalLinks} />;
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
      case "Resource Allocation":
        return <ResourceAllocationScreen />;
      case "Vault":
        return <VaultScreen />;
      case "Externals":
        return (
          <ExternalsScreen
            links={externalLinks}
            onCreateLink={(link) =>
              setExternalLinks((currentLinks) => [link, ...currentLinks])
            }
            onDeleteLink={(linkId) =>
              setExternalLinks((currentLinks) =>
                currentLinks.filter((link) => link.id !== linkId),
              )
            }
          />
        );
      case "Assets":
        return <AssetsScreen />;
      case "Recent Files":
      case "Folders":
      case "Shared with Project":
        return <OfficeScreen activeTab={currentTab} />;
      case "Logs":
        return <LogsScreen />;
      case "Security":
        return <SecurityScreen />;
      default:
        return <ProjectDetailsScreen id={id} externalLinks={externalLinks} />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-[100dvh] w-full bg-background items-center justify-center gap-3">
        <div className="w-5 h-5 rounded-full border-2 border-border-strong border-t-foreground animate-spin" />
        <span className="text-text-tertiary text-sm">Loading project...</span>
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="flex flex-col h-[100dvh] w-full bg-background items-center justify-center gap-4 p-6 text-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-surface-card border border-border">
          <FolderX className="w-6 h-6 text-muted-foreground" />
        </div>
        <div className="flex flex-col gap-1.5 max-w-sm">
          <h1 className="text-lg font-semibold text-foreground">Project not found</h1>
          <p className="text-sm text-muted-foreground">
            No project exists for{" "}
            <span className="font-mono text-secondary">{String(id)}</span>. Check the
            link or pick a project from your dashboard.
          </p>
        </div>
        <Button asChild variant="secondary" className="mt-1">
          <Link href="/">
            <ArrowLeft className="w-4 h-4" />
            Back to dashboard
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-col h-[100dvh] w-full bg-background text-foreground font-sans overflow-hidden selection:bg-surface-strong flex">
      <SidebarProvider className="flex-col !flex h-full min-w-0" style={{flexDirection: 'column'}}>
        <ProjectTopbar externalLinks={externalLinks} />
        <div className="flex flex-1 overflow-hidden relative">
          <ProjectSidebar activeTab={currentTab} onTabChange={setCurrentTab} />
          <SidebarInset className="flex-1 flex flex-col h-full bg-transparent overflow-hidden relative border-none">
            <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-foreground/[0.02] blur-[120px] pointer-events-none rounded-full"></div>
            <main className={`flex-1 relative z-10 w-full min-w-0 [&::-webkit-scrollbar]:hidden [&]:-ms-overflow-style:none [&]:scrollbar-width:none ${isFullBleedScreen ? "min-h-0 overflow-hidden p-0" : "overflow-y-auto p-4 md:p-8"}`}>
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
      <ProjectBudgetProvider>
        <AddonRegistryProvider>
          <Suspense
            fallback={
              <div className="flex flex-col h-[100dvh] w-full bg-background items-center justify-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-border-strong border-t-foreground animate-spin" />
                <span className="text-text-tertiary text-sm">Loading...</span>
              </div>
            }
          >
            <ProjectLayoutContent id={id} />
          </Suspense>
        </AddonRegistryProvider>
      </ProjectBudgetProvider>
    </ProjectProvider>
  );
}
