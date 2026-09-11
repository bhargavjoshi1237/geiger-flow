"use client";

// The tab -> screen map for the project workspace.
//
// Extracted from app/project/[id]/page.js so the real route and the landing
// playground resolve tabs through the same list — a screen added here appears
// in both, and the two can never drift apart.
//
// Screens are dynamic() imports so selecting a tab fetches that screen (and only
// that screen). Planning in particular pulls in React Flow and its node types;
// loading it on the landing page before anyone asks for it would be wasteful.

import dynamic from "next/dynamic";
import { settingsNav } from "@/components/internal/sidebar/projects/sidebar_data";
import { getAddonScreens, getAddonScreenOptions } from "@/addons/registry";

// Shared while a screen chunk arrives. Sized to the main area rather than the
// viewport, since the shell (sidebar + topbar) is already on screen.
function ScreenLoading() {
  return (
    <div className="flex h-full min-h-[240px] w-full items-center justify-center gap-3">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-border-strong border-t-foreground" />
      <span className="text-sm text-text-tertiary">Loading...</span>
    </div>
  );
}

const screen = (loader) => dynamic(loader, { ssr: false, loading: ScreenLoading });

const ProjectDetailsScreen = screen(() =>
  import("./overview/project_details").then((m) => m.ProjectDetailsScreen),
);
const WorkflowsScreen = screen(() =>
  import("./issues/workflows").then((m) => m.WorkflowsScreen),
);
const ObjectivesScreen = screen(() =>
  import("./objectives/objectives_screen").then((m) => m.ObjectivesScreen),
);
const TasksScreen = screen(() =>
  import("./tasks/tasks_screen").then((m) => m.TasksScreen),
);
const WorkQueueScreen = screen(() =>
  import("./work_queue/work_queue_screen").then((m) => m.WorkQueueScreen),
);
const GroundingScreen = screen(() =>
  import("./grounding/grounding_screen").then((m) => m.GroundingScreen),
);
const GoalsScreen = screen(() =>
  import("./goals/goals_screen").then((m) => m.GoalsScreen),
);
const ReportingScreen = screen(() =>
  import("@/components/internal/screens/reporting/reporting_screen").then(
    (m) => m.ReportingScreen,
  ),
);
const TeamScreen = screen(() => import("./team/team").then((m) => m.TeamScreen));
const ResourceAllocationScreen = screen(() =>
  import("./resource_allocation/resource_allocation_screen").then(
    (m) => m.ResourceAllocationScreen,
  ),
);
const MilestonesScreen = screen(() =>
  import("./milestones/milestones_screen").then((m) => m.MilestonesScreen),
);
const ProjectionsScreen = screen(() =>
  import("./projections/projections_screen").then((m) => m.ProjectionsScreen),
);
const SecurityScreen = screen(() =>
  import("./security/security_screen").then((m) => m.SecurityScreen),
);
const SettingsScreen = screen(() =>
  import("./settings/settings_screen").then((m) => m.SettingsScreen),
);
const VaultScreen = screen(() =>
  import("./vault/vault_screen").then((m) => m.VaultScreen),
);
const LogsScreen = screen(() => import("./logs/logs_screen").then((m) => m.LogsScreen));
const AssetsScreen = screen(() =>
  import("./assets/assets_screen").then((m) => m.AssetsScreen),
);
const PlanningScreen = screen(() =>
  import("./planning/planning_screen").then((m) => m.PlanningScreen),
);
const ExternalsScreen = screen(() =>
  import("./externals/externals_screen").then((m) => m.ExternalsScreen),
);
const OfficeScreen = screen(() =>
  import("./office/office_screen").then((m) => m.OfficeScreen),
);

// Tab titles that own their whole scroll container and padding. Kept beside the
// map because it is the same decision — which screen renders, and how it frames.
export function isFullBleedScreen(tab, enabledAddons = []) {
  return Boolean(getAddonScreenOptions(enabledAddons)[tab]?.fullBleed);
}

// The element for `tab`, or null when nothing claims it. Callers decide the
// fallback (the real route falls back to Overview).
//
// `id` is the open project id; `externalLinks` and its handlers belong to the
// shell, not to the Externals screen, so they are passed down rather than
// re-fetched per screen.
export function resolveProjectScreen(
  tab,
  {
    id,
    externalLinks = [],
    linksLoading = false,
    onCreateLink,
    onDeleteLink,
    onViewIssues,
    enabledAddons = [],
  } = {},
) {
  if (settingsNav.some((item) => item.title === tab)) {
    return <SettingsScreen activeSettingsTab={tab} />;
  }

  const addonScreens = getAddonScreens(enabledAddons);
  if (addonScreens[tab]) {
    const AddonScreen = addonScreens[tab];
    return <AddonScreen />;
  }

  switch (tab) {
    case "Overview":
      return (
        <ProjectDetailsScreen
          id={id}
          externalLinks={externalLinks}
          onViewIssues={onViewIssues}
        />
      );
    case "Issues":
      return <WorkflowsScreen />;
    case "Tasks":
      return <TasksScreen />;
    case "Work Queue":
      return <WorkQueueScreen />;
    case "Grounding":
      return <GroundingScreen />;
    case "Goals":
      return <GoalsScreen />;
    case "Reporting":
      return <ReportingScreen />;
    case "Objectives":
      return <ObjectivesScreen />;
    case "Projections":
      return <ProjectionsScreen />;
    case "Planning":
      return <PlanningScreen />;
    case "Milestones":
      return <MilestonesScreen />;
    case "Team":
      return <TeamScreen />;
    case "Resource Allocation":
      return <ResourceAllocationScreen />;
    case "Vault":
      return <VaultScreen />;
    case "Externals":
      return (
        <ExternalsScreen
          links={externalLinks}
          linksLoading={linksLoading}
          onCreateLink={onCreateLink}
          onDeleteLink={onDeleteLink}
        />
      );
    case "Assets":
      return <AssetsScreen />;
    case "Recent Files":
    case "Folders":
    case "Shared with Project":
      return <OfficeScreen activeTab={tab} />;
    case "Logs":
      return <LogsScreen />;
    case "Security":
      return <SecurityScreen />;
    default:
      return null;
  }
}
