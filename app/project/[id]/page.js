"use client";

import React, { Suspense, useState } from "react";
import { use, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FolderX } from "lucide-react";
import { Button } from "@geiger/ui";
import { ProjectSidebar } from "@/components/internal/sidebar/projects/project_sidebar";
import { ProjectTopbar } from "@/components/internal/topbar/projects/topbar";
import { SidebarProvider, SidebarInset } from "@geiger/ui";
import { ProjectProvider, useProject } from "@/context/project-context";
import { ProjectBudgetProvider } from "@/context/project-budget-context";
import { AddonRegistryProvider, useAddonRegistry } from "@/addons/registry";
import { NavVisibilityProvider } from "@/context/nav-visibility-context";
import { ProjectDetailsScreen } from "@/components/internal/screens/projects/overview/project_details";
import {
  isFullBleedScreen,
  resolveProjectScreen,
} from "@/components/internal/screens/projects/resolve_project_screen";
import {
  listExternalLinks,
  createExternalLink,
  softDeleteExternalLink,
} from "@/features/external_links/actions";
import { toast } from "sonner";
import "@/addons/sql";
import "@/addons/project-plus";
import "@/addons/forms";
import "@/addons/credited-resources";
import "@/addons/system-architecture";
import { useEffect } from "react";

function ProjectLayoutContent({ id }) {
  const { fetchProjectInfo, project, loading, notFound } = useProject();
  const { enabledAddons } = useAddonRegistry();
  const [externalLinks, setExternalLinks] = useState([]);
  const [linksLoading, setLinksLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (id) {
      fetchProjectInfo(id);
    }
  }, [id, fetchProjectInfo]);

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;

    void listExternalLinks(id).then((rows) => {
      if (cancelled) {
        return;
      }
      setExternalLinks(rows ?? []);
      setLinksLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const createLink = useCallback(
    async (link) => {
      const optimisticId = crypto.randomUUID();
      const optimistic = { ...link, id: optimisticId };

      setExternalLinks((currentLinks) => [optimistic, ...currentLinks]);

      const created = await createExternalLink(id, { ...link, id: optimisticId });
      if (!created) {
        setExternalLinks((currentLinks) =>
          currentLinks.filter((entry) => entry.id !== optimisticId),
        );
        toast.error("Couldn't save the link.");
        return;
      }

      setExternalLinks((currentLinks) =>
        currentLinks.map((entry) => (entry.id === created.id ? created : entry)),
      );
      toast.success("Link added");
    },
    [id],
  );

  const deleteLink = useCallback(
    async (linkId) => {
      const previous = externalLinks.find((entry) => entry.id === linkId);

      setExternalLinks((currentLinks) =>
        currentLinks.filter((entry) => entry.id !== linkId),
      );

      const ok = await softDeleteExternalLink(linkId);
      if (!ok) {
        setExternalLinks((currentLinks) =>
          previous && !currentLinks.some((entry) => entry.id === previous.id)
            ? [previous, ...currentLinks]
            : currentLinks,
        );
        toast.error("Couldn't delete the link.");
      }
    },
    [externalLinks],
  );

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

  const fullBleed = isFullBleedScreen(currentTab, enabledAddons);

  const renderScreen = () =>
    resolveProjectScreen(currentTab, {
      id,
      externalLinks,
      linksLoading,
      onCreateLink: createLink,
      onDeleteLink: deleteLink,
      onViewIssues: () => setCurrentTab("Issues"),
      enabledAddons,
    }) ?? (
      <ProjectDetailsScreen
        id={id}
        externalLinks={externalLinks}
        onViewIssues={() => setCurrentTab("Issues")}
      />
    );

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
            <main className={`flex-1 relative z-10 w-full min-w-0 [&::-webkit-scrollbar]:hidden [&]:-ms-overflow-style:none [&]:scrollbar-width:none ${fullBleed ? "min-h-0 overflow-hidden p-0" : "overflow-y-auto p-4 md:p-8"}`}>
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
          {/* Sidebar curation is per (project, user) and sits under both, so it
              filters the nav the addons have already been merged into. */}
          <NavVisibilityProvider>
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
          </NavVisibilityProvider>
        </AddonRegistryProvider>
      </ProjectBudgetProvider>
    </ProjectProvider>
  );
}
