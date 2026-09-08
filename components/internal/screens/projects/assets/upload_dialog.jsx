"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@geiger/ui";
import { Button } from "@geiger/ui";
import { Progress } from "@geiger/ui";
import { Field } from "@/components/internal/shared/screen_kit";
import {
  Upload, X, CloudUpload, FileIcon,
} from "lucide-react";
import { toast } from "sonner";
import { formatBytes, mediaTypeFromName } from "@/features/assets/constants";
import { uploadAsset } from "@/features/assets/actions";
import { typeIcons, typeColors } from "./data";

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

export function UploadDialog({ open, onOpenChange, projectId, onUploaded }) {
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  // True while any real upload is in flight (submit disabled).
  const [uploading, setUploading] = useState(false);

  const addFiles = useCallback((newFiles) => {
    const accepted = [];
    Array.from(newFiles).forEach((f) => {
      if (f.size <= 0 || f.size > MAX_UPLOAD_BYTES) {
        toast.error(`${f.name} is empty or exceeds the ${formatBytes(MAX_UPLOAD_BYTES)} limit.`);
        return;
      }
      accepted.push({
        id: crypto.randomUUID(),
        file: f,
        name: f.name,
        size: f.size,
        type: mediaTypeFromName(f.name),
        progress: 0,
        status: "pending",
      });
    });
    if (accepted.length > 0) {
      setFiles((prev) => [...prev, ...accepted]);
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const updateFile = useCallback((id, patch) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }, []);

  // Real upload: one file at a time through the data layer. Each success is
  // handed to onUploaded so the screen prepends the row; failures toast and
  // keep going so one bad file doesn't block the rest.
  const startUpload = useCallback(async () => {
    if (!projectId) {
      toast.error("No project selected.");
      return;
    }

    const queue = files.filter((f) => f.status === "pending");
    if (queue.length === 0) {
      return;
    }

    setUploading(true);
    let uploaded = [];

    for (const entry of queue) {
      updateFile(entry.id, { status: "uploading", progress: 5 });

      const created = await uploadAsset(projectId, entry.file, {
        onProgress: (progress) =>
          updateFile(entry.id, {
            progress: Math.max(entry.progress, Math.round(progress)),
          }),
      });

      if (created) {
        updateFile(entry.id, { status: "done", progress: 100 });
        uploaded = [...uploaded, created];
      } else {
        updateFile(entry.id, { status: "pending", progress: 0 });
        toast.error(`Couldn't upload "${entry.name}".`);
      }
    }

    setUploading(false);

    if (uploaded.length > 0) {
      toast.success(
        uploaded.length === 1
          ? `${uploaded[0].name} uploaded`
          : `${uploaded.length} assets uploaded`,
      );
      uploaded.forEach((asset) => onUploaded?.(asset));
      setFiles([]);
      onOpenChange(false);
    }
  }, [files, projectId, onUploaded, onOpenChange, updateFile]);

  const removeFile = useCallback((id) => setFiles((prev) => prev.filter((f) => f.id !== id)), []);

  const clearDone = useCallback(() => setFiles((prev) => prev.filter((f) => f.status !== "done")), []);

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const uploadingCount = files.filter((f) => f.status === "uploading").length;
  const doneCount = files.filter((f) => f.status === "done").length;

  const dropZoneBase = "relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200";

  return (
    <Dialog open={open} onOpenChange={(next) => !uploading && onOpenChange(next)}>
      <DialogContent className="bg-surface-subtle border-border text-foreground sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CloudUpload className="w-5 h-5" />
            Upload Assets
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            Drag and drop files or click to browse. Supports images, videos, documents, audio and archives.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
        <Field label="Files" hint="Max 25 MB per file. Drag and drop files or click to browse.">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={
            dropZoneBase +
            (dragOver
              ? " border-foreground bg-foreground/5"
              : " border-border hover:border-border-strong bg-background")
          }
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }}
          />
          <CloudUpload className={"w-10 h-10 mx-auto mb-3 " + (dragOver ? "text-foreground" : "text-text-tertiary")} />
          <p className="text-sm text-muted-foreground mb-1">{dragOver ? "Drop files here" : "Drag and drop files here"}</p>
          <p className="text-xs text-text-tertiary">or click to browse · Max 25 MB per file</p>
        </div>
        </Field>

        {files.length > 0 && (
          <Field label="Selected files" hint={`${files.length} file${files.length !== 1 ? "s" : ""} · ${doneCount} done${uploadingCount > 0 ? ` · ${uploadingCount} uploading` : ""}${pendingCount > 0 ? ` · ${pendingCount} pending` : ""}`}>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-tertiary">
                {files.length} file{files.length !== 1 && "s"} · {doneCount} done
                {uploadingCount > 0 && " · " + uploadingCount + " uploading"}
                {pendingCount > 0 && " · " + pendingCount + " pending"}
              </span>
              {doneCount > 0 && !uploading && (
                <Button variant="ghost" size="sm" className="h-6 text-[10px] text-text-tertiary hover:text-foreground" onClick={clearDone}>
                  Clear done
                </Button>
              )}
            </div>
            {files.map((f) => {
              const TypeIcon = typeIcons[f.type] || FileIcon;
              return (
                <div key={f.id} className="flex items-center gap-3 p-2 px-3 rounded-md bg-background border border-border">
                  <TypeIcon className={"w-4 h-4 flex-shrink-0 " + (typeColors[f.type] || "text-text-tertiary")} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-foreground truncate pr-2">{f.name}</span>
                      <span className="text-[10px] text-text-tertiary flex-shrink-0">{formatBytes(f.size)}</span>
                    </div>
                    {(f.status === "uploading" || f.progress > 0) && (
                      <Progress value={f.progress} className="h-1 mt-1.5 bg-surface-active" />
                    )}
                  </div>
                  {!uploading && (
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-text-tertiary hover:text-red-400 flex-shrink-0" onClick={() => removeFile(f.id)}>
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
          </Field>
        )}

        <DialogFooter>
          <Button
            variant="ghost"
            className="text-text-tertiary hover:text-foreground"
            disabled={uploading}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={files.length === 0 || uploading}
            onClick={startUpload}
          >
            <Upload className="h-4 w-4" />
            {uploading
              ? "Uploading..."
              : pendingCount > 0
              ? "Upload " + pendingCount + " file" + (pendingCount !== 1 ? "s" : "")
              : "Upload"}
          </Button>
        </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
