"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Clock,
  Pencil,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { Button, LogoLoading } from "@geiger/ui";
import { ActionMenu } from "@geiger/ui";
import { Input } from "@geiger/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@geiger/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@geiger/ui";
import { createClient } from "@/utils/supabase/client";
import { useProject } from "@/context/project-context";
import {
  DataTable,
  EmptyState,
  Field,
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
  OFFICE_FILE_TYPES,
  OFFICE_FILE_TYPE_LIST,
  OFFICE_FILE_TYPE_MAP,
  OFFICE_TYPE_FILTER_OPTIONS,
  getOfficeFileType,
  timeAgo,
} from "@/lib/office/office-file-meta";
import { cn } from "@/lib/utils";


export function OfficeRecentScreen() {
  const { project } = useProject();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [creating, setCreating] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

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

  const openRename = (file) => {
    setRenameTarget(file);
    setRenameValue(file.name);
  };

  const handleRename = async () => {
    const file = renameTarget;
    const newName = renameValue.trim();
    if (!file || !newName) return;
    setRenameTarget(null);
    setFiles((prev) =>
      prev.map((f) => (f.id === file.id ? { ...f, name: newName } : f))
    );
    const supabase = createClient();
    await supabase
      .from("office_files")
      .update({ name: newName })
      .eq("id", file.id)
      .eq("project_id", project.id);
  };

  const handleDelete = async (file) => {
    setDeleteTarget(null);
    setFiles((prev) => prev.filter((f) => f.id !== file.id));
    const supabase = createClient();
    await supabase
      .from("office_files")
      .delete()
      .eq("id", file.id)
      .eq("project_id", project.id);
  };

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
      { label: "Total files", value: String(files.length), footer: "In this project" },
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
            {file.starred && (
              <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
            )}
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
      key: "updated",
      header: "Updated",
      render: (file) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {timeAgo(file.updated_at)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      className: "text-right",
      render: (file) => (
        <ActionMenu
          label={`Actions for ${file.name}`}
          items={[
            { icon: Pencil, label: "Rename", onSelect: () => openRename(file) },
            { icon: Star, label: file.starred ? "Unstar" : "Star", onSelect: () => handleToggleStar(file) },
            { icon: Trash2, label: "Move to trash", onSelect: () => handleTrash(file) },
            { separator: true },
            { icon: Trash2, label: "Delete forever", destructive: true, onSelect: () => setDeleteTarget(file) },
          ]}
        />
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
        <div className="flex items-center gap-2">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search files…"
          />
          <Select
            disabled={creating}
            onValueChange={(type) => handleCreate(type)}
            value=""
          >
            <SelectTrigger className="h-9 border-none bg-primary font-medium text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              <span>New</span>
            </SelectTrigger>
            <SelectContent className="border-border bg-surface-card">
              {OFFICE_FILE_TYPE_LIST.map((t) => (
                <SelectItem key={t.type} value={t.type}>
                  <div className="flex items-center gap-2">
                    <t.icon className={cn("h-4 w-4", t.iconClass)} />
                    {t.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Toolbar>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-subtle px-6 py-16 text-sm text-text-secondary">
          <LogoLoading size={40} label="Loading files" />
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
      ) : (
        <div className="space-y-5">
          <DataTable
            columns={columns}
            data={pager.pageItems}
            getRowKey={(f) => f.id}
            empty={
              <div className="rounded-xl border border-border bg-surface-subtle">
                <EmptyState
                  icon={Clock}
                  title={query.trim() ? "No files match your search" : "No files yet"}
                  description={
                    query.trim()
                      ? "Try a different search term."
                      : "Create a new document, spreadsheet, or presentation to get started."
                  }
                />
              </div>
            }
          />
          <ListPagination {...pager} itemLabel="files" />
        </div>
      )}

      <Dialog
        open={!!renameTarget}
        onOpenChange={(isOpen) => !isOpen && setRenameTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename file</DialogTitle>
            <DialogDescription>
              Give &quot;{renameTarget?.name}&quot; a new name.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Field label="File name" htmlFor="office-file-name">
              <Input
                id="office-file-name"
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleRename();
                  }
                }}
                placeholder="Enter file name"
              />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRenameTarget(null)}>
              Cancel
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={!renameValue.trim()}
              onClick={handleRename}
            >
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(isOpen) => !isOpen && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete file permanently</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.name}
              </span>
              ? This action can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              className="bg-red-500/90 text-white hover:bg-red-500"
              onClick={() => handleDelete(deleteTarget)}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
