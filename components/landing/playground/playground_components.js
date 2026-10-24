// Components served alone on /playground/<component>, so a host page (the suite
// Help Center) can stream one interactive piece of Flow instead of the whole
// workspace. Each id maps to an element in flow_component_embed.jsx.
export const PLAYGROUND_COMPONENT_IDS = [
  "tasks",
  "add-task",
  "task-details",
  "work-queue",
  "overview",
  "issues",
  "issue-details",
  "issues-inbox",
  "issues-triage",
  "issues-views",
  "issues-members",
  "issues-settings",
  "issues-cycles",
  "issues-divisions",
  "issues-initiatives",
  "grounding",
  "planning",
  "projections",
  "milestones",
  "goals",
  "objectives",
  "reporting",
  "assets",
  "logs",
  "team",
  "resource-allocation",
  "vault",
  "security",
  "settings-general",
  "settings-navigation",
  "settings-add-ons",
  "settings-usage",
  "system-architecture",
  "budget-tracker",
];

// Components that float on the host's backdrop: the page stays transparent and dialogs open without a dimming overlay.
export const FLOATING_PLAYGROUND_COMPONENT_IDS = ["add-task"];
