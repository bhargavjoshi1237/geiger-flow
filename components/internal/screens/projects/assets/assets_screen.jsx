"use client";

import React, { useState } from "react";
import { Button } from "@geiger/ui";
import { Upload, ExternalLink } from "lucide-react";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { StatsRow } from "./stats_cards";
import { MediaTable } from "./media_table";
import { StorageBreakdownCard } from "./storage_breakdown";
import { UploadDialog } from "./upload_dialog";
import { ActivityCard } from "./activity_card";
import { TopAssetsCard } from "./top_assets_card";

export function AssetsScreen() {
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <MainScreenWrapper className="text-foreground">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Assets</h1>
          <p className="text-muted-foreground mt-1">
            Manage assets and track storage usage for this project.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-border bg-transparent text-muted-foreground hover:bg-surface-active hover:text-foreground"
            asChild
          >
            <a href="#" title="Open in Digital Asset Manager">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open DAM
            </a>
          </Button>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary"
            onClick={() => setUploadOpen(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />

      <div className="space-y-6 mt-6">
        <StatsRow />

        <div>
          <MediaTable />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ActivityCard />
          <TopAssetsCard />
          <StorageBreakdownCard />
        </div>
      </div>
    </MainScreenWrapper>
  );
}
