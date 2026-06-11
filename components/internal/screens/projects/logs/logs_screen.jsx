"use client";

import React, { useState } from "react";
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
  Copy,
  CheckCircle2,
} from "lucide-react";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { cn } from "@/lib/utils";
import { LogEntry, LevelBadge, LEVEL_CONFIG, formatExactTime } from "./log_entry";

function MetadataRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
      <span className="text-[11px] text-text-secondary uppercase tracking-wider font-medium">
        {label}
      </span>
      <span className="text-[13px] text-muted-foreground font-mono">{value}</span>
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
        className="w-full sm:max-w-lg bg-surface-subtle border-l border-border p-0"
      >
        <SheetHeader className="p-6 pb-4 border-b border-border gap-3">
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
              <SheetTitle className="text-[15px] font-medium text-foreground leading-snug">
                {log.title}
              </SheetTitle>
              <SheetDescription className="text-[11px] text-text-secondary mt-0.5">
                {formatExactTime(log.timestamp)}
              </SheetDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <LevelBadge level={log.level} />
            {log.tags?.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-medium text-text-secondary bg-surface-card px-2 py-0.5 rounded-md border border-border"
              >
                {tag}
              </span>
            ))}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 pb-4">
            <h3 className="text-[11px] uppercase tracking-wider text-text-secondary font-semibold mb-3">
              Description
            </h3>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              {log.message}
            </p>
          </div>

          {log.metadata && (
            <div className="px-6 pb-4">
              <h3 className="text-[11px] uppercase tracking-wider text-text-secondary font-semibold mb-3">
                Metadata
              </h3>
              <div className="bg-surface-card border border-border rounded-lg p-3 divide-y divide-border">
                {Object.entries(log.metadata).map(([key, value]) => (
                  <MetadataRow key={key} label={key} value={String(value)} />
                ))}
              </div>
            </div>
          )}

          <div className="px-6 pb-4">
            <h3 className="text-[11px] uppercase tracking-wider text-text-secondary font-semibold mb-3">
              Source
            </h3>
            <div className="bg-surface-card border border-border rounded-lg p-3 divide-y divide-border">
              <MetadataRow label="Actor" value={log.actor} />
              <MetadataRow label="Source" value={log.source} />
              <MetadataRow label="Log ID" value={log.id} />
            </div>
          </div>

          <div className="px-6 pb-6">
            <h3 className="text-[11px] uppercase tracking-wider text-text-secondary font-semibold mb-3">
              Raw
            </h3>
            <div className="relative">
              <pre className="bg-background border border-border rounded-lg p-4 text-[11px] text-text-secondary font-mono overflow-x-auto leading-relaxed max-h-[240px] [&::-webkit-scrollbar]:hidden [&]:-ms-overflow-style:none [&]:scrollbar-width:none">
                {JSON.stringify(log, null, 2)}
              </pre>
              <Button
                onClick={handleCopy}
                className={cn(
                  "absolute top-2 right-2 p-1.5 rounded-md border transition-colors",
                  copied
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-surface-card border-border text-text-secondary hover:text-muted-foreground hover:border-border-strong",
                )}
              >
                {copied ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function LogsScreen() {
  const [selectedLog, setSelectedLog] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const logs = [];

  const handleLogClick = (log) => {
    setSelectedLog(log);
    setSheetOpen(true);
  };

  return (
    <MainScreenWrapper>
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Logs</h1>
          <p className="text-muted-foreground mt-1">
            View and analyze your project activity logs.
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary">
          <Download className="w-4 h-4 mr-2" />
          Export Logs
        </Button>
      </div>

      <div className="space-y-2">
        {logs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface-subtle p-10 text-center">
            <Terminal className="mx-auto mb-3 h-6 w-6 text-text-tertiary" />
            <p className="text-sm font-medium text-foreground">No logs yet</p>
            <p className="mt-1 text-xs text-text-secondary">
              Project logs will appear here once events are recorded.
            </p>
          </div>
        ) : (
          logs.map((log) => (
            <LogEntry
              key={log.id}
              log={log}
              onClick={handleLogClick}
            />
          ))
        )}
      </div>

      <LogDetailSheet
        log={selectedLog}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </MainScreenWrapper>
  );
}
