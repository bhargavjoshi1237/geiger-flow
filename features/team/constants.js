// Shared lookups for the Team feature.
// Values mirror the flow.project_members columns (see migration
// 20260909194734_project_members.sql). StatusPill maps (config-only):
// { [key]: { label, variant } } fed to <StatusPill status map /> from the
// shared screen kit.

export const MEMBER_ROLES = ["admin", "member", "viewer", "manager"];
export const DEFAULT_MEMBER_ROLE = "member";

export const MEMBER_STATUSES = ["Active", "Invited"];
export const DEFAULT_MEMBER_STATUS = "Active";

export const MEMBER_ROLE_MAP = {
  admin: { label: "Admin", variant: "success" },
  member: { label: "Member", variant: "info" },
  viewer: { label: "Viewer", variant: "neutral" },
  manager: { label: "Manager", variant: "purple" },
};

export const MEMBER_STATUS_MAP = {
  Active: { label: "Active", variant: "success" },
  Invited: { label: "Invited", variant: "warning" },
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
