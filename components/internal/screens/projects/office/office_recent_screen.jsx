"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Clock,
  FileText,
  FolderOpen,
  Loader2,
  Plus,
  Presentation,
  Search,
  Sheet,
  Star,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { createClient } from "@/utils/supabase/client";
import { useProject } from "@/context/project-context";
import {
  OFFICE_FILE_TYPES,
  OFFICE_FILE_TYPE_LIST,
  getOfficeFileType,
  timeAgo,
} from "@/lib/office/office-file-meta";

const TYPE_ICONS = {
  document: FileText,
  spreadsheet: Sheet,
  presentation: Presentation,
};

export function OfficeRecentScreen() {
  const { project } = useProject();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [creating, setCreating] = useState(false);

  const fetchFiles = useCallback(async () => {
    if (!project?.id) return;
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      let q = supabase
        .from("office_files")
        .select("id, type, name, starred, trashed, user_id, created_at, updated_at, folder_id")
        .eq("project_id", project.id)
        .eq("trashed", false)
        .order("updated_at", { ascending: false });

      if (typeFilter !== "all") {
        q = q.eq("type", typeFilter);
      }

      const { data, error: fetchError } = await q;
      if (fetchError) throw fetchError;
      setFiles(data ?? []);
    } catch (err) {
      setError(err.message || "Failed to load files");
    } finally {
      setLoading(false);
    }
  }, [project?.id, typeFilter]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleCreate = async (type) => {
    if (!project?.id) return;
    setCreating(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be signed in to create a file");
      const meta = OFFICE_FILE_TYPES[type];
      const { data, error: createError } = await supabase
        .from("office_files")
        .insert({
          project_id: project.id,
          user_id: user.id,
          type,
          name: meta.defaultName,
          content: {},
        })
        .select()
        .single();
      if (createError) throw createError;
      setFiles((prev) => [data, ...prev]);
    } catch (err) {
      setError(err.message || "Failed to create file");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStar = async (file) => {
    const next = !file.starred;
    setFiles((prev) =>
      prev.map((f) => (f.id === file.id ? { ...f, starred: next } : f))
    );
    const supabase = createClient();
    await supabase
      .from("office_files")
      .update({ starred: next })
      .eq("id", file.id)
      .eq("project_id", project.id);
  };

  const handleTrash = async (file) => {
    setFiles((prev) => prev.filter((f) => f.id !== file.id));
    const supabase = createClient();
    await supabase
      .from("office_files")
      .update({ trashed: true })
      .eq("id", file.id)
      .eq("project_id", project.id);
  };

  const handleRename = async (file) => {
    const newName = prompt("Rename file", file.name);
    if (!newName || !newName.trim()) return;
    setFiles((prev) =>
      prev.map((f) => (f.id === file.id ? { ...f, name: newName.trim() } : f))
    );
    const supabase = createClient();
    await supabase
      .from("office_files")
      .update({ name: newName.trim() })
      .eq("id", file.id)
      .eq("project_id", project.id);
  };

  const handleDelete = async (file) => {
    if (!confirm(`Delete "${file.name}" permanently?`)) return;
    setFiles((prev) => prev.filter((f) => f.id !== file.id));
    const supabase = createClient();
    await supabase
      .from("office_files")
      .delete()
      .eq("id", file.id)
      .eq("project_id", project.id);
  };

  const filtered = files.filter((f) =>
    query.trim() ? f.name.toLowerCase().includes(query.toLowerCase()) : true
  );

  const stats = {
    total: files.length,
    documents: files.filter((f) => f.type === "document").length,
    spreadsheets: files.filter((f) => f.type === "spreadsheet").length,
    presentations: files.filter((f) => f.type === "presentation").length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={<FileText className="w-4 h-4 text-muted-foreground" />}
          label="Total files"
          value={stats.total}
        />
        <StatCard
          icon={<FileText className="w-4 h-4" style={{ color: OFFICE_FILE_TYPES.document.accent }} />}
          label="Documents"
          value={stats.documents}
        />
        <StatCard
          icon={<Sheet className="w-4 h-4" style={{ color: OFFICE_FILE_TYPES.spreadsheet.accent }} />}
          label="Spreadsheets"
          value={stats.spreadsheets}
        />
        <StatCard
          icon={<Presentation className="w-4 h-4" style={{ color: OFFICE_FILE_TYPES.presentation.accent }} />}
          label="Presentations"
          value={stats.presentations}
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files"
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
        <Select
          disabled={creating}
          onValueChange={(type) => handleCreate(type)}
          value=""
        >
          <SelectTrigger className="h-9 bg-primary text-primary-foreground hover:bg-primary font-medium border-none">
            <Plus className="w-4 h-4 mr-1" />
            <span>New</span>
          </SelectTrigger>
          <SelectContent className="bg-surface-card border-border">
            {OFFICE_FILE_TYPE_LIST.map((t) => (
              <SelectItem key={t.type} value={t.type}>
                <div className="flex items-center gap-2">
                  <t.icon className="w-4 h-4" style={{ color: t.accent }} />
                  {t.label}
                </div>
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
          <Button
            variant="outline"
            size="sm"
            onClick={fetchFiles}
            className="border-border text-muted-foreground hover:bg-surface-active hover:text-foreground"
          >
            Try again
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex min-h-56 flex-col items-center justify-center rounded-md border border-dashed border-border bg-surface-subtle p-8 text-center">
          <Clock className="mb-3 h-6 w-6 text-text-tertiary" />
          <p className="text-sm font-medium text-foreground">
            {query.trim() ? "No files match your search" : "No files yet"}
          </p>
          <p className="mt-1 max-w-md text-xs leading-5 text-text-secondary">
            {query.trim()
              ? "Try a different search term."
              : "Create a new document, spreadsheet, or presentation to get started."}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((file) => {
            const meta = getOfficeFileType(file.type);
            const Icon = meta.icon;
            return (
              <ContextMenu key={file.id}>
                <ContextMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex flex-col gap-3 rounded-md border border-border bg-surface-subtle p-4 text-left transition-colors hover:border-border-strong"
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-md border border-border"
                        style={{ backgroundColor: meta.accent + "1a" }}
                      >
                        <Icon className="h-4 w-4" style={{ color: meta.accent }} />
                      </div>
                      {file.starred && (
                        <Star className="h-3.5 w-3.5 fill-[#f4b400] text-[#f4b400]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-foreground truncate">
                        {file.name}
                      </h3>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {meta.label}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 border-t border-border pt-2.5 text-[10px] text-text-tertiary">
                      <Clock className="h-3 w-3" />
                      {timeAgo(file.updated_at)}
                    </div>
                  </button>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-48 bg-surface-card border-border shadow-xl">
                  <ContextMenuItem
                    className="text-muted-foreground focus:bg-surface-hover focus:text-foreground cursor-pointer gap-2"
                    onSelect={() => handleRename(file)}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Rename
                  </ContextMenuItem>
                  <ContextMenuItem
                    className="text-muted-foreground focus:bg-surface-hover focus:text-foreground cursor-pointer gap-2"
                    onSelect={() => handleToggleStar(file)}
                  >
                    <Star className="h-3.5 w-3.5" />
                    {file.starred ? "Unstar" : "Star"}
                  </ContextMenuItem>
                  <ContextMenuItem
                    className="text-muted-foreground focus:bg-surface-hover focus:text-foreground cursor-pointer gap-2"
                    onSelect={() => handleTrash(file)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Move to trash
                  </ContextMenuItem>
                  <ContextMenuItem
                    className="text-red-400 focus:bg-surface-hover focus:text-red-300 cursor-pointer gap-2"
                    onSelect={() => handleDelete(file)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete forever
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-md border border-border bg-surface-subtle p-3">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-text-secondary">{label}</span>
      </div>
      <p className="text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}
