"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

const AddonRegistryContext = createContext();

const INSTALLED_ADDONS = [];

export function loadAddon(addonModule) {
  const existing = INSTALLED_ADDONS.findIndex((a) => a.id === addonModule.id);
  if (existing !== -1) {
    INSTALLED_ADDONS[existing] = addonModule;
  } else {
    INSTALLED_ADDONS.push(addonModule);
  }
}

export function getInstalledAddons() {
  return INSTALLED_ADDONS;
}

export function getEnabledAddons(enabledIds) {
  return INSTALLED_ADDONS.filter((addon) => enabledIds.includes(addon.id));
}

export function getAddonScreens(enabledIds) {
  const screens = {};
  getEnabledAddons(enabledIds).forEach((addon) => {
    addon.screens.forEach((screen) => {
      screens[screen.id] = screen.component;
    });
  });
  return screens;
}

export function getAddonNavItems(enabledIds) {
  const items = [];
  getEnabledAddons(enabledIds).forEach((addon) => {
    if (addon.navItem) {
      items.push({ ...addon.navItem, addonId: addon.id });
    }
  });
  return items;
}

export function AddonRegistryProvider({ children }) {
  const [enabledAddons, setEnabledAddons] = useState([]);

  const toggleAddon = useCallback((addonId) => {
    setEnabledAddons((prev) =>
      prev.includes(addonId)
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId]
    );
  }, []);

  const isAddonEnabled = useCallback(
    (addonId) => enabledAddons.includes(addonId),
    [enabledAddons]
  );

  return (
    <AddonRegistryContext.Provider
      value={{ enabledAddons, toggleAddon, isAddonEnabled }}
    >
      {children}
    </AddonRegistryContext.Provider>
  );
}

export function useAddonRegistry() {
  const context = useContext(AddonRegistryContext);
  if (context === undefined) {
    throw new Error(
      "useAddonRegistry must be used within an AddonRegistryProvider"
    );
  }
  return context;
}
