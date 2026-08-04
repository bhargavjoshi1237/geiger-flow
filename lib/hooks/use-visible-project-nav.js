"use client";

import React from "react";
import { applyNavVisibility } from "@geiger/ui";

import navConfig from "@/geiger-ui.config";
import {
  curatableProjectNav,
  projectNav,
  settingsNav as SETTINGS_NAV,
} from "@/components/internal/sidebar/projects/sidebar_data";
import {
  useAddonRegistry,
  getAddonNavItems,
  mergeNavWithAddons,
} from "@/addons/registry";
import { useNavVisibility } from "@/context/nav-visibility-context";

// The project sidebar the current user actually sees: addon entries merged in,
// then narrowed to what they chose to keep in Settings → Navigation.
//
// The sidebar renders the Settings submenu from a separate `settingsNav` array,
// but the resolver works over one tree, so we attach the submenu, filter, and
// hand both back out. Personal visibility is applied *after* the addon merge, so
// an addon's entries are curatable on the same code path as core nav.
//
// Hiding is a curation of the sidebar, not an authorization boundary — a hidden
// screen stays reachable if something navigates straight to it.

const SETTINGS = "Settings";

// Everything the user is *allowed* to reach, before their own curation, as one
// tree. This is what Settings → Navigation lists, so hidden entries are still
// there to switch back on.
export function useCuratableProjectNav() {
  const { enabledAddons, navPositions, addonColors } = useAddonRegistry();

  return React.useMemo(() => {
    const addonNavItems = getAddonNavItems(enabledAddons, navPositions, addonColors);
    return curatableProjectNav(mergeNavWithAddons(projectNav, addonNavItems));
  }, [enabledAddons, navPositions, addonColors]);
}

export function useVisibleProjectNav() {
  const curatable = useCuratableProjectNav();
  const { hidden, config } = useNavVisibility();

  return React.useMemo(() => {
    const visible = applyNavVisibility(curatable, hidden, config ?? navConfig);
    const settings = visible.find((item) => item.title === SETTINGS);
    return {
      nav: visible,
      // Settings is locked, so it can't vanish; fall back to the full list if a
      // product ever unlocks it, rather than rendering an empty submenu.
      settingsNav: settings?.subItems || SETTINGS_NAV,
    };
  }, [curatable, hidden, config]);
}

export default useVisibleProjectNav;
