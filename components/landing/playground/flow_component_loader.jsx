"use client";

import dynamic from "next/dynamic";
import { LoadingArea } from "@geiger/ui/screen-kit";

// Client-only for the same reason as the full playground: the demo client has to
// be armed in the browser before the component mounts.
const FlowComponentEmbed = dynamic(
  () => import("./flow_component_embed").then((mod) => mod.FlowComponentEmbed),
  {
    ssr: false,
    loading: () => <LoadingArea size={56} label="Loading the playground" className="h-full" />,
  },
);

export default FlowComponentEmbed;
