"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Upload, X, CloudUpload, FileIcon,
} from "lucide-react";
import { typeIcons, typeColors, getFileTypeFromName, formatFileSize } from "./data";

export function UploadDialog({ open, onOpenChange }) {
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const intervalRef = useRef(null);

  const addFiles = useCallback((newFiles) => {
    const mapped = Array.from(newFiles).map((f) => ({
      id: Math.random().toString(36).slice(2),
      file: f,
      name: f.name,
      size: f.size,
      type: getFileTypeFromName(f.name),
      progress: 0,
      status: "pending",
    }));
    setFiles((prev) => [...prev, ...mapped]);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const simulateUpload = useCallback(() => {
    setFiles((prev) =>
      prev.map((f) =>
        f.status === "pending" ? { ...f, status: "uploading", progress: 0 } : f
      )
    );

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setFiles((prev) => {
        let allDone = true;
        const updated = prev.map((f) => {
          if (f.status === "uploading") {
            const next = Math.min(f.progress + Math.random() * 25 + 5, 100);
            const done = next >= 100;
            if (!done) allDone = false;
            return {
              ...f,
              progress: done ? 100 : Math.round(next),
              status: done ? "done" : "uploading",
            };
          }
          return f;
        });
        if (allDone && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return updated;
      });
    }, 400);
  }, []);

  const removeFile = useCallback((id) => setFiles((prev) => prev.filter((f) => f.id !== id)), []);

  const clearDone = useCallback(() => setFiles((prev) => prev.filter((f) => f.status !== "done")), []);

  const handleOpenChange = useCallback(
    (nextOpen) => {
      if (!nextOpen && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      onOpenChange(nextOpen);
    },
    [onOpenChange]
  );

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const uploadingCount = files.filter((f) => f.status === "uploading").length;
  const doneCount = files.filter((f) => f.status === "done").length;

  const dropZoneBase = "relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
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
          <p className="text-xs text-text-tertiary">or click to browse · Max 500 MB per file</p>
        </div>

        {files.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-tertiary">
                {files.length} file{files.length !== 1 && "s"} · {doneCount} done
                {uploadingCount > 0 && " · " + uploadingCount + " uploading"}
                {pendingCount > 0 && " · " + pendingCount + " pending"}
              </span>
              {doneCount > 0 && (
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
                      <span className="text-[10px] text-text-tertiary flex-shrink-0">{formatFileSize(f.size)}</span>
                    </div>
                    {f.status === "uploading" && (
                      <Progress value={f.progress} className="h-1 mt-1.5 bg-surface-active" />
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-text-tertiary hover:text-red-400 flex-shrink-0" onClick={() => removeFile(f.id)}>
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <Button variant="ghost" className="text-text-tertiary hover:text-foreground" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary"
            disabled={files.length === 0 || uploadingCount > 0}
            onClick={simulateUpload}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploadingCount > 0
              ? "Uploading " + uploadingCount + "..."
              : pendingCount > 0
              ? "Upload " + pendingCount + " file" + (pendingCount !== 1 ? "s" : "")
              : "Upload"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
