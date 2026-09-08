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
  risks: {
    view: "risks.view",
    create: "risks.create",
    update: "risks.update",
    delete: "risks.delete",
  },
  decisions: {
    view: "decisions.view",
    create: "decisions.create",
    update: "decisions.update",
    delete: "decisions.delete",
  },
  time: {
    view: "time.view",
    create: "time.create",
    update: "time.update",
    delete: "time.delete",
  },
  vault: {
    view: "vault.view",
    create: "vault.create",
    update: "vault.update",
    delete: "vault.delete",
  },
  external_links: {
    view: "external_links.view",
    create: "external_links.create",
    update: "external_links.update",
    delete: "external_links.delete",
  },
  grounding: {
    view: "grounding.view",
    create: "grounding.create",
    update: "grounding.update",
    delete: "grounding.delete",
  },
  projections: {
    view: "projections.view",
    create: "projections.create",
    update: "projections.update",
    delete: "projections.delete",
  },
  resources: {
    view: "resources.view",
    create: "resources.create",
    update: "resources.update",
    delete: "resources.delete",
  },
  security: {
    view: "security.view",
    create: "security.create",
    update: "security.update",
    delete: "security.delete",
  },
  activity: {
    view: "activity.view",
    create: "activity.create",
    delete: "activity.delete",
  },
  assets: {
    view: "assets.view",
    create: "assets.create",
    update: "assets.update",
    delete: "assets.delete",
  },
  planning: {
    view: "planning.view",
    update: "planning.update",
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
  { key: ABILITIES.risks.view, label: "View risks", group: "Risks" },
  { key: ABILITIES.risks.create, label: "Create risks", group: "Risks" },
  { key: ABILITIES.risks.update, label: "Edit risks", group: "Risks" },
  { key: ABILITIES.risks.delete, label: "Delete risks", group: "Risks" },
  { key: ABILITIES.decisions.view, label: "View decisions", group: "Decisions" },
  { key: ABILITIES.decisions.create, label: "Create decisions", group: "Decisions" },
  { key: ABILITIES.decisions.update, label: "Edit decisions", group: "Decisions" },
  { key: ABILITIES.decisions.delete, label: "Delete decisions", group: "Decisions" },
  { key: ABILITIES.time.view, label: "View time entries", group: "Time" },
  { key: ABILITIES.time.create, label: "Log time", group: "Time" },
  { key: ABILITIES.time.update, label: "Edit time entries", group: "Time" },
  { key: ABILITIES.time.delete, label: "Delete time entries", group: "Time" },
  { key: ABILITIES.vault.view, label: "View vault secrets", group: "Vault" },
  { key: ABILITIES.vault.create, label: "Create vault secrets", group: "Vault" },
  { key: ABILITIES.vault.update, label: "Edit vault secrets", group: "Vault" },
  { key: ABILITIES.vault.delete, label: "Delete vault secrets", group: "Vault" },
  {
    key: ABILITIES.external_links.view,
    label: "View external links",
    group: "External links",
  },
  {
    key: ABILITIES.external_links.create,
    label: "Create external links",
    group: "External links",
  },
  {
    key: ABILITIES.external_links.update,
    label: "Edit external links",
    group: "External links",
  },
  {
    key: ABILITIES.external_links.delete,
    label: "Delete external links",
    group: "External links",
  },
  { key: ABILITIES.grounding.view, label: "View grounding", group: "Grounding" },
  { key: ABILITIES.grounding.create, label: "Create channels", group: "Grounding" },
  { key: ABILITIES.grounding.update, label: "Edit grounding content", group: "Grounding" },
  { key: ABILITIES.grounding.delete, label: "Delete grounding content", group: "Grounding" },
  { key: ABILITIES.projections.view, label: "View projections", group: "Projections" },
  { key: ABILITIES.projections.create, label: "Create projections", group: "Projections" },
  { key: ABILITIES.projections.update, label: "Edit projections", group: "Projections" },
  { key: ABILITIES.projections.delete, label: "Delete projections", group: "Projections" },
  { key: ABILITIES.resources.view, label: "View resource allocation", group: "Resources" },
  { key: ABILITIES.resources.create, label: "Create allocations & requests", group: "Resources" },
  { key: ABILITIES.resources.update, label: "Edit allocations & requests", group: "Resources" },
  { key: ABILITIES.resources.delete, label: "Delete allocations & requests", group: "Resources" },
  { key: ABILITIES.security.view, label: "View security", group: "Security" },
  { key: ABILITIES.security.create, label: "Create security items & keys", group: "Security" },
  { key: ABILITIES.security.update, label: "Update security items & keys", group: "Security" },
  { key: ABILITIES.security.delete, label: "Delete security items & keys", group: "Security" },
  { key: ABILITIES.activity.view, label: "View activity logs", group: "Activity" },
  { key: ABILITIES.activity.create, label: "Write activity logs", group: "Activity" },
  { key: ABILITIES.activity.delete, label: "Delete activity logs", group: "Activity" },
  { key: ABILITIES.assets.view, label: "View assets", group: "Assets" },
  { key: ABILITIES.assets.create, label: "Upload assets", group: "Assets" },
  { key: ABILITIES.assets.update, label: "Edit assets", group: "Assets" },
  { key: ABILITIES.assets.delete, label: "Delete assets", group: "Assets" },
  { key: ABILITIES.planning.view, label: "View planning board", group: "Planning" },
  { key: ABILITIES.planning.update, label: "Edit planning board", group: "Planning" },
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
  "risks",
  "decisions",
  "time",
  "vault",
  "external_links",
  "grounding",
  "projections",
  "resources",
  "security",
  "activity",
  "assets",
  "planning",
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
