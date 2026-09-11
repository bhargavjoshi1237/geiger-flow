"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@geiger/ui";

// Client-only: the playground swaps the Supabase client for a fixture-backed one
// at module scope, which has to happen in the browser before any screen mounts.
const FlowPlayground = dynamic(
  () =>
    import("@/components/landing/playground/flow_playground").then(
      (mod) => mod.FlowPlayground,
    ),
  { ssr: false },
);

// The interactive half of the landing page: the real project workspace — sidebar,
// topbar and every screen — running on a demo project. Sits below the static
// kanban hero, which stays as it is.
export default function FlowPlaygroundShowcase({ backgroundImage } = {}) {
  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-border bg-surface-subtle bg-cover bg-center bg-no-repeat p-3 sm:rounded-3xl sm:p-6 md:p-8 xl:p-10"
      style={
        backgroundImage ? { backgroundImage: `url('${backgroundImage}')` } : undefined
      }
    >
      <div className="absolute inset-0 bg-[#080808]/75" />
      <div className="relative z-10 flex flex-col gap-6 sm:gap-10">
        <div className="mx-auto mb-4 mt-4 flex w-[92%] flex-col items-start gap-4 sm:mb-6 sm:mt-6 sm:w-[90%]">
          <h3 className="text-3xl font-semibold leading-tight text-foreground">
            Explore the whole workspace, right here.
          </h3>
          <p className="max-w-lg text-[#bcbcbc]">
            This is the real Flow project workspace running live on the page — the
            sidebar, the topbar, and every screen inside them, loaded from a demo
            project. Click through as much as you like; nothing here saves.
          </p>
          <Button asChild className="rounded-full">
            <Link href="/org">
              Open Flow
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="relative rounded-2xl border border-border/80 bg-background/70 p-2 shadow-2xl backdrop-blur-md sm:p-3">
          <div className="h-[680px] overflow-hidden rounded-xl border border-border bg-background sm:h-[760px] lg:h-[900px]">
            <FlowPlayground />
          </div>
        </div>
      </div>
    </section>
  );
}
