"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@geiger/ui";
import { ActionMenu } from "@geiger/ui";
import { LogoLoading } from "@geiger/ui";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@geiger/ui";
import {
  Download,
  Terminal,
  Copy,
  CheckCircle2,
  Eye,
  Trash2,
} from "lucide-react";
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
import { useProject } from "@/context/project-context";
import {
  listActivityLogs,
  deleteLog,
} from "@/features/activity_logs/actions";
import {
  ACTIVITY_LEVEL_FILTER_OPTIONS,
  DEFAULT_LEVEL_FILTER,
  LOG_LEVEL_PILL_MAP,
  formatExportDate,
} from "@/features/activity_logs/constants";
import { LevelBadge, LEVEL_CONFIG, formatExactTime } from "./log_entry";

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

// Maps an activity-log view model onto the shape LogEntry / the detail sheet
// render (title/timestamp/tags are presentation fields).
function toEntry(log) {
  return {
    id: log.id,
    level: log.level,
    source: log.source,
    actor: log.actor,
    message: log.message,
    title: log.message,
    detail: log.detail,
    metadata: log.metadata,
    tags: [log.source],
    timestamp: log.occurredAt,
  };
}

function LogDetailSheet({ log, open, onOpenChange, onDelete }) {
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

          {log.detail && Object.keys(log.detail).length > 0 && (
            <div className="px-6 pb-4">
              <h3 className="text-[11px] uppercase tracking-wider text-text-secondary font-semibold mb-3">
                Detail
              </h3>
              <pre className="bg-surface-card border border-border rounded-lg p-3 text-[11px] text-muted-foreground font-mono overflow-x-auto leading-relaxed max-h-[200px] [&::-webkit-scrollbar]:hidden [&]:-ms-overflow-style:none [&]:scrollbar-width:none">
                {JSON.stringify(log.detail, null, 2)}
              </pre>
            </div>
          )}

          {log.metadata && Object.keys(log.metadata).length > 0 && (
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

        {onDelete && (
          <div className="border-t border-border px-6 py-4 flex justify-end">
            <Button
              variant="ghost"
              onClick={() => onDelete(log)}
              className="text-red-400 hover:bg-red-500/10 hover:text-red-400 gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Log
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function LogsScreen() {
  const { project } = useProject();
  const projectId = project?.id;

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState(DEFAULT_LEVEL_FILTER);
  const [selectedLog, setSelectedLog] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (!projectId) {
      return;
    }
    let active = true;
    void Promise.resolve().then(async () => {
      setLoading(true);
      const rows = await listActivityLogs(projectId);
      if (active) {
        setLogs((rows ?? []).map(toEntry));
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [projectId]);

  // Level + free-text filter over message / source / actor.
  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return logs.filter((log) => {
      if (levelFilter !== DEFAULT_LEVEL_FILTER && log.level !== levelFilter) {
        return false;
      }
      if (!query) {
        return true;
      }
      return [log.message, log.source, log.actor]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(query));
    });
  }, [logs, search, levelFilter]);

  const pager = usePagination(filteredLogs, {
    resetKey: `${search}|${levelFilter}`,
  });

  const stats = useMemo(() => {
    const errors = logs.filter((log) => log.level === "error").length;
    const warnings = logs.filter((log) => log.level === "warning").length;
    const sources = new Set(logs.map((log) => log.source).filter(Boolean)).size;
    return [
      { label: "Total logs", value: String(logs.length), footer: `${filteredLogs.length} shown` },
      { label: "Errors", value: String(errors), footer: "Needs attention" },
      { label: "Warnings", value: String(warnings), footer: "Review soon" },
      { label: "Sources", value: String(sources), footer: "Distinct origins" },
    ];
  }, [logs, filteredLogs.length]);

  const hasFilters =
    levelFilter !== DEFAULT_LEVEL_FILTER || search.trim().length > 0;

  const handleLogClick = (log) => {
    setSelectedLog(log);
    setSheetOpen(true);
  };

  const handleCopyLog = async (log) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(log, null, 2));
      toast.success("Log copied to clipboard");
    } catch {
      toast.error("Couldn't copy log");
    }
  };

  const handleExport = () => {
    if (loading || filteredLogs.length === 0) {
      return;
    }

    const escapeCsv = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const lines = [
      ["Occurred At", "Level", "Source", "Actor", "Message", "Detail"].join(","),
      ...filteredLogs.map((log) =>
        [
          log.timestamp ?? "",
          log.level,
          log.source,
          log.actor ?? "",
          log.message,
          log.detail ? JSON.stringify(log.detail) : "",
        ]
          .map(escapeCsv)
          .join(","),
      ),
    ];

    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `activity-log-${formatExportDate(new Date())}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    toast.success("Activity log exported");
  };

  const handleDeleteLog = async (log) => {
    if (!log?.id) {
      return;
    }
    const previous = logs;
    // Optimistic removal, reconcile on failure.
    setLogs((prev) => prev.filter((entry) => entry.id !== log.id));
    setSheetOpen(false);
    setSelectedLog(null);

    const ok = await deleteLog(log.id);
    if (!ok) {
      setLogs(previous);
      toast.error("Failed to delete log entry");
      return;
    }
    toast.success("Log deleted");
  };

  const clearFilters = () => {
    setSearch("");
    setLevelFilter(DEFAULT_LEVEL_FILTER);
  };

  const columns = [
    {
      key: "level",
      header: "Level",
      render: (log) => <StatusPill status={log.level} map={LOG_LEVEL_PILL_MAP} />,
    },
    {
      key: "message",
      header: "Message",
      render: (log) => (
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate font-medium text-foreground">{log.title}</span>
          <span className="line-clamp-2 text-xs text-text-secondary">{log.message}</span>
        </div>
      ),
    },
    {
      key: "source",
      header: "Source",
      render: (log) => (
        <span className="text-xs text-muted-foreground">{log.source || "—"}</span>
      ),
    },
    {
      key: "time",
      header: "Time",
      render: (log) => (
        <span className="whitespace-nowrap text-xs text-text-secondary">
          {formatExactTime(log.timestamp)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      className: "text-right",
      render: (log) => (
        <ActionMenu
          label={`Actions for log ${log.id}`}
          items={[
            { icon: Eye, label: "View details", onSelect: () => handleLogClick(log) },
            { icon: Copy, label: "Copy JSON", onSelect: () => void handleCopyLog(log) },
            { separator: true },
            {
              icon: Trash2,
              label: "Delete",
              destructive: true,
              onSelect: () => void handleDeleteLog(log),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <MainScreenWrapper>
      <ScreenHeader
        title="Logs"
        description="View and analyze your project activity logs."
        actions={
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleExport}
            disabled={loading || filteredLogs.length === 0}
          >
            <Download className="h-4 w-4" />
            Export Logs
          </Button>
        }
      />

      <StatsBar stats={stats} />

      <Toolbar>
        <div className="flex items-center gap-2">
          <FilterDropdown
            value={levelFilter}
            onValueChange={setLevelFilter}
            options={ACTIVITY_LEVEL_FILTER_OPTIONS}
            height="h-9"
          />
        </div>
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by message, source or actor…"
        />
      </Toolbar>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-subtle px-6 py-16 text-sm text-text-secondary">
          <LogoLoading size={40} label="Loading logs" />
        </div>
      ) : (
        <div className="space-y-5">
          <DataTable
            columns={columns}
            data={pager.pageItems}
            getRowKey={(log) => log.id}
            onRowClick={handleLogClick}
            empty={
              <div className="rounded-xl border border-border bg-surface-subtle">
                <EmptyState
                  icon={Terminal}
                  title={hasFilters ? "No matching logs" : "No logs yet"}
                  description={
                    hasFilters
                      ? "Nothing matches your filters. Clear them to see everything."
                      : "Project logs will appear here once events are recorded."
                  }
                  action={
                    hasFilters ? (
                      <Button
                        variant="ghost"
                        onClick={clearFilters}
                        className="text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                      >
                        Clear filters
                      </Button>
                    ) : undefined
                  }
                />
              </div>
            }
          />
          <ListPagination {...pager} itemLabel="logs" />
        </div>
      )}

      <LogDetailSheet
        log={selectedLog}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onDelete={handleDeleteLog}
      />
    </MainScreenWrapper>
  );
}

export default LogsScreen;
