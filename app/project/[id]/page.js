"use client";

import React, { useState } from "react";
import { use } from "react";
import { ProjectSidebar } from "@/components/internal/sidebar/projects/project_sidebar";
import { ProjectTopbar } from "@/components/internal/topbar/projects/topbar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ProjectDetailsScreen } from "@/components/internal/screens/projects/project_details";
import { WorkflowsScreen } from "@/components/internal/screens/projects/workflows";
import { DatasetsScreen } from "@/components/internal/screens/projects/datasets";
import { TasksScreen } from "@/components/internal/screens/projects/tasks/tasks_screen";
import { GoalsScreen } from "@/components/internal/screens/projects/goals/goals_screen";
import { TeamScreen } from "@/components/internal/screens/projects/team/team";
import { SettingsScreen } from "@/components/internal/screens/projects/settings/settings_screen";
import { ProjectProvider, useProject } from "@/context/project-context";
import { settingsNav } from "@/components/internal/sidebar/projects/sidebar_data";
import { useEffect } from "react";

function ProjectLayoutContent({ id }) {
  const { fetchProjectInfo, project, loading } = useProject();
  const [currentTab, setCurrentTab] = useState("Overview");

  useEffect(() => {
    if (id) {
      fetchProjectInfo(id);
    }
  }, [id, fetchProjectInfo]);

  const renderScreen = () => {
    const isSettingsTab = settingsNav.some((item) => item.title === currentTab);
    if (isSettingsTab) {
      return <SettingsScreen activeSettingsTab={currentTab} />;
    }

    switch (currentTab) {
      case "Overview":
        return <ProjectDetailsScreen id={id} />;
      case "Issues":
        return <WorkflowsScreen />;
      case "Tasks":
        return <TasksScreen />;
      case "Goals":
        return <GoalsScreen />;
      case "Objectives":
        return <DatasetsScreen />;
      case "Milestones":
        return <DatasetsScreen />;
      case "Team":
        return <TeamScreen />;
      case "Security":
        return <DatasetsScreen />;
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
            <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 w-full min-w-0">
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
      <ProjectLayoutContent id={id} />
    </ProjectProvider>
  );
}
