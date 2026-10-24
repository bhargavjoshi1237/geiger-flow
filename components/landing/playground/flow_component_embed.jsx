"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { ClipboardList, Plus } from "lucide-react";
import { Button, LoadingArea } from "@geiger/ui";
import { EmptyState } from "@/components/internal/shared/screen_kit";
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

// Same frame as a screen inside the workspace's main area, minus the sidebar and topbar.
function ScreenFrame({ children }) {
  return (
    <main className="h-full w-full overflow-y-auto p-4 [scrollbar-width:none] md:p-8 [&::-webkit-scrollbar]:hidden">
      {children}
    </main>
  );
}

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
