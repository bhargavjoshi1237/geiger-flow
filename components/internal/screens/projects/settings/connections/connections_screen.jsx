"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  Github,
  Rocket,
  Database,
  Cloud,
  Server,
  ExternalLink,
  RefreshCw,
  Unplug,
} from "lucide-react";

const connections = [
  {
    id: "github",
    name: "GitHub",
    status: "connected",
    description: "Repository sync and webhooks",
    detail: "Sync issues, pull requests, commits, and deployment activity from selected repositories.",
    account: "geiger-flow/geiger-flow",
    lastSync: "2 minutes ago",
    syncMode: "realtime",
    webhookUrl: "https://api.geigerflow.dev/webhooks/github",
    icon: Github,
  },
  {
    id: "vercel",
    name: "Vercel",
    status: "connected",
    description: "Deployments and preview links",
    detail: "Attach production and preview deployments to project activity, releases, and status checks.",
    account: "geiger-flow",
    lastSync: "15 minutes ago",
    syncMode: "realtime",
    webhookUrl: "https://api.geigerflow.dev/webhooks/vercel",
    icon: Rocket,
  },
  {
    id: "supabase",
    name: "Supabase",
    status: "pending",
    description: "Database, auth, and realtime",
    detail: "Connect database events, auth logs, and realtime signals once the pending authorization is approved.",
    account: "Waiting for OAuth approval",
    lastSync: "Not synced yet",
    syncMode: "hourly",
    webhookUrl: "",
    icon: Database,
  },
  {
    id: "aws",
    name: "AWS",
    status: null,
    description: "Cloud infrastructure",
    detail: "Import infrastructure events, logs, and deployment state from AWS services.",
    account: "No account connected",
    lastSync: "Never",
    syncMode: "manual",
    webhookUrl: "",
    icon: Cloud,
  },
  {
    id: "azure",
    name: "Azure",
    status: null,
    description: "Enterprise cloud services",
    detail: "Link Azure resources, identity events, and deployment metadata to this project.",
    account: "No account connected",
    lastSync: "Never",
    syncMode: "manual",
    webhookUrl: "",
    icon: Server,
  },
  {
    id: "gcp",
    name: "Google Cloud",
    status: "error",
    description: "Infrastructure and AI services",
    detail: "The last authorization attempt failed. Reconnect to resume infrastructure and service syncing.",
    account: "geiger-prod",
    lastSync: "Failed 1 hour ago",
    syncMode: "hourly",
    webhookUrl: "https://api.geigerflow.dev/webhooks/gcp",
    icon: Cloud,
  },
];

const statusMeta = {
  connected: {
    label: "Connected",
    className: "bg-green-500/10 text-green-400 border-green-500/20",
  },
  pending: {
    label: "Pending",
    className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  error: {
    label: "Needs attention",
    className: "bg-red-500/10 text-red-400 border-red-500/20",
  },
  disconnected: {
    label: "Not connected",
    className: "bg-[#2c2c2c] text-[#a3a3a3] border-[#3c3c3c]",
  },
};

function ConnectionStatus({ status }) {
  const meta = statusMeta[status || "disconnected"];

  return (
    <Badge className={cn("h-5 px-2 text-[10px] font-medium", meta.className)}>
      {meta.label}
    </Badge>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="rounded-md border border-[#2c2c2c] bg-[#161616] px-3 py-2">
      <div className="text-[11px] font-medium uppercase tracking-wide text-[#666]">
        {label}
      </div>
      <div className="mt-1 truncate text-[13px] text-[#e7e7e7]">{value}</div>
    </div>
  );
}

export function ConnectionsScreen() {
  const [connectionSettings, setConnectionSettings] = React.useState(() =>
    connections.reduce((settings, connection) => {
      settings[connection.id] = {
        enabled: connection.status === "connected",
        syncMode: connection.syncMode,
        webhookUrl: connection.webhookUrl,
        projectEvents: connection.status === "connected",
        alerts: connection.status === "error",
      };

      return settings;
    }, {})
  );

  const updateConnectionSetting = (connectionId, key, value) => {
    setConnectionSettings((current) => ({
      ...current,
      [connectionId]: {
        ...current[connectionId],
        [key]: value,
      },
    }));
  };

  return (
    <div className="my-10 w-full space-y-6">
      <Accordion
        type="multiple"
        defaultValue={["github"]}
        className="w-full overflow-hidden rounded-lg border border-border bg-card"
      >
        {connections.map((conn) => {
          const Icon = conn.icon;
          const settings = connectionSettings[conn.id];

          return (
            <AccordionItem
              key={conn.id}
              value={conn.id}
              className="border-border"
            >
              <AccordionTrigger className="px-4 py-4 hover:no-underline sm:px-5">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-background text-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">{conn.name}</p>
                      <ConnectionStatus status={conn.status} />
                    </div>
                    <p className="mt-1 text-sm font-normal text-muted-foreground">
                      {conn.description}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-5 sm:px-5">
                <div className="space-y-5 rounded-md border border-[#2c2c2c] bg-[#181818] p-4">
                  <p className="text-sm leading-6 text-[#a3a3a3]">
                    {conn.detail}
                  </p>

                  <div className="grid gap-3 md:grid-cols-3">
                    <DetailItem label="Account" value={conn.account} />
                    <DetailItem label="Last sync" value={conn.lastSync} />
                    <DetailItem
                      label="State"
                      value={statusMeta[conn.status || "disconnected"].label}
                    />
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
                    <div className="space-y-2">
                      <Label htmlFor={`${conn.id}-webhook`}>
                        Webhook endpoint
                      </Label>
                      <Input
                        id={`${conn.id}-webhook`}
                        value={settings.webhookUrl}
                        onChange={(event) =>
                          updateConnectionSetting(
                            conn.id,
                            "webhookUrl",
                            event.target.value
                          )
                        }
                        placeholder="Add webhook endpoint"
                        className="bg-[#121212] text-[#e7e7e7]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Sync mode</Label>
                      <Select
                        value={settings.syncMode}
                        onValueChange={(value) =>
                          updateConnectionSetting(conn.id, "syncMode", value)
                        }
                      >
                        <SelectTrigger className="w-full bg-[#121212] border-[#2c2c2c] text-[#e7e7e7]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#181818] border-[#2c2c2c] text-[#e7e7e7]">
                          <SelectItem value="realtime">Realtime</SelectItem>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <label className="flex items-center justify-between gap-4 rounded-md border border-[#2c2c2c] bg-[#161616] px-3 py-2">
                      <span>
                        <span className="block text-[13px] font-medium text-[#e7e7e7]">
                          Enabled
                        </span>
                        <span className="text-[12px] text-[#666]">
                          Allow this integration
                        </span>
                      </span>
                      <Switch
                        checked={settings.enabled}
                        onCheckedChange={(checked) =>
                          updateConnectionSetting(conn.id, "enabled", checked)
                        }
                      />
                    </label>

                    <label className="flex items-center justify-between gap-4 rounded-md border border-[#2c2c2c] bg-[#161616] px-3 py-2">
                      <span>
                        <span className="block text-[13px] font-medium text-[#e7e7e7]">
                          Project events
                        </span>
                        <span className="text-[12px] text-[#666]">
                          Show activity in feed
                        </span>
                      </span>
                      <Switch
                        checked={settings.projectEvents}
                        onCheckedChange={(checked) =>
                          updateConnectionSetting(
                            conn.id,
                            "projectEvents",
                            checked
                          )
                        }
                      />
                    </label>

                    <label className="flex items-center justify-between gap-4 rounded-md border border-[#2c2c2c] bg-[#161616] px-3 py-2">
                      <span>
                        <span className="block text-[13px] font-medium text-[#e7e7e7]">
                          Alerts
                        </span>
                        <span className="text-[12px] text-[#666]">
                          Notify on failures
                        </span>
                      </span>
                      <Switch
                        checked={settings.alerts}
                        onCheckedChange={(checked) =>
                          updateConnectionSetting(conn.id, "alerts", checked)
                        }
                      />
                    </label>
                  </div>

                  <div className="flex flex-col gap-2 border-t border-[#2c2c2c] pt-4 sm:flex-row sm:justify-end">
                    {conn.status === "connected" ? (
                      <>
                        <Button variant="outline" className="text-foreground">
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Sync now
                        </Button>
                        <Button variant="secondary">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Manage
                        </Button>
                        <Button variant="ghost" className="text-red-400">
                          <Unplug className="mr-2 h-4 w-4" />
                          Disconnect
                        </Button>
                      </>
                    ) : conn.status === "pending" || conn.status === "error" ? (
                      <Button variant="secondary">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Retry connection
                      </Button>
                    ) : (
                      <Button variant="default">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
