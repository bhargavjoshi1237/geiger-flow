// Shared option/label maps for the Project Integrations feature.
// Providers/statuses mirror the `flow.project_integrations` columns.

export const INTEGRATION_PROVIDERS = [
  { value: "github", label: "GitHub" },
  { value: "gitlab", label: "GitLab" },
  { value: "bitbucket", label: "Bitbucket" },
  { value: "ci", label: "CI Provider" },
  { value: "slack", label: "Slack" },
  { value: "other", label: "Other" },
];

export const INTEGRATION_STATUSES = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "error", label: "Error" },
];

export const DEFAULT_INTEGRATION_PROVIDER = "github";
export const DEFAULT_INTEGRATION_STATUS = "active";

export const INTEGRATION_STATUS_META = {
  active: { label: "Active", className: "bg-green-500/10 text-green-400 border-green-500/20" },
  paused: { label: "Paused", className: "bg-zinc-500/10 text-muted-foreground border-border-strong" },
  error: { label: "Error", className: "bg-red-500/10 text-red-400 border-red-500/20" },
};

export function getProviderLabel(provider) {
  return INTEGRATION_PROVIDERS.find((item) => item.value === provider)?.label ?? provider;
}
