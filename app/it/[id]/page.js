"use client";

import React, { Suspense, use, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, FolderX } from "lucide-react";
import { Button, LoadingScreen, LogoLoading } from "@geiger/ui";
import { ProjectProvider, useProject } from "@/context/project-context";
import { itFont } from "@/components/internal/screens/it/it_font";
import { ItShell } from "@/components/internal/screens/it/it_shell";

function ItContent({ id }) {
  const { fetchProjectInfo, project, loading, notFound } = useProject();

  useEffect(() => {
    if (id) {
      fetchProjectInfo(id);
    }
  }, [id, fetchProjectInfo]);

  if (loading) {
    return (
      <div className="flex h-[100dvh] w-full flex-col items-center justify-center gap-3 bg-background">
        <LogoLoading size={96} label="Loading tracker" />
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="flex h-[100dvh] w-full flex-col items-center justify-center gap-4 bg-background p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface-card">
          <FolderX className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="flex max-w-sm flex-col gap-1.5">
          <h1 className="text-lg font-semibold text-foreground">Project not found</h1>
          <p className="text-sm text-muted-foreground">
            No project exists for{" "}
            <span className="font-mono text-secondary">{String(id)}</span>.
          </p>
        </div>
        <Button asChild variant="secondary" className="mt-1">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className={itFont.variable}>
      <ItShell />
    </div>
  );
}

export default function ItProjectPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { id } = params;

  return (
    <ProjectProvider>
      <Suspense
        fallback={
          <LoadingScreen />
        }
      >
        <ItContent id={id} />
      </Suspense>
    </ProjectProvider>
  );
}
