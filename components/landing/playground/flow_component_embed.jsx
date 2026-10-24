"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { ClipboardList, Plus } from "lucide-react";
import { Button, LoadingArea } from "@geiger/ui";
import { EmptyState } from "@/components/internal/shared/screen_kit";
import { itFont } from "@/components/internal/screens/it/it_font";
import { NavVisibilityProvider } from "@/context/nav-visibility-context";
import { useProject } from "@/context/project-context";
import { createTask, listTasks, updateTask } from "@/features/tasks/actions";
import { listOrgMembers } from "@/lib/supabase/profiles";
import { FLOATING_PLAYGROUND_COMPONENT_IDS } from "./playground_components";
import { PlaygroundSession } from "./playground_session";
import { ScreenErrorBoundary } from "./screen_error_boundary";

function EmbedLoading() {
  return <LoadingArea size={56} className="h-full" />;
}

const embed = (loader) => dynamic(loader, { ssr: false, loading: EmbedLoading });

const TasksScreen = embed(() =>
  import("@/components/internal/screens/projects/tasks/tasks_screen").then((m) => m.TasksScreen),
);
const WorkQueueScreen = embed(() =>
  import("@/components/internal/screens/projects/work_queue/work_queue_screen").then((m) => m.WorkQueueScreen),
);
const TaskDetails = embed(() =>
  import("@/components/internal/screens/projects/tasks/tasks_screen").then((m) => m.TaskDetails),
);
const AddTaskDialog = embed(() =>
  import("@/components/internal/screens/projects/tasks/add_task_dialog").then((m) => m.AddTaskDialog),
);
const ProjectDetailsScreen = embed(() =>
  import("@/components/internal/screens/projects/overview/project_details").then((m) => m.ProjectDetailsScreen),
);
const ItShell = embed(() => import("@/components/internal/screens/it/it_shell").then((m) => m.ItShell));
const GroundingScreen = embed(() =>
  import("@/components/internal/screens/projects/grounding/grounding_screen").then((m) => m.GroundingScreen),
);
const PlanningScreen = embed(() =>
  import("@/components/internal/screens/projects/planning/planning_screen").then((m) => m.PlanningScreen),
);
const ProjectionsScreen = embed(() =>
  import("@/components/internal/screens/projects/projections/projections_screen").then((m) => m.ProjectionsScreen),
);
const MilestonesScreen = embed(() =>
  import("@/components/internal/screens/projects/milestones/milestones_screen").then((m) => m.MilestonesScreen),
);
const GoalsScreen = embed(() =>
  import("@/components/internal/screens/projects/goals/goals_screen").then((m) => m.GoalsScreen),
);
const ObjectivesScreen = embed(() =>
  import("@/components/internal/screens/projects/objectives/objectives_screen").then((m) => m.ObjectivesScreen),
);
const ReportingScreen = embed(() =>
  import("@/components/internal/screens/reporting/reporting_screen").then((m) => m.ReportingScreen),
);
const AssetsScreen = embed(() =>
  import("@/components/internal/screens/projects/assets/assets_screen").then((m) => m.AssetsScreen),
);
const LogsScreen = embed(() =>
  import("@/components/internal/screens/projects/logs/logs_screen").then((m) => m.LogsScreen),
);
const TeamScreen = embed(() => import("@/components/internal/screens/projects/team/team").then((m) => m.TeamScreen));
const ResourceAllocationScreen = embed(() =>
  import("@/components/internal/screens/projects/resource_allocation/resource_allocation_screen").then(
    (m) => m.ResourceAllocationScreen,
  ),
);
const VaultScreen = embed(() =>
  import("@/components/internal/screens/projects/vault/vault_screen").then((m) => m.VaultScreen),
);
const SecurityScreen = embed(() =>
  import("@/components/internal/screens/projects/security/security_screen").then((m) => m.SecurityScreen),
);
const SettingsScreen = embed(() =>
  import("@/components/internal/screens/projects/settings/settings_screen").then((m) => m.SettingsScreen),
);
const SystemArchitectureScreen = embed(() =>
  import("@/addons/system-architecture/screens/system_architecture_screen").then((m) => m.SystemArchitectureScreen),
);
const BudgetTrackerScreen = embed(() =>
  import("@/addons/project-plus/screens/product_addon_screens").then((m) => m.BudgetTrackerScreen),
);

// Same frame as a screen inside the workspace's main area, minus the sidebar and topbar.
function ScreenFrame({ children }) {
  return (
    <main className="h-full w-full overflow-y-auto p-4 [scrollbar-width:none] md:p-8 [&::-webkit-scrollbar]:hidden">
      {children}
    </main>
  );
}

// For screens that own their whole area and scrolling (Planning, Grounding, System Architecture), as in the workspace.
function FullBleedFrame({ children }) {
  return <div className="h-full w-full overflow-hidden">{children}</div>;
}

// The issue tracker held to one view, without the rail it would navigate from.
function TrackerFrame({ view, openLeadIssue = false }) {
  return (
    <div className={`${itFont.variable} h-full w-full`}>
      <ItShell pinnedView={view} openLeadIssue={openLeadIssue} />
    </div>
  );
}

const screenEntry = (title, render) => ({ title, render: () => <ScreenFrame>{render()}</ScreenFrame> });
const fullBleedEntry = (title, render) => ({ title, render: () => <FullBleedFrame>{render()}</FullBleedFrame> });
const trackerEntry = (title, view, options = {}) => ({
  title,
  render: () => <TrackerFrame view={view} {...options} />,
});
const settingsEntry = (tab) => screenEntry(`${tab} settings`, () => <SettingsScreen activeSettingsTab={tab} />);

// The New Task dialog on its own: open from the start, reopened from a lone Create Task button once closed.
function AddTaskShowcase() {
  const { project } = useProject();
  const [open, setOpen] = useState(true);
  const [goalOptions, setGoalOptions] = useState([]);

  // The Tasks screen offers these goals, so the dialog shows the same list.
  useEffect(() => {
    let active = true;
    void import("@/components/internal/screens/projects/tasks/tasks_screen").then((m) => {
      if (active) setGoalOptions(m.GOAL_OPTIONS);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleSave = async (payload) => {
    const created = await createTask(project.id, payload);
    if (created) toast.success("Task created");
    else toast.error("Couldn't create task");
  };

  return (
    <div className="flex h-full w-full items-center justify-center">
      <Button onClick={() => setOpen(true)} className="gap-1.5">
        <Plus className="h-4 w-4" />
        Create Task
      </Button>
      <AddTaskDialog
        open={open}
        onOpenChange={setOpen}
        onSave={handleSave}
        goalOptions={goalOptions}
        autoFocus={false}
        modal={false}
        // The host sizes the frame to the dialog, so let it use all but a slim margin instead of 88vh.
        contentClassName="max-h-[calc(100dvh-2rem)]"
      />
    </div>
  );
}

// The task detail panel on its own, opened on the demo project's furthest-along task in progress.
function TaskDetailsShowcase() {
  const { project } = useProject();
  const [tasks, setTasks] = useState(null);
  const [members, setMembers] = useState([]);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    let active = true;
    void Promise.all([listTasks(project.id), listOrgMembers(project.organization_id)]).then(([rows, people]) => {
      if (!active) return;
      const lead = rows
        .filter((task) => task.status === "in_progress")
        .sort((a, b) => (b.progress || 0) - (a.progress || 0))[0];
      setTasks(lead ? [lead, ...rows.filter((task) => task.id !== lead.id)] : rows);
      setMembers(people);
    });
    return () => {
      active = false;
    };
  }, [project.id, project.organization_id]);

  if (!tasks) return <EmbedLoading />;

  const task = tasks[0];
  if (!task) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No tasks left"
        description="Reload to bring the sample tasks back."
        className="bg-background"
      />
    );
  }

  const handleUpdate = (updated) => setTasks((current) => current.map((row) => (row.id === updated.id ? updated : row)));
  // Deleting shows the next task, the way closing the sheet returns to the list.
  const handleDelete = (id) => setTasks((current) => current.filter((row) => row.id !== id));

  const handleSaveEdit = async (payload) => {
    const updated = await updateTask(editing.id, payload);
    if (!updated) {
      toast.error("Couldn't update task");
      return;
    }
    handleUpdate(updated);
    toast.success("Task updated");
  };

  return (
    <div className="h-full w-full overflow-y-auto border-l border-border bg-background [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <TaskDetails
        key={task.id}
        task={task}
        members={members}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onEdit={setEditing}
      />
      <AddTaskDialog
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(null)}
        task={editing}
        onSave={handleSaveEdit}
      />
    </div>
  );
}

const COMPONENTS = {
  tasks: {
    title: "Tasks",
    render: () => (
      <ScreenFrame>
        <TasksScreen />
      </ScreenFrame>
    ),
  },
  "add-task": { title: "New task", render: () => <AddTaskShowcase /> },
  "task-details": { title: "Task details", render: () => <TaskDetailsShowcase /> },
  "work-queue": {
    title: "Work Queue",
    render: () => (
      <ScreenFrame>
        <WorkQueueScreen />
      </ScreenFrame>
    ),
  },
  // View Issues and View Schedule lead to other screens, so here they do nothing.
  overview: screenEntry("Overview", () => <ProjectDetailsScreen />),
  issues: trackerEntry("Issues", "all-issues"),
  "issue-details": trackerEntry("Issue details", "all-issues", { openLeadIssue: true }),
  "issues-inbox": trackerEntry("Inbox", "inbox"),
  "issues-triage": trackerEntry("Triage", "triage"),
  "issues-views": trackerEntry("Views", "views"),
  "issues-members": trackerEntry("Members", "members"),
  "issues-settings": trackerEntry("Tracker settings", "settings"),
  "issues-cycles": trackerEntry("Cycles", "cycles"),
  "issues-divisions": trackerEntry("Divisions", "divisions"),
  "issues-initiatives": trackerEntry("Initiatives", "initiatives"),
  grounding: fullBleedEntry("Grounding", () => <GroundingScreen />),
  planning: fullBleedEntry("Planning", () => <PlanningScreen />),
  projections: screenEntry("Projections", () => <ProjectionsScreen />),
  milestones: screenEntry("Milestones", () => <MilestonesScreen />),
  goals: screenEntry("Goals", () => <GoalsScreen />),
  objectives: screenEntry("Objectives", () => <ObjectivesScreen />),
  reporting: screenEntry("Reporting", () => <ReportingScreen />),
  assets: screenEntry("Assets", () => <AssetsScreen />),
  logs: screenEntry("Logs", () => <LogsScreen />),
  team: screenEntry("Team", () => <TeamScreen />),
  "resource-allocation": screenEntry("Resource Allocation", () => <ResourceAllocationScreen />),
  vault: screenEntry("Vault", () => <VaultScreen />),
  security: screenEntry("Security", () => <SecurityScreen />),
  "settings-general": settingsEntry("General"),
  // Navigation writes to the per-user sidebar preferences, which only exist under this provider.
  "settings-navigation": screenEntry("Navigation settings", () => (
    <NavVisibilityProvider>
      <SettingsScreen activeSettingsTab="Navigation" />
    </NavVisibilityProvider>
  )),
  "settings-add-ons": settingsEntry("Add-ons"),
  "settings-usage": settingsEntry("Usage"),
  "system-architecture": fullBleedEntry("System Architecture", () => <SystemArchitectureScreen />),
  "budget-tracker": screenEntry("Budget Tracker", () => <BudgetTrackerScreen />),
};

// One Flow component in the demo session, with nothing around it to navigate away to.
export function FlowComponentEmbed({ component }) {
  const entry = COMPONENTS[component];
  if (!entry) return null;

  return (
    <PlaygroundSession>
      <div
        className={`h-full w-full overflow-hidden font-sans text-foreground selection:bg-surface-strong ${
          FLOATING_PLAYGROUND_COMPONENT_IDS.includes(component) ? "" : "bg-background"
        }`}
      >
        <ScreenErrorBoundary
          title={entry.title}
          hint="Open the workspace to see this one with your own data."
        >
          {entry.render()}
        </ScreenErrorBoundary>
      </div>
    </PlaygroundSession>
  );
}

export default FlowComponentEmbed;
