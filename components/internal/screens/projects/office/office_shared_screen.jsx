"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Clock,
  Users,
} from "lucide-react";
import { Button, LoadingArea } from "@geiger/ui";
import { useProject } from "@/context/project-context";
import {
  DataTable,
  EmptyState,
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
import {
  OFFICE_FILE_TYPE_MAP,
  OFFICE_TYPE_FILTER_OPTIONS,
  getOfficeFileType,
  timeAgo,
} from "@/lib/office/office-file-meta";
import { listSharedOfficeFiles } from "@/features/office/actions";
import { cn } from "@/lib/utils";

export function OfficeSharedScreen() {
  const { project } = useProject();
  const projectId = project?.id;
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Fetch on mount / project change through the data layer.
  const fetchSharedFiles = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const rows = await listSharedOfficeFiles(projectId, { type: typeFilter });
      setFiles(rows ?? []);
    } catch (err) {
      setError(err.message || "Failed to load shared files");
    } finally {
      setLoading(false);
    }
  }, [projectId, typeFilter]);

  useEffect(() => {
    void Promise.resolve().then(fetchSharedFiles);
  }, [fetchSharedFiles]);

  const filtered = useMemo(
    () =>
      files.filter((f) =>
        query.trim() ? f.name.toLowerCase().includes(query.toLowerCase()) : true
      ),
    [files, query],
  );

  const pager = usePagination(filtered, {
    resetKey: `${query}|${typeFilter}`,
  });

  const stats = useMemo(
    () => [
      { label: "Shared files", value: String(files.length), footer: "With this project" },
      { label: "Documents", value: String(files.filter((f) => f.type === "document").length), footer: "Text documents" },
      { label: "Spreadsheets", value: String(files.filter((f) => f.type === "spreadsheet").length), footer: "Sheets" },
      { label: "Presentations", value: String(files.filter((f) => f.type === "presentation").length), footer: "Slide decks" },
    ],
    [files],
  );

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (file) => {
        const meta = getOfficeFileType(file.type);
        const Icon = meta.icon;
        return (
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border",
                meta.tintClass,
              )}
            >
              <Icon className={cn("h-4 w-4", meta.iconClass)} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
              <p className="text-xs text-text-secondary">{meta.label}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "type",
      header: "Type",
      render: (file) => <StatusPill status={file.type} map={OFFICE_FILE_TYPE_MAP} />,
    },
    {
      key: "shared",
      header: "Shared",
      render: (file) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {timeAgo(file._sharedAt || file.updatedAt)}
        </span>
      ),
    },
    {
      key: "owner",
      header: "Owner",
      render: (file) => (
        <span className="max-w-[180px] truncate text-xs text-muted-foreground">
          {file._sharedBy || "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <StatsBar stats={stats} />

      <Toolbar>
        <div className="flex items-center gap-2">
          <FilterDropdown
            value={typeFilter}
            onValueChange={setTypeFilter}
            options={OFFICE_TYPE_FILTER_OPTIONS}
            height="h-9"
          />
        </div>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search shared files…"
        />
      </Toolbar>

      {loading ? (
        <LoadingArea panel label="Loading shared files" className="rounded-none min-h-[280px]" />
      ) : error ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm text-red-300">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSharedFiles}
            className="border-border text-muted-foreground hover:bg-surface-active hover:text-foreground"
          >
            Try again
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          <DataTable
            columns={columns}
            data={pager.pageItems}
            getRowKey={(f) => f.id}
            empty={
              <div className="rounded-xl border border-border bg-surface-subtle">
                <EmptyState
                  icon={query.trim() ? Clock : Users}
                  title={query.trim() ? "No files match your search" : "No shared files"}
                  description={
                    query.trim()
                      ? "Try a different search term."
                      : "Files shared with this project will appear here."
                  }
                />
              </div>
            }
          />
          <ListPagination {...pager} itemLabel="files" />
        </div>
      )}
    </div>
  );
}
