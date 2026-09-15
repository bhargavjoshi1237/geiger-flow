"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Clock,
  Pencil,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { Button, LoadingArea } from "@geiger/ui";
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
import { toast } from "sonner";
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
import {
  createOfficeFile,
  listOfficeFiles,
  softDeleteOfficeFile,
  updateOfficeFile,
} from "@/features/office/actions";
import { cn } from "@/lib/utils";


export function OfficeRecentScreen() {
  const { project } = useProject();
  const projectId = project?.id;
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [creating, setCreating] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Fetch on mount / project / filter change through the data layer.
  const fetchFiles = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const rows = await listOfficeFiles(projectId, { type: typeFilter });
      setFiles(rows ?? []);
    } catch (err) {
      setError(err.message || "Failed to load files");
    } finally {
      setLoading(false);
    }
  }, [projectId, typeFilter]);

  useEffect(() => {
    void Promise.resolve().then(fetchFiles);
  }, [fetchFiles]);

  // Optimistic create with rollback + toast on failure.
  const handleCreate = async (type) => {
    if (!projectId) return;
    const meta = OFFICE_FILE_TYPES[type];
    if (!meta) return;
    setCreating(true);
    const optimisticId = crypto.randomUUID();
    const optimistic = {
      id: optimisticId,
      projectId,
      type,
      name: meta.defaultName,
      content: {},
      starred: false,
      trashed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setFiles((prev) => [optimistic, ...prev]);
    try {
      const created = await createOfficeFile(projectId, {
        id: optimisticId,
        type,
        name: meta.defaultName,
        content: {},
      });
      if (!created) {
        throw new Error("Failed to create file");
      }
      setFiles((prev) => [created, ...prev.filter((f) => f.id !== optimisticId)]);
      toast.success(`${meta.label} created`);
    } catch (err) {
      setFiles((prev) => prev.filter((f) => f.id !== optimisticId));
      toast.error(err.message || "Failed to create file");
    } finally {
      setCreating(false);
    }
  };

  // Optimistic star toggle with rollback + toast on failure.
  const handleToggleStar = async (file) => {
    const next = !file.starred;
    const previous = files;
    setFiles((prev) =>
      prev.map((f) => (f.id === file.id ? { ...f, starred: next } : f))
    );
    const saved = await updateOfficeFile(file.id, { starred: next });
    if (!saved) {
      setFiles(previous);
      toast.error("Couldn't update the file.");
      return;
    }
    setFiles((prev) => prev.map((f) => (f.id === saved.id ? saved : f)));
  };

  // Move to trash (reversible flag) with rollback + toast on failure.
  const handleTrash = async (file) => {
    const previous = files;
    setFiles((prev) => prev.filter((f) => f.id !== file.id));
    const saved = await updateOfficeFile(file.id, { trashed: true });
    if (!saved) {
      setFiles(previous);
      toast.error("Couldn't move the file to trash.");
      return;
    }
    toast.success("File moved to trash");
  };

  const openRename = (file) => {
    setRenameTarget(file);
    setRenameValue(file.name);
  };

  // Optimistic rename with rollback + toast on failure.
  const handleRename = async () => {
    const file = renameTarget;
    const newName = renameValue.trim();
    if (!file || !newName) return;
    setRenameTarget(null);
    const previous = files;
    setFiles((prev) =>
      prev.map((f) => (f.id === file.id ? { ...f, name: newName } : f))
    );
    const saved = await updateOfficeFile(file.id, { name: newName });
    if (!saved) {
      setFiles(previous);
      toast.error("Couldn't rename the file.");
      return;
    }
    setFiles((prev) => prev.map((f) => (f.id === saved.id ? saved : f)));
    toast.success("File renamed");
  };

  // Soft delete — the row is preserved with deleted_at, never hard-deleted.
  const handleDelete = async (file) => {
    if (!file) return;
    setDeleteTarget(null);
    const previous = files;
    setFiles((prev) => prev.filter((f) => f.id !== file.id));
    const ok = await softDeleteOfficeFile(file.id);
    if (!ok) {
      setFiles(previous);
      toast.error("Couldn't delete the file.");
      return;
    }
    toast.success("File deleted");
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
          {timeAgo(file.updatedAt)}
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
        <LoadingArea panel label="Loading files" className="rounded-none min-h-[280px]" />
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
            <DialogTitle>Delete file</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.name}
              </span>
              ? The file will be removed from this project. This action can&apos;t be undone.
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
