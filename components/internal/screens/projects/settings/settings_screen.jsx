import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GeneralSettingsScreen } from "./general/general_settings";
import { SecondaryScreenWrapper } from "@/components/internal/shared/screen_wrappers";

export function SettingsScreen({ activeSettingsTab = "General" }) {
  const renderContent = () => {
    switch (activeSettingsTab) {
      case "General":
        return <GeneralSettingsScreen />;
      default:
        return (
          <Card className="bg-[#1a1a1a] border-[#2a2a2a] text-[#e7e7e7]">
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription className="text-[#a3a3a3]">
                Update your {activeSettingsTab.toLowerCase()} configuration
                here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 rounded bg-[#111] border border-[#2a2a2a] flex items-center justify-center text-[#525252]">
                {activeSettingsTab} settings template area
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <SecondaryScreenWrapper>
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight mb-2">
          {activeSettingsTab}
        </h1>
        <p className="text-[#a3a3a3] text-sm">
          Manage your {activeSettingsTab.toLowerCase()} settings for this
          project.
        </p>
      </div>

      {renderContent()}
    </SecondaryScreenWrapper>
  );
}
