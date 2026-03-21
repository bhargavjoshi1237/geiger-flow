import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GeneralSettingsScreen } from "./general/general_settings";
import { ConnectivityScreen } from "./connectivity/connectivity_screen";
import { SecondaryScreenWrapper } from "@/components/internal/shared/screen_wrappers";

export function SettingsScreen({ activeSettingsTab = "General" }) {
  const renderContent = () => {
    switch (activeSettingsTab) {
      case "General":
        return <GeneralSettingsScreen />;
      case "Connectivity":
        return <ConnectivityScreen />;
      default:
        return (
          <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-border rounded-lg text-muted">
            <div className="flex flex-col items-center gap-2">
              <span>{activeSettingsTab} settings placeholder</span>
            </div>
          </div>
        );
    }
  };

  return (
    <SecondaryScreenWrapper>
      <div>
        <h1 className="text-2xl font-bold text-primary tracking-tight mb-2">
          {activeSettingsTab}
        </h1>
        <p className="text-secondary text-sm">
          Manage your {activeSettingsTab.toLowerCase()} settings for this
          project.
        </p>
      </div>

      {renderContent()}
    </SecondaryScreenWrapper>
  );
}
