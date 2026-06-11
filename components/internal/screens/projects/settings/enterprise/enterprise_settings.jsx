"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Building2,
  ChevronRight,
  Database,
  KeyRound,
  Network,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

function ToggleRow({ label, description, checked, onCheckedChange, badge }) {
  return (
    <div className="flex items-center justify-between border-b border-border px-5 py-3.5 last:border-0">
      <div className="pr-4">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-foreground">{label}</span>
          {badge ? (
            <Badge
              className={cn(
                "h-4 px-1.5 text-[9px]",
                badge.variant === "green"
                  ? "border-green-500/20 bg-green-500/10 text-green-400"
                  : "border-border-strong bg-surface-hover text-muted-foreground",
              )}
            >
              {badge.text}
            </Badge>
          ) : null}
        </div>
        {description ? (
          <p className="mt-0.5 text-[12px] text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
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

function StatCard({ icon: Icon, label, helper }) {
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
      <div className="text-xl font-semibold text-foreground">0</div>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{helper}</p>
    </div>
  );
}

export function EnterpriseSettingsScreen() {
  const [ssoEnabled, setSsoEnabled] = useState(false);
  const [scimProvisioning, setScimProvisioning] = useState(false);
  const [dataRetention, setDataRetention] = useState(false);
  const [encryptionAtRest, setEncryptionAtRest] = useState(false);
  const [fieldEncryption, setFieldEncryption] = useState(false);
  const [ipWhitelist, setIpWhitelist] = useState(false);
  const [auditTrail, setAuditTrail] = useState(false);
  const [disablePublicApi, setDisablePublicApi] = useState(false);

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
              Enterprise plan and governance details will appear here after backend data is connected.
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

        <Card className="overflow-hidden rounded-xl border-border bg-surface-subtle text-foreground shadow-sm">
          <div className="-my-6">
            <ToggleRow
              label="Single Sign-On (SSO)"
              description="Require SSO authentication for all project members"
              checked={ssoEnabled}
              onCheckedChange={setSsoEnabled}
              badge={
                ssoEnabled
                  ? { text: "ACTIVE", variant: "green" }
                  : { text: "DISABLED", variant: "default" }
              }
            />
            <ToggleRow
              label="SCIM User Provisioning"
              description="Automatically sync users from your identity provider"
              checked={scimProvisioning}
              onCheckedChange={setScimProvisioning}
            />
          </div>
        </Card>

        <EmptyPanel
          title="No SSO providers configured"
          description="Identity provider data will appear here after backend fetching is connected."
        />
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-medium text-foreground">Security Policies</h3>
          <p className="text-sm text-muted-foreground">
            Encryption, access rules, and data protection settings.
          </p>
        </div>

        <Card className="overflow-hidden rounded-xl border-border bg-surface-subtle text-foreground shadow-sm">
          <div className="-my-6">
            <ToggleRow
              label="Encryption at Rest"
              description="Enable encryption for stored data"
              checked={encryptionAtRest}
              onCheckedChange={setEncryptionAtRest}
              badge={encryptionAtRest ? { text: "ACTIVE", variant: "green" } : undefined}
            />
            <ToggleRow
              label="Field-Level Encryption"
              description="Encrypt sensitive fields with separate keys"
              checked={fieldEncryption}
              onCheckedChange={setFieldEncryption}
            />
            <ToggleRow
              label="IP Whitelist"
              description="Restrict API access to approved IP ranges"
              checked={ipWhitelist}
              onCheckedChange={setIpWhitelist}
            />
            <ToggleRow
              label="Audit Trail"
              description="Log data access and mutations for compliance"
              checked={auditTrail}
              onCheckedChange={setAuditTrail}
              badge={auditTrail ? { text: "ACTIVE", variant: "green" } : undefined}
            />
            <ToggleRow
              label="Data Retention Policy"
              description="Automatically archive or purge data per compliance rules"
              checked={dataRetention}
              onCheckedChange={setDataRetention}
            />
            <ToggleRow
              label="Disable Public API"
              description="Block all external API access to this project"
              checked={disablePublicApi}
              onCheckedChange={setDisablePublicApi}
            />
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard icon={KeyRound} label="Encryption Keys" helper="No key data" />
          <StatCard icon={Network} label="Whitelisted IPs" helper="No IP data" />
          <StatCard icon={Database} label="Retention Period" helper="No retention data" />
          <StatCard icon={Shield} label="Key Rotation" helper="No rotation data" />
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
            <div className="px-5 py-8 text-center">
              <p className="text-sm font-medium text-foreground">No audit events yet</p>
              <p className="mt-1 text-xs text-text-secondary">
                Security and access events will appear here after backend data is connected.
              </p>
            </div>
            <div className="flex items-center justify-between bg-background/50 px-5 py-3">
              <span className="text-[12px] text-muted-foreground">Showing 0 events</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[12px] text-muted-foreground hover:bg-surface-hover hover:text-foreground"
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
