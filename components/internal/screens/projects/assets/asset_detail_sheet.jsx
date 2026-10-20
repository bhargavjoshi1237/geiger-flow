"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Download,
  ExternalLink,
  FileType,
  HardDrive,
  Link2,
  Pencil,
  Trash2,
  User,
  X,
} from "lucide-react";
import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@geiger/ui";
import {
  fileExtension,
  formatAssetDate,
  formatBytes,
  mediaMeta,
} from "@/features/assets/constants";
import { AssetPreview, TypeGlyph } from "./asset_preview";

function SectionHeading({ children }) {
  return (
    <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
      {children}
    </h3>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <Icon className="h-3.5 w-3.5 shrink-0 text-text-tertiary" />
      <span className="text-xs text-text-secondary">{label}</span>
      <span className="ml-auto min-w-0 truncate text-right text-xs font-medium text-foreground" title={value}>
        {value}
      </span>
    </div>
  );
}

// Chip input: Enter/comma adds, Backspace on an empty draft removes the last tag.
function TagEditor({ tags, onChange }) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const tag = draft.trim().replace(/,+$/, "");
    setDraft("");
    if (!tag || tags.some((existing) => existing.toLowerCase() === tag.toLowerCase())) {
      return;
    }
    onChange([...tags, tag]);
  };

  return (
    <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border border-border bg-surface-card px-2 py-1.5 transition-colors focus-within:border-border-strong">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-subtle py-0.5 pl-2 pr-0.5 text-xs text-muted-foreground"
        >
          {tag}
          <button
            type="button"
            aria-label={`Remove tag ${tag}`}
            onClick={() => onChange(tags.filter((existing) => existing !== tag))}
            className="rounded-sm p-0.5 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            commit();
          } else if (event.key === "Backspace" && !draft && tags.length > 0) {
            onChange(tags.slice(0, -1));
          }
        }}
        placeholder={tags.length ? "Add tag…" : "Add tags to make this easier to find…"}
        aria-label="Add tag"
        className="h-6 min-w-24 flex-1 bg-transparent px-1 text-xs text-foreground outline-none placeholder:text-text-tertiary"
      />
    </div>
  );
}

export function AssetDetailSheet({
  asset,
  open,
  onOpenChange,
  onOpenInTab,
  onDownload,
  onCopyLink,
  onRename,
  onDelete,
  onUpdateTags,
}) {
  if (!asset) {
    return null;
  }

  const meta = mediaMeta(asset.mediaType);
  const extension = fileExtension(asset.name);
  const updated =
    asset.updatedAt && asset.updatedAt !== asset.createdAt ? formatAssetDate(asset.updatedAt) : "—";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 border-l border-border bg-surface-subtle p-0 sm:max-w-lg"
      >
        <SheetHeader className="gap-0 border-b border-border p-6 pb-5">
          <div className="flex items-center gap-3 pr-8">
            <TypeGlyph type={asset.mediaType} />
            <div className="min-w-0 flex-1">
              <SheetTitle className="truncate text-[15px] font-medium leading-snug text-foreground" title={asset.name}>
                {asset.name}
              </SheetTitle>
              <SheetDescription className="mt-0.5 text-xs text-text-secondary">
                {meta.label} · {formatBytes(asset.sizeBytes)}
                {extension ? ` · ${extension}` : ""}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <div className="space-y-3">
            <div className="overflow-hidden rounded-lg border border-border">
              <AssetPreview asset={asset} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button
                size="sm"
                disabled={!asset.url}
                onClick={() => onDownload(asset)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!asset.url}
                onClick={() => onOpenInTab(asset)}
                className="border-border bg-surface-card text-muted-foreground hover:bg-surface-hover hover:text-foreground"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!asset.url}
                onClick={() => onCopyLink(asset)}
                className="border-border bg-surface-card text-muted-foreground hover:bg-surface-hover hover:text-foreground"
              >
                <Link2 className="h-3.5 w-3.5" />
                Copy link
              </Button>
            </div>
          </div>

          <div>
            <SectionHeading>Details</SectionHeading>
            <div className="divide-y divide-border rounded-lg border border-border bg-surface-card">
              <DetailRow icon={FileType} label="Type" value={extension ? `${meta.label} (${extension})` : meta.label} />
              <DetailRow icon={HardDrive} label="Size" value={formatBytes(asset.sizeBytes)} />
              <DetailRow icon={User} label="Owner" value={asset.owner || "—"} />
              <DetailRow icon={Calendar} label="Uploaded" value={formatAssetDate(asset.createdAt)} />
              <DetailRow icon={Clock} label="Last updated" value={updated} />
            </div>
          </div>

          <div>
            <SectionHeading>Tags</SectionHeading>
            <TagEditor
              key={asset.id}
              tags={asset.tags}
              onChange={(tags) => onUpdateTags(asset.id, tags)}
            />
            <p className="mt-2 text-xs text-text-tertiary">Tags are searchable from the assets toolbar.</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border px-6 py-4">
          <Button
            variant="ghost"
            onClick={() => onRename(asset)}
            className="text-muted-foreground hover:bg-surface-hover hover:text-foreground"
          >
            <Pencil className="h-4 w-4" />
            Rename
          </Button>
          <Button
            variant="ghost"
            onClick={() => onDelete(asset)}
            className="text-red-600 hover:bg-red-500/10 hover:text-red-600 dark:text-red-400 dark:hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
