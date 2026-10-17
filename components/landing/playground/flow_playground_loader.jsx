"use client";

import dynamic from "next/dynamic";
import { LoadingArea } from "@geiger/ui/screen-kit";

// Client-only: the playground swaps the Supabase client for the in-memory demo
// one at module scope, which has to happen in the browser before any screen mounts.
const FlowPlayground = dynamic(
  () => import("./flow_playground").then((mod) => mod.FlowPlayground),
  {
    ssr: false,
    loading: () => <LoadingArea size={80} label="Loading the playground" className="h-full bg-background" />,
  },
);

export default FlowPlayground;
