"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@geiger/ui";
import { ActionMenu } from "@geiger/ui";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@geiger/ui";
import { Input } from "@geiger/ui";
import { Badge } from "@geiger/ui";
import { cn } from "@/lib/utils";
import {
  Eye,
  Download as DownloadIcon,
  Pencil,
  Copy,
  Link2Icon,
  Trash2,
  Search,
  PanelRightClose,
  PanelRightOpen,
  HardDrive,
  Calendar,
  Ruler,
  User,
  Loader2,
} from "lucide-react";
import {
  DataTable,
  EmptyState,
  SearchInput,
  Toolbar,
} from "@/components/internal/shared/screen_kit";
import {
  ListPagination,
  usePagination,
} from "@/components/internal/shared/pagination";
import FilterDropdown from "@/components/internal/screens/projects/overview/filter_dropdown";
import {
  MEDIA_TYPE_FILTERS,
  MEDIA_TYPE_MAP,
  ASSET_SORTS,
  DEFAULT_ASSET_SORT,
  formatBytes,
} from "@/features/assets/constants";
import { typeIcons, typeColors } from "./data";

function formatDate(value) {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function extensionOf(name) {
  const ext = name.split(".").pop();
  return ext && ext !== name ? ext.toUpperCase() : "—";
}

function DetailsPane({ item, onCollapse }) {
  const IconComp = item ? typeIcons[item.mediaType] : HardDrive;
  const meta = item ? MEDIA_TYPE_MAP[item.mediaType] : null;

  const preview = () => {
    if (item?.url) {
      window.open(item.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <aside className="border-t border-border bg-surface-subtle p-4 xl:border-l xl:border-t-0">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Asset details</p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onCollapse}
          title="Collapse asset details"
          className="hidden h-7 w-7 text-text-secondary hover:bg-surface-active hover:text-foreground xl:inline-flex"
        >
          <PanelRightClose className="h-4 w-4" />
        </Button>
      </div>

      {item ? (
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-border bg-surface-dialog p-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-surface-active">
                <IconComp className={cn("h-5 w-5", typeColors[item.mediaType])} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-medium leading-5 text-foreground">{item.name}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <Badge className={cn("border px-1.5 py-0 text-[11px]", meta?.className)}>
                    {meta?.label ?? item.mediaType}
                  </Badge>
                  <span className="text-xs text-text-tertiary">{formatBytes(item.sizeBytes)}</span>
                  <span className="text-xs text-text-tertiary">·</span>
                  <span className="text-xs text-text-tertiary">{extensionOf(item.name)}</span>
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button
                onClick={preview}
                disabled={!item.url}
                className="h-8 bg-primary text-xs text-primary-foreground hover:bg-primary/90"
                size="sm"
              >
                <Eye className="h-3.5 w-3.5" />
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!item.url}
                onClick={() => navigator.clipboard?.writeText(item.url)}
                className="h-8 border-border bg-transparent text-xs text-muted-foreground hover:bg-surface-active hover:text-foreground"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy Link
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface-dialog">
            {[
              [User, "Owner", item.owner || "—"],
              [Calendar, "Uploaded", formatDate(item.createdAt)],
              [Ruler, "Size", formatBytes(item.sizeBytes)],
              [HardDrive, "Storage Path", item.storagePath || "—"],
            ].map(([MetaIcon, label, value]) => (
              <div key={label} className="flex items-center gap-3 border-b border-border px-3 py-2.5 last:border-0">
                <MetaIcon className="h-3.5 w-3.5 shrink-0 text-text-secondary" />
                <p className="min-w-20 text-xs text-text-secondary">{label}</p>
                <p className="ml-auto min-w-0 truncate text-right text-xs font-medium text-foreground" title={value}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-text-secondary">Tags</p>
            {item.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <Badge key={tag} className="border-border bg-surface-card px-2 py-0.5 text-xs text-muted-foreground">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-tertiary">No tags yet.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-md border border-dashed border-border bg-surface-dialog p-4 text-center">
          <HardDrive className="mx-auto h-5 w-5 text-text-tertiary" />
          <p className="mt-3 text-sm text-muted-foreground">Select an asset to inspect metadata and actions.</p>
        </div>
      )}
    </aside>
  );
}

export function MediaTable({ assets = [], loading = false, onRename, onDelete }) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sort, setSort] = useState(DEFAULT_ASSET_SORT);
  // Selection falls back to the first sorted row until the user picks one;
  // deriving it avoids a setState-in-effect dance when rows load or change.
  const [userSelectedId, setUserSelectedId] = useState(null);
  // Inline rename: { id, value } while editing, null otherwise.
  const [renaming, setRenaming] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDetailsPaneCollapsed, setIsDetailsPaneCollapsed] = useState(false);

  const sortedAssets = useMemo(() => {
    const rows = [...assets];
    switch (sort) {
      case "oldest":
        return rows.sort(
          (a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime(),
        );
      case "largest":
        return rows.sort((a, b) => b.sizeBytes - a.sizeBytes);
      case "name":
        return rows.sort((a, b) => a.name.localeCompare(b.name));
      case "newest":
      default:
        return rows.sort(
          (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
        );
    }
  }, [assets, sort]);

  const selectedId =
    userSelectedId && assets.some((asset) => asset.id === userSelectedId)
      ? userSelectedId
      : sortedAssets[0]?.id ?? null;
  const selectedItem = assets.find((item) => item.id === selectedId) || null;

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return sortedAssets.filter((item) => {
      const matchesType = typeFilter === "all" || item.mediaType === typeFilter;
      const matchesQuery =
        !normalizedQuery ||
        item.name.toLowerCase().includes(normalizedQuery) ||
        (item.owner ?? "").toLowerCase().includes(normalizedQuery) ||
        item.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));

      return matchesType && matchesQuery;
    });
  }, [sortedAssets, query, typeFilter]);

  const pager = usePagination(visibleItems, {
    resetKey: `${query}|${typeFilter}|${sort}`,
  });

  const startRename = (item) => {
    setRenaming({ id: item.id, value: item.name });
  };

  const commitRename = () => {
    if (!renaming) {
      return;
    }
    const nextName = renaming.value.trim();
    const item = assets.find((asset) => asset.id === renaming.id);
    setRenaming(null);
    if (!item || !nextName || nextName === item.name) {
      return;
    }
    onRename?.(item.id, nextName);
  };

  const handlePreview = (item) => {
    if (item.url) {
      window.open(item.url, "_blank", "noopener,noreferrer");
    }
  };

  const handleCopyLink = (item) => {
    if (item.url) {
      void navigator.clipboard?.writeText(item.url);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (item) => {
        const IconComp = typeIcons[item.mediaType];
        const isRenaming = renaming?.id === item.id;
        return (
          <div className="flex min-w-[190px] items-center gap-2 font-medium text-foreground">
            <IconComp className={cn("h-4 w-4 shrink-0", typeColors[item.mediaType])} />
            {isRenaming ? (
              <Input
                autoFocus
                value={renaming.value}
                onChange={(event) => setRenaming({ id: item.id, value: event.target.value })}
                onBlur={commitRename}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    commitRename();
                  } else if (event.key === "Escape") {
                    setRenaming(null);
                  }
                }}
                onClick={(event) => event.stopPropagation()}
                className="!h-7 max-w-56 border-border-strong bg-background text-sm text-foreground"
              />
            ) : (
              <span className="truncate">{item.name}</span>
            )}
          </div>
        );
      },
    },
    {
      key: "size",
      header: "Size",
      render: (item) => (
        <span className="whitespace-nowrap text-muted-foreground">{formatBytes(item.sizeBytes)}</span>
      ),
    },
    {
      key: "owner",
      header: "Owner",
      render: (item) => (
        <span className="whitespace-nowrap text-muted-foreground">{item.owner || "—"}</span>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (item) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      className: "text-right",
      render: (item) => (
        <ActionMenu
          label={`Actions for ${item.name}`}
          items={[
            { icon: Eye, label: "Preview", disabled: !item.url, onSelect: () => handlePreview(item) },
            { icon: DownloadIcon, label: "Download", disabled: !item.url, onSelect: () => handlePreview(item) },
            { icon: Link2Icon, label: "Copy Link", disabled: !item.url, onSelect: () => handleCopyLink(item) },
            { separator: true },
            { icon: Pencil, label: "Rename", onSelect: () => startRename(item) },
            { icon: Trash2, label: "Delete", destructive: true, onSelect: () => setDeleteTarget(item) },
          ]}
        />
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-subtle px-6 py-16 text-sm text-text-secondary">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading assets…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Toolbar>
        <div className="flex items-center gap-2">
          <FilterDropdown
            value={typeFilter}
            onValueChange={setTypeFilter}
            options={MEDIA_TYPE_FILTERS}
            height="h-9"
          />
          <FilterDropdown
            value={sort}
            onValueChange={setSort}
            options={ASSET_SORTS}
            height="h-9"
          />
        </div>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search assets, tags, owners…"
        />
      </Toolbar>

      <div
        className={cn(
          "grid grid-cols-1 overflow-hidden rounded-xl border border-border bg-surface-subtle",
          isDetailsPaneCollapsed ? "xl:grid-cols-[48px_minmax(0,1fr)]" : "xl:grid-cols-[minmax(0,1fr)_300px]",
        )}
      >
        <div className="order-2 min-w-0 xl:order-1">
          <DataTable
            columns={columns}
            data={pager.pageItems}
            getRowKey={(item) => item.id}
            onRowClick={(item) => setUserSelectedId(item.id)}
            className="rounded-none border-0"
            empty={
              <div className="rounded-xl border border-border bg-surface-subtle">
                <EmptyState
                  icon={Search}
                  title="No assets found"
                  description={
                    assets.length === 0
                      ? "Upload your first asset to get started."
                      : "Try a different search or type filter."
                  }
                />
              </div>
            }
          />
          <div className="border-t border-border px-4 py-4">
            <ListPagination {...pager} itemLabel="assets" />
          </div>
        </div>

        {isDetailsPaneCollapsed ? (
          <aside className="order-1 hidden border-t border-border bg-surface-subtle p-2 xl:order-2 xl:flex xl:items-start xl:justify-center xl:border-l xl:border-t-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsDetailsPaneCollapsed(false)}
              title="Expand asset details"
              className="h-8 w-8 text-text-secondary hover:bg-surface-active hover:text-foreground"
            >
              <PanelRightOpen className="h-4 w-4" />
            </Button>
          </aside>
        ) : (
          <div className="order-1 xl:order-2">
            <DetailsPane
              item={selectedItem}
              onCollapse={() => setIsDetailsPaneCollapsed(true)}
            />
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="bg-surface-subtle text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete asset?</DialogTitle>
            <DialogDescription className="text-text-secondary">
              &quot;{deleteTarget?.name}&quot; will be removed from this project along with its stored
              file. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              className="text-text-tertiary hover:text-foreground"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-500/90 text-white hover:bg-red-500"
              onClick={() => {
                const target = deleteTarget;
                setDeleteTarget(null);
                if (target) {
                  onDelete?.(target.id);
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
