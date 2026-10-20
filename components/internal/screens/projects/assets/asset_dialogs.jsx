"use client";

import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from "@geiger/ui";
import { Field } from "@/components/internal/shared/screen_kit";

// Keyed by asset id at the call site, so the draft seeds from props with no sync effect.
export function RenameAssetDialog({ asset, open, onOpenChange, onSubmit }) {
  const [name, setName] = useState(asset?.name ?? "");
  const trimmed = name.trim();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!trimmed) {
      return;
    }
    onOpenChange(false);
    if (trimmed !== asset.name) {
      onSubmit(asset.id, trimmed);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename asset</DialogTitle>
          <DialogDescription>Give &quot;{asset?.name}&quot; a new name.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <Field label="File name" htmlFor="asset-rename">
            <Input
              id="asset-rename"
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              // Select the base name so typing keeps the extension.
              onFocus={(event) => {
                const dot = event.target.value.lastIndexOf(".");
                event.target.setSelectionRange(0, dot > 0 ? dot : event.target.value.length);
              }}
              placeholder="Enter file name"
              className="border-border bg-surface-card text-foreground placeholder:text-text-secondary"
            />
          </Field>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!trimmed}
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

export function DeleteAssetDialog({ asset, open, onOpenChange, onConfirm }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete asset</DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{asset?.name}</span> and its stored file
            will be removed from this project. This action can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-red-500/90 text-white hover:bg-red-500"
            onClick={() => {
              onOpenChange(false);
              if (asset) {
                onConfirm(asset);
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
