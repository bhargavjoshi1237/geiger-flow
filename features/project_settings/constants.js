// Shared defaults for the Project Settings feature.
// One row per project in `flow.project_settings`; everything not yet promoted
// lives in the metadata expansion bag under section keys. No row data here.

export const PROJECT_VISIBILITY_OPTIONS = [
  { value: "private", label: "Private" },
  { value: "internal", label: "Internal" },
  { value: "public", label: "Public" },
];

export const PROJECT_REGION_OPTIONS = [
  { value: "us-east-1", label: "US East (N. Virginia)" },
  { value: "eu-west-1", label: "EU West (Ireland)" },
  { value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
];

export const DEFAULT_PROJECT_VISIBILITY = "private";
export const DEFAULT_PROJECT_REGION = "us-east-1";

// Toggles behind Settings -> Advanced. Keys are the metadata.advanced bag.
export const DEFAULT_ADVANCED_SETTINGS = Object.freeze({
  readOnly: false,
  maintenanceMode: false,
  auditLogging: false,
  rateLimiting: false,
  ipRestriction: false,
  requestSigning: false,
});

// Toggles behind Settings -> Enterprise. Keys are the metadata.enterprise bag.
export const DEFAULT_ENTERPRISE_SETTINGS = Object.freeze({
  ssoEnabled: false,
  scimProvisioning: false,
  dataRetention: false,
  encryptionAtRest: false,
  fieldEncryption: false,
  ipWhitelist: false,
  auditTrail: false,
  disablePublicApi: false,
});

// Add-on prefs behind Settings -> Add-ons. Keys are the metadata.addons bag:
// { enabled: string[], navPositions: Record<string, number|null>, colors:
// Record<string, string|null> }.
export const DEFAULT_ADDON_PREFS = Object.freeze({
  enabled: [],
  navPositions: {},
  colors: {},
});
