"use client";

import React, { Suspense, use, useEffect } from "react";
import { ProjectTopbar } from "@/components/internal/topbar/projects/topbar";
import { LoadingScreen, LogoLoading, SidebarProvider } from "@geiger/ui";
import { ProjectProvider, useProject } from "@/context/project-context";
import { FormBuilderScreen } from "@/addons/forms/screens/form_builder_screen";

function BuilderContent({ id }) {
  const { fetchProjectInfo, project, loading } = useProject();

  useEffect(() => {
    if (id) {
      fetchProjectInfo(id);
    }
  }, [id, fetchProjectInfo]);

  if (loading || !project) {
    return (
      <div className="flex h-[100dvh] w-full flex-col items-center justify-center gap-3 bg-background">
        <LogoLoading size={72} label="Loading builder" />
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-background text-foreground">
      <SidebarProvider className="!flex h-full flex-col" style={{ flexDirection: "column" }}>
        <ProjectTopbar />
        <FormBuilderScreen projectId={id} />
      </SidebarProvider>
    </div>
  );
}

export default function ProjectFormBuilderPage({ params: paramsPromise }) {
  const params = use(paramsPromise);

  return (
    <ProjectProvider>
      <Suspense
        fallback={
          <LoadingScreen />
        }
      >
        <BuilderContent id={params.id} />
      </Suspense>
    </ProjectProvider>
  );
}
