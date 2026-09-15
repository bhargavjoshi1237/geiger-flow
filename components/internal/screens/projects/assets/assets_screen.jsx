"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button, LoadingArea } from "@geiger/ui";
import { Upload, FolderPlus } from "lucide-react";
import { toast } from "sonner";
import { useProject } from "@/context/project-context";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import {
  EmptyState,
  ScreenHeader,
  StatsBar,
} from "@/components/internal/shared/screen_kit";
import {
  listAssets,
  updateAsset,
  deleteAsset,
} from "@/features/assets/actions";
import {
  MEDIA_TYPES,
  formatBytes,
} from "@/features/assets/constants";
import { MediaTable } from "./media_table";
import { UploadDialog } from "./upload_dialog";


export function AssetsScreen() {
  const { project } = useProject();
  const projectId = project?.id;

  const [uploadOpen, setUploadOpen] = useState(false);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch on mount / project change. listAssets returns [] when unconfigured
  // or on failure — the screen renders its empty state either way.
  useEffect(() => {
    if (!projectId) {
      return;
    }
    let active = true;
    void Promise.resolve().then(async () => {
      setLoading(true);
      const rows = await listAssets(projectId);
      if (active) {
        setAssets(rows);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [projectId]);

  // KPIs: total count, summed storage, distinct types in use, largest file.
  const stats = useMemo(() => {
    const totalSize = assets.reduce((sum, asset) => sum + asset.sizeBytes, 0);
    const largest = assets.reduce((max, asset) => Math.max(max, asset.sizeBytes), 0);
    const typeCount = new Set(assets.map((asset) => asset.mediaType)).size;

    return [
      { label: "Total assets", value: String(assets.length), footer: `${typeCount} types in use` },
      { label: "Storage used", value: formatBytes(totalSize), footer: "Across all assets" },
      { label: "Asset types", value: String(typeCount), footer: `Of ${MEDIA_TYPES.length} supported` },
      { label: "Largest asset", value: formatBytes(largest), footer: "Single biggest file" },
    ];
  }, [assets]);

  // Upload success: prepend the persisted row.
  const handleUploaded = (created) => {
    if (!created) {
      return;
    }
    setAssets((prev) => [created, ...prev]);
  };

  // Optimistic rename with rollback + toast on failure.
  const handleRename = async (id, nextName) => {
    const previous = assets;
    setAssets((prev) =>
      prev.map((asset) => (asset.id === id ? { ...asset, name: nextName } : asset)),
    );

    const saved = await updateAsset(id, { name: nextName });
    if (!saved) {
      setAssets(previous);
      toast.error("Couldn't rename the asset.");
      return;
    }

    setAssets((prev) => prev.map((asset) => (asset.id === saved.id ? saved : asset)));
    toast.success("Asset renamed");
  };

  // Optimistic delete (row + storage object) with rollback + toast.
  const handleDelete = async (id) => {
    const previous = assets;
    setAssets((prev) => prev.filter((asset) => asset.id !== id));

    const ok = await deleteAsset(id);
    if (!ok) {
      setAssets(previous);
      toast.error("Couldn't delete the asset.");
      return;
    }

    toast.success("Asset deleted");
  };

  return (
    <MainScreenWrapper className="text-foreground">
      <ScreenHeader
        title="Assets"
        description="Manage assets and track storage usage for this project."
        actions={
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setUploadOpen(true)}
          >
            <Upload className="h-4 w-4" />
            Upload
          </Button>
        }
      />

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        projectId={projectId}
        onUploaded={handleUploaded}
      />

      {loading ? (
        <LoadingArea panel label="Loading assets" className="rounded-none" />
      ) : assets.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface-subtle">
          <EmptyState
            icon={FolderPlus}
            title="No assets yet"
            description="Upload your first file to get started."
            action={
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setUploadOpen(true)}
              >
                <Upload className="h-4 w-4" />
                Upload Asset
              </Button>
            }
          />
        </div>
      ) : (
        <div className="space-y-6">
          <StatsBar stats={stats} />

          <div>
            <MediaTable
              assets={assets}
              loading={loading}
              onRename={handleRename}
              onDelete={handleDelete}
            />
          </div>
        </div>
      )}
    </MainScreenWrapper>
  );
}

export default AssetsScreen;
