"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Clock,
  FileText,
  Loader2,
  Presentation,
  Search,
  Sheet,
  Users,
} from "lucide-react";
import { Input } from "@geiger/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@geiger/ui";
import { createClient } from "@/utils/supabase/client";
import { useProject } from "@/context/project-context";
import {
  OFFICE_FILE_TYPE_LIST,
  getOfficeFileType,
  timeAgo,
} from "@/lib/office/office-file-meta";

const TYPE_ICONS = {
  document: FileText,
  spreadsheet: Sheet,
  presentation: Presentation,
};

export function OfficeSharedScreen() {
  const { project } = useProject();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const fetchSharedFiles = useCallback(async () => {
    if (!project?.id) return;
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("office_file_shares")
        .select(
          `id, shared_by, created_at,
           file:office_files!inner(id, type, name, starred, trashed, created_at, updated_at, user_id)`
        )
        .eq("project_id", project.id)
        .eq("office_files.trashed", false)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      const sharedFiles = (data ?? [])
        .filter((row) => row.file)
        .map((row) => ({
          ...row.file,
          _sharedAt: row.created_at,
          _sharedBy: row.shared_by,
        }));

      setFiles(sharedFiles);
    } catch (err) {
      setError(err.message || "Failed to load shared files");
    } finally {
      setLoading(false);
    }
  }, [project?.id]);

  useEffect(() => {
    fetchSharedFiles();
  }, [fetchSharedFiles]);

  const filtered = files.filter((f) => {
    const matchesQuery = query.trim()
      ? f.name.toLowerCase().includes(query.toLowerCase())
      : true;
    const matchesType = typeFilter !== "all" ? f.type === typeFilter : true;
    return matchesQuery && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search shared files"
            className="h-9 pl-8 bg-surface-card border-border text-foreground placeholder:text-text-secondary focus:border-border-strong"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="h-9 w-36 bg-surface-card border-border text-muted-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-surface-card border-border">
            <SelectItem value="all">All types</SelectItem>
            {OFFICE_FILE_TYPE_LIST.map((t) => (
              <SelectItem key={t.type} value={t.type}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center text-text-secondary">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex min-h-56 flex-col items-center justify-center rounded-md border border-dashed border-border bg-surface-subtle p-8 text-center">
          <Users className="mb-3 h-6 w-6 text-text-tertiary" />
          <p className="text-sm font-medium text-foreground">
            {query.trim() ? "No files match your search" : "No shared files"}
          </p>
          <p className="mt-1 max-w-md text-xs leading-5 text-text-secondary">
            {query.trim()
              ? "Try a different search term."
              : "Files shared with this project will appear here."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((file) => {
            const meta = getOfficeFileType(file.type);
            const Icon = meta.icon;
            return (
              <div
                key={file.id}
                className="flex flex-col gap-3 rounded-md border border-border bg-surface-subtle p-4"
              >
                <div className="flex items-start justify-between">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-border"
                    style={{ backgroundColor: meta.accent + "1a" }}
                  >
                    <Icon className="h-4 w-4" style={{ color: meta.accent }} />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-text-tertiary">
                    <Users className="h-3 w-3" />
                    Shared
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-foreground truncate">
                    {file.name}
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">{meta.label}</p>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-2.5">
                  <div className="flex items-center gap-1 text-[10px] text-text-tertiary">
                    <Clock className="h-3 w-3" />
                    {timeAgo(file._sharedAt || file.updated_at)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
