"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, LoadingArea } from "@geiger/ui";
import {
  CloudUpload,
  Download,
  ExternalLink,
  LayoutGrid,
  Link2,
  List,
  PanelRight,
  Pencil,
  SearchX,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useProject } from "@/context/project-context";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import {
  EmptyState,
  ScreenHeader,
  SearchInput,
  StatsBar,
  Toolbar,
} from "@/components/internal/shared/screen_kit";
import {
  ListPagination,
  usePagination,
} from "@/components/internal/shared/pagination";
import FilterDropdown from "@/components/internal/screens/projects/overview/filter_dropdown";
import {
  assetDownloadUrl,
  deleteAsset,
  listAssets,
  updateAsset,
} from "@/features/assets/actions";
import {
  ASSET_SORTS,
  DEFAULT_ASSET_SORT,
  MEDIA_TYPE_FILTERS,
  formatBytes,
  mediaMeta,
} from "@/features/assets/constants";
import { AssetGrid } from "./asset_grid";
import { MediaTable } from "./media_table";
import { AssetDetailSheet } from "./asset_detail_sheet";
import { DeleteAssetDialog, RenameAssetDialog } from "./asset_dialogs";
import { StorageBreakdown } from "./storage_breakdown";
import { UploadDialog, toUploadEntries } from "./upload_dialog";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const VIEW_OPTIONS = [
  { value: "grid", label: "Grid view", icon: LayoutGrid },
  { value: "list", label: "List view", icon: List },
];

const SORTERS = {
  newest: (a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0),
  oldest: (a, b) => new Date(a.createdAt ?? 0) - new Date(b.createdAt ?? 0),
  largest: (a, b) => b.sizeBytes - a.sizeBytes,
  name: (a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }),
};

// Non-breaking space keeps "28.9 MB" intact inside StatsBar's rolling number.
function statBytes(bytes) {
  return formatBytes(bytes).replace(" ", "\u00A0");
}

function hasFiles(event) {
  return Array.from(event.dataTransfer?.types ?? []).includes("Files");
}

export function AssetsScreen() {
  const { project } = useProject();
  const projectId = project?.id;

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  // Fetch time anchors the "added this week" KPI without calling Date.now() during render.
  const [loadedAt, setLoadedAt] = useState(0);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sort, setSort] = useState(DEFAULT_ASSET_SORT);
  const [view, setView] = useState("grid");
  // Sheet keeps the last opened asset as a snapshot so it can animate out after a delete.
  const [detail, setDetail] = useState({ open: false, asset: null });
  // Rename/delete dialogs share one slot; `key` remounts the rename draft per open.
  const [dialog, setDialog] = useState({ type: null, asset: null, key: 0 });
  const [upload, setUpload] = useState({ open: false, key: 0, files: [] });
  const [dragActive, setDragActive] = useState(false);
  const dragDepth = useRef(0);

  useEffect(() => {
    if (!projectId) {
      return;
    }
    let active = true;
    void Promise.resolve().then(async () => {
      setLoading(true);
      const rows = await listAssets(projectId);
      if (active) {
        setAssets(rows ?? []);
        setLoadedAt(Date.now());
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [projectId]);

  const visibleAssets = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return assets
      .filter((asset) => {
        if (typeFilter !== "all" && asset.mediaType !== typeFilter) {
          return false;
        }
        if (!needle) {
          return true;
        }
        return (
          asset.name.toLowerCase().includes(needle) ||
          (asset.owner ?? "").toLowerCase().includes(needle) ||
          asset.tags.some((tag) => tag.toLowerCase().includes(needle))
        );
      })
      .sort(SORTERS[sort] ?? SORTERS.newest);
  }, [assets, query, typeFilter, sort]);

  const pager = usePagination(visibleAssets, {
    resetKey: `${query}|${typeFilter}|${sort}`,
  });

  const stats = useMemo(() => {
    const totalBytes = assets.reduce((sum, asset) => sum + asset.sizeBytes, 0);
    const largest = assets.reduce((max, asset) => (!max || asset.sizeBytes > max.sizeBytes ? asset : max), null);
    const addedThisWeek = assets.filter(
      (asset) => loadedAt - new Date(asset.createdAt ?? 0).getTime() < WEEK_MS,
    ).length;
    const mediaCount = assets.filter((asset) =>
      ["image", "video", "audio"].includes(asset.mediaType),
    ).length;

    return [
      {
        label: "Total assets",
        value: String(assets.length),
        footer: addedThisWeek > 0 ? `${addedThisWeek} added this week` : "None added this week",
      },
      {
        label: "Storage used",
        value: statBytes(totalBytes),
        footer: assets.length > 0 ? `Avg ${formatBytes(totalBytes / assets.length)} per file` : "Nothing stored yet",
      },
      {
        label: "Media files",
        value: String(mediaCount),
        footer: "Images, video and audio",
      },
      {
        label: "Largest file",
        value: statBytes(largest?.sizeBytes ?? 0),
        footer: largest ? `${mediaMeta(largest.mediaType).label} file` : "No files yet",
      },
    ];
  }, [assets, loadedAt]);

  const hasFilters = typeFilter !== "all" || query.trim().length > 0;
  const detailAsset = assets.find((asset) => asset.id === detail.asset?.id) ?? detail.asset;

  const clearFilters = () => {
    setQuery("");
    setTypeFilter("all");
  };

  // Each open remounts the dialog so a page drop can seed its queue.
  const openUpload = (fileList) => {
    const files = fileList ? toUploadEntries(fileList) : [];
    if (fileList && files.length === 0) {
      return;
    }
    setUpload((prev) => ({ open: true, key: prev.key + 1, files }));
  };

  const openDetails = (asset) => setDetail({ open: true, asset });
  const openDialog = (type, asset) => setDialog((prev) => ({ type, asset, key: prev.key + 1 }));
  const closeDialog = () => setDialog((prev) => ({ ...prev, type: null }));

  const handleUploaded = (created) => {
    if (created) {
      setAssets((prev) => [created, ...prev.filter((asset) => asset.id !== created.id)]);
    }
  };

  // Optimistic patch with rollback; returns the saved row or null.
  const patchAsset = async (id, patch, errorMessage) => {
    const previous = assets;
    setAssets((prev) => prev.map((asset) => (asset.id === id ? { ...asset, ...patch } : asset)));
    const saved = await updateAsset(id, patch);
    if (!saved) {
      setAssets(previous);
      toast.error(errorMessage);
      return null;
    }
    setAssets((prev) => prev.map((asset) => (asset.id === saved.id ? saved : asset)));
    return saved;
  };

  const handleRename = async (id, name) => {
    if (await patchAsset(id, { name }, "Couldn't rename the asset.")) {
      toast.success("Asset renamed");
    }
  };

  const handleUpdateTags = (id, tags) => patchAsset(id, { tags }, "Couldn't update tags.");

  // Optimistic delete (row + storage object) with rollback.
  const handleDelete = async (target) => {
    const previous = assets;
    setAssets((prev) => prev.filter((asset) => asset.id !== target.id));
    if (detail.asset?.id === target.id) {
      setDetail((prev) => ({ ...prev, open: false }));
    }
    const ok = await deleteAsset(target.id);
    if (!ok) {
      setAssets(previous);
      toast.error("Couldn't delete the asset.");
      return;
    }
    toast.success("Asset deleted");
  };

  const handleOpenInTab = (asset) => {
    if (asset.url) {
      window.open(asset.url, "_blank", "noopener,noreferrer");
    }
  };

  const handleDownload = (asset) => {
    const href = assetDownloadUrl(asset);
    if (!href) {
      return;
    }
    const link = document.createElement("a");
    link.href = href;
    link.download = asset.name || "asset";
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleCopyLink = async (asset) => {
    if (!asset.url) {
      return;
    }
    try {
      await navigator.clipboard.writeText(asset.url);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link.");
    }
  };

  const assetActions = (asset) => [
    { icon: PanelRight, label: "View details", onSelect: () => openDetails(asset) },
    { icon: ExternalLink, label: "Open in new tab", disabled: !asset.url, onSelect: () => handleOpenInTab(asset) },
    { icon: Download, label: "Download", disabled: !asset.url, onSelect: () => handleDownload(asset) },
    { icon: Link2, label: "Copy link", disabled: !asset.url, onSelect: () => void handleCopyLink(asset) },
    { separator: true },
    { icon: Pencil, label: "Rename", onSelect: () => openDialog("rename", asset) },
    { icon: Trash2, label: "Delete", destructive: true, onSelect: () => openDialog("delete", asset) },
  ];

  // Page-level drop target; the depth counter ignores enter/leave flicker across children.
  const dropHandlers = {
    onDragEnter: (event) => {
      if (upload.open || !hasFiles(event)) {
        return;
      }
      event.preventDefault();
      dragDepth.current += 1;
      setDragActive(true);
    },
    onDragOver: (event) => {
      if (upload.open || !hasFiles(event)) {
        return;
      }
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    },
    onDragLeave: (event) => {
      if (upload.open || !hasFiles(event)) {
        return;
      }
      dragDepth.current = Math.max(0, dragDepth.current - 1);
      if (dragDepth.current === 0) {
        setDragActive(false);
      }
    },
    onDrop: (event) => {
      if (upload.open || !hasFiles(event)) {
        return;
      }
      event.preventDefault();
      dragDepth.current = 0;
      setDragActive(false);
      openUpload(event.dataTransfer.files);
    },
  };

  const uploadButton = (label) => (
    <Button
      className="bg-primary text-primary-foreground hover:bg-primary/90"
      onClick={() => openUpload()}
    >
      <Upload className="h-4 w-4" />
      {label}
    </Button>
  );

  return (
    <MainScreenWrapper className="relative text-foreground" {...dropHandlers}>
      {/* Drop overlay sits first with m-0 so space-y never shifts the layout. */}
      {dragActive && (
        <div className="pointer-events-none absolute inset-0 z-30 m-0 flex items-center justify-center rounded-2xl border-2 border-dashed border-border-strong bg-background/85 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-surface-card text-foreground">
              <CloudUpload className="h-6 w-6" />
            </div>
            <p className="text-base font-semibold text-foreground">Drop files to upload</p>
            <p className="text-sm text-text-secondary">They&apos;ll be added to this project&apos;s assets.</p>
          </div>
        </div>
      )}

      <ScreenHeader
        title="Assets"
        description="Store, preview and share the files that power this project."
        actions={uploadButton("Upload")}
      />

      <div className="space-y-4">
        <StatsBar stats={stats} />
        {!loading && (
          <StorageBreakdown assets={assets} activeType={typeFilter} onSelectType={setTypeFilter} />
        )}
      </div>

      <Toolbar>
        {/* Mobile: zero basis lets this lane scroll beside the search icon instead of wrapping it. */}
        <div className="flex items-center gap-2 max-sm:min-h-fit max-sm:basis-0">
          <div
            role="group"
            aria-label="Layout"
            className="flex h-9 items-center rounded-lg border border-border bg-surface-subtle p-0.5"
          >
            {VIEW_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant="ghost"
                size="sm"
                aria-label={option.label}
                aria-pressed={view === option.value}
                title={option.label}
                onClick={() => setView(option.value)}
                className={cn(
                  "h-full w-8 rounded-md px-0 has-[>svg]:px-0",
                  view === option.value
                    ? "bg-surface-hover text-foreground"
                    : "text-text-tertiary hover:bg-transparent hover:text-muted-foreground",
                )}
              >
                <option.icon className="h-3.5 w-3.5" />
              </Button>
            ))}
          </div>
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
          placeholder="Search names, tags, owners…"
        />
      </Toolbar>

      {loading ? (
        <LoadingArea panel label="Loading assets" className="min-h-[280px]" />
      ) : assets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-strong bg-surface-subtle">
          <EmptyState
            icon={CloudUpload}
            title="No assets yet"
            description="Drop files anywhere on this page, or upload them from your computer."
            action={uploadButton("Upload files")}
          />
        </div>
      ) : visibleAssets.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface-subtle">
          <EmptyState
            icon={SearchX}
            title="No matching assets"
            description="Nothing matches your search or filters. Clear them to see everything."
            action={
              hasFilters ? (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                >
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="space-y-5">
          {view === "grid" ? (
            <AssetGrid assets={pager.pageItems} onOpen={openDetails} actions={assetActions} />
          ) : (
            <MediaTable assets={pager.pageItems} onOpen={openDetails} actions={assetActions} />
          )}
          <ListPagination {...pager} itemLabel="assets" />
        </div>
      )}

      <UploadDialog
        key={upload.key}
        open={upload.open}
        onOpenChange={(open) => setUpload((prev) => ({ ...prev, open }))}
        projectId={projectId}
        initialFiles={upload.files}
        onUploaded={handleUploaded}
      />

      <AssetDetailSheet
        asset={detailAsset}
        open={detail.open}
        onOpenChange={(open) => setDetail((prev) => ({ ...prev, open }))}
        onOpenInTab={handleOpenInTab}
        onDownload={handleDownload}
        onCopyLink={(asset) => void handleCopyLink(asset)}
        onRename={(asset) => openDialog("rename", asset)}
        onDelete={(asset) => openDialog("delete", asset)}
        onUpdateTags={handleUpdateTags}
      />

      <RenameAssetDialog
        key={`rename-${dialog.key}`}
        asset={dialog.asset}
        open={dialog.type === "rename"}
        onOpenChange={(open) => !open && closeDialog()}
        onSubmit={handleRename}
      />

      <DeleteAssetDialog
        asset={dialog.asset}
        open={dialog.type === "delete"}
        onOpenChange={(open) => !open && closeDialog()}
        onConfirm={handleDelete}
      />

    </MainScreenWrapper>
  );
}

export default AssetsScreen;
