// Shared lookups for the Team feature.
// Values mirror the flow.project_members columns (see migration
// 20260909194734_project_members.sql). StatusPill maps (config-only):
// { [key]: { label, variant } } fed to <StatusPill status map /> from the
// shared screen kit.

export const MEMBER_ROLES = ["admin", "member", "viewer", "manager"];
export const DEFAULT_MEMBER_ROLE = "member";

export const MEMBER_STATUSES = ["Active", "Invited"];
export const DEFAULT_MEMBER_STATUS = "Active";

// Badges are monochrome, drawn from the design-system palette (surfaces
// #1a1a1a-#2a2a2a, borders #333333/#474747, text #ffffff/#a3a3a3/#737373) via
// their semantic tokens. Rank reads as SHADE rather than hue: the more access a
// role carries, the lighter its surface and the brighter its text.
export const MEMBER_ROLE_MAP = {
  admin: {
    label: "Admin",
    variant: "neutral",
    badgeClass: "border-border-strong bg-surface-hover text-foreground",
  },
  manager: {
    label: "Manager",
    variant: "neutral",
    badgeClass: "border-border-strong bg-surface-active text-foreground",
  },
  member: {
    label: "Member",
    variant: "neutral",
    badgeClass: "border-border bg-surface-card text-muted-foreground",
  },
  viewer: {
    label: "Viewer",
    variant: "neutral",
    badgeClass: "border-border bg-surface-card text-text-secondary",
  },
};

// Scope badge ("Project"), the quietest thing in the row — it is the same for
// every member, so it should not compete with the role.
export const MEMBER_SCOPE_BADGE_CLASS =
  "border-border bg-surface-card text-text-secondary";

// Status keeps its meaning through dot brightness instead of colour: a live
// member gets a full-strength dot, a pending invite a dimmed one.
export const MEMBER_STATUS_MAP = {
  Active: {
    label: "Active",
    variant: "neutral",
    badgeClass: "border-border-strong bg-surface-active text-foreground",
    dotClass: "bg-foreground",
  },
  Invited: {
    label: "Invited",
    variant: "neutral",
    badgeClass: "border-border bg-surface-card text-text-secondary",
    dotClass: "bg-text-secondary",
  },
};

export const ROLE_FILTER_OPTIONS = [
  { value: "all", label: "All Roles" },
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
  { value: "viewer", label: "Viewer" },
];

export function memberRoleLabel(role) {
  return MEMBER_ROLE_MAP[role]?.label || role;
}

export function memberStatusLabel(status) {
  return MEMBER_STATUS_MAP[status]?.label || status;
}
