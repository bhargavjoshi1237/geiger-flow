"use client";

import React from "react";
import { MainScreenWrapper } from "@/components/internal/shared/screen_wrappers";
import { ScreenHeader } from "@/components/internal/shared/screen_kit";
import { OfficeRecentScreen } from "./office_recent_screen";
import { OfficeFoldersScreen } from "./office_folders_screen";
import { OfficeSharedScreen } from "./office_shared_screen";

const SCREEN_META = {
  "Recent Files": {
    title: "Recent Files",
    description: "Documents, spreadsheets, and decks created in this project.",
  },
  Folders: {
    title: "Folders",
    description: "Organize this project's office files into folders.",
  },
  "Shared with Project": {
    title: "Shared with Project",
    description: "Files other members have shared with everyone on this project.",
  },
};

export function OfficeScreen({ activeTab = "Recent Files" }) {
  const meta = SCREEN_META[activeTab] ?? SCREEN_META["Recent Files"];

  const renderContent = () => {
    switch (activeTab) {
      case "Folders":
        return <OfficeFoldersScreen />;
      case "Shared with Project":
        return <OfficeSharedScreen />;
      default:
        return <OfficeRecentScreen />;
    }
  };

  return (
    <MainScreenWrapper>
      <ScreenHeader title={meta.title} description={meta.description} />
      {renderContent()}
    </MainScreenWrapper>
  );
}
