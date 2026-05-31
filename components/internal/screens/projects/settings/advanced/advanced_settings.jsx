"use client";

import React, { useState } from "react";
import {
  Card,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

function SettingRow({
  label,
  description,
  children,
  bordered = true,
}) {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-center gap-4 py-4 px-6",
        bordered && "border-b border-[#2c2c2c]"
      )}
    >
      <div className="md:w-[300px] shrink-0">
        <div className="text-sm font-medium text-[#e7e7e7]">{label}</div>
        {description && (
          <p className="text-xs text-[#666] mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="flex-1 flex items-center justify-end gap-3">{children}</div>
    </div>
  );
}

function ToggleRow({ label, description, checked, onCheckedChange }) {
  return (
    <div className="flex items-center justify-between py-3.5 px-5 border-b border-[#2c2c2c] last:border-0">
      <div>
        <div className="text-[13px] font-medium text-[#e7e7e7]">{label}</div>
        {description && (
          <p className="text-[12px] text-[#666] mt-0.5">{description}</p>
        )}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function WebhookItem({ name, url, events, status, lastTriggered }) {
  return (
    <div className="flex items-center justify-between py-3 px-5 border-b border-[#2c2c2c] last:border-0 hover:bg-[#1c1c1c] transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-[#2c2c2c] border border-[#3c3c3c] flex items-center justify-center shrink-0">
          <Globe className="w-3.5 h-3.5 text-[#a3a3a3]" strokeWidth={1.8} />
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-[#e7e7e7] truncate">
            {name}
          </div>
          <div className="text-[11px] text-[#555] font-mono truncate">{url}</div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-4">
        <div className="hidden sm:flex items-center gap-1.5">
          {events.map((e) => (
            <Badge
              key={e}
              className="text-[10px] h-5 px-1.5 bg-[#2c2c2c] text-[#a3a3a3] border-[#3c3c3c] hover:bg-[#2c2c2c]"
            >
              {e}
            </Badge>
          ))}
        </div>
        <Badge
          className={cn(
            "text-[10px] h-5 px-2",
            status === "active"
              ? "bg-green-500/10 text-green-400 border-green-500/20"
              : "bg-[#2c2c2c] text-[#a3a3a3] border-[#3c3c3c]"
          )}
        >
          {status}
        </Badge>
        <span className="text-[11px] text-[#555] whitespace-nowrap">
          {lastTriggered}
        </span>
      </div>
    </div>
  );
}

function EnvVarItem({ name, value, isSecret }) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between py-3 px-5 border-b border-[#2c2c2c] last:border-0 hover:bg-[#1c1c1c] transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-[#2c2c2c] border border-[#3c3c3c] flex items-center justify-center shrink-0">
          <Key className="w-3.5 h-3.5 text-[#a3a3a3]" strokeWidth={1.8} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-[#e7e7e7] font-mono">
              {name}
            </span>
            {isSecret && (
              <Badge className="text-[9px] h-4 px-1.5 bg-amber-500/10 text-amber-400 border-amber-500/20">
                SECRET
              </Badge>
            )}
          </div>
          <div className="text-[11px] text-[#555] font-mono truncate">
            {isSecret && !visible
              ? "••••••••••••••••"
              : value}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0 ml-4">
        {isSecret && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-[#555] hover:text-[#a3a3a3] hover:bg-[#2c2c2c]"
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
          className="h-7 w-7 text-[#555] hover:text-[#a3a3a3] hover:bg-[#2c2c2c]"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-primary" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
}

export function AdvancedSettingsScreen() {
  const [readOnly, setReadOnly] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [auditLogging, setAuditLogging] = useState(false);
  const [rateLimiting, setRateLimiting] = useState(false);
  const [ipRestriction, setIpRestriction] = useState(false);
  const [requestSigning, setRequestSigning] = useState(false);

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

        <Card className="bg-[#181818] border-[#2c2c2c] text-[#e7e7e7] rounded-xl overflow-hidden shadow-sm">
       <div className="-my-6" >
           <SettingRow
            label="Project Visibility"
            description="Control who can discover and access this project"
          >
            <Select defaultValue="private">
              <SelectTrigger className="w-[200px] bg-[#121212] border-[#2c2c2c] h-9 text-sm text-[#e7e7e7]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#2c2c2c]">
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="internal">Internal</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
          <SettingRow
            label="Read-Only Mode"
            description="Temporarily prevent any writes to the project"
          >
            <div className="flex items-center gap-2">
              <Switch checked={readOnly} onCheckedChange={setReadOnly} />
              <span
                className={cn(
                  "text-[12px] font-medium",
                  readOnly ? "text-amber-400" : "text-[#555]"
                )}
              >
                {readOnly ? "Enabled" : "Disabled"}
              </span>
            </div>
          </SettingRow>
          <SettingRow
            label="Project Region"
            description="Primary deployment region for compute and data"
          >
            <Select defaultValue="us-east-1">
              <SelectTrigger className="w-[200px] bg-[#121212] border-[#2c2c2c] h-9 text-sm text-[#e7e7e7]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1a1a] border-[#2c2c2c]">
                <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                <SelectItem value="eu-west-1">EU West (Ireland)</SelectItem>
                <SelectItem value="ap-southeast-1">
                  Asia Pacific (Singapore)
                </SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
          <SettingRow label="Maintenance Mode" description={null} bordered={false}>
            <div className="flex items-center gap-3">
              <Switch
                checked={maintenanceMode}
                onCheckedChange={setMaintenanceMode}
              />
              <span
                className={cn(
                  "text-[12px] font-medium",
                  maintenanceMode ? "text-amber-400" : "text-[#555]"
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
          </SettingRow>
       </div>
        </Card>
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

        <Card className="bg-[#181818] border-[#2c2c2c] text-[#e7e7e7] rounded-xl overflow-hidden shadow-sm">
          <div className="-my-6">
            <div className=" ">
              <ToggleRow
                label="Audit Logging"
              description="Log all API requests, mutations, and access events"
              checked={auditLogging}
              onCheckedChange={setAuditLogging}
            />
            <ToggleRow
              label="Rate Limiting"
              description="Throttle API requests to prevent abuse (100 req/min)"
              checked={rateLimiting}
              onCheckedChange={setRateLimiting}
            />
            <ToggleRow
              label="IP Restriction"
              description="Allow access only from whitelisted IP addresses"
              checked={ipRestriction}
              onCheckedChange={setIpRestriction}
            />
            <ToggleRow
              label="Request Signing"
              description="Require signed requests for API mutations"
              checked={requestSigning}
              onCheckedChange={setRequestSigning}
            />
          </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#181818] border border-[#2c2c2c] rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#2c2c2c] border border-[#3c3c3c] text-[#a3a3a3] flex items-center justify-center">
                <Shield className="w-4 h-4" strokeWidth={1.8} />
              </div>
              <span className="text-[13px] font-medium text-[#a3a3a3]">
                SSL/TLS
              </span>
            </div>
            <div className="text-xl font-semibold text-[#e7e7e7] mb-1">
              No data
            </div>
            <p className="text-[12px] text-[#555]">
              Certificate status will appear after backend data is connected
            </p>
          </div>
          <div className="bg-[#181818] border border-[#2c2c2c] rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#2c2c2c] border border-[#3c3c3c] text-[#a3a3a3] flex items-center justify-center">
                <Clock className="w-4 h-4" strokeWidth={1.8} />
              </div>
              <span className="text-[13px] font-medium text-[#a3a3a3]">
                Session Timeout
              </span>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-xl font-semibold text-[#e7e7e7]">0</span>
              <span className="text-sm text-[#555]">hours</span>
            </div>
            <p className="text-[12px] text-[#555]">
              Inactivity timeout for user sessions
            </p>
          </div>
          <div className="bg-[#181818] border border-[#2c2c2c] rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#2c2c2c] border border-[#3c3c3c] text-[#a3a3a3] flex items-center justify-center">
                <Zap className="w-4 h-4" strokeWidth={1.8} />
              </div>
              <span className="text-[13px] font-medium text-[#a3a3a3]">
                API Version
              </span>
            </div>
            <div className="text-xl font-semibold text-[#e7e7e7] mb-1">No version</div>
            <p className="text-[12px] text-[#555]">
              API version data will appear after backend data is connected
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

        <Card className="bg-[#181818] border-[#2c2c2c] text-[#e7e7e7] rounded-xl overflow-hidden shadow-sm">
          <div className="-my-6">
          <div className="py-3 px-5 flex items-center justify-between bg-[#161616]/50">
            <span className="text-[12px] text-[#555]">No webhooks configured</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[12px] text-[#a3a3a3] hover:text-[#e7e7e7] hover:bg-[#2c2c2c]"
            >
              <ExternalLink className="w-3 h-3 mr-1.5" />
              Add Webhook
            </Button>
          </div>
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
        <Card className="bg-[#181818] border-[#2c2c2c] text-[#e7e7e7] rounded-xl overflow-hidden shadow-sm">
          <div className="-my-6">
          <div className="py-3 px-5 flex items-center justify-between bg-[#161616]/50">
            <span className="text-[12px] text-[#555]">
              No variables configured
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[12px] text-[#a3a3a3] hover:text-[#e7e7e7] hover:bg-[#2c2c2c]"
            >
              <ExternalLink className="w-3 h-3 mr-1.5" />
              Add Variable
            </Button>
          </div>
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
          <div className="bg-[#181818] border border-[#2c2c2c] rounded-xl p-5 shadow-sm hover:border-[#3c3c3c] transition-all duration-300">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#2c2c2c] border border-[#3c3c3c] text-[#a3a3a3] flex items-center justify-center">
                <Download className="w-4 h-4" strokeWidth={1.8} />
              </div>
              <span className="text-sm font-medium text-[#e7e7e7]">
                Export Data
              </span>
            </div>
            <p className="text-[12px] text-[#666] mb-4 leading-relaxed">
              Download a full snapshot of your project data as a JSON archive.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-[12px] bg-[#121212] border-[#2c2c2c] text-[#a3a3a3] hover:text-[#e7e7e7] hover:bg-[#2c2c2c]"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export
            </Button>
          </div>
          <div className="bg-[#181818] border border-[#2c2c2c] rounded-xl p-5 shadow-sm hover:border-[#3c3c3c] transition-all duration-300">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#2c2c2c] border border-[#3c3c3c] text-[#a3a3a3] flex items-center justify-center">
                <Upload className="w-4 h-4" strokeWidth={1.8} />
              </div>
              <span className="text-sm font-medium text-[#e7e7e7]">
                Import Data
              </span>
            </div>
            <p className="text-[12px] text-[#666] mb-4 leading-relaxed">
              Upload a JSON archive to restore or migrate project data.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-[12px] bg-[#121212] border-[#2c2c2c] text-[#a3a3a3] hover:text-[#e7e7e7] hover:bg-[#2c2c2c]"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              Import
            </Button>
          </div>
          <div className="bg-[#181818] border border-[#2c2c2c] rounded-xl p-5 shadow-sm hover:border-[#3c3c3c] transition-all duration-300">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#2c2c2c] border border-[#3c3c3c] text-[#a3a3a3] flex items-center justify-center">
                <RefreshCw className="w-4 h-4" strokeWidth={1.8} />
              </div>
              <span className="text-sm font-medium text-[#e7e7e7]">
                Refresh Cache
              </span>
            </div>
            <p className="text-[12px] text-[#666] mb-4 leading-relaxed">
              Purge all cached data and rebuild from source.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-[12px] bg-[#121212] border-[#2c2c2c] text-[#a3a3a3] hover:text-[#e7e7e7] hover:bg-[#2c2c2c]"
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
        <Card className="bg-[#181818] border border-red-500/20 text-[#e7e7e7] rounded-xl overflow-hidden shadow-sm">
          <div className="-my-6">
            <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                <RotateCcw className="w-4 h-4" strokeWidth={1.8} />
              </div>
              <div>
                <div className="text-sm font-medium text-[#e7e7e7]">
                  Reset Project
                </div>
                <p className="text-xs text-[#666] mt-0.5">
                  Delete all data and reset this project to its initial state.
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-[12px] bg-red-500/5 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 shrink-0"
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
                <div className="text-sm font-medium text-[#e7e7e7]">
                  Delete Project
                </div>
                <p className="text-xs text-[#666] mt-0.5">
                  Permanently delete this project, all its data, configurations,
                  and integrations.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-[12px] bg-red-500/5 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Delete Project
            </Button>
          </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
