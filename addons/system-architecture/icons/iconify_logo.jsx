"use client";

import React from "react";
import logos from "@iconify-json/logos/icons.json";

export function IconifyLogo({ name, className }) {
  const icon = logos.icons[name];

  if (!icon) {
    return null;
  }

  const width = icon.width || logos.width || 256;
  const height = icon.height || logos.height || 256;

  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      dangerouslySetInnerHTML={{ __html: icon.body }}
    />
  );
}
