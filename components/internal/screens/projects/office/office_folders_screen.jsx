"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Clock,
  FileText,
  FolderOpen,
  FolderPlus,
  Loader2,
  Pencil,
  Plus,
  Presentation,
  Search,
  Sheet,
  Trash2,
} from "lucide-react";
import { Button } from "@geiger/ui";
import { Input } from "@geiger/ui";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@geiger/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@geiger/ui";
import { Label } from "@geiger/ui";
import { createClient } from "@/utils/supabase/client";
import { useProject } from "@/context/project-context";
import {
  getOfficeFileType,
  FOLDER_COLORS,
  timeAgo,
} from "@/lib/office/office-file-meta";

const TYPE_ICONS = {
  document: FileText,
  spreadsheet: Sheet,
  presentation: Presentation,
};

export function OfficeFoldersScreen() {
  const { project } = useProject();
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFolder, setActiveFolder] = useState(null);
  const [folderFiles, setFolderFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null);
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

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-text-secondary">
        <Loader2 className="h-5 w-5 animate-spin" />
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
            className="h-8 w-8 p-0 border-border bg-transparent text-muted-foreground hover:bg-surface-active hover:text-foreground"
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
            className="bg-primary text-primary-foreground hover:bg-primary"
          >
            <FolderPlus className="w-4 h-4 mr-1" />
            Add files
          </Button>
        </div>

        {filesLoading ? (
          <div className="flex min-h-[20vh] items-center justify-center text-text-secondary">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : folderFiles.length === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center rounded-md border border-dashed border-border bg-surface-subtle p-8 text-center">
            <FolderOpen className="mb-3 h-6 w-6 text-text-tertiary" />
            <p className="text-sm font-medium text-foreground">
              This folder is empty
            </p>
            <p className="mt-1 max-w-md text-xs leading-5 text-text-secondary">
              Click &quot;Add files&quot; to move files into this folder.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {folderFiles.map((file) => {
              const meta = getOfficeFileType(file.type);
              const Icon = meta.icon;
              return (
                <ContextMenu key={file.id}>
                  <ContextMenuTrigger asChild>
                    <div className="flex flex-col gap-3 rounded-md border border-border bg-surface-subtle p-4">
                      <div className="flex items-start justify-between">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-md border border-border"
                          style={{ backgroundColor: meta.accent + "1a" }}
                        >
                          <Icon
                            className="h-4 w-4"
                            style={{ color: meta.accent }}
                          />
                        </div>
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
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-48 bg-surface-card border-border shadow-xl">
                    <ContextMenuItem
                      className="text-muted-foreground focus:bg-surface-hover focus:text-foreground cursor-pointer gap-2"
                      onSelect={() => handleRemoveFromFolder(file.id)}
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Remove from folder
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              );
            })}
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

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {folders.length} {folders.length === 1 ? "folder" : "folders"}
        </p>
        <Button
          size="sm"
          onClick={() => setCreateOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary"
        >
          <Plus className="w-4 h-4 mr-1" />
          New folder
        </Button>
      </div>

      {folders.length === 0 ? (
        <div className="flex min-h-56 flex-col items-center justify-center rounded-md border border-dashed border-border bg-surface-subtle p-8 text-center">
          <FolderOpen className="mb-3 h-6 w-6 text-text-tertiary" />
          <p className="text-sm font-medium text-foreground">No folders yet</p>
          <p className="mt-1 max-w-md text-xs leading-5 text-text-secondary">
            Create a folder to organize your office files.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {folders.map((folder) => (
            <ContextMenu key={folder.id}>
              <ContextMenuTrigger asChild>
                <button
                  type="button"
                  onClick={() => setActiveFolder(folder)}
                  className="flex flex-col gap-3 rounded-md border border-border bg-surface-subtle p-4 text-left transition-colors hover:border-border-strong"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border"
                      style={{
                        backgroundColor: (folder.color || "#4285f4") + "1a",
                      }}
                    >
                      <FolderOpen
                        className="h-4 w-4"
                        style={{ color: folder.color || "var(--muted-foreground)" }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-medium text-foreground">
                        {folder.name}
                      </h3>
                      <span className="text-xs text-text-secondary">
                        {folder.file_count}{" "}
                        {folder.file_count === 1 ? "file" : "files"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 border-t border-border pt-2.5 text-[10px] text-text-tertiary">
                    <Clock className="h-3 w-3" />
                    Updated {timeAgo(folder.updated_at)}
                  </div>
                </button>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-52 bg-surface-card border-border shadow-xl">
                <ContextMenuItem
                  className="text-muted-foreground focus:bg-surface-hover focus:text-foreground cursor-pointer gap-2"
                  onSelect={() => setActiveFolder(folder)}
                >
                  <FolderOpen className="h-3.5 w-3.5" />
                  Open
                </ContextMenuItem>
                <ContextMenuItem
                  className="text-muted-foreground focus:bg-surface-hover focus:text-foreground cursor-pointer gap-2"
                  onSelect={() => setRenameTarget(folder)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Rename
                </ContextMenuItem>
                <ContextMenuItem
                  className="text-red-400 focus:bg-surface-hover focus:text-red-300 cursor-pointer gap-2"
                  onSelect={() => handleDeleteFolder(folder)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}
        </div>
      )}

      <CreateFolderDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreateFolder}
      />
      <RenameFolderDialog
        open={!!renameTarget}
        folder={renameTarget}
        onOpenChange={(open) => !open && setRenameTarget(null)}
        onSubmit={handleRenameFolder}
      />
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
      <DialogContent className="bg-surface-subtle border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground">New folder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">Folder name</Label>
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter folder name"
              className="bg-surface-card border-border text-foreground placeholder:text-text-secondary focus:border-border-strong"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">Color</Label>
            <div className="flex items-center gap-2">
              {FOLDER_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="h-6 w-6 rounded-full border-2 transition-colors"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? "#fff" : "transparent",
                  }}
                />
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground hover:bg-surface-active"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary"
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
      <DialogContent className="bg-surface-subtle border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground">Rename folder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm">Folder name</Label>
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={folder?.name}
              className="bg-surface-card border-border text-foreground placeholder:text-text-secondary focus:border-border-strong"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground hover:bg-surface-active"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary"
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
      <DialogContent className="bg-surface-subtle border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add files to folder</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search files"
              className="h-9 pl-8 bg-surface-card border-border text-foreground placeholder:text-text-secondary focus:border-border-strong"
            />
          </div>

          {loading ? (
            <div className="flex min-h-[20vh] items-center justify-center text-text-secondary">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-8">
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
              <div className="max-h-60 overflow-y-auto space-y-1">
                {filtered.map((file) => {
                  const meta = getOfficeFileType(file.type);
                  const Icon = meta.icon;
                  return (
                    <button
                      key={file.id}
                      type="button"
                      onClick={() => toggleSelect(file.id)}
                      className={`flex items-center gap-3 w-full rounded-md px-3 py-2 text-left transition-colors ${
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
                      <Icon
                        className="h-4 w-4 shrink-0"
                        style={{ color: meta.accent }}
                      />
                      <span className="text-sm text-foreground truncate">
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
            className="text-muted-foreground hover:text-foreground hover:bg-surface-active"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={selected.size === 0 || saving}
            className="bg-primary text-primary-foreground hover:bg-primary"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : null}
            Add {selected.size > 0 ? `${selected.size} files` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
