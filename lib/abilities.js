// Action abilities — classified user actions that a role may be granted.
//
// Mirrors the lib/rbac.js permission pattern (string keys + a grouped catalog),
// but covers *actions* (create / edit / delete) rather than workspace views.
//
// Enforced in the database by flow.has_ability(project_id, ability)
// (see supabase/migrations/0003_abilities.sql). Use the helpers here to gate UI
// affordances so the client matches what the DB will allow.

// Stable references for use in code, e.g. ABILITIES.issues.create.
export const ABILITIES = {
  issues: {
    view: "issues.view",
    create: "issues.create",
    update: "issues.update",
    delete: "issues.delete",
    comment: "issues.comment",
  },
  tasks: {
    view: "tasks.view",
    create: "tasks.create",
    update: "tasks.update",
    delete: "tasks.delete",
    comment: "tasks.comment",
  },
  objectives: {
    view: "objectives.view",
    create: "objectives.create",
    update: "objectives.update",
    delete: "objectives.delete",
  },
  goals: {
    view: "goals.view",
    create: "goals.create",
    update: "goals.update",
    delete: "goals.delete",
  },
  milestones: {
    view: "milestones.view",
    create: "milestones.create",
    update: "milestones.update",
    delete: "milestones.delete",
  },
  project: {
    rename: "project.rename",
  },
};

// Catalog for the roles UI (same shape as rbac.js WORKSPACE_PERMISSIONS).
export const ACTION_ABILITIES = [
  { key: ABILITIES.issues.view, label: "View issues", group: "Issues" },
  { key: ABILITIES.issues.create, label: "Create issues", group: "Issues" },
  { key: ABILITIES.issues.update, label: "Edit issues", group: "Issues" },
  { key: ABILITIES.issues.delete, label: "Delete issues", group: "Issues" },
  { key: ABILITIES.issues.comment, label: "Comment on issues", group: "Issues" },
  { key: ABILITIES.tasks.view, label: "View tasks", group: "Tasks" },
  { key: ABILITIES.tasks.create, label: "Create tasks", group: "Tasks" },
  { key: ABILITIES.tasks.update, label: "Edit tasks", group: "Tasks" },
  { key: ABILITIES.tasks.delete, label: "Delete tasks", group: "Tasks" },
  { key: ABILITIES.tasks.comment, label: "Comment on tasks", group: "Tasks" },
  { key: ABILITIES.objectives.view, label: "View objectives", group: "Objectives" },
  { key: ABILITIES.objectives.create, label: "Create objectives", group: "Objectives" },
  { key: ABILITIES.objectives.update, label: "Edit objectives", group: "Objectives" },
  { key: ABILITIES.objectives.delete, label: "Delete objectives", group: "Objectives" },
  { key: ABILITIES.goals.view, label: "View goals", group: "Goals" },
  { key: ABILITIES.goals.create, label: "Create goals", group: "Goals" },
  { key: ABILITIES.goals.update, label: "Edit goals", group: "Goals" },
  { key: ABILITIES.goals.delete, label: "Delete goals", group: "Goals" },
  { key: ABILITIES.milestones.view, label: "View milestones", group: "Milestones" },
  { key: ABILITIES.milestones.create, label: "Create milestones", group: "Milestones" },
  { key: ABILITIES.milestones.update, label: "Edit milestones", group: "Milestones" },
  { key: ABILITIES.milestones.delete, label: "Delete milestones", group: "Milestones" },
  { key: ABILITIES.project.rename, label: "Rename project", group: "Project" },
];

// Modules currently open to every project member regardless of role.
// MUST stay in sync with the flow.open_module table (see migrations 0004 / 0008
// / 0009 / 0010). Remove an entry here and in the DB once its abilities are
// classified per role.
export const OPEN_MODULES = [
  "issues",
  "tasks",
  "objectives",
  "goals",
  "milestones",
];

function moduleOf(ability) {
  return String(ability || "").split(".")[0];
}

// Pure check mirroring flow.has_ability for client-side UI gating.
//   role   - the caller's resolved project role ('owner' bypasses all checks)
//   grants - ability keys granted to that role (from flow.role_ability)
export function can(ability, { role, grants = [] } = {}) {
  if (!role) {
    return false;
  }
  if (role === "owner") {
    return true;
  }
  if (OPEN_MODULES.includes(moduleOf(ability))) {
    return true;
  }
  return grants.includes(ability) || grants.includes("*");
}
