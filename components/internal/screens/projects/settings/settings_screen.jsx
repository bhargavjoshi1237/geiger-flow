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
import { EmptyState, ScreenHeader } from "@/components/internal/shared/screen_kit";
import { SlidersHorizontal } from "lucide-react";

// Header copy per settings tab — config, not data.
const SETTINGS_TAB_META = {
  General: "Name, identifiers, and the basics that describe this project.",
  Connections: "Services and repositories wired into this project.",
  Customs: "Custom fields that extend this project's entities.",
  Navigation: "Choose which sections appear in this project's sidebar.",
  "Add-ons": "Optional modules that add screens and capabilities.",
  Usage: "Resource consumption and activity across this project.",
  Advanced: "Operational controls, API access, and destructive actions.",
  Enterprise: "SSO, provisioning, retention, and compliance controls.",
};

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
          <div className="rounded-xl border border-dashed border-border bg-surface-subtle">
            <EmptyState
              icon={SlidersHorizontal}
              title={`${activeSettingsTab} settings aren't available yet`}
              description="This section has no configurable options in this project yet."
            />
          </div>
        );
    }
  };

  return (
    <SecondaryScreenWrapper>
      <ScreenHeader
        title={activeSettingsTab}
        description={
          SETTINGS_TAB_META[activeSettingsTab] ??
          `Manage your ${activeSettingsTab.toLowerCase()} settings for this project.`
        }
        actions={
          <>
            {activeSettingsTab === "Customs" && (
              <CustomsCreateFieldButton onClick={() => setCustomsCreateOpen(true)} />
            )}

            {activeSettingsTab === "Add-ons" && (
              <AddonsViewToggle
                compactView={addonsCompactView}
                onToggle={() => setAddonsCompactView((value) => !value)}
              />
            )}
          </>
        }
      />

      {renderContent()}
    </SecondaryScreenWrapper>
  );
}
