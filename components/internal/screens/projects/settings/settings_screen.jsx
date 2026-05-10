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
import { CustomsSettingsScreen } from "./customs/customs_settings";
import { AddonsSettingsScreen } from "./addons/addons_settings";
import { UsageSettingsScreen } from "./usage/usage_screen";
import { AdvancedSettingsScreen } from "./advanced/advanced_settings";
import { EnterpriseSettingsScreen } from "./enterprise/enterprise_settings";
import { SecondaryScreenWrapper } from "@/components/internal/shared/screen_wrappers";

export function SettingsScreen({ activeSettingsTab = "General" }) {
  const renderContent = () => {
    switch (activeSettingsTab) {
      case "General":
        return <GeneralSettingsScreen />;
      case "Connectivity":
        return <ConnectivityScreen />;
      case "Customs":
        return <CustomsSettingsScreen />;
      case "Add-ons":
        return <AddonsSettingsScreen />;
      case "Usage":
        return <UsageSettingsScreen />;
      case "Advanced":
        return <AdvancedSettingsScreen />;
      case "Enterprise":
        return <EnterpriseSettingsScreen />;
      default:
        return (
          <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-[#2a2a2a] rounded-lg text-[#a3a3a3]">
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
