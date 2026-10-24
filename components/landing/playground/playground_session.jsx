"use client";

import React, { useEffect, useRef } from "react";
import { toast } from "sonner";
import { ProjectBudgetProvider } from "@/context/project-budget-context";
import { AddonRegistryProvider } from "@/addons/registry";
// Side-effect import: fills the addon registry, so the playground offers the
// same addon screens the real project route does.
import "@/addons";
import { setDemoMode, setDemoWriteHandler } from "@/supabase/demo/demo-mode";
import { PlaygroundProjectProvider } from "./playground_project_provider";

// Armed as this module is evaluated, which happens when a lazy playground chunk
// loads and therefore before a single child renders. A screen that mounted a
// tick early would fetch against the real client, get nothing, and sit on an
// empty state forever — so this cannot be an effect.
setDemoMode(true);

// Addons mount their own screens (system-architecture pulls in a React Flow
// canvas). The playground starts from none enabled rather than turning them off
// afterwards, so nothing heavy mounts on a public page. Settings → Add-ons
// still lists them; enabling one lasts only for the session.
export const PLAYGROUND_ADDONS = [];

// The demo session every playground surface runs in — the whole workspace on
// /playground and the single components on /playground/<component>: the fixture
// project, in-memory writes that reset on reload, and one toast for any call
// the demo can't serve.
export function PlaygroundSession({ children }) {
  // Set while a playground is mounted. See the deferred reset below.
  const armedRef = useRef(false);

  // Disarm on unmount so the flag can't leak into a later route in the same
  // session — a client-side navigation to a real project would otherwise render
  // fixture data with no session.
  //
  // The reset is deferred by a microtask because React's StrictMode remount runs
  // this cleanup without tearing the tree down. The effect body re-arms on that
  // simulated remount before the microtask drains, so the reset is cancelled; on
  // a genuine unmount nothing re-arms it and the flag clears.
  useEffect(() => {
    armedRef.current = true;
    return () => {
      armedRef.current = false;
      queueMicrotask(() => {
        if (!armedRef.current) setDemoMode(false);
      });
    };
  }, []);

  // Edits land in the in-memory session store and reset on reload; only a call
  // the demo can't serve funnels here, as one message for the whole playground.
  // The fixed id collapses a burst of them into a single toast.
  useEffect(() => {
    setDemoWriteHandler(() =>
      toast.error("This isn't available in the playground.", {
        id: "playground-unavailable",
        description: "Open the workspace to try it for real.",
      }),
    );
    return () => setDemoWriteHandler(null);
  }, []);

  return (
    <PlaygroundProjectProvider>
      <ProjectBudgetProvider>
        <AddonRegistryProvider initialEnabledAddons={PLAYGROUND_ADDONS}>
          {children}
        </AddonRegistryProvider>
      </ProjectBudgetProvider>
    </PlaygroundProjectProvider>
  );
}

export default PlaygroundSession;
