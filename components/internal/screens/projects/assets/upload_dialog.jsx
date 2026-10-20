"use client";

import React, { useRef, useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Progress,
} from "@geiger/ui";
import { CheckCircle2, CloudUpload, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  MAX_UPLOAD_BYTES,
  formatBytes,
  mediaMeta,
  mediaTypeFromName,
} from "@/features/assets/constants";
import { uploadAsset } from "@/features/assets/actions";
import { TypeGlyph } from "./asset_preview";

// Validates a FileList into queue entries, toasting any file that's empty or over the limit.
export function toUploadEntries(fileList) {
  const entries = [];
  Array.from(fileList ?? []).forEach((file) => {
    if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) {
      toast.error(`${file.name} is empty or over the ${formatBytes(MAX_UPLOAD_BYTES)} limit.`);
      return;
    }
    entries.push({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      size: file.size,
      type: mediaTypeFromName(file.name),
      progress: 0,
      status: "pending",
    });
  });
  return entries;
}

function QueueRow({ entry, busy, onRemove }) {
  const meta = mediaMeta(entry.type);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-card px-3 py-2.5">
      <TypeGlyph type={entry.type} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-foreground" title={entry.name}>{entry.name}</p>
        {entry.status === "uploading" ? (
          <Progress value={entry.progress} className="mt-2 h-1 bg-surface-active" />
        ) : (
          <p
            className={cn(
              "mt-0.5 text-xs",
              entry.status === "done" && "text-emerald-600 dark:text-emerald-400",
              entry.status === "error" && "text-red-600 dark:text-red-400",
              entry.status === "pending" && "text-text-secondary",
            )}
          >
            {entry.status === "done"
              ? "Uploaded"
              : entry.status === "error"
                ? "Upload failed"
                : `${formatBytes(entry.size)} · ${meta.label}`}
          </p>
        )}
      </div>
      {entry.status === "uploading" ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-text-secondary" />
      ) : entry.status === "done" ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <Button
          variant="ghost"
          size="icon-xs"
          disabled={busy}
          aria-label={`Remove ${entry.name}`}
          onClick={() => onRemove(entry.id)}
          className="text-text-tertiary hover:bg-surface-hover hover:text-foreground"
        >
          <X />
        </Button>
      )}
    </div>
  );
}

// Keyed by the screen per open, so `initialFiles` (from a page drop) seeds a fresh queue.
export function UploadDialog({ open, onOpenChange, projectId, onUploaded, initialFiles = [] }) {
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState(initialFiles);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const queue = files.filter((entry) => entry.status === "pending" || entry.status === "error");
  const retrying = queue.length > 0 && queue.every((entry) => entry.status === "error");
  const totalBytes = files.reduce((sum, entry) => sum + entry.size, 0);

  const addFiles = (fileList) => {
    const entries = toUploadEntries(fileList);
    if (entries.length > 0) {
      setFiles((prev) => [...prev, ...entries]);
    }
  };

  const updateEntry = (id, patch) => {
    setFiles((prev) => prev.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));
  };

  const handleOpenChange = (next) => {
    if (uploading) {
      return;
    }
    onOpenChange(next);
  };

  // Uploads sequentially; failures stay queued (status "error") so the button retries them.
  const startUpload = async () => {
    if (!projectId) {
      toast.error("No project selected.");
      return;
    }
    if (queue.length === 0) {
      return;
    }

    setUploading(true);
    const uploaded = [];
    let failed = 0;

    for (const entry of queue) {
      updateEntry(entry.id, { status: "uploading", progress: 5 });
      const created = await uploadAsset(projectId, entry.file, {
        onProgress: (progress) => updateEntry(entry.id, { progress: Math.round(progress) }),
      });
      if (created) {
        updateEntry(entry.id, { status: "done", progress: 100 });
        uploaded.push(created);
      } else {
        updateEntry(entry.id, { status: "error", progress: 0 });
        failed += 1;
      }
    }

    setUploading(false);
    uploaded.forEach((asset) => onUploaded?.(asset));

    if (failed > 0) {
      toast.error(`${failed} file${failed === 1 ? "" : "s"} couldn't be uploaded.`);
      return;
    }
    toast.success(uploaded.length === 1 ? `${uploaded[0].name} uploaded` : `${uploaded.length} assets uploaded`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="border-border bg-surface-subtle text-foreground sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload assets</DialogTitle>
          <DialogDescription className="text-text-secondary">
            Add files to this project&apos;s asset library. Up to {formatBytes(MAX_UPLOAD_BYTES)} per file.
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-w-0 gap-4">
          <div
            role="button"
            tabIndex={uploading ? -1 : 0}
            aria-label="Choose files to upload"
            aria-disabled={uploading}
            onClick={() => !uploading && fileInputRef.current?.click()}
            onKeyDown={(event) => {
              if (!uploading && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setDragOver(false);
              if (!uploading && event.dataTransfer.files.length) {
                addFiles(event.dataTransfer.files);
              }
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-8 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
              dragOver
                ? "border-foreground/40 bg-surface-hover"
                : "border-border-strong bg-surface-card hover:bg-surface-hover",
              uploading && "pointer-events-none opacity-60",
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(event) => {
                if (event.target.files) {
                  addFiles(event.target.files);
                }
                event.target.value = "";
              }}
            />
            <div
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface-subtle transition-colors",
                dragOver ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <CloudUpload className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {dragOver ? (
                  "Drop to add files"
                ) : (
                  <>
                    Drop files here or{" "}
                    <span className="underline decoration-border-strong underline-offset-4">browse</span>
                  </>
                )}
              </p>
              <p className="text-xs text-text-secondary">Images, video, audio, documents and archives</p>
            </div>
          </div>

          {files.length > 0 && (
            <div className="min-w-0 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-text-secondary">
                  {files.length} file{files.length === 1 ? "" : "s"} · {formatBytes(totalBytes)}
                </p>
                {!uploading && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setFiles([])}
                    className="text-text-secondary hover:bg-surface-hover hover:text-foreground"
                  >
                    Clear all
                  </Button>
                )}
              </div>
              <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
                {files.map((entry) => (
                  <QueueRow
                    key={entry.id}
                    entry={entry}
                    busy={uploading}
                    onRemove={(id) => setFiles((prev) => prev.filter((item) => item.id !== id))}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            disabled={uploading}
            onClick={() => onOpenChange(false)}
            className="text-text-secondary hover:text-foreground"
          >
            Cancel
          </Button>
          <Button
            disabled={queue.length === 0 || uploading}
            onClick={startUpload}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading
              ? "Uploading…"
              : queue.length === 0
                ? "Upload"
                : `${retrying ? "Retry" : "Upload"} ${queue.length} file${queue.length === 1 ? "" : "s"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
