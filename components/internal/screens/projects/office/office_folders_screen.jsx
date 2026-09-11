"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  FolderOpen,
  FolderPlus,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "@geiger/ui";
import { ActionMenu } from "@geiger/ui";
import { Input } from "@geiger/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@geiger/ui";
import { createClient } from "@/utils/supabase/client";
import { useProject } from "@/context/project-context";
import {
  DataTable,
  EmptyState,
  Field,
  SearchInput,
  StatsBar,
  Toolbar,
} from "@/components/internal/shared/screen_kit";
import {
  ListPagination,
  usePagination,
} from "@/components/internal/shared/pagination";
import {
  getOfficeFileType,
  FOLDER_COLORS,
  timeAgo,
} from "@/lib/office/office-file-meta";
import { cn } from "@/lib/utils";

export function OfficeFoldersScreen() {
  const { project } = useProject();
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [fileQuery, setFileQuery] = useState("");
  const [activeFolder, setActiveFolder] = useState(null);
  const [folderFiles, setFolderFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [addToFolderOpen, setAddToFolderOpen] = useState(false);

  const fetchFolders = useCallback(async () => {
    if (!project?.id) return;
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("office_folders")
        .select("id, name, color, created_at, updated_at")
        .eq("project_id", project.id)
        .order("updated_at", { ascending: false });

      if (fetchError) throw fetchError;

      const folderIds = (data ?? []).map((f) => f.id);
      let fileCounts = {};

      if (folderIds.length > 0) {
        const { data: countData } = await supabase
          .from("office_files")
          .select("folder_id")
          .in("folder_id", folderIds)
          .eq("trashed", false);

        for (const row of countData ?? []) {
          fileCounts[row.folder_id] = (fileCounts[row.folder_id] || 0) + 1;
        }
      }

      setFolders(
        (data ?? []).map((f) => ({
          ...f,
          file_count: fileCounts[f.id] || 0,
        }))
      );
    } catch (err) {
      setError(err.message || "Failed to load folders");
    } finally {
      setLoading(false);
    }
  }, [project?.id]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const fetchFolderFiles = useCallback(async (folderId) => {
    if (!project?.id) return;
    setFilesLoading(true);
    try {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("office_files")
        .select("id, type, name, starred, created_at, updated_at")
        .eq("project_id", project.id)
        .eq("folder_id", folderId)
        .eq("trashed", false)
        .order("updated_at", { ascending: false });

      if (fetchError) throw fetchError;
      setFolderFiles(data ?? []);
    } catch {
      setFolderFiles([]);
    } finally {
      setFilesLoading(false);
    }
  }, [project?.id]);

  useEffect(() => {
    if (activeFolder) {
      fetchFolderFiles(activeFolder.id);
    }
  }, [activeFolder, fetchFolderFiles]);

  const handleCreateFolder = async ({ name, color }) => {
    if (!project?.id) return;
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be signed in to create a folder");
      const { data, error: createError } = await supabase
        .from("office_folders")
        .insert({ project_id: project.id, user_id: user.id, name, color })
        .select()
        .single();
      if (createError) throw createError;
      setFolders((prev) => [{ ...data, file_count: 0 }, ...prev]);
    } catch (err) {
      setError(err.message || "Failed to create folder");
    }
  };

  const handleRenameFolder = async ({ id, name }) => {
    setFolders((prev) =>
      prev.map((f) => (f.id === id ? { ...f, name } : f))
    );
    const supabase = createClient();
    await supabase
      .from("office_folders")
      .update({ name })
      .eq("id", id)
      .eq("project_id", project.id);
  };

  const handleDeleteFolder = async (folder) => {
    setDeleteTarget(null);
    setFolders((prev) => prev.filter((f) => f.id !== folder.id));
    if (activeFolder?.id === folder.id) setActiveFolder(null);
    const supabase = createClient();
    await supabase
      .from("office_folders")
      .delete()
      .eq("id", folder.id)
      .eq("project_id", project.id);
  };

  const handleMoveToFolder = async (fileId, folderId) => {
    const supabase = createClient();
    await supabase
      .from("office_files")
      .update({ folder_id: folderId })
      .eq("id", fileId)
      .eq("project_id", project.id);
    if (activeFolder) {
      fetchFolderFiles(activeFolder.id);
    }
    fetchFolders();
  };

  const handleRemoveFromFolder = async (fileId) => {
    const supabase = createClient();
    await supabase
      .from("office_files")
      .update({ folder_id: null })
      .eq("id", fileId)
      .eq("project_id", project.id);
    if (activeFolder) {
      fetchFolderFiles(activeFolder.id);
    }
    fetchFolders();
  };

  const stats = useMemo(() => {
    const totalFiles = folders.reduce((sum, f) => sum + (f.file_count || 0), 0);
    const empty = folders.filter((f) => !f.file_count).length;
    const largest = folders.reduce((max, f) => Math.max(max, f.file_count || 0), 0);
    return [
      { label: "Total folders", value: String(folders.length), footer: "In this project" },
      { label: "Files organized", value: String(totalFiles), footer: "Across all folders" },
      { label: "Empty folders", value: String(empty), footer: "With no files" },
      { label: "Largest folder", value: String(largest), footer: "Most files" },
    ];
  }, [folders]);

  const filteredFolders = useMemo(
    () =>
      folders.filter((f) =>
        query.trim() ? f.name.toLowerCase().includes(query.toLowerCase()) : true
      ),
    [folders, query],
  );

  const folderPager = usePagination(filteredFolders, { resetKey: query });

  const filteredFiles = useMemo(
    () =>
      folderFiles.filter((f) =>
        fileQuery.trim() ? f.name.toLowerCase().includes(fileQuery.toLowerCase()) : true
      ),
    [folderFiles, fileQuery],
  );

  const filePager = usePagination(filteredFiles, {
    resetKey: `${activeFolder?.id}|${fileQuery}`,
  });

  const folderColumns = [
    {
      key: "name",
      header: "Name",
      render: (folder) => (
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border"
            style={{
              backgroundColor: `${folder.color || FOLDER_COLORS[0]}1a`,
            }}
          >
            <FolderOpen
              className="h-4 w-4"
              style={{ color: folder.color || "var(--muted-foreground)" }}
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{folder.name}</p>
            <p className="text-xs text-text-secondary">
              {folder.file_count} {folder.file_count === 1 ? "file" : "files"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "updated",
      header: "Updated",
      render: (folder) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {timeAgo(folder.updated_at)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      className: "text-right",
      render: (folder) => (
        <ActionMenu
          label={`Actions for ${folder.name}`}
          items={[
            { icon: FolderOpen, label: "Open", onSelect: () => setActiveFolder(folder) },
            { icon: Pencil, label: "Rename", onSelect: () => setRenameTarget(folder) },
            { separator: true },
            { icon: Trash2, label: "Delete", destructive: true, onSelect: () => setDeleteTarget(folder) },
          ]}
        />
      ),
    },
  ];

  const fileColumns = [
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
            { icon: ArrowLeft, label: "Remove from folder", onSelect: () => handleRemoveFromFolder(file.id) },
          ]}
        />
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-subtle px-6 py-16 text-sm text-text-secondary">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading folders…
      </div>
    );
  }

  if (activeFolder) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveFolder(null)}
            className="h-8 w-8 border-border bg-transparent p-0 text-muted-foreground hover:bg-surface-active hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
          <h2 className="text-sm font-medium text-foreground">
            {activeFolder.name}
          </h2>
          <div className="flex-1" />
          <Button
            size="sm"
            onClick={() => setAddToFolderOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <FolderPlus className="h-4 w-4" />
            Add files
          </Button>
        </div>

        <Toolbar>
          <div />
          <SearchInput
            value={fileQuery}
            onChange={setFileQuery}
            placeholder="Search files in folder…"
          />
        </Toolbar>

        {filesLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-subtle px-6 py-16 text-sm text-text-secondary">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading files…
          </div>
        ) : (
          <div className="space-y-5">
            <DataTable
              columns={fileColumns}
              data={filePager.pageItems}
              getRowKey={(f) => f.id}
              empty={
                <div className="rounded-xl border border-border bg-surface-subtle">
                  <EmptyState
                    icon={FolderOpen}
                    title={fileQuery.trim() ? "No files match your search" : "This folder is empty"}
                    description={
                      fileQuery.trim()
                        ? "Try a different search term."
                        : "Click \u201CAdd files\u201D to move files into this folder."
                    }
                  />
                </div>
              }
            />
            <ListPagination {...filePager} itemLabel="files" />
          </div>
        )}

        <AddToFolderDialog
          open={addToFolderOpen}
          onOpenChange={setAddToFolderOpen}
          folderId={activeFolder.id}
          projectId={project.id}
          existingFileIds={folderFiles.map((f) => f.id)}
          onAdded={() => {
            fetchFolderFiles(activeFolder.id);
            fetchFolders();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-300">{error}</p>}

      <StatsBar stats={stats} />

      <Toolbar>
        <p className="text-sm text-muted-foreground">
          {folders.length} {folders.length === 1 ? "folder" : "folders"}
        </p>
        <div className="flex items-center gap-2">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search folders…"
          />
          <Button
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New folder
          </Button>
        </div>
      </Toolbar>

      <div className="space-y-5">
        <DataTable
          columns={folderColumns}
          data={folderPager.pageItems}
          getRowKey={(f) => f.id}
          onRowClick={(folder) => setActiveFolder(folder)}
          empty={
            <div className="rounded-xl border border-border bg-surface-subtle">
              <EmptyState
                icon={FolderOpen}
                title={query.trim() ? "No folders match your search" : "No folders yet"}
                description={
                  query.trim()
                    ? "Try a different search term."
                    : "Create a folder to organize your office files."
                }
                action={
                  <Button
                    size="sm"
                    onClick={() => setCreateOpen(true)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4" />
                    New folder
                  </Button>
                }
              />
            </div>
          }
        />
        <ListPagination {...folderPager} itemLabel="folders" />
      </div>

      <CreateFolderDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreateFolder}
      />
      <RenameFolderDialog
        open={!!renameTarget}
        folder={renameTarget}
        onOpenChange={(isOpen) => !isOpen && setRenameTarget(null)}
        onSubmit={handleRenameFolder}
      />
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(isOpen) => !isOpen && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete folder</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.name}
              </span>
              ? Files inside will not be deleted. This action can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              className="bg-red-500/90 text-white hover:bg-red-500"
              onClick={() => handleDeleteFolder(deleteTarget)}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreateFolderDialog({ open, onOpenChange, onSubmit }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(FOLDER_COLORS[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), color });
    setName("");
    setColor(FOLDER_COLORS[0]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground">New folder</DialogTitle>
          <DialogDescription>
            Create a folder to organize your office files.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <Field label="Folder name" htmlFor="office-folder-name">
              <Input
                id="office-folder-name"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter folder name"
                className="border-border bg-surface-card text-foreground placeholder:text-text-secondary"
              />
            </Field>
            <Field label="Color">
              <div className="flex items-center gap-2">
                {FOLDER_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    aria-label={`Folder color ${c}`}
                    className={cn(
                      "h-6 w-6 rounded-full ring-2 ring-offset-2 ring-offset-surface-dialog transition-all",
                      color === c ? "ring-foreground" : "ring-transparent",
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </Field>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RenameFolderDialog({ open, folder, onOpenChange, onSubmit }) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (folder) setName(folder.name);
  }, [folder]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim() || folder.name;
    onSubmit({ id: folder.id, name: trimmed });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground">Rename folder</DialogTitle>
          <DialogDescription>
            Give &quot;{folder?.name}&quot; a new name.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <Field label="Folder name" htmlFor="office-rename-folder">
              <Input
                id="office-rename-folder"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={folder?.name}
                className="border-border bg-surface-card text-foreground placeholder:text-text-secondary"
              />
            </Field>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Rename
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddToFolderDialog({
  open,
  onOpenChange,
  folderId,
  projectId,
  existingFileIds,
  onAdded,
}) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !projectId) return;
    setLoading(true);
    const supabase = createClient();
    supabase
      .from("office_files")
      .select("id, type, name, folder_id")
      .eq("project_id", projectId)
      .eq("trashed", false)
      .order("updated_at", { ascending: false })
      .then(({ data }) => {
        setFiles(
          (data ?? []).filter(
            (f) => !existingFileIds.includes(f.id)
          )
        );
        setLoading(false);
      });
  }, [open, projectId, existingFileIds]);

  const filtered = files.filter((f) =>
    query.trim() ? f.name.toLowerCase().includes(query.toLowerCase()) : true
  );

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((f) => f.id)));
    }
  };

  const handleAdd = async () => {
    if (selected.size === 0) return;
    setSaving(true);
    const supabase = createClient();
    for (const fileId of selected) {
      await supabase
        .from("office_files")
        .update({ folder_id: folderId })
        .eq("id", fileId)
        .eq("project_id", projectId);
    }
    setSaving(false);
    setSelected(new Set());
    onOpenChange(false);
    onAdded?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add files to folder</DialogTitle>
          <DialogDescription>
            Select files to move into this folder.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <Field label="Search files">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search files"
                className="h-9 border-border bg-surface-card pl-8 text-foreground placeholder:text-text-secondary"
              />
            </div>
          </Field>

          {loading ? (
            <div className="flex min-h-[20vh] items-center justify-center text-text-secondary">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-secondary">
              No files available to add.
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={toggleAll}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  {selected.size === filtered.length
                    ? "Deselect all"
                    : "Select all"}
                </button>
                <span className="text-xs text-text-secondary">
                  {selected.size} selected
                </span>
              </div>
              <div className="max-h-60 space-y-1 overflow-y-auto">
                {filtered.map((file) => {
                  const meta = getOfficeFileType(file.type);
                  const Icon = meta.icon;
                  return (
                    <button
                      key={file.id}
                      type="button"
                      onClick={() => toggleSelect(file.id)}
                      className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors ${
                        selected.has(file.id)
                          ? "bg-surface-hover"
                          : "hover:bg-surface-card"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected.has(file.id)}
                        onChange={() => toggleSelect(file.id)}
                        className="accent-white"
                      />
                      <Icon className={cn("h-4 w-4 shrink-0", meta.iconClass)} />
                      <span className="truncate text-sm text-foreground">
                        {file.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={selected.size === 0 || saving}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Add {selected.size > 0 ? `${selected.size} files` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
