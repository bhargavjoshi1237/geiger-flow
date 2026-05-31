"use client";

import React, { Suspense, use, useEffect } from "react";
import { ProjectTopbar } from "@/components/internal/topbar/projects/topbar";
import { SidebarProvider } from "@/components/ui/sidebar";
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
      <div className="flex h-[100dvh] w-full flex-col items-center justify-center gap-3 bg-[#161616]">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#474747] border-t-[#e7e7e7]" />
        <span className="text-sm text-[#525252]">Loading builder...</span>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-[#161616] text-[#ededed]">
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
          <div className="flex h-[100dvh] w-full flex-col items-center justify-center gap-3 bg-[#161616]">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#474747] border-t-[#e7e7e7]" />
            <span className="text-sm text-[#525252]">Loading...</span>
          </div>
        }
      >
        <BuilderContent id={params.id} />
      </Suspense>
    </ProjectProvider>
  );
}
