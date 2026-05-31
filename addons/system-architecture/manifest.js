import { Network } from "lucide-react";
import { SystemArchitectureScreen } from "./screens/system_architecture_screen";

export const systemArchitectureAddon = {
  id: "system-architecture",
  name: "System Architecture",
  description: "Map microservices, infrastructure, data stores, MVC layers, integrations, security boundaries, and operational flows on a full-screen canvas.",
  version: "1.0.0",
  category: "Architecture",
  icon: Network,
  color: "#38bdf8",
  features: [
    "Full-screen React Flow architecture canvas",
    "Explorable node catalogue with search and category filters",
    "Drag-and-drop architecture nodes",
    "Broad coverage for app, cloud, data, security, DevOps, AI, and observability systems",
  ],
  navItem: {
    title: "System Architecture",
    icon: Network,
    insertAfter: "Planning",
  },
  screens: [
    {
      id: "System Architecture",
      component: SystemArchitectureScreen,
      fullBleed: true,
    },
  ],
};
