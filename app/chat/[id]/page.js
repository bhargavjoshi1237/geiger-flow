"use client";

import React, { Suspense, use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FolderX } from "lucide-react";
import { Button, LoadingScreen, LogoLoading, SidebarProvider } from "@geiger/ui";
import { ProjectProvider, useProject } from "@/context/project-context";
import { ProjectTopbar } from "@/components/internal/topbar/projects/topbar";
import { listExternalLinks } from "@/features/external_links/actions";
import { GroundingScreen } from "@/components/internal/screens/projects/grounding/grounding_screen";

// The chat workspace, standalone. Same screen the Grounding tab renders, given
// the full window instead of sitting inside the project shell — this is where
// the tab's pop-out button lands. The chat rail is the only navigation here, so
// the screen runs with `embedded` off.
function ChatContent({ id }) {
  const { fetchProjectInfo, project, loading, notFound } = useProject();
  const [externalLinks, setExternalLinks] = useState([]);

  useEffect(() => {
    if (id) {
      fetchProjectInfo(id);
    }
  }, [id, fetchProjectInfo]);

  // The topbar shows the project's pinned external links, same as /project.
  useEffect(() => {
    if (!id) return undefined;
    let cancelled = false;
    void listExternalLinks(id).then((rows) => {
      if (!cancelled) setExternalLinks(rows ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[100dvh] w-full flex-col items-center justify-center gap-3 bg-background">
        <LogoLoading size={96} label="Loading chat" />
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
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-background font-sans text-foreground selection:bg-surface-strong">
      {/* Same shell as /project: the provider supplies the sidebar + tooltip
          context the topbar and the chat rail both rely on. There is no project
          sidebar here — the chat rail is the only navigation. */}
      <SidebarProvider
        className="flex-col !flex h-full min-w-0"
        style={{ flexDirection: "column" }}
      >
        <ProjectTopbar externalLinks={externalLinks} />
        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          <GroundingScreen projectId={id} embedded={false} />
        </div>
      </SidebarProvider>
    </div>
  );
}

export default function ChatPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { id } = params;

  return (
    <ProjectProvider>
      <Suspense fallback={<LoadingScreen size={96} />}>
        <ChatContent id={id} />
      </Suspense>
    </ProjectProvider>
  );
}
