import { FileQuestion } from "lucide-react";
import { FormsScreen } from "./screens/forms_screen";

export const formsAddon = {
  id: "forms",
  name: "Forms",
  description:
    "Create confidential project forms, collect clause-bound submissions, and review responses inside the project workspace.",
  version: "1.0.0",
  category: "Collaboration",
  icon: FileQuestion,
  color: "#14b8a6",
  features: [
    "Project-scoped form builder with common question types",
    "Confidential submission mode for project members and approved guests",
    "Response summary, submission table, and status tracking",
    "Access, identity, notification, and closing controls",
  ],
  navItem: {
    title: "Forms",
    icon: FileQuestion,
    insertAfter: "Work Queue",
  },
  screens: [
    {
      id: "Forms",
      component: FormsScreen,
    },
  ],
};
