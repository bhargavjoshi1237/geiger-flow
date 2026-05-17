import { BadgeDollarSign } from "lucide-react";
import { CreditedResourcesScreen } from "./screens/credited_resources_screen";

export const creditedResourcesAddon = {
  id: "credited-resources",
  name: "Credited Resources",
  description:
    "Manage time-bound org credits such as AI token budgets and allocate them across users, tasks, goals, milestones, and modules.",
  version: "1.0.0",
  category: "Resource Management",
  icon: BadgeDollarSign,
  color: "#10b981",
  features: [
    "Track monthly credited resources with reset windows",
    "Allocate limited credits to users, tasks, goals, milestones, and modules",
    "Compare planned usage, actual usage, and remaining balance",
    "Plan usage across the month before credits reset",
  ],
  navItem: {
    title: "Credited Resources",
    icon: BadgeDollarSign,
    insertAfter: "Resource Allocation",
  },
  screens: [
    {
      id: "Credited Resources",
      component: CreditedResourcesScreen,
    },
  ],
};
