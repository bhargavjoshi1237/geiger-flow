"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { usePathname, useRouter } from "next/navigation";
import { Badge } from "@geiger/ui";
import { Button } from "@geiger/ui";
import { Card } from "@geiger/ui";
import { Switch } from "@geiger/ui";
import {
  Building2,
  ChevronRight,
  Database,
  KeyRound,
  Network,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SectionCard,
  SettingRow,
  SettingsList,
} from "@/components/internal/shared/screen_kit";
import { useProject } from "@/context/project-context";
import {
  defaultProjectSettings,
  getProjectSettings,
  mergeProjectSettings,
} from "@/features/project_settings/actions";
import { DEFAULT_ENTERPRISE_SETTINGS } from "@/features/project_settings/constants";
import { listActivityLogs } from "@/features/activity_logs/actions";

function StatusBadge({ text, variant }) {
  return (
    <Badge
      className={cn(
        "h-4 px-1.5 text-[9px]",
        variant === "green"
          ? "border-green-500/20 bg-green-500/10 text-green-400"
          : "border-border-strong bg-surface-hover text-muted-foreground",
      )}
    >
      {text}
    </Badge>
  );
}

function EmptyPanel({ title, description }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface-subtle p-8 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-xs text-text-secondary">{description}</p>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, helper }) {
  return (
    <div className="rounded-xl border border-border bg-surface-subtle p-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-strong bg-surface-hover text-muted-foreground">
          <Icon className="h-4 w-4" strokeWidth={1.8} />
        </div>
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
      </div>
      <div className="text-xl font-semibold text-foreground">{value}</div>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{helper}</p>
    </div>
  );
}

function formatRelative(value) {
  if (!value) return "";
  const diffMs = Date.now() - new Date(value).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function EnterpriseSettingsScreen() {
  const { project } = useProject();
  const projectId = project?.id ?? null;
  const router = useRouter();
  const pathname = usePathname();

  const [enterprise, setEnterprise] = useState({ ...DEFAULT_ENTERPRISE_SETTINGS });
  const [secretCount, setSecretCount] = useState(0);
  const [auditEvents, setAuditEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) {
        return undefined;
      }
      if (!projectId) {
        setEnterprise({ ...DEFAULT_ENTERPRISE_SETTINGS });
        setSecretCount(0);
        setAuditEvents([]);
        setLoading(false);
        return undefined;
      }
      setLoading(true);
      return Promise.all([getProjectSettings(projectId), listActivityLogs(projectId)]).then(
        ([settings, logs]) => {
          if (!active) return;
          const resolved = settings ?? defaultProjectSettings(projectId);
          setEnterprise(resolved.enterprise);
          setSecretCount(resolved.variables.filter((variable) => variable.secret).length);
          setAuditEvents(logs ?? []);
          setLoading(false);
        },
      );
    });
    return () => {
      active = false;
    };
  }, [projectId]);

  const persist = async (next) => {
    setEnterprise(next);
    if (!projectId) return;
    const saved = await mergeProjectSettings(projectId, { enterprise: next });
    if (saved) {
      setEnterprise(saved.enterprise);
    } else {
      toast.error("Couldn't save the setting.");
    }
  };

  const handleToggle = (key) => (checked) => {
    void persist({ ...enterprise, [key]: Boolean(checked) });
  };

  const {
    ssoEnabled,
    scimProvisioning,
    dataRetention,
    encryptionAtRest,
    fieldEncryption,
    ipWhitelist,
    auditTrail,
    disablePublicApi,
  } = enterprise;

  const goToLogs = () => {
    if (pathname) {
      router.push(`${pathname}?${encodeURIComponent("Logs")}`, { scroll: false });
    }
  };

  return (
    <div className="space-y-12">
      <div className="rounded-2xl border border-border bg-surface-subtle p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
            <Building2 className="h-4 w-4" strokeWidth={1.8} />
          </div>
          <div>
            <div className="mb-1 text-[14px] font-semibold text-foreground">
              Enterprise Plan
            </div>
            <div className="text-[13px] leading-relaxed text-muted-foreground">
              {project?.name
                ? `Governance and compliance controls for ${project.name}.`
                : "Governance and compliance controls for this project."}{" "}
              {auditEvents.length > 0
                ? `${auditEvents.length} audit event${auditEvents.length === 1 ? "" : "s"} recorded.`
                : "Events appear below once activity is recorded."}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-medium text-foreground">Identity & Access</h3>
          <p className="text-sm text-muted-foreground">
            Single sign-on and user provisioning.
          </p>
        </div>

        <SectionCard>
          <SettingsList>
            <SettingRow
              title="Single Sign-On (SSO)"
              description="Require SSO authentication for all project members"
              control={
                <div className="flex items-center gap-2">
                  <StatusBadge
                    text={ssoEnabled ? "ACTIVE" : "DISABLED"}
                    variant={ssoEnabled ? "green" : "default"}
                  />
                  <Switch checked={ssoEnabled} onCheckedChange={handleToggle("ssoEnabled")} disabled={loading} />
                </div>
              }
            />
            <SettingRow
              title="SCIM User Provisioning"
              description="Automatically sync users from your identity provider"
              checked={scimProvisioning}
              onCheckedChange={handleToggle("scimProvisioning")}
            />
          </SettingsList>
        </SectionCard>

        {ssoEnabled ? (
          <SectionCard>
            <SettingsList>
              <SettingRow
                title="Primary identity provider"
                description="SSO is required for every member of this project"
                control={<StatusBadge text="ENFORCED" variant="green" />}
              />
            </SettingsList>
          </SectionCard>
        ) : (
          <EmptyPanel
            title="No SSO providers configured"
            description="Enable SSO to require identity-provider sign-in for this project."
          />
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-medium text-foreground">Security Policies</h3>
          <p className="text-sm text-muted-foreground">
            Encryption, access rules, and data protection settings.
          </p>
        </div>

        <SectionCard>
          <SettingsList>
            <SettingRow
              title="Encryption at Rest"
              description="Enable encryption for stored data"
              control={
                <div className="flex items-center gap-2">
                  {encryptionAtRest ? (
                    <StatusBadge text="ACTIVE" variant="green" />
                  ) : null}
                  <Switch
                    checked={encryptionAtRest}
                    onCheckedChange={handleToggle("encryptionAtRest")}
                    disabled={loading}
                  />
                </div>
              }
            />
            <SettingRow
              title="Field-Level Encryption"
              description="Encrypt sensitive fields with separate keys"
              checked={fieldEncryption}
              onCheckedChange={handleToggle("fieldEncryption")}
            />
            <SettingRow
              title="IP Whitelist"
              description="Restrict API access to approved IP ranges"
              checked={ipWhitelist}
              onCheckedChange={handleToggle("ipWhitelist")}
            />
            <SettingRow
              title="Audit Trail"
              description="Log data access and mutations for compliance"
              control={
                <div className="flex items-center gap-2">
                  {auditTrail ? (
                    <StatusBadge text="ACTIVE" variant="green" />
                  ) : null}
                  <Switch checked={auditTrail} onCheckedChange={handleToggle("auditTrail")} disabled={loading} />
                </div>
              }
            />
            <SettingRow
              title="Data Retention Policy"
              description="Automatically archive or purge data per compliance rules"
              checked={dataRetention}
              onCheckedChange={handleToggle("dataRetention")}
            />
            <SettingRow
              title="Disable Public API"
              description="Block all external API access to this project"
              checked={disablePublicApi}
              onCheckedChange={handleToggle("disablePublicApi")}
            />
          </SettingsList>
        </SectionCard>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard
            icon={KeyRound}
            label="Secrets Stored"
            value={String(secretCount)}
            helper={secretCount > 0 ? "Masked env variables" : "No secrets stored"}
          />
          <StatCard
            icon={Network}
            label="IP Whitelist"
            value={ipWhitelist ? "On" : "Off"}
            helper={ipWhitelist ? "Range enforcement active" : "Open to all IPs"}
          />
          <StatCard
            icon={Database}
            label="Retention"
            value={dataRetention ? "90d" : "Off"}
            helper={dataRetention ? "Default compliance window" : "No retention policy"}
          />
          <StatCard
            icon={Shield}
            label="Audit Events"
            value={String(auditEvents.length)}
            helper={auditTrail ? "Trail recording active" : "From project activity"}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-medium text-foreground">Audit Log</h3>
          <p className="text-sm text-muted-foreground">
            Recent security and access events.
          </p>
        </div>

        <Card className="overflow-hidden rounded-xl border-border bg-surface-subtle text-foreground shadow-sm">
          <div className="-my-6">
            {auditEvents.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm font-medium text-foreground">No audit events yet</p>
                <p className="mt-1 text-xs text-text-secondary">
                  Project activity will appear here as it is recorded.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {auditEvents.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-center justify-between gap-4 px-5 py-3">
                    <p className="min-w-0 truncate text-[13px] text-foreground">
                      {event.message}
                    </p>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {formatRelative(event.occurredAt ?? event.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between bg-background/50 px-5 py-3">
              <span className="text-[12px] text-muted-foreground">
                Showing {Math.min(auditEvents.length, 5)} of {auditEvents.length} events
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[12px] text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                onClick={goToLogs}
              >
                View Full Audit Log
                <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
