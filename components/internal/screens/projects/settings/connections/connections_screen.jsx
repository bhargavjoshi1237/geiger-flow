"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Link2, Pause, Play, Plus, Trash2, Unplug } from "lucide-react";
import { Badge } from "@geiger/ui";
import { Button } from "@geiger/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@geiger/ui";
import { Input } from "@geiger/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@geiger/ui";
import {
  EmptyState,
  Field,
  SectionCard,
} from "@/components/internal/shared/screen_kit";
import { useProject } from "@/context/project-context";
import {
  createProjectIntegration,
  listProjectIntegrations,
  softDeleteProjectIntegration,
  updateProjectIntegration,
} from "@/features/project_integrations/actions";
import {
  INTEGRATION_PROVIDERS,
  INTEGRATION_STATUS_META,
  getProviderLabel,
} from "@/features/project_integrations/constants";

const DEFAULT_DRAFT = {
  provider: "github",
  name: "",
  url: "",
  events: "",
};

function StatusBadge({ status }) {
  const meta = INTEGRATION_STATUS_META[status] ?? INTEGRATION_STATUS_META.active;
  return (
    <Badge className={`h-5 px-2 text-[10px] ${meta.className}`}>
      {meta.label}
    </Badge>
  );
}

// Rendered in the page header by SettingsScreen, next to the tab title.
export function ConnectionsConnectButton({ onClick }) {
  return (
    <Button
      className="bg-primary text-primary-foreground hover:bg-primary/90"
      onClick={onClick}
    >
      <Plus className="h-4 w-4" />
      Connect
    </Button>
  );
}

export function ConnectionsScreen({ isCreateOpen = false, onCreateOpenChange }) {
  const { project } = useProject();
  const projectId = project?.id ?? null;

  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(DEFAULT_DRAFT);
  const [saving, setSaving] = useState(false);
  const dialogOpen = isCreateOpen;
  const setDialogOpen = onCreateOpenChange ?? (() => {});

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) {
        return undefined;
      }
      if (!projectId) {
        setConnections([]);
        setLoading(false);
        return undefined;
      }
      setLoading(true);
      return listProjectIntegrations(projectId).then((rows) => {
        if (!active) {
          return;
        }
        setConnections(rows ?? []);
        setLoading(false);
      });
    });
    return () => {
      active = false;
    };
  }, [projectId]);

  const handleDialogOpenChange = (open) => {
    setDialogOpen(open);
    if (!open) setDraft(DEFAULT_DRAFT);
  };

  const handleConnect = async () => {
    const name = draft.name.trim();
    if (!name || !projectId || saving) return;
    setSaving(true);
    const optimistic = {
      id: crypto.randomUUID(),
      projectId,
      provider: draft.provider,
      name,
      url: draft.url.trim(),
      status: "active",
      events: draft.events
        .split(",")
        .map((event) => event.trim())
        .filter(Boolean),
    };
    setConnections((current) => [optimistic, ...current]);
    const created = await createProjectIntegration(projectId, optimistic);
    setSaving(false);
    if (created) {
      setConnections((current) =>
        current.map((entry) => (entry.id === created.id ? created : entry)),
      );
      toast.success("Service connected.");
      handleDialogOpenChange(false);
    } else {
      setConnections((current) => current.filter((entry) => entry.id !== optimistic.id));
      toast.error("Couldn't connect the service.");
    }
  };

  const handleToggleStatus = async (entry) => {
    const nextStatus = entry.status === "active" ? "paused" : "active";
    setConnections((current) =>
      current.map((item) => (item.id === entry.id ? { ...item, status: nextStatus } : item)),
    );
    const updated = await updateProjectIntegration(entry.id, { status: nextStatus });
    if (updated) {
      setConnections((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      toast.success(nextStatus === "active" ? "Connection resumed." : "Connection paused.");
    } else {
      setConnections((current) =>
        current.map((item) => (item.id === entry.id ? entry : item)),
      );
      toast.error("Couldn't update the connection.");
    }
  };

  const handleDisconnect = async (id) => {
    const previous = connections.find((entry) => entry.id === id);
    setConnections((current) => current.filter((entry) => entry.id !== id));
    const ok = await softDeleteProjectIntegration(id);
    if (!ok) {
      if (previous) setConnections((current) => [previous, ...current]);
      toast.error("Couldn't remove the connection.");
    } else {
      toast.success("Connection removed.");
    }
  };

  return (
    <SectionCard bodyPadding={false}>
      {loading ? (
        <div className="flex items-center justify-center gap-2 px-4 py-12 text-sm text-muted-foreground">
          <Link2 className="h-4 w-4 animate-pulse" />
          Loading connections…
        </div>
      ) : connections.length === 0 ? (
        <div className="p-4">
          <div className="rounded-xl border border-dashed border-border bg-surface-subtle">
            <EmptyState
              icon={Unplug}
              title="No connections yet"
              description="Connect a repository or CI provider to start syncing activity into this project."
              action={
                <Button
                  className="mt-4 bg-primary text-primary-foreground hover:bg-primary"
                  onClick={() => setDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Connect a service
                </Button>
              }
            />
          </div>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {connections.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-card">
                  <Link2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium text-foreground">{entry.name}</p>
                    <StatusBadge status={entry.status} />
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                    <span>{getProviderLabel(entry.provider)}</span>
                    {entry.url ? (
                      <>
                        <span aria-hidden="true">•</span>
                        <span className="truncate font-mono">{entry.url}</span>
                      </>
                    ) : null}
                    {entry.events.length > 0 ? (
                      <>
                        <span aria-hidden="true">•</span>
                        <span>{entry.events.length} events</span>
                      </>
                    ) : null}
                  </div>
                  {entry.events.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {entry.events.slice(0, 4).map((event) => (
                        <span
                          key={event}
                          className="rounded-md border border-border bg-surface-card px-2 py-1 font-mono text-xs text-muted-foreground"
                        >
                          {event}
                        </span>
                      ))}
                      {entry.events.length > 4 ? (
                        <span className="rounded-md border border-border bg-surface-card px-2 py-1 text-xs text-text-secondary">
                          +{entry.events.length - 4}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-2 md:justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-border bg-surface-card text-foreground hover:bg-surface-active"
                  onClick={() => handleToggleStatus(entry)}
                >
                  {entry.status === "active" ? (
                    <Pause className="mr-1.5 h-3.5 w-3.5" />
                  ) : (
                    <Play className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  {entry.status === "active" ? "Pause" : "Resume"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-text-secondary hover:bg-red-500/10 hover:text-red-300"
                  onClick={() => handleDisconnect(entry.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="bg-background border-border text-foreground sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Plus className="h-5 w-5" />
              Connect a service
            </DialogTitle>
            <DialogDescription className="text-text-secondary">
              Wire a repository, CI provider, or other service into this project.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <Field label="Service name">
              <Input
                value={draft.name}
                onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                placeholder="Website repository"
                className="border-border bg-surface-card text-foreground"
              />
            </Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Provider">
                <Select
                  value={draft.provider}
                  onValueChange={(value) => setDraft((current) => ({ ...current, provider: value }))}
                >
                  <SelectTrigger className="w-full border-border bg-surface-card text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-surface-subtle text-foreground">
                    {INTEGRATION_PROVIDERS.map((provider) => (
                      <SelectItem key={provider.value} value={provider.value}>
                        {provider.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Repository URL" hint="Optional.">
                <Input
                  value={draft.url}
                  onChange={(event) => setDraft((current) => ({ ...current, url: event.target.value }))}
                  placeholder="https://github.com/org/repo"
                  className="border-border bg-surface-card font-mono text-foreground"
                />
              </Field>
            </div>
            <Field label="Events" hint="Separate each event with a comma.">
              <Input
                value={draft.events}
                onChange={(event) => setDraft((current) => ({ ...current, events: event.target.value }))}
                placeholder="push, pull_request"
                className="border-border bg-surface-card font-mono text-foreground"
              />
            </Field>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              className="text-text-secondary hover:text-foreground"
              onClick={() => handleDialogOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary"
              onClick={handleConnect}
              disabled={!draft.name.trim() || saving}
            >
              <Plus className="mr-2 h-4 w-4" />
              {saving ? "Connecting…" : "Connect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SectionCard>
  );
}
