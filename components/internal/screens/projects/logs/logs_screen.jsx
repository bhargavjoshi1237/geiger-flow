"use client";

import React, { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Download,
  Info,
  AlertTriangle,
  AlertCircle,
  Bug,
  Terminal,
  Clock,
  User,
  ArrowRight,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { cn } from "@/lib/utils";

const LEVEL_CONFIG = {
  info: {
    label: "Info",
    icon: Info,
    className: "bg-zinc-500/10 border-zinc-500/20 text-zinc-400",
  },
  warning: {
    label: "Warning",
    icon: AlertTriangle,
    className: "bg-zinc-500/10 border-zinc-500/20 text-zinc-400",
  },
  error: {
    label: "Error",
    icon: AlertCircle,
    className: "bg-zinc-500/10 border-zinc-500/20 text-zinc-400",
  },
  debug: {
    label: "Debug",
    icon: Bug,
    className: "bg-zinc-500/10 border-zinc-500/20 text-zinc-400",
  },
  system: {
    label: "System",
    icon: Terminal,
    className: "bg-zinc-500/10 border-zinc-500/20 text-zinc-400",
  },
};

const MOCK_LOGS = [
  {
    id: "log_001",
    level: "info",
    title: "Deployment completed",
    message:
      "Successfully deployed v2.4.1 to production environment. All health checks passed. Zero-downtime deployment initiated.",
    actor: "CI Pipeline",
    source: "GitHub Actions",
    timestamp: new Date(Date.now() - 1000 * 60 * 3),
    tags: ["deploy", "production", "v2.4.1"],
    metadata: {
      version: "2.4.1",
      environment: "production",
      duration: "2m 34s",
      commit: "a3f2e91",
    },
  },
  {
    id: "log_002",
    level: "warning",
    title: "High memory usage detected",
    message:
      "Worker node prod-worker-03 memory usage exceeded 85% threshold. Auto-scaling policy triggered. New instance provisioning in progress.",
    actor: "Monitoring",
    source: "Datadog",
    timestamp: new Date(Date.now() - 1000 * 60 * 12),
    tags: ["infrastructure", "memory", "auto-scale"],
    metadata: {
      currentUsage: "89.2%",
      threshold: "85%",
      node: "prod-worker-03",
    },
  },
  {
    id: "log_003",
    level: "error",
    title: "Database connection timeout",
    message:
      "Connection pool exhausted on primary replica. 23 queries queued for >30s. Fallback to read-replica initiated automatically.",
    actor: "Database",
    source: "PostgreSQL",
    timestamp: new Date(Date.now() - 1000 * 60 * 28),
    tags: ["database", "timeout", "critical"],
    metadata: {
      poolSize: "50/50",
      queuedQueries: 23,
      maxWaitTime: "34000ms",
      replica: "read-replica-02",
    },
  },
  {
    id: "log_004",
    level: "info",
    title: "New member joined",
    message:
      'Sarah Johnson accepted the invitation and joined the Engineering team. Role set to Developer.',
    actor: "Alex M.",
    source: "Team Management",
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    tags: ["team", "onboarding"],
    metadata: {
      member: "Sarah Johnson",
      role: "Developer",
      team: "Engineering",
    },
  },
  {
    id: "log_005",
    level: "debug",
    title: "Cache invalidation sweep",
    message:
      "Scheduled cache invalidation completed. Cleared 1,247 stale entries from Redis. Hit ratio improved from 89.1% to 94.6%.",
    actor: "Scheduler",
    source: "Redis",
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    tags: ["cache", "performance", "scheduled"],
    metadata: {
      entriesCleared: 1247,
      hitRatioBefore: "89.1%",
      hitRatioAfter: "94.6%",
    },
  },
  {
    id: "log_006",
    level: "system",
    title: "Webhook configuration updated",
    message:
      'Project webhook for " deploy-success" event updated. New endpoint: https://hooks.slack.com/services/T0X/B0X/xxx. SSL verification enabled.',
    actor: "System",
    source: "Webhooks",
    timestamp: new Date(Date.now() - 1000 * 60 * 90),
    tags: ["webhook", "configuration", "integrations"],
    metadata: {
      event: "deploy-success",
      endpoint: "https://hooks.slack.com/.../xxx",
      sslVerified: true,
    },
  },
  {
    id: "log_007",
    level: "error",
    title: "API rate limit exceeded",
    message:
      "External API provider (Stripe) returned 429 Too Many Requests. Retry policy: exponential backoff with 5s base delay. Circuit breaker at 80% threshold.",
    actor: "API Gateway",
    source: "Stripe API",
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    tags: ["api", "rate-limit", "payments"],
    metadata: {
      provider: "Stripe",
      statusCode: 429,
      retryBaseDelay: "5s",
      circuitBreakerThreshold: "80%",
    },
  },
  {
    id: "log_008",
    level: "info",
    title: "Milestone completed",
    message:
      'Milestone "Q1 Foundation" marked as completed by Mike T. All 8 tasks within this milestone are now done. On-time delivery.',
    actor: "Mike T.",
    source: "Project Management",
    timestamp: new Date(Date.now() - 1000 * 60 * 180),
    tags: ["milestone", "project", "completed"],
    metadata: {
      milestone: "Q1 Foundation",
      totalTasks: 8,
      completedTasks: 8,
      onTime: true,
    },
  },
  {
    id: "log_009",
    level: "warning",
    title: "SSL certificate expiring soon",
    message:
      'SSL certificate for api.geigerflow.com expires in 7 days. Auto-renewal via Let\'s Encrypt is configured. Manual verification recommended.',
    actor: "System",
    source: "SSL Monitor",
    timestamp: new Date(Date.now() - 1000 * 60 * 240),
    tags: ["security", "ssl", "certificate"],
    metadata: {
      domain: "api.geigerflow.com",
      expiresAt: "Apr 2, 2026",
      autoRenewal: true,
      issuer: "Let's Encrypt",
    },
  },
  {
    id: "log_010",
    level: "debug",
    title: "Background sync completed",
    message:
      "Scheduled background sync with analytics provider finished. Synced 14,230 events from the last 24 hours. No conflicts detected.",
    actor: "Scheduler",
    source: "Analytics Sync",
    timestamp: new Date(Date.now() - 1000 * 60 * 300),
    tags: ["analytics", "sync", "scheduled"],
    metadata: {
      eventsSynced: 14230,
      timeRange: "24h",
      conflicts: 0,
    },
  },
  {
    id: "log_011",
    level: "info",
    title: "Environment variable updated",
    message:
      'Production environment variable "MAX_CONNECTIONS" updated from 50 to 75 by Alex M. Change will take effect on next deploy.',
    actor: "Alex M.",
    source: "Environment Config",
    timestamp: new Date(Date.now() - 1000 * 60 * 360),
    tags: ["config", "environment", "production"],
    metadata: {
      variable: "MAX_CONNECTIONS",
      oldValue: 50,
      newValue: 75,
      scope: "production",
    },
  },
  {
    id: "log_012",
    level: "system",
    title: "Backup completed successfully",
    message:
      "Daily database backup completed. Snapshot stored in us-east-1 S3 bucket. Size: 2.4 GB. Retention policy: 30 days.",
    actor: "System",
    source: "AWS Backup",
    timestamp: new Date(Date.now() - 1000 * 60 * 480),
    tags: ["backup", "database", "aws"],
    metadata: {
      snapshotSize: "2.4 GB",
      region: "us-east-1",
      retentionDays: 30,
    },
  },
];

function formatRelativeTime(timestamp) {
  try {
    const date = new Date(timestamp);
    return isNaN(date.getTime())
      ? String(timestamp)
      : formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return String(timestamp);
  }
}

function formatExactTime(timestamp) {
  try {
    const date = new Date(timestamp);
    return isNaN(date.getTime())
      ? String(timestamp)
      : date.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });
  } catch {
    return String(timestamp);
  }
}

function LevelBadge({ level }) {
  const config = LEVEL_CONFIG[level] || LEVEL_CONFIG.info;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-semibold uppercase tracking-wider",
        config.className,
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

function MetadataRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#333333] last:border-b-0">
      <span className="text-[11px] text-[#737373] uppercase tracking-wider font-medium">
        {label}
      </span>
      <span className="text-[13px] text-[#a3a3a3] font-mono">{value}</span>
    </div>
  );
}

function LogDetailSheet({ log, open, onOpenChange }) {
  const [copied, setCopied] = useState(false);
  const config = LEVEL_CONFIG[log?.level] || LEVEL_CONFIG.info;
  const Icon = config.icon;

  const handleCopy = () => {
    if (!log) return;
    navigator.clipboard.writeText(
      JSON.stringify(log, null, 2),
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!log) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg bg-[#1a1a1a] border-l border-[#333333] p-0"
      >
        <SheetHeader className="p-6 pb-4 border-b border-[#333333] gap-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex items-center justify-center w-9 h-9 rounded-lg border",
                config.className,
              )}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-[15px] font-medium text-[#e7e7e7] leading-snug">
                {log.title}
              </SheetTitle>
              <SheetDescription className="text-[11px] text-[#737373] mt-0.5">
                {formatExactTime(log.timestamp)}
              </SheetDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <LevelBadge level={log.level} />
            {log.tags?.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-medium text-[#737373] bg-[#202020] px-2 py-0.5 rounded-md border border-[#333333]"
              >
                {tag}
              </span>
            ))}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 pb-4">
            <h3 className="text-[11px] uppercase tracking-wider text-[#737373] font-semibold mb-3">
              Description
            </h3>
            <p className="text-[13px] text-[#a3a3a3] leading-relaxed">
              {log.message}
            </p>
          </div>

          {log.metadata && (
            <div className="px-6 pb-4">
              <h3 className="text-[11px] uppercase tracking-wider text-[#737373] font-semibold mb-3">
                Metadata
              </h3>
              <div className="bg-[#202020] border border-[#333333] rounded-lg p-3 divide-y divide-[#333333]">
                {Object.entries(log.metadata).map(([key, value]) => (
                  <MetadataRow key={key} label={key} value={String(value)} />
                ))}
              </div>
            </div>
          )}

          <div className="px-6 pb-4">
            <h3 className="text-[11px] uppercase tracking-wider text-[#737373] font-semibold mb-3">
              Source
            </h3>
            <div className="bg-[#202020] border border-[#333333] rounded-lg p-3 divide-y divide-[#333333]">
              <MetadataRow label="Actor" value={log.actor} />
              <MetadataRow label="Source" value={log.source} />
              <MetadataRow label="Log ID" value={log.id} />
            </div>
          </div>

          <div className="px-6 pb-6">
            <h3 className="text-[11px] uppercase tracking-wider text-[#737373] font-semibold mb-3">
              Raw
            </h3>
            <div className="relative scrollbar-hidden">
              <pre className="bg-[#161616] border border-[#333333] rounded-lg p-4 text-[11px] text-[#737373] font-mono overflow-x-auto leading-relaxed max-h-[240px]">
                {JSON.stringify(log, null, 2)}
              </pre>
              <button
                onClick={handleCopy}
                className={cn(
                  "absolute top-2 right-2 p-1.5 rounded-md border transition-colors",
                  copied
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-[#202020] border-[#333333] text-[#737373] hover:text-[#a3a3a3] hover:border-[#474747]",
                )}
              >
                {copied ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function LogEntry({ log, onClick }) {
  const config = LEVEL_CONFIG[log.level] || LEVEL_CONFIG.info;
  const Icon = config.icon;

  return (
    <div
      onClick={() => onClick(log)}
      className={cn(
        "group flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer",
        "bg-[#202020] border-[#333333] hover:border-[#474747] hover:bg-[#242424]",
      )}
    >
      <div className="flex-shrink-0 mt-0.5">
        <div
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-lg border",
            config.className,
          )}
        >
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3 mb-1">
          <h3 className="text-[13px] font-medium text-[#e7e7e7] truncate group-hover:text-white transition-colors">
            {log.title}
          </h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[11px] text-[#737373] whitespace-nowrap">
              {formatRelativeTime(log.timestamp)}
            </span>
            <ArrowRight className="w-3 h-3 text-[#737373] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <p className="text-[12px] text-[#737373] leading-relaxed line-clamp-2 mb-2.5">
          {log.message}
        </p>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-[#737373]">
            <User className="w-3 h-3" />
            <span>{log.actor}</span>
          </div>
          <span className="text-[#333333]">·</span>
          <div className="flex items-center gap-1.5 text-[11px] text-[#737373]">
            <Clock className="w-3 h-3" />
            <span>{formatExactTime(log.timestamp)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LogsScreen() {
  const [selectedLog, setSelectedLog] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const sortedLogs = useMemo(() => {
    return [...MOCK_LOGS].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
    );
  }, []);

  const handleLogClick = (log) => {
    setSelectedLog(log);
    setSheetOpen(true);
  };

  return (
    <MainScreenWrapper>
      <div className="flex items-center justify-between border-b border-[#333333] pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#e7e7e7]">Logs</h1>
          <p className="text-[#a3a3a3] mt-1">
            View and analyze your project activity logs.
          </p>
        </div>
        <Button className="bg-white text-black hover:bg-[#e7e7e7]">
          <Download className="w-4 h-4 mr-2" />
          Export Logs
        </Button>
      </div>

      <div className="space-y-2">
        {sortedLogs.map((log) => (
          <LogEntry
            key={log.id}
            log={log}
            onClick={handleLogClick}
          />
        ))}
      </div>

      <LogDetailSheet
        log={selectedLog}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </MainScreenWrapper>
  );
}
