import React, { useState } from "react";
import { GeneralSettingsScreen } from "./general/general_settings";
import { CustomsCreateFieldButton, CustomsSettingsScreen } from "./customs/customs_settings";
import { AddonsSettingsScreen, AddonsViewToggle } from "./addons/addons_settings";
import { UsageSettingsScreen } from "./usage/usage_screen";
import { AdvancedSettingsScreen } from "./advanced/advanced_settings";
import { EnterpriseSettingsScreen } from "./enterprise/enterprise_settings";
import { ConnectionsScreen } from "./connections/connections_screen";
import { NavigationSettingsScreen } from "./navigation/navigation_settings";
import { SecondaryScreenWrapper } from "@/components/internal/shared/screen_wrappers";

export function SettingsScreen({ activeSettingsTab = "General" }) {
  const [addonsCompactView, setAddonsCompactView] = useState(false);
  const [customsCreateOpen, setCustomsCreateOpen] = useState(false);

  const renderContent = () => {
    switch (activeSettingsTab) {
      case "General":
        return <GeneralSettingsScreen />;
      case "Connections":
        return <ConnectionsScreen />;
      case "Customs":
        return (
          <CustomsSettingsScreen
            isCreateOpen={customsCreateOpen}
            onCreateOpenChange={setCustomsCreateOpen}
          />
        );
      case "Navigation":
        return <NavigationSettingsScreen />;
      case "Add-ons":
        return <AddonsSettingsScreen compactView={addonsCompactView} />;
      case "Usage":
        return <UsageSettingsScreen />;
      case "Advanced":
        return <AdvancedSettingsScreen />;
      case "Enterprise":
        return <EnterpriseSettingsScreen />;
      default:
        return (
          <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-border rounded-lg text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <span>{activeSettingsTab} settings placeholder</span>
            </div>
          </div>
        );
    }
  };

  return (
    <SecondaryScreenWrapper>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight mb-2">
            {activeSettingsTab}
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage your {activeSettingsTab.toLowerCase()} settings for this
            project.
          </p>
        </div>

        {activeSettingsTab === "Customs" && (
          <CustomsCreateFieldButton onClick={() => setCustomsCreateOpen(true)} />
        )}

        {activeSettingsTab === "Add-ons" && (
          <AddonsViewToggle
            compactView={addonsCompactView}
            onToggle={() => setAddonsCompactView((value) => !value)}
          />
        )}
      </div>

      {renderContent()}
    </SecondaryScreenWrapper>
  );
}
