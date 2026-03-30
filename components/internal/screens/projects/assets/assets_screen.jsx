"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, ExternalLink } from "lucide-react";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { StatsRow } from "./stats_cards";
import { MediaTable } from "./media_table";
import { StorageBreakdownCard } from "./storage_breakdown";
import { UploadDialog } from "./upload_dialog";
import { ActivityCard } from "./activity_card";
import { TopAssetsCard } from "./top_assets_card";
import { DamCard } from "./dam_card";

export function AssetsScreen() {
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <MainScreenWrapper className="text-[#e7e7e7]">
      <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#e7e7e7]">Assets</h1>
          <p className="text-[#a3a3a3] mt-1">
            Manage assets and track storage usage for this project.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-[#2a2a2a] bg-transparent text-[#a3a3a3] hover:bg-[#242424] hover:text-[#e7e7e7]"
            asChild
          >
            <a href="#" title="Open in Digital Asset Manager">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open DAM
            </a>
          </Button>
          <Button
            className="bg-white text-black hover:bg-[#e7e7e7]"
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

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
          <MediaTable />
          <StorageBreakdownCard />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ActivityCard />
          <TopAssetsCard />
          <DamCard />
        </div>
      </div>
    </MainScreenWrapper>
  );
}
