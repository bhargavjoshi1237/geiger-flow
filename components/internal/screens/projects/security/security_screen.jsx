"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  Eye,
  Fingerprint,
  KeyRound,
  Loader2,
  Lock,
  Plus,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Wrench,
} from "lucide-react";
import { Button } from "@geiger/ui";
import { ActionMenu } from "@geiger/ui";
import { Switch } from "@geiger/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@geiger/ui";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import {
  DataTable,
  EmptyState,
  ScreenHeader,
  SearchInput,
  StatsBar,
  StatusPill,
  Toolbar,
} from "@/components/internal/shared/screen_kit";
import {
  ListPagination,
  usePagination,
} from "@/components/internal/shared/pagination";
import FilterDropdown from "@/components/internal/screens/projects/overview/filter_dropdown";
import { cn } from "@/lib/utils";
import { NewApiKeyDialog } from "@/components/internal/dilouges/security/new_api_key_dilouge";
import { NewVulnerabilityDialog } from "@/components/internal/dilouges/security/new_vulnerability_dilouge";
import {
  ACCESS_RESULT_PILL_MAP,
  API_KEY_STATUS_PILL_MAP,
  SEVERITY_FILTER_OPTIONS,
  SEVERITY_PILL_MAP,
  VULNERABILITY_STATUS_FILTER_OPTIONS,
  VULNERABILITY_STATUS_PILL_MAP,
  formatDate,
  formatDateTime,
} from "@/features/security/constants";
import { useProject } from "@/context/project-context";
import {
  createApiKey,
  createVulnerability,
  listAccessEvents,
  listApiKeys,
  listSecurityPolicies,
  listVulnerabilities,
  softDeleteApiKey,
  softDeleteVulnerability,
  updateApiKey,
  updateSecurityPolicy,
  updateVulnerability,
} from "@/features/security/actions";

const SECURITY_VIEWS = ["Overview", "Access", "Vulnerabilities", "Keys"];

const ENFORCEMENT_PILL_MAP = {
  monitor: { label: "Monitor", variant: "neutral" },
  enforce: { label: "Enforce", variant: "warning" },
};

// Case-insensitive StatusPill lookup — rows predate the lowercase constants.
function pillProps(value, map) {
  const key = String(value ?? "").toLowerCase();
  return { status: key, map, fallback: String(value ?? "—") };
}

function Pill({ value, map }) {
  const { status, fallback } = pillProps(value, map);
  if (!map[status]) {
    return <span className="text-xs text-muted-foreground">{fallback}</span>;
  }
  return <StatusPill status={status} map={map} />;
}

function ViewSwitch({ activeView, onChange }) {
  return (
    <div className="flex w-full items-center overflow-x-auto rounded-lg border border-border bg-surface-card p-0.5 xl:w-auto">
      {SECURITY_VIEWS.map((view) => (
        <Button
          key={view}
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange(view)}
          className={cn(
            "h-7 rounded-md px-3 text-xs",
            activeView === view
              ? "bg-surface-hover text-foreground"
              : "text-text-secondary hover:bg-transparent hover:text-muted-foreground",
          )}
        >
          {view}
        </Button>
      ))}
    </div>
  );
}

function PolicyCard({ policy, onToggle }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface-subtle p-4">
      <div className="flex min-w-0 items-start gap-3">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
            policy.isEnabled
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
              : "border-border bg-surface-card text-text-secondary",
          )}
        >
          {policy.isEnabled ? <ShieldCheck className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">{policy.name}</h3>
            <Pill value={policy.enforcement} map={ENFORCEMENT_PILL_MAP} />
          </div>
          <p className="mt-1 text-xs leading-5 text-text-secondary">
            {policy.scope || "No scope recorded"}
          </p>
        </div>
      </div>
      <Switch checked={policy.isEnabled} onCheckedChange={onToggle} />
    </div>
  );
}

export function SecurityScreen() {
  const { project } = useProject();
  const { id: projectId } = project ?? {};

  const [activeView, setActiveView] = useState("Overview");
  const [query, setQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [vulnStatusFilter, setVulnStatusFilter] = useState("all");

  const [policies, setPolicies] = useState([]);
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [accessEvents, setAccessEvents] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);

  const [vulnDialogOpen, setVulnDialogOpen] = useState(false);
  const [keyDialogOpen, setKeyDialogOpen] = useState(false);
  const [vulnDeleteTarget, setVulnDeleteTarget] = useState(null);
  const [keyDeleteTarget, setKeyDeleteTarget] = useState(null);

  useEffect(() => {
    if (!projectId) {
      void Promise.resolve().then(() => setLoading(false));
      return undefined;
    }
    let cancelled = false;
    void Promise.resolve().then(async () => {
      setLoading(true);
      const [policyRows, vulnRows, eventRows, keyRows] = await Promise.all([
        listSecurityPolicies(projectId),
        listVulnerabilities(projectId),
        listAccessEvents(projectId),
        listApiKeys(projectId),
      ]);
      if (cancelled) {
        return;
      }
      setPolicies(policyRows ?? []);
      setVulnerabilities(vulnRows ?? []);
      setAccessEvents(eventRows ?? []);
      setApiKeys(keyRows ?? []);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const filteredVulnerabilities = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return vulnerabilities.filter((item) => {
      if (severityFilter !== "all" && String(item.severity ?? "").toLowerCase() !== severityFilter) {
        return false;
      }
      if (vulnStatusFilter !== "all" && String(item.status ?? "").toLowerCase() !== vulnStatusFilter) {
        return false;
      }
      if (!normalizedQuery) return true;
      return [item.title, item.affected, item.severity, item.status]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [vulnerabilities, query, severityFilter, vulnStatusFilter]);

  const vulnPager = usePagination(filteredVulnerabilities, {
    resetKey: `${query}|${severityFilter}|${vulnStatusFilter}|${activeView}`,
  });
  const accessPager = usePagination(accessEvents, { resetKey: activeView });
  const keyPager = usePagination(apiKeys, { resetKey: activeView });

  const stats = useMemo(() => {
    const enabledPolicies = policies.filter((policy) => policy.isEnabled).length;
    const openVulns = vulnerabilities.filter(
      (item) => String(item.status ?? "").toLowerCase() !== "resolved",
    ).length;
    const denied = accessEvents.filter(
      (event) => String(event.result ?? "").toLowerCase() === "denied",
    ).length;
    const activeKeys = apiKeys.filter((key) => !key.isRevoked).length;
    return [
      { label: "Policies enabled", value: `${enabledPolicies}/${policies.length}`, footer: "Access controls currently active" },
      { label: "Open vulnerabilities", value: String(openVulns), footer: "Findings to triage" },
      { label: "Denied access", value: String(denied), footer: "Blocked actions" },
      { label: "Active keys", value: String(activeKeys), footer: "Credentials in use" },
    ];
  }, [policies, vulnerabilities, accessEvents, apiKeys]);

  const handleTogglePolicy = async (policy, next) => {
    const previous = policy.isEnabled;
    setPolicies((prev) =>
      prev.map((entry) => (entry.id === policy.id ? { ...entry, isEnabled: next } : entry)),
    );
    const updated = await updateSecurityPolicy(policy.id, { isEnabled: next });
    if (!updated) {
      setPolicies((prev) =>
        prev.map((entry) => (entry.id === policy.id ? { ...entry, isEnabled: previous } : entry)),
      );
      toast.error("Couldn't update policy");
    } else {
      setPolicies((prev) =>
        prev.map((entry) => (entry.id === policy.id ? updated : entry)),
      );
    }
  };

  const handleCreateVulnerability = async (form) => {
    const optimistic = {
      id: crypto.randomUUID(),
      title: form.title,
      severity: form.severity,
      status: form.status,
      affected: form.affected,
      detectedOn: form.detectedOn,
      resolvedAt: null,
    };
    setVulnerabilities((prev) => [optimistic, ...prev]);
    const created = await createVulnerability(projectId, { ...form, id: optimistic.id });
    if (created) {
      setVulnerabilities((prev) =>
        prev.map((entry) => (entry.id === optimistic.id ? created : entry)),
      );
      toast.success("Finding logged");
    } else {
      setVulnerabilities((prev) => prev.filter((entry) => entry.id !== optimistic.id));
      toast.error("Couldn't log finding");
    }
  };

  const handleChangeVulnerabilityStatus = async (item, status) => {
    const previous = item;
    const resolvedAt = status === "resolved" ? new Date().toISOString() : null;
    setVulnerabilities((prev) =>
      prev.map((entry) => (entry.id === item.id ? { ...entry, status, resolvedAt } : entry)),
    );
    const updated = await updateVulnerability(item.id, { status, resolvedAt });
    if (updated) {
      setVulnerabilities((prev) =>
        prev.map((entry) => (entry.id === item.id ? updated : entry)),
      );
      toast.success(`Marked ${VULNERABILITY_STATUS_PILL_MAP[status]?.label?.toLowerCase() ?? status}`);
    } else {
      setVulnerabilities((prev) =>
        prev.map((entry) => (entry.id === item.id ? previous : entry)),
      );
      toast.error("Couldn't update finding");
    }
  };

  const handleDeleteVulnerability = async (item) => {
    if (!item) {
      return;
    }
    const snapshot = item;
    setVulnerabilities((prev) => prev.filter((entry) => entry.id !== item.id));
    setVulnDeleteTarget(null);
    const ok = await softDeleteVulnerability(item.id);
    if (ok) {
      toast.success("Finding deleted");
    } else {
      setVulnerabilities((prev) => [snapshot, ...prev]);
      toast.error("Couldn't delete finding");
    }
  };

  const handleCreateKey = async (form) => {
    const optimistic = {
      id: crypto.randomUUID(),
      name: form.name,
      keyPrefix: form.keyPrefix,
      scopes: form.scopes ?? [],
      lastUsedAt: null,
      expiresAt: form.expiresAt ?? null,
      isRevoked: false,
    };
    setApiKeys((prev) => [optimistic, ...prev]);
    const created = await createApiKey(projectId, { ...form, id: optimistic.id });
    if (created) {
      setApiKeys((prev) =>
        prev.map((key) => (key.id === optimistic.id ? created : key)),
      );
      toast.success("API key created — store the secret somewhere safe now");
    } else {
      setApiKeys((prev) => prev.filter((key) => key.id !== optimistic.id));
      toast.error("Couldn't create key");
    }
  };

  const handleToggleKeyRevoked = async (apiKey) => {
    const nextRevoked = !apiKey.isRevoked;
    setApiKeys((prev) =>
      prev.map((key) =>
        key.id === apiKey.id ? { ...key, isRevoked: nextRevoked } : key,
      ),
    );
    const updated = await updateApiKey(apiKey.id, { isRevoked: nextRevoked });
    if (updated) {
      setApiKeys((prev) =>
        prev.map((key) => (key.id === apiKey.id ? updated : key)),
      );
      toast.success(nextRevoked ? "Key revoked" : "Key restored");
    } else {
      setApiKeys((prev) =>
        prev.map((key) =>
          key.id === apiKey.id ? { ...key, isRevoked: apiKey.isRevoked } : key,
        ),
      );
      toast.error("Couldn't update key");
    }
  };

  const handleDeleteKey = async (apiKey) => {
    if (!apiKey) {
      return;
    }
    const snapshot = apiKey;
    setApiKeys((prev) => prev.filter((key) => key.id !== apiKey.id));
    setKeyDeleteTarget(null);
    const ok = await softDeleteApiKey(apiKey.id);
    if (ok) {
      toast.success("Key deleted");
    } else {
      setApiKeys((prev) => [snapshot, ...prev]);
      toast.error("Couldn't delete key");
    }
  };

  const vulnColumns = [
    {
      key: "finding",
      header: "Finding",
      render: (item) => (
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-semibold text-foreground">{item.title}</span>
            <span className="font-mono text-[10px] text-text-secondary">{String(item.id ?? "").slice(0, 8)}</span>
          </div>
          <span className="truncate text-xs text-text-secondary">{item.affected || "No affected surface recorded"}</span>
        </div>
      ),
    },
    {
      key: "severity",
      header: "Severity",
      render: (item) => <Pill value={item.severity} map={SEVERITY_PILL_MAP} />,
    },
    {
      key: "status",
      header: "Status",
      render: (item) => <Pill value={item.status} map={VULNERABILITY_STATUS_PILL_MAP} />,
    },
    {
      key: "meta",
      header: "Detail",
      render: (item) => (
        <span className="text-xs text-text-secondary">
          {[item.affected, item.detectedOn ? formatDate(item.detectedOn) : null]
            .filter(Boolean)
            .join(" · ") || "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      className: "text-right",
      render: (item) => {
        const statusKey = String(item.status ?? "").toLowerCase();
        return (
          <ActionMenu
            label={`Actions for ${item.title}`}
            items={[
              statusKey === "open" && {
                icon: Wrench,
                label: "Mark triaged",
                onSelect: () => void handleChangeVulnerabilityStatus(item, "triaged"),
              },
              statusKey !== "resolved" && {
                icon: CheckCircle2,
                label: "Mark resolved",
                onSelect: () => void handleChangeVulnerabilityStatus(item, "resolved"),
              },
              statusKey === "resolved" && {
                icon: RotateCcw,
                label: "Reopen",
                onSelect: () => void handleChangeVulnerabilityStatus(item, "open"),
              },
              { separator: true },
              {
                icon: Trash2,
                label: "Delete",
                destructive: true,
                onSelect: () => setVulnDeleteTarget(item),
              },
            ]}
          />
        );
      },
    },
  ];

  const accessColumns = [
    {
      key: "event",
      header: "Event",
      render: (event) => (
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-sm font-medium text-foreground">{event.actor || "Unknown actor"}</span>
          <span className="truncate text-xs text-text-secondary">{event.action}</span>
        </div>
      ),
    },
    {
      key: "device",
      header: "Target",
      render: (event) => (
        <span className="truncate text-xs text-muted-foreground">{event.target || "-"}</span>
      ),
    },
    {
      key: "time",
      header: "Time",
      render: (event) => (
        <span className="truncate text-xs text-text-secondary">
          {event.occurredAt ? formatDateTime(event.occurredAt) : "-"}
        </span>
      ),
    },
    {
      key: "state",
      header: "Result",
      render: (event) => <Pill value={event.result} map={ACCESS_RESULT_PILL_MAP} />,
    },
  ];

  const keyColumns = [
    {
      key: "key",
      header: "Key",
      render: (apiKey) => (
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-card text-muted-foreground">
            <KeyRound className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{apiKey.name}</p>
            <p className="mt-0.5 truncate font-mono text-xs text-text-secondary">
              {apiKey.keyPrefix ? `${apiKey.keyPrefix}••••••••` : "—"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "scopes",
      header: "Scopes",
      render: (apiKey) => (
        <span className="truncate text-xs text-muted-foreground">
          {(apiKey.scopes || []).length > 0 ? apiKey.scopes.join(", ") : "no scopes"}
        </span>
      ),
    },
    {
      key: "meta",
      header: "Detail",
      render: (apiKey) => (
        <span className="text-xs text-text-secondary">
          {[
            apiKey.lastUsedAt ? `Last used ${formatDateTime(apiKey.lastUsedAt)}` : "Never used",
            apiKey.expiresAt ? `Expires ${formatDate(apiKey.expiresAt)}` : null,
          ]
            .filter(Boolean)
            .join(" · ") || "—"}
        </span>
      ),
    },
    {
      key: "state",
      header: "Status",
      render: (apiKey) => (
        <Pill
          value={apiKey.isRevoked ? "revoked" : "active"}
          map={API_KEY_STATUS_PILL_MAP}
        />
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      className: "text-right",
      render: (apiKey) => {
        const revoked = Boolean(apiKey.isRevoked);
        return (
          <ActionMenu
            label={`Actions for ${apiKey.name}`}
            items={[
              {
                icon: Eye,
                label: revoked ? "Restore key" : "Revoke key",
                onSelect: () => void handleToggleKeyRevoked(apiKey),
              },
              { separator: true },
              {
                icon: Trash2,
                label: "Delete",
                destructive: true,
                onSelect: () => setKeyDeleteTarget(apiKey),
              },
            ]}
          />
        );
      },
    },
  ];

  const showOverview = activeView === "Overview";
  const showAccess = activeView === "Access" || showOverview;
  const showVulnerabilities = activeView === "Vulnerabilities" || showOverview;
  const showKeys = activeView === "Keys" || showOverview;

  return (
    <MainScreenWrapper className="text-foreground">
      <ScreenHeader
        title="Security"
        description="Review access, fix risks, and manage project credentials."
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => setVulnDialogOpen(true)}
              className="border-border bg-transparent text-muted-foreground hover:bg-surface-active hover:text-foreground"
            >
              <ShieldAlert className="mr-2 h-4 w-4" />
              Log finding
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setKeyDialogOpen(true)}
            >
              <Lock className="mr-2 h-4 w-4" />
              Create key
            </Button>
          </>
        }
      />

      <StatsBar stats={stats} />

      <Toolbar>
        <div className="flex flex-wrap items-center gap-2">
          <ViewSwitch activeView={activeView} onChange={setActiveView} />
          {(showVulnerabilities && !showAccess) || activeView === "Vulnerabilities" ? (
            <>
              <FilterDropdown
                value={severityFilter}
                onValueChange={setSeverityFilter}
                options={SEVERITY_FILTER_OPTIONS}
                height="h-9"
              />
              <FilterDropdown
                value={vulnStatusFilter}
                onValueChange={setVulnStatusFilter}
                options={VULNERABILITY_STATUS_FILTER_OPTIONS}
                height="h-9"
              />
            </>
          ) : null}
        </div>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search security items"
        />
      </Toolbar>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-subtle px-6 py-16 text-sm text-text-secondary">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading security…
        </div>
      ) : (
        <>
          {showAccess ? (
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Access Controls</h2>
                  <p className="mt-1 text-sm text-text-secondary">
                    Policies that decide who can enter, merge, and act.
                  </p>
                </div>
              </div>
              {policies.length === 0 ? (
                <div className="rounded-xl border border-border bg-surface-subtle">
                  <EmptyState
                    icon={Shield}
                    title="No policies yet"
                    description="Access policies will appear here once configured."
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                  {policies.map((policy) => (
                    <PolicyCard
                      key={policy.id || policy.name}
                      policy={policy}
                      onToggle={(next) => void handleTogglePolicy(policy, next)}
                    />
                  ))}
                </div>
              )}

              <div>
                <h2 className="text-lg font-semibold text-foreground">Recent Access</h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Recent authentication and sensitive project actions.
                </p>
              </div>
              <div className="space-y-5">
                <DataTable
                  columns={accessColumns}
                  data={accessPager.pageItems}
                  getRowKey={(event, index) => event.id || `${event.actor}-${event.occurredAt}-${index}`}
                  empty={
                    <div className="rounded-xl border border-border bg-surface-subtle">
                      <EmptyState
                        icon={Fingerprint}
                        title="No access events yet"
                        description="Entries will appear here as they happen."
                      />
                    </div>
                  }
                />
                <ListPagination {...accessPager} itemLabel="events" />
              </div>
            </section>
          ) : null}

          {showVulnerabilities ? (
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Risk Queue</h2>
                  <p className="mt-1 text-sm text-text-secondary">
                    Actionable findings with severity, status, and resolution trail.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setVulnDialogOpen(true)}
                  className="text-text-secondary hover:bg-surface-active hover:text-foreground"
                >
                  New finding
                  <Plus className="ml-2 h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="space-y-5">
                <DataTable
                  columns={vulnColumns}
                  data={vulnPager.pageItems}
                  getRowKey={(item, index) => item.id || `${item.title}-${index}`}
                  empty={
                    <div className="rounded-xl border border-border bg-surface-subtle">
                      <EmptyState
                        icon={ShieldAlert}
                        title={vulnerabilities.length ? "No matching findings" : "No findings yet"}
                        description={
                          vulnerabilities.length
                            ? "Try clearing the search or filters."
                            : "Log the first finding to start the risk queue."
                        }
                        action={
                          !vulnerabilities.length ? (
                            <Button
                              className="bg-primary text-primary-foreground hover:bg-primary/90"
                              onClick={() => setVulnDialogOpen(true)}
                            >
                              <Plus className="h-4 w-4" /> Log finding
                            </Button>
                          ) : undefined
                        }
                      />
                    </div>
                  }
                />
                <ListPagination {...vulnPager} itemLabel="findings" />
              </div>
            </section>
          ) : null}

          {showKeys ? (
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Keys & Tokens</h2>
                  <p className="mt-1 text-sm text-text-secondary">
                    Project credentials and automation tokens that need periodic review.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setKeyDialogOpen(true)}
                  className="text-text-secondary hover:bg-surface-active hover:text-foreground"
                >
                  New key
                  <Plus className="ml-2 h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="space-y-5">
                <DataTable
                  columns={keyColumns}
                  data={keyPager.pageItems}
                  getRowKey={(apiKey, index) => apiKey.id || `${apiKey.name}-${index}`}
                  empty={
                    <div className="rounded-xl border border-border bg-surface-subtle">
                      <EmptyState
                        icon={KeyRound}
                        title="No keys yet"
                        description="Create the first key to get started."
                        action={
                          <Button
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                            onClick={() => setKeyDialogOpen(true)}
                          >
                            <Plus className="h-4 w-4" /> Create key
                          </Button>
                        }
                      />
                    </div>
                  }
                />
                <ListPagination {...keyPager} itemLabel="keys" />
              </div>
            </section>
          ) : null}
        </>
      )}

      <NewVulnerabilityDialog
        open={vulnDialogOpen}
        onOpenChange={setVulnDialogOpen}
        onCreate={handleCreateVulnerability}
      />

      <NewApiKeyDialog
        open={keyDialogOpen}
        onOpenChange={setKeyDialogOpen}
        onCreate={handleCreateKey}
      />

      <Dialog
        open={!!vulnDeleteTarget}
        onOpenChange={(open) => !open && setVulnDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-md bg-background border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground">Delete finding</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {vulnDeleteTarget?.title}
              </span>
              ? This action can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setVulnDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              className="bg-red-500/90 text-white hover:bg-red-500"
              onClick={() => void handleDeleteVulnerability(vulnDeleteTarget)}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!keyDeleteTarget}
        onOpenChange={(open) => !open && setKeyDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-md bg-background border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground">Delete key</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete the{" "}
              <span className="font-medium text-foreground">
                {keyDeleteTarget?.name}
              </span>{" "}
              key? This action can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setKeyDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              className="bg-red-500/90 text-white hover:bg-red-500"
              onClick={() => void handleDeleteKey(keyDeleteTarget)}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainScreenWrapper>
  );
}

export default SecurityScreen;
