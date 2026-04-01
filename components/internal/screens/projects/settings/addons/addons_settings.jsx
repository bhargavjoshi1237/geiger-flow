"use client";

import React from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  LucidePackagePlus,
  GripVertical,
} from "lucide-react";
import { useAddonRegistry } from "@/addons/registry";
import { getInstalledAddons } from "@/addons/registry";
import { projectNav } from "@/components/internal/sidebar/projects/sidebar_data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AddonsSettingsScreen() {
  const { isAddonEnabled, toggleAddon, navPositions, setAddonNavPosition } =
    useAddonRegistry();
  const installedAddons = getInstalledAddons();

  // Build position options: "before <nav item>" for each core nav item + "end"
  const positionOptions = projectNav.map((item, idx) => ({
    value: String(idx),
    label: `Before "${item.title}"`,
  }));
  positionOptions.push({
    value: "end",
    label: "At the end",
  });
  positionOptions.push({
    value: "auto",
    label: "Auto (default)",
  });

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <h3 className="text-xl font-medium text-foreground">
            Installed Add-ons
          </h3>
          <p className="text-sm text-muted-foreground">
            Extend your project with add-ons. Enable or disable them to add or
            remove functionality. Choose where each add-on appears in the
            sidebar navigation.
          </p>
        </div>

        {installedAddons.length === 0 ? (
          <Card className="bg-card text-card-foreground border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <LucidePackagePlus className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  No add-ons available
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Add-ons will appear here when installed.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {installedAddons.map((addon) => {
              const enabled = isAddonEnabled(addon.id);
              const Icon = addon.icon;
              const currentPosition = navPositions[addon.id];
              const selectValue =
                currentPosition === undefined || currentPosition === null
                  ? "auto"
                  : String(currentPosition);

              return (
                <Card
                  key={addon.id}
                  className={`bg-card text-card-foreground transition-all duration-200 ${enabled ? "border-border" : "border-border opacity-70"}`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div
                          className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 border"
                          style={{
                            backgroundColor: enabled
                              ? `${addon.color}10`
                              : undefined,
                            borderColor: enabled
                              ? `${addon.color}30`
                              : undefined,
                          }}
                        >
                          {Icon && (
                            <Icon
                              className="w-5 h-5"
                              style={{
                                color: enabled ? addon.color : undefined,
                              }}
                            />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-foreground text-base">
                              {addon.name}
                            </h4>
                            <Badge
                              variant="outline"
                              className="text-[10px] font-medium border-border text-muted-foreground bg-transparent"
                            >
                              v{addon.version}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-[10px] font-medium border-border text-muted-foreground bg-transparent"
                            >
                              {addon.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {addon.description}
                          </p>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {addon.features.map((feature, i) => (
                              <span
                                key={i}
                                className="text-[10px] font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded border border-border"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>

                          {/* Nav Position Picker — shown when the addon is enabled */}
                          {enabled && addon.navItem && (
                            <div className="flex items-center gap-2 pt-2 mt-1">
                              <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                Nav position:
                              </span>
                              <Select
                                value={selectValue}
                                onValueChange={(val) => {
                                  if (val === "auto") {
                                    setAddonNavPosition(addon.id, null);
                                  } else if (val === "end") {
                                    setAddonNavPosition(
                                      addon.id,
                                      projectNav.length
                                    );
                                  } else {
                                    setAddonNavPosition(
                                      addon.id,
                                      Number(val)
                                    );
                                  }
                                }}
                              >
                                <SelectTrigger
                                  size="sm"
                                  className="h-7 text-xs w-auto min-w-[160px]"
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {positionOptions.map((opt) => (
                                    <SelectItem
                                      key={opt.value}
                                      value={opt.value}
                                      className="text-xs"
                                    >
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 pt-1">
                        {enabled && (
                          <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[10px] font-bold tracking-wide uppercase">
                            Active
                          </Badge>
                        )}
                        <Switch
                          checked={enabled}
                          onCheckedChange={() => toggleAddon(addon.id)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
