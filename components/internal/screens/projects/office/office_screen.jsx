"use client";

import React from "react";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { OfficeRecentScreen } from "./office_recent_screen";
import { OfficeFoldersScreen } from "./office_folders_screen";
import { OfficeSharedScreen } from "./office_shared_screen";

const SCREEN_META = {
  "Recent Files": {
    title: "Recent Files",
    subtitle: "Office files created in this project.",
  },
  Folders: {
    title: "Folders",
    subtitle: "Organize your office files into folders.",
  },
  "Shared with Project": {
    title: "Shared with Project",
    subtitle: "Files shared with all members of this project.",
  },
};

export function OfficeScreen({ activeTab = "Recent Files" }) {
  const meta = SCREEN_META[activeTab] ?? SCREEN_META["Recent Files"];

  const renderContent = () => {
    switch (activeTab) {
      case "Recent Files":
        return <OfficeRecentScreen />;
      case "Folders":
        return <OfficeFoldersScreen />;
      case "Shared with Project":
        return <OfficeSharedScreen />;
      default:
        return <OfficeRecentScreen />;
    }
  };

  return (
    <MainScreenWrapper className="text-foreground">
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-bold text-foreground">{meta.title}</h1>
        <p className="text-muted-foreground mt-1">{meta.subtitle}</p>
      </div>
      <div className="mt-6">{renderContent()}</div>
    </MainScreenWrapper>
  );
}
