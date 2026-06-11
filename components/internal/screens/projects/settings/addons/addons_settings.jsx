"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  LucidePackagePlus,
  GripVertical,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  LayoutList,
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
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function AddonCard({ addon, enabled, positionOptions, selectValue, currentColor, onToggle, onPositionChange, onColorChange }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = addon.icon;
  const effectiveColor = currentColor || addon.color;

  return (
    <div
      className={cn(
        "rounded-xl border transition-all duration-300",
        enabled
          ? "border-border bg-surface-subtle hover:border-border-strong shadow-sm"
          : "border-border bg-background opacity-60 hover:opacity-75"
      )}
    >
      <div className="flex items-center gap-4 p-5">
        <div
          className={cn(
            "w-11 h-11 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-300",
            enabled
              ? ""
              : "border-border bg-surface-subtle"
          )}
          style={
            enabled
              ? {
                  backgroundColor: `${effectiveColor}10`,
                  borderColor: `${effectiveColor}30`,
                }
              : undefined
          }
        >
          {Icon && (
            <Icon
              className="w-5 h-5 transition-colors duration-300"
              style={{ color: enabled ? effectiveColor : "var(--muted-foreground)" }}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground text-[15px]">
              {addon.name}
            </span>
            <Badge className="text-[9px] h-4 px-1.5 font-medium border-border text-muted-foreground bg-surface-subtle hover:bg-surface-subtle">
              v{addon.version}
            </Badge>
            <Badge className="text-[9px] h-4 px-1.5 font-medium border-border text-muted-foreground bg-surface-subtle hover:bg-surface-subtle">
              {addon.category}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed truncate">
            {addon.description}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {enabled && (
            <div className="flex items-center gap-1.5 text-green-400 text-[10px] font-semibold tracking-wider uppercase mr-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Active
            </div>
          )}
          <Switch checked={enabled} onCheckedChange={onToggle} />
        </div>
      </div>

      <Button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 border-t border-border hover:bg-surface-subtle transition-colors duration-200"
      >
        {expanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
        )}
        <span className="text-[11px] text-muted-foreground font-medium">
          {expanded ? "Less details" : "More details"}
        </span>
      </Button>

      {expanded && (
        <div className="border-t border-border p-5 space-y-5">
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Features
            </span>
            <p className="text-[13px] text-muted-foreground leading-relaxed mt-3">
              {addon.features.join(". ") + "."}
            </p>
          </div>

          {enabled && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border-2 border-border-strong shrink-0 overflow-hidden">
                  <div
                    className="w-full h-full"
                    style={{ backgroundColor: effectiveColor }}
                  />
                </div>
                <div className="flex-1">
                  <span className="text-[12px] text-foreground">Accent color</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Custom color for the sidebar icon and UI accents
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#06b6d4", "#f97316"].map((color) => (
                    <Button
                      key={color}
                      type="button"
                      onClick={() => onColorChange(color)}
                      className={cn(
                        "w-6 h-6 rounded-full border-2 transition-all hover:scale-110",
                        effectiveColor === color
                          ? "border-foreground scale-110 shadow-lg"
                          : "border-border hover:border-border-strong"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {addon.navItem && (
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-text-tertiary shrink-0" />
                  <div className="flex-1">
                    <span className="text-[12px] text-foreground">Sidebar position</span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Choose where this add-on appears in the navigation sidebar
                    </p>
                  </div>
                  <Select value={selectValue} onValueChange={onPositionChange}>
                    <SelectTrigger className="h-8 text-xs w-auto min-w-[180px] bg-surface-dialog border-border text-foreground focus:ring-ring focus:border-border-strong">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-surface-dialog border-border">
                      {positionOptions.map((opt) => (
                        <SelectItem
                          key={opt.value}
                          value={opt.value}
                          className="text-xs text-foreground focus:bg-surface-hover focus:text-foreground"
                        >
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AddonsViewToggle({ compactView, onToggle }) {
  return (
    <Button
      type="button"
      onClick={onToggle}
      className={cn(
        "w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-200",
        compactView
          ? "border-border bg-primary text-primary-foreground"
          : "border-border bg-surface-dialog text-muted-foreground hover:text-muted-foreground hover:bg-surface-card"
      )}
      title={compactView ? "Switch to list view" : "Switch to grid view"}
    >
      {compactView ? (
        <LayoutList className="w-4 h-4" />
      ) : (
        <LayoutGrid className="w-4 h-4" />
      )}
    </Button>
  );
}

export function AddonsSettingsScreen({ compactView: controlledCompactView }) {
  const { isAddonEnabled, toggleAddon, navPositions, setAddonNavPosition, addonColors, setAddonColor } =
    useAddonRegistry();
  const installedAddons = getInstalledAddons();

  const [uncontrolledCompactView] = useState(false);
  const compactView = controlledCompactView ?? uncontrolledCompactView;

  const positionOptions = projectNav.map((item, idx) => ({
    value: String(idx),
    label: `Before "${item.title}"`,
  }));
  positionOptions.push({
    value: "end",
    label: 'At the end (before "Settings")',
  });
  positionOptions.push({
    value: "auto",
    label: "Auto (default)",
  });

  return (
    <div className="space-y-8 border-t border-border pt-6">
      {installedAddons.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-background p-12 flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-surface-dialog border border-border flex items-center justify-center">
            <LucidePackagePlus className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">
              No add-ons available
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Add-ons will appear here when installed.
            </p>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-3 transition-all duration-300",
            compactView
              ? "grid-cols-2"
              : "grid-cols-1"
          )}
        >
          {installedAddons.map((addon) => {
            const enabled = isAddonEnabled(addon.id);
            const currentPosition = navPositions[addon.id];
            const selectValue =
              currentPosition === undefined || currentPosition === null
                ? "auto"
                : String(currentPosition);
            const currentColor = addonColors[addon.id];

            return (
              <AddonCard
                key={addon.id}
                addon={addon}
                enabled={enabled}
                positionOptions={positionOptions}
                selectValue={selectValue}
                currentColor={currentColor}
                onToggle={() => toggleAddon(addon.id)}
                onPositionChange={(val) => {
                  if (val === "auto") {
                    setAddonNavPosition(addon.id, null);
                  } else if (val === "end") {
                    setAddonNavPosition(addon.id, projectNav.length - 1);
                  } else {
                    setAddonNavPosition(addon.id, Number(val));
                  }
                }}
                onColorChange={(color) => {
                  const newColor = color === addon.color ? null : color;
                  setAddonColor(addon.id, newColor);
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
