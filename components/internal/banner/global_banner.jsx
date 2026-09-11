"use client";

import React from "react";
import { useBanner } from "@/context/banner-context";
import { AlertCircle, X, ExternalLink } from "lucide-react";
import { Button } from "@geiger/ui";
import { cn } from "@/lib/utils";

// Hazard-stripe banner variants. The 45° stripe is a deliberate design motif;
// every colour is a tailwind palette utility rather than a raw hex.
const BANNER_THEMES = {
  warning: {
    surface:
      "bg-[repeating-linear-gradient(45deg,var(--color-orange-900)_0_8px,var(--color-orange-800)_8px_16px)]",
    border: "border-amber-600",
    text: "text-orange-100",
    iconBg: "bg-orange-950/40",
    linkDecoration: "decoration-orange-300/40",
  },
  info: {
    surface:
      "bg-[repeating-linear-gradient(45deg,var(--color-blue-900)_0_8px,var(--color-blue-700)_8px_16px)]",
    border: "border-blue-700",
    text: "text-blue-100",
    iconBg: "bg-blue-950/40",
    linkDecoration: "decoration-blue-300/40",
  },
};

export function GlobalBanner() {
  const { banner, hideBanner } = useBanner();

  if (!banner.isVisible) return null;

  const currentTheme = BANNER_THEMES[banner.type] || BANNER_THEMES.warning;

  return (
    <div
      className={cn(
        "relative z-[100] flex w-full items-center justify-center gap-3 border-b px-4 py-2.5 transition-all duration-500 animate-in fade-in slide-in-from-top-full",
        currentTheme.surface,
        currentTheme.border,
        currentTheme.text,
      )}
      style={{ backgroundSize: "32px 32px" }}
    >
      <div className="flex items-center gap-3 max-w-7xl mx-auto w-full justify-center">
        <div
          className={cn(
            "flex items-center justify-center w-5 h-5 rounded flex-shrink-0",
            currentTheme.iconBg,
          )}
        >
          <AlertCircle className="w-3.5 h-3.5 text-foreground" />
        </div>
        <div className="flex items-center gap-2 text-[13px] font-semibold tracking-tight leading-none">
          <span className="translate-y-[0.5px] -mt-1.5">{banner.message}</span>
          {banner.link && (
            <>
              <span className="opacity-40 font-normal">·</span>
              <a
                href={banner.link.url}
                className={cn(
                  "hover:text-white transition-colors underline underline-offset-4 font-bold flex items-center gap-1.5",
                  currentTheme.linkDecoration,
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                {banner.link.text}
              </a>
            </>
          )}
        </div>
      </div>

      {banner.isSticky && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={hideBanner}
          className="absolute right-4 p-1.5 rounded-full hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center"
          aria-label="Close banner"
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );
}
