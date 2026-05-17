"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useProject } from "@/context/project-context";
import {
  Building2,
  Users,
  Shield,
  FileCheck,
  Lock,
  Server,
  Globe,
  Activity,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ArrowRight,
  RefreshCw,
  Download,
  ChevronRight,
  Circle,
  FileText,
  Scale,
  Database,
  ShieldCheck,
  UserCog,
  KeyRound,
  Network,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

function ToggleRow({ label, description, checked, onCheckedChange, badge }) {
  return (
    <div className="flex items-center justify-between py-3.5 px-5 border-b border-[#2c2c2c] last:border-0">
      <div className="pr-4">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-[#e7e7e7]">{label}</span>
          {badge && (
            <Badge
              className={cn(
                "text-[9px] h-4 px-1.5",
                badge.variant === "green"
                  ? "bg-green-500/10 text-green-400 border-green-500/20"
                  : badge.variant === "amber"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : "bg-[#2c2c2c] text-[#a3a3a3] border-[#3c3c3c]"
              )}
            >
              {badge.text}
            </Badge>
          )}
        </div>
        {description && (
          <p className="text-[12px] text-[#666] mt-0.5">{description}</p>
        )}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function ComplianceItem({ icon: Icon, title, status, lastAudit, details }) {
  const isActive = status === "compliant" || status === "verified";

  return (
    <div className="flex items-start gap-4 py-4 px-5 border-b border-[#2c2c2c] last:border-0 hover:bg-[#1c1c1c] transition-colors">
      <div
        className={cn(
          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border",
          isActive
            ? "bg-green-500/10 border-green-500/20 text-green-400"
            : "bg-[#2c2c2c] border-[#3c3c3c] text-[#a3a3a3]"
        )}
      >
        <Icon className="w-4 h-4" strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-medium text-[#e7e7e7]">
            {title}
          </span>
          <Badge
            className={cn(
              "text-[9px] h-4 px-1.5",
              isActive
                ? "bg-green-500/10 text-green-400 border-green-500/20"
                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
            )}
          >
            {status}
          </Badge>
        </div>
        <p className="text-[11px] text-[#555] mt-0.5">{details}</p>
      </div>
      <div className="text-right shrink-0 ml-4">
        <div className="text-[11px] text-[#555]">Last audit</div>
        <div className="text-[12px] text-[#a3a3a3] font-medium">{lastAudit}</div>
      </div>
    </div>
  );
}

function SSOProviderCard({ name, status, domains, userCount }) {
  const isConfigured = status === "configured" || status === "active";

  return (
    <div className="bg-[#181818] border border-[#2c2c2c] rounded-xl p-5 shadow-sm hover:border-[#3c3c3c] transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center border",
            isConfigured
              ? "bg-primary/10 border-primary/20 text-primary"
              : "bg-[#2c2c2c] border-[#3c3c3c] text-[#a3a3a3]"
          )}
        >
          <KeyRound className="w-5 h-5" strokeWidth={1.8} />
        </div>
        <Badge
          className={cn(
            "text-[10px] h-5 px-2",
            isConfigured
              ? "bg-green-500/10 text-green-400 border-green-500/20"
              : "bg-[#2c2c2c] text-[#555] border-[#3c3c3c]"
          )}
        >
          {status}
        </Badge>
      </div>
      <div className="text-sm font-medium text-[#e7e7e7] mb-1">{name}</div>
      <p className="text-[11px] text-[#555] mb-3">
        {isConfigured ? domains.join(", ") : "Not configured"}
      </p>
      {isConfigured ? (
        <div className="flex items-center gap-1.5 text-[12px] text-[#a3a3a3]">
          <Users className="w-3 h-3" />
          {userCount} users linked
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="w-full h-7 text-[11px] bg-[#121212] border-[#2c2c2c] text-[#a3a3a3] hover:text-[#e7e7e7] hover:bg-[#2c2c2c]"
        >
          Configure
          <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      )}
    </div>
  );
}

function AuditLogItem({ action, user, target, time, severity }) {
  const iconMap = {
    info: (
      <Circle className="w-2 h-2 fill-[#555] text-[#555]" />
    ),
    warning: (
      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
    ),
    success: (
      <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
    ),
  };

  return (
    <div className="flex items-start gap-3 py-3 px-5 border-b border-[#2c2c2c] last:border-0 hover:bg-[#1c1c1c] transition-colors">
      <div className="mt-0.5 shrink-0">{iconMap[severity]}</div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] text-[#e7e7e7]">
          <span className="font-medium">{user}</span> {action}
        </div>
        <div className="text-[11px] text-[#555] mt-0.5 truncate">{target}</div>
      </div>
      <span className="text-[11px] text-[#555] whitespace-nowrap shrink-0 ml-4">
        {time}
      </span>
    </div>
  );
}

export function EnterpriseSettingsScreen() {
  const { project } = useProject();
  const [ssoEnabled, setSsoEnabled] = useState(true);
  const [scimProvisioning, setScimProvisioning] = useState(false);
  const [dataRetention, setDataRetention] = useState(true);
  const [encryptionAtRest, setEncryptionAtRest] = useState(true);
  const [fieldEncryption, setFieldEncryption] = useState(true);
  const [ipWhitelist, setIpWhitelist] = useState(true);
  const [auditTrail, setAuditTrail] = useState(true);
  const [disablePublicApi, setDisablePublicApi] = useState(false);

  return (
    <div className="space-y-12">
      <div className="bg-[#181818] border border-[#2c2c2c] rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
            <Building2 className="w-4 h-4" strokeWidth={1.8} />
          </div>
          <div>
            <div className="text-[14px] font-semibold text-[#e7e7e7] mb-1">
              Enterprise Plan
            </div>
            <div className="text-[13px] text-[#8b8b8b] leading-relaxed">
              Your organization is on the{" "}
              <span className="text-primary font-medium">
                Enterprise plan
              </span>
              . All governance, compliance, and security features are
              available. Contact your account manager for custom configurations.
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-medium text-foreground">
            Identity & Access
          </h3>
          <p className="text-sm text-muted-foreground">
            Single sign-on and user provisioning.
          </p>
        </div>

        <Card className="bg-[#181818] border-[#2c2c2c] text-[#e7e7e7] rounded-xl overflow-hidden shadow-sm">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SSOProviderCard
            name="SAML 2.0"
            status="active"
            domains={["geigerflow.dev"]}
            userCount={12}
          />
          <SSOProviderCard
            name="OpenID Connect"
            status="configured"
            domains={["auth.geigerflow.dev"]}
            userCount={5}
          />
          <SSOProviderCard name="LDAP / AD" status="not configured" />
        </div>
      </div>

   
      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-medium text-foreground">
            Security Policies
          </h3>
          <p className="text-sm text-muted-foreground">
            Encryption, access rules, and data protection settings.
          </p>
        </div>

        <Card className="bg-[#181818]  border-[#2c2c2c] text-[#e7e7e7] rounded-xl overflow-hidden shadow-sm">
          <div className="-my-6">
            <ToggleRow
              label="Encryption at Rest"
              description="AES-256 encryption for all stored data"
              checked={encryptionAtRest}
              onCheckedChange={setEncryptionAtRest}
              badge={
                encryptionAtRest
                  ? { text: "AES-256", variant: "green" }
                  : undefined
              }
            />
            <ToggleRow
              label="Field-Level Encryption"
              description="Encrypt sensitive fields (PII, credentials) with separate keys"
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
              description="Log all data access and mutations for compliance"
              checked={auditTrail}
              onCheckedChange={setAuditTrail}
              badge={
                auditTrail
                  ? { text: "7yr retention", variant: "green" }
                  : undefined
              }
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#181818] border border-[#2c2c2c] rounded-xl p-4 shadow-sm">
            <div className="text-[11px] text-[#666] uppercase tracking-wider font-medium mb-2">
              Encryption Keys
            </div>
            <div className="text-xl font-semibold text-[#e7e7e7]">3</div>
            <p className="text-[11px] text-[#555] mt-0.5">All active</p>
          </div>
          <div className="bg-[#181818] border border-[#2c2c2c] rounded-xl p-4 shadow-sm">
            <div className="text-[11px] text-[#666] uppercase tracking-wider font-medium mb-2">
              Whitelisted IPs
            </div>
            <div className="text-xl font-semibold text-[#e7e7e7]">8</div>
            <p className="text-[11px] text-[#555] mt-0.5">4 CIDR ranges</p>
          </div>
          <div className="bg-[#181818] border border-[#2c2c2c] rounded-xl p-4 shadow-sm">
            <div className="text-[11px] text-[#666] uppercase tracking-wider font-medium mb-2">
              Retention Period
            </div>
            <div className="text-xl font-semibold text-[#e7e7e7]">7</div>
            <p className="text-[11px] text-[#555] mt-0.5">years</p>
          </div>
          <div className="bg-[#181818] border border-[#2c2c2c] rounded-xl p-4 shadow-sm">
            <div className="text-[11px] text-[#666] uppercase tracking-wider font-medium mb-2">
              Key Rotation
            </div>
            <div className="text-xl font-semibold text-[#e7e7e7]">28</div>
            <p className="text-[11px] text-[#555] mt-0.5">days ago</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-medium text-foreground">
            Audit Log
          </h3>
          <p className="text-sm text-muted-foreground">
            Recent security and access events.
          </p>
        </div>

        <Card className="bg-[#181818] border-[#2c2c2c] text-[#e7e7e7] rounded-xl overflow-hidden shadow-sm">
         <div className="-my-6">
           <AuditLogItem
            action="enabled SSO for project"
            user="bhargavjoshi"
            target="SAML 2.0 provider configuration updated"
            time="2 hours ago"
            severity="success"
          />
          <AuditLogItem
            action="rotated encryption key"
            user="system"
            target="Encryption key #2 rotated · new key #4 active"
            time="28 days ago"
            severity="success"
          />
          <AuditLogItem
            action="added IP to whitelist"
            user="bhargavjoshi"
            target="Added 203.0.113.0/24 to IP whitelist"
            time="5 days ago"
            severity="info"
          />
          <AuditLogItem
            action="failed login attempt"
            user="unknown"
            target="Multiple failed login attempts from 198.51.100.42"
            time="1 day ago"
            severity="warning"
          />
          <AuditLogItem
            action="exported audit report"
            user="bhargavjoshi"
            target="Q1 2026 compliance audit report (PDF, 2.4 MB)"
            time="3 days ago"
            severity="info"
          />
          <AuditLogItem
            action="updated retention policy"
            user="bhargavjoshi"
            target="Data retention period changed from 5 years to 7 years"
            time="12 days ago"
            severity="info"
          />
          <div className="py-3 px-5 flex items-center justify-between bg-[#161616]/50">
            <span className="text-[12px] text-[#555]">
              Showing recent events
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[12px] text-[#a3a3a3] hover:text-[#e7e7e7] hover:bg-[#2c2c2c]"
            >
              View Full Audit Log
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
         </div>
        </Card>
      </div>

    
    </div>
  );
}
