// Icon/color CONFIG maps for the Assets screen children.
//
// This is presentation config only — no row data lives here. The canonical
// media-type config (labels, icons, colors, formatters) is
// features/assets/constants.js; these maps re-key its icon/color fields by
// media type for the table/cards' lookup style.

import { MEDIA_TYPE_MAP } from "@/features/assets/constants";

export const typeIcons = Object.fromEntries(
  Object.entries(MEDIA_TYPE_MAP).map(([type, meta]) => [type, meta.icon]),
);

export const typeColors = Object.fromEntries(
  Object.entries(MEDIA_TYPE_MAP).map(([type, meta]) => [type, meta.iconColor]),
);
