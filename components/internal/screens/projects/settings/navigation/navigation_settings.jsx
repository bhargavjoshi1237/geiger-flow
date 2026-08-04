"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { NavVisibilitySettings } from "@geiger/ui";

import { useCuratableProjectNav } from "@/lib/hooks/use-visible-project-nav";
import { useNavVisibility } from "@/context/nav-visibility-context";

// Settings → Navigation. Lets this user hide the parts of the project sidebar
// they don't use, for this project only — it's a personal preference, stored per
// (project, user) in the suite-shared public.user_nav_prefs, so teammates keep
// their own sidebar.
//
// The rules are declared in geiger-ui.config.js and enforced by @geiger/ui's
// <NavVisibilitySettings>: a switch that would leave a visible screen without
// something it needs is disabled and explains why. This screen owns only the
// toasts. The page title and description come from SettingsScreen.

export function NavigationSettingsScreen() {
  const nav = useCuratableProjectNav();
  const { hidden, config, loading, available, setHidden, showAll } =
    useNavVisibility();
  const [busy, setBusy] = useState(false);

  const handleToggle = async (title, nextHidden) => {
    setBusy(true);
    const { ok, reason } = await setHidden(title, nextHidden);
    setBusy(false);
    if (ok) toast.success(`${title} ${nextHidden ? "hidden" : "shown"}`);
    else toast.error(reason || `Couldn't ${nextHidden ? "hide" : "show"} ${title}.`);
  };

  const handleReset = async () => {
    setBusy(true);
    const ok = await showAll();
    setBusy(false);
    if (ok) toast.success("Every section is back in the sidebar");
    else toast.error("Couldn't reset your navigation settings.");
  };

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center rounded-lg border border-border text-muted-foreground">
        Loading your navigation…
      </div>
    );
  }

  return (
    <NavVisibilitySettings
      nav={nav}
      config={config}
      hidden={hidden}
      busy={busy || !available}
      onToggle={handleToggle}
      onReset={handleReset}
    />
  );
}

export default NavigationSettingsScreen;
