"use client";

import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Card,
} from "@geiger/ui";
import { Button } from "@geiger/ui";
import { Input } from "@geiger/ui";
import { Badge } from "@geiger/ui";
import { Switch } from "@geiger/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@geiger/ui";
import {
  Field,
  SectionCard,
  SettingRow,
  SettingsList,
} from "@/components/internal/shared/screen_kit";
import {
  Trash2,
  AlertTriangle,
  RotateCcw,
  Download,
  Upload,
  Clock,
  Shield,
  Zap,
  Globe,
  Key,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Check,
  ExternalLink,
  Plus,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@geiger/ui";
import { cn } from "@/lib/utils";
import { useProject } from "@/context/project-context";
import { createClient } from "@/lib/supabase/client";
import {
  defaultProjectSettings,
  getProjectSettings,
  mergeProjectSettings,
  updateProjectSettingsColumns,
} from "@/features/project_settings/actions";
import {
  DEFAULT_ADVANCED_SETTINGS,
  PROJECT_REGION_OPTIONS,
  PROJECT_VISIBILITY_OPTIONS,
} from "@/features/project_settings/constants";

function WebhookItem({ webhook, onDelete }) {
  return (
    <div className="flex items-center justify-between py-3 px-5 border-b border-border last:border-0 hover:bg-surface-subtle transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-surface-hover border border-border-strong flex items-center justify-center shrink-0">
          <Globe className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.8} />
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-foreground truncate">
            {webhook.name}
          </div>
          <div className="text-[11px] text-muted-foreground font-mono truncate">{webhook.url}</div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-4">
        <div className="hidden sm:flex items-center gap-1.5">
          {(webhook.events ?? []).map((e) => (
            <Badge
              key={e}
              className="text-[10px] h-5 px-1.5 bg-surface-hover text-muted-foreground border-border-strong hover:bg-surface-hover"
            >
              {e}
            </Badge>
          ))}
        </div>
        <Badge
          className={cn(
            "text-[10px] h-5 px-2",
            webhook.status === "active"
              ? "bg-green-500/10 text-green-400 border-green-500/20"
              : "bg-surface-hover text-muted-foreground border-border-strong"
          )}
        >
          {webhook.status}
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-text-secondary hover:bg-red-500/10 hover:text-red-300"
          onClick={() => onDelete(webhook.id)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

function EnvVarItem({ variable, onDelete }) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const isSecret = variable.secret === true;

  const handleCopy = () => {
    navigator.clipboard.writeText(variable.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between py-3 px-5 border-b border-border last:border-0 hover:bg-surface-subtle transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-surface-hover border border-border-strong flex items-center justify-center shrink-0">
          <Key className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={1.8} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-foreground font-mono">
              {variable.name}
            </span>
            {isSecret && (
              <Badge className="text-[9px] h-4 px-1.5 bg-amber-500/10 text-amber-400 border-amber-500/20">
                SECRET
              </Badge>
            )}
          </div>
          <div className="text-[11px] text-muted-foreground font-mono truncate">
            {isSecret && !visible
              ? "••••••••••••••••"
              : variable.value}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0 ml-4">
        {isSecret && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-muted-foreground hover:bg-surface-hover"
            onClick={() => setVisible(!visible)}
          >
            {visible ? (
              <EyeOff className="w-3.5 h-3.5" />
            ) : (
              <Eye className="w-3.5 h-3.5" />
            )}
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-muted-foreground hover:bg-surface-hover"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-primary" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-text-secondary hover:bg-red-500/10 hover:text-red-300"
          onClick={() => onDelete(variable.id)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

const WEBHOOK_DRAFT = { name: "", url: "", events: "" };
const VARIABLE_DRAFT = { name: "", value: "", secret: true };

export function AdvancedSettingsScreen() {
  const { project } = useProject();
  const projectId = project?.id ?? null;
  const router = useRouter();
  const importInputRef = useRef(null);

  const [advanced, setAdvanced] = useState({ ...DEFAULT_ADVANCED_SETTINGS });
  const [visibility, setVisibility] = useState("private");
  const [region, setRegion] = useState("us-east-1");
  const [webhooks, setWebhooks] = useState([]);
  const [variables, setVariables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [webhookOpen, setWebhookOpen] = useState(false);
  const [webhookDraft, setWebhookDraft] = useState(WEBHOOK_DRAFT);
  const [variableOpen, setVariableOpen] = useState(false);
  const [variableDraft, setVariableDraft] = useState(VARIABLE_DRAFT);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  const fetchSettings = async () => {
    if (!projectId) {
      const defaults = defaultProjectSettings(null);
      setAdvanced(defaults.advanced);
      setVisibility(defaults.visibility);
      setRegion(defaults.region);
      setWebhooks([]);
      setVariables([]);
      setLoading(false);
      return;
    }
    const settings = await getProjectSettings(projectId);
    const resolved = settings ?? defaultProjectSettings(projectId);
    setAdvanced(resolved.advanced);
    setVisibility(resolved.visibility);
    setRegion(resolved.region);
    setWebhooks(resolved.webhooks);
    setVariables(resolved.variables);
    setLoading(false);
  };

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) {
        return undefined;
      }
      setLoading(true);
      return fetchSettings();
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const persistAdvanced = async (next) => {
    setAdvanced(next);
    if (!projectId) return;
    const saved = await mergeProjectSettings(projectId, { advanced: next });
    if (saved) {
      setAdvanced(saved.advanced);
    } else {
      toast.error("Couldn't save the setting.");
      void fetchSettings();
    }
  };

  const handleToggle = (key) => (checked) => {
    void persistAdvanced({ ...advanced, [key]: Boolean(checked) });
  };

  const handleVisibilityChange = async (value) => {
    const previous = visibility;
    setVisibility(value);
    if (!projectId) return;
    const saved = await updateProjectSettingsColumns(projectId, { visibility: value });
    if (saved) {
      setVisibility(saved.visibility);
      toast.success("Project visibility updated.");
    } else {
      setVisibility(previous);
      toast.error("Couldn't update visibility.");
    }
  };

  const handleRegionChange = async (value) => {
    const previous = region;
    setRegion(value);
    if (!projectId) return;
    const saved = await updateProjectSettingsColumns(projectId, { region: value });
    if (saved) {
      setRegion(saved.region);
      toast.success("Project region updated.");
    } else {
      setRegion(previous);
      toast.error("Couldn't update the region.");
    }
  };

  const persistWebhooks = async (next) => {
    setWebhooks(next);
    if (!projectId) return true;
    const saved = await mergeProjectSettings(projectId, { webhooks: next });
    if (saved) {
      setWebhooks(saved.webhooks);
      return true;
    }
    toast.error("Couldn't save webhooks.");
    void fetchSettings();
    return false;
  };

  const persistVariables = async (next) => {
    setVariables(next);
    if (!projectId) return true;
    const saved = await mergeProjectSettings(projectId, { variables: next });
    if (saved) {
      setVariables(saved.variables);
      return true;
    }
    toast.error("Couldn't save variables.");
    void fetchSettings();
    return false;
  };

  const handleAddWebhook = async () => {
    const name = webhookDraft.name.trim();
    const url = webhookDraft.url.trim();
    if (!name || !url) return;
    const entry = {
      id: crypto.randomUUID(),
      name,
      url,
      events: webhookDraft.events
        .split(",")
        .map((event) => event.trim())
        .filter(Boolean),
      status: "active",
      lastTriggered: "Never",
    };
    const ok = await persistWebhooks([entry, ...webhooks]);
    if (ok) {
      setWebhookDraft(WEBHOOK_DRAFT);
      setWebhookOpen(false);
      toast.success("Webhook added.");
    }
  };

  const handleDeleteWebhook = async (id) => {
    const previous = webhooks;
    const ok = await persistWebhooks(webhooks.filter((webhook) => webhook.id !== id));
    if (ok) {
      toast.success("Webhook removed.");
    } else {
      setWebhooks(previous);
    }
  };

  const handleAddVariable = async () => {
    const name = variableDraft.name.trim();
    if (!name) return;
    const entry = {
      id: crypto.randomUUID(),
      name,
      value: variableDraft.value,
      secret: variableDraft.secret,
    };
    const ok = await persistVariables([entry, ...variables]);
    if (ok) {
      setVariableDraft(VARIABLE_DRAFT);
      setVariableOpen(false);
      toast.success("Variable added.");
    }
  };

  const handleDeleteVariable = async (id) => {
    const previous = variables;
    const ok = await persistVariables(variables.filter((variable) => variable.id !== id));
    if (ok) {
      toast.success("Variable removed.");
    } else {
      setVariables(previous);
    }
  };

  const handleExport = () => {
    const snapshot = {
      projectId,
      exportedAt: new Date().toISOString(),
      visibility,
      region,
      advanced,
      webhooks,
      variables: variables.map((variable) => ({ ...variable, value: variable.secret ? "" : variable.value })),
    };
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `project-settings-${projectId ?? "export"}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Settings exported.");
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !projectId) return;
    try {
      const parsed = JSON.parse(await file.text());
      const patch = {};
      if (parsed.advanced && typeof parsed.advanced === "object") patch.advanced = parsed.advanced;
      if (Array.isArray(parsed.webhooks)) patch.webhooks = parsed.webhooks;
      if (Array.isArray(parsed.variables)) patch.variables = parsed.variables;
      if (Object.keys(patch).length === 0) {
        toast.error("No importable settings found in that file.");
        return;
      }
      const saved = await mergeProjectSettings(projectId, patch);
      if (saved) {
        setAdvanced(saved.advanced);
        setWebhooks(saved.webhooks);
        setVariables(saved.variables);
        toast.success("Settings imported.");
      } else {
        toast.error("Couldn't import settings.");
      }
    } catch {
      toast.error("Couldn't read that JSON file.");
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await fetchSettings();
    toast.success("Settings refreshed.");
  };

  const handleReset = async () => {
    if (!projectId || busy) return;
    setBusy(true);
    const columns = await updateProjectSettingsColumns(projectId, {
      visibility: "private",
      region: "us-east-1",
    });
    const merged = await mergeProjectSettings(projectId, {
      advanced: { ...DEFAULT_ADVANCED_SETTINGS },
      webhooks: [],
      variables: [],
    });
    setBusy(false);
    setConfirmReset(false);
    if (columns && merged) {
      setAdvanced(merged.advanced);
      setVisibility(columns.visibility);
      setRegion(columns.region);
      setWebhooks(merged.webhooks);
      setVariables(merged.variables);
      toast.success("Project settings reset.");
    } else {
      toast.error("Couldn't reset project settings.");
    }
  };

  const handleDeleteProject = async () => {
    if (!projectId || busy) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("projects")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", projectId);
    setBusy(false);
    setConfirmDelete(false);
    if (error) {
      console.error("[advanced-settings] delete error:", error);
      toast.error("Couldn't delete the project.");
      return;
    }
    toast.success("Project deleted.");
    router.push("/");
  };

  const readOnly = advanced.readOnly;
  const maintenanceMode = advanced.maintenanceMode;
  const auditLogging = advanced.auditLogging;
  const rateLimiting = advanced.rateLimiting;
  const ipRestriction = advanced.ipRestriction;
  const requestSigning = advanced.requestSigning;

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-medium text-foreground">
            Project Controls
          </h3>
          <p className="text-sm text-muted-foreground">
            Core project behavior and lifecycle settings.
          </p>
        </div>

        <SectionCard>
          <SettingsList>
            <SettingRow
              title="Project Visibility"
              description="Control who can discover and access this project"
              control={
                <Select value={visibility} onValueChange={handleVisibilityChange} disabled={loading}>
              <SelectTrigger className="w-[200px] bg-background border-border h-9 text-sm text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-surface-subtle border-border">
                {PROJECT_VISIBILITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
              }
            />
          <SettingRow
            title="Read-Only Mode"
            description="Temporarily prevent any writes to the project"
            control={
            <div className="flex items-center gap-2">
              <Switch checked={readOnly} onCheckedChange={handleToggle("readOnly")} disabled={loading} />
              <span
                className={cn(
                  "text-[12px] font-medium",
                  readOnly ? "text-amber-400" : "text-muted-foreground"
                )}
              >
                {readOnly ? "Enabled" : "Disabled"}
              </span>
            </div>
              }
          />
          <SettingRow
            title="Project Region"
            description="Primary deployment region for compute and data"
            control={
            <Select value={region} onValueChange={handleRegionChange} disabled={loading}>
              <SelectTrigger className="w-[200px] bg-background border-border h-9 text-sm text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-surface-subtle border-border">
                {PROJECT_REGION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
              }
          />
          <SettingRow
            title="Maintenance Mode"
            control={
            <div className="flex items-center gap-3">
              <Switch
                checked={maintenanceMode}
                onCheckedChange={handleToggle("maintenanceMode")}
                disabled={loading}
              />
              <span
                className={cn(
                  "text-[12px] font-medium",
                  maintenanceMode ? "text-amber-400" : "text-muted-foreground"
                )}
              >
                {maintenanceMode ? "Active" : "Inactive"}
              </span>
              {maintenanceMode && (
                <Badge className="text-[10px] h-5 px-2 bg-amber-500/10 text-amber-400 border-amber-500/20">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Users will see maintenance page
                </Badge>
              )}
            </div>
              }
          />
          </SettingsList>
        </SectionCard>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-medium text-foreground">
            Security
          </h3>
          <p className="text-sm text-muted-foreground">
            Security features and access controls.
          </p>
        </div>

        <SectionCard>
          <SettingsList>
            <SettingRow
              title="Audit Logging"
              description="Log all API requests, mutations, and access events"
              checked={auditLogging}
              onCheckedChange={handleToggle("auditLogging")}
            />
            <SettingRow
              title="Rate Limiting"
              description="Throttle API requests to prevent abuse (100 req/min)"
              checked={rateLimiting}
              onCheckedChange={handleToggle("rateLimiting")}
            />
            <SettingRow
              title="IP Restriction"
              description="Allow access only from whitelisted IP addresses"
              checked={ipRestriction}
              onCheckedChange={handleToggle("ipRestriction")}
            />
            <SettingRow
              title="Request Signing"
              description="Require signed requests for API mutations"
              checked={requestSigning}
              onCheckedChange={handleToggle("requestSigning")}
            />
          </SettingsList>
        </SectionCard>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface-subtle border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-surface-hover border border-border-strong text-muted-foreground flex items-center justify-center">
                <Shield className="w-4 h-4" strokeWidth={1.8} />
              </div>
              <span className="text-[13px] font-medium text-muted-foreground">
                SSL/TLS
              </span>
            </div>
            <div className="text-xl font-semibold text-foreground mb-1">
              {webhooks.length > 0 ? "Active" : "No data"}
            </div>
            <p className="text-[12px] text-muted-foreground">
              {webhooks.length > 0
                ? `${webhooks.length} webhook${webhooks.length === 1 ? "" : "s"} delivering over HTTPS`
                : "Connect a webhook to report delivery status here"}
            </p>
          </div>
          <div className="bg-surface-subtle border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-surface-hover border border-border-strong text-muted-foreground flex items-center justify-center">
                <Clock className="w-4 h-4" strokeWidth={1.8} />
              </div>
              <span className="text-[13px] font-medium text-muted-foreground">
                Session Timeout
              </span>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-xl font-semibold text-foreground">{rateLimiting ? 1 : 12}</span>
              <span className="text-sm text-muted-foreground">hours</span>
            </div>
            <p className="text-[12px] text-muted-foreground">
              Inactivity timeout for user sessions
            </p>
          </div>
          <div className="bg-surface-subtle border border-border rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-surface-hover border border-border-strong text-muted-foreground flex items-center justify-center">
                <Zap className="w-4 h-4" strokeWidth={1.8} />
              </div>
              <span className="text-[13px] font-medium text-muted-foreground">
                API Version
              </span>
            </div>
            <div className="text-xl font-semibold text-foreground mb-1">v1</div>
            <p className="text-[12px] text-muted-foreground">
              Current API version for this project
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-medium text-foreground">
            Webhooks
          </h3>
          <p className="text-sm text-muted-foreground">
            Configure outgoing webhooks for project events.
          </p>
        </div>

        <Card className="bg-surface-subtle border-border text-foreground rounded-xl overflow-hidden shadow-sm">
          <div className="-my-6">
            {webhooks.length === 0 ? (
              <div className="py-3 px-5 flex items-center justify-between bg-background/50">
                <span className="text-[12px] text-muted-foreground">No webhooks configured</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[12px] text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                  onClick={() => setWebhookOpen(true)}
                >
                  <ExternalLink className="w-3 h-3 mr-1.5" />
                  Add Webhook
                </Button>
              </div>
            ) : (
              <>
                {webhooks.map((webhook) => (
                  <WebhookItem key={webhook.id} webhook={webhook} onDelete={handleDeleteWebhook} />
                ))}
                <div className="py-3 px-5 flex items-center justify-between bg-background/50">
                  <span className="text-[12px] text-muted-foreground">
                    {webhooks.length} webhook{webhooks.length === 1 ? "" : "s"}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[12px] text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                    onClick={() => setWebhookOpen(true)}
                  >
                    <Plus className="w-3 h-3 mr-1.5" />
                    Add Webhook
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-medium text-foreground">
            Environment Variables
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage secrets and configuration for your project.
          </p>
        </div>
        <Card className="bg-surface-subtle border-border text-foreground rounded-xl overflow-hidden shadow-sm">
          <div className="-my-6">
            {variables.length === 0 ? (
              <div className="py-3 px-5 flex items-center justify-between bg-background/50">
                <span className="text-[12px] text-muted-foreground">
                  No variables configured
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[12px] text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                  onClick={() => setVariableOpen(true)}
                >
                  <ExternalLink className="w-3 h-3 mr-1.5" />
                  Add Variable
                </Button>
              </div>
            ) : (
              <>
                {variables.map((variable) => (
                  <EnvVarItem key={variable.id} variable={variable} onDelete={handleDeleteVariable} />
                ))}
                <div className="py-3 px-5 flex items-center justify-between bg-background/50">
                  <span className="text-[12px] text-muted-foreground">
                    {variables.length} variable{variables.length === 1 ? "" : "s"}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[12px] text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                    onClick={() => setVariableOpen(true)}
                  >
                    <Plus className="w-3 h-3 mr-1.5" />
                    Add Variable
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-medium text-foreground">
            Data Management
          </h3>
          <p className="text-sm text-muted-foreground">
            Import, export, and reset project data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface-subtle border border-border rounded-xl p-5 shadow-sm hover:border-border-strong transition-all duration-300">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-surface-hover border border-border-strong text-muted-foreground flex items-center justify-center">
                <Download className="w-4 h-4" strokeWidth={1.8} />
              </div>
              <span className="text-sm font-medium text-foreground">
                Export Data
              </span>
            </div>
            <p className="text-[12px] text-muted-foreground mb-4 leading-relaxed">
              Download a full snapshot of your project data as a JSON archive.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-[12px] bg-background border-border text-muted-foreground hover:text-foreground hover:bg-surface-hover"
              onClick={handleExport}
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export
            </Button>
          </div>
          <div className="bg-surface-subtle border border-border rounded-xl p-5 shadow-sm hover:border-border-strong transition-all duration-300">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-surface-hover border border-border-strong text-muted-foreground flex items-center justify-center">
                <Upload className="w-4 h-4" strokeWidth={1.8} />
              </div>
              <span className="text-sm font-medium text-foreground">
                Import Data
              </span>
            </div>
            <p className="text-[12px] text-muted-foreground mb-4 leading-relaxed">
              Upload a JSON archive to restore or migrate project data.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-[12px] bg-background border-border text-muted-foreground hover:text-foreground hover:bg-surface-hover"
              onClick={() => importInputRef.current?.click()}
            >
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              Import
            </Button>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={handleImportFile}
            />
          </div>
          <div className="bg-surface-subtle border border-border rounded-xl p-5 shadow-sm hover:border-border-strong transition-all duration-300">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-surface-hover border border-border-strong text-muted-foreground flex items-center justify-center">
                <RefreshCw className="w-4 h-4" strokeWidth={1.8} />
              </div>
              <span className="text-sm font-medium text-foreground">
                Refresh Cache
              </span>
            </div>
            <p className="text-[12px] text-muted-foreground mb-4 leading-relaxed">
              Purge all cached data and rebuild from source.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-[12px] bg-background border-border text-muted-foreground hover:text-foreground hover:bg-surface-hover"
              onClick={handleRefresh}
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-medium text-red-400">
            Danger Zone
          </h3>
          <p className="text-sm text-muted-foreground">
            Irreversible and destructive actions.
          </p>
        </div>
        <Card className="bg-surface-subtle border border-red-500/20 text-foreground rounded-xl overflow-hidden shadow-sm">
          <div className="-my-6">
            <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                <RotateCcw className="w-4 h-4" strokeWidth={1.8} />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">
                  Reset Project
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Delete all data and reset this project to its initial state.
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-[12px] bg-red-500/5 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 shrink-0"
              onClick={() => setConfirmReset(true)}
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Reset Project
            </Button>
          </div>
          <div className="border-t border-red-500/10 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                <Trash2 className="w-4 h-4" strokeWidth={1.8} />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">
                  Delete Project
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Permanently delete this project, all its data, configurations,
                  and integrations.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-[12px] bg-red-500/5 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 shrink-0"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Delete Project
            </Button>
          </div>
          </div>
        </Card>
      </div>

      <Dialog open={webhookOpen} onOpenChange={setWebhookOpen}>
        <DialogContent className="bg-background border-border text-foreground sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Plus className="h-5 w-5" />
              Add Webhook
            </DialogTitle>
            <DialogDescription className="text-text-secondary">
              Deliver project events to an HTTPS endpoint.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Field label="Name">
              <Input
                value={webhookDraft.name}
                onChange={(event) => setWebhookDraft((current) => ({ ...current, name: event.target.value }))}
                placeholder="Deploy hook"
                className="border-border bg-surface-card text-foreground"
              />
            </Field>
            <Field label="Endpoint URL">
              <Input
                value={webhookDraft.url}
                onChange={(event) => setWebhookDraft((current) => ({ ...current, url: event.target.value }))}
                placeholder="https://example.com/hooks/project"
                className="border-border bg-surface-card font-mono text-foreground"
              />
            </Field>
            <Field label="Events" hint="Separate each event with a comma.">
              <Input
                value={webhookDraft.events}
                onChange={(event) => setWebhookDraft((current) => ({ ...current, events: event.target.value }))}
                placeholder="task.created, issue.closed"
                className="border-border bg-surface-card font-mono text-foreground"
              />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="ghost" className="text-text-secondary hover:text-foreground" onClick={() => setWebhookOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary"
              onClick={handleAddWebhook}
              disabled={!webhookDraft.name.trim() || !webhookDraft.url.trim()}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Webhook
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={variableOpen} onOpenChange={setVariableOpen}>
        <DialogContent className="bg-background border-border text-foreground sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Plus className="h-5 w-5" />
              Add Variable
            </DialogTitle>
            <DialogDescription className="text-text-secondary">
              Store configuration for this project. Secret values are masked in the UI.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Field label="Name">
              <Input
                value={variableDraft.name}
                onChange={(event) => setVariableDraft((current) => ({ ...current, name: event.target.value }))}
                placeholder="API_BASE_URL"
                className="border-border bg-surface-card font-mono text-foreground"
              />
            </Field>
            <Field label="Value">
              <Input
                value={variableDraft.value}
                onChange={(event) => setVariableDraft((current) => ({ ...current, value: event.target.value }))}
                placeholder="https://api.example.com"
                className="border-border bg-surface-card font-mono text-foreground"
              />
            </Field>
            <div className="flex items-center justify-between rounded-lg border border-border bg-surface-card p-3">
              <div>
                <p className="text-sm font-medium text-foreground">Secret</p>
                <p className="mt-1 text-xs text-text-secondary">Mask the value in the UI.</p>
              </div>
              <Switch
                checked={variableDraft.secret}
                onCheckedChange={(checked) => setVariableDraft((current) => ({ ...current, secret: checked }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" className="text-text-secondary hover:text-foreground" onClick={() => setVariableOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary"
              onClick={handleAddVariable}
              disabled={!variableDraft.name.trim()}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Variable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmReset} onOpenChange={setConfirmReset}>
        <DialogContent className="bg-background border-border text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset project settings?</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Visibility, region, toggles, webhooks, and variables return to their
              defaults. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="ghost" onClick={() => setConfirmReset(false)} disabled={busy}>
              Cancel
            </Button>
            <Button
              onClick={handleReset}
              disabled={busy}
              className="bg-red-500/90 text-white hover:bg-red-500"
            >
              {busy ? "Resetting…" : "Reset settings"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="bg-background border-border text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this project?</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              “{project?.name ?? "This project"}” and its settings will be removed.
              This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="ghost" onClick={() => setConfirmDelete(false)} disabled={busy}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteProject}
              disabled={busy}
              className="bg-red-500/90 text-white hover:bg-red-500"
            >
              {busy ? "Deleting…" : "Delete project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
