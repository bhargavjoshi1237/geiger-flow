"use client";

import React, { Suspense, use, useEffect } from "react";
import Link from "next/link";
import { Inter } from "next/font/google";
import { ArrowLeft, FolderX } from "lucide-react";
import { Button, LogoLoading } from "@geiger/ui";
import { ProjectProvider, useProject } from "@/context/project-context";
import { ItShell } from "@/components/internal/screens/it/it_shell";

// The tracker is typeset in Inter with Linear's OpenType features, so it reads
// like Linear rather than like the rest of the suite (which is on Geist).
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-it-sans",
  display: "swap",
});

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
        <LogoLoading size={72} />
        <span className="text-sm text-text-tertiary">Loading tracker...</span>
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
    <div className={inter.variable}>
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
          <div className="flex h-[100dvh] w-full flex-col items-center justify-center gap-3 bg-background">
            <LogoLoading size={72} />
            <span className="text-sm text-text-tertiary">Loading...</span>
          </div>
        }
      >
        <ItContent id={id} />
      </Suspense>
    </ProjectProvider>
  );
}
