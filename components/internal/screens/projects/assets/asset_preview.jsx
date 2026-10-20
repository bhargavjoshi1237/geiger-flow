"use client";

import React, { useState } from "react";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { fileExtension, mediaMeta } from "@/features/assets/constants";

// Token-based checkerboard so transparent images read as transparent.
const CHECKERBOARD =
  "bg-[conic-gradient(var(--surface-card)_25%,var(--surface-subtle)_0_50%,var(--surface-card)_0_75%,var(--surface-subtle)_0)] bg-[length:16px_16px]";

// Tinted media-type chip (icon in the type's colour).
export function TypeGlyph({ type, size = "md", className }) {
  const meta = mediaMeta(type);
  const Icon = meta.icon;
  const sizes = {
    sm: "h-8 w-8 rounded-md [&_svg]:h-4 [&_svg]:w-4",
    md: "h-9 w-9 rounded-md [&_svg]:h-4 [&_svg]:w-4",
    lg: "h-12 w-12 rounded-xl [&_svg]:h-5 [&_svg]:w-5",
    xl: "h-16 w-16 rounded-2xl [&_svg]:h-7 [&_svg]:w-7",
  };

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center border",
        meta.className,
        sizes[size],
        className,
      )}
    >
      <Icon />
    </div>
  );
}

// Image that swaps to `fallback` when the URL fails to load.
function SafeImage({ src, alt, className, fallback }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return fallback;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

function GlyphFill({ asset }) {
  const meta = mediaMeta(asset.mediaType);
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2.5 bg-surface-card">
      <TypeGlyph type={asset.mediaType} size="lg" />
      <span className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
        {fileExtension(asset.name) || meta.label}
      </span>
    </div>
  );
}

// Fills its box: real image, a video's first frame, or the type glyph.
export function AssetThumbnail({ asset, className }) {
  const fallback = <GlyphFill asset={asset} />;

  if (asset.url && asset.mediaType === "image") {
    return (
      <SafeImage
        key={asset.url}
        src={asset.url}
        alt={asset.name}
        fallback={fallback}
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }

  if (asset.url && asset.mediaType === "video") {
    return <VideoFrame key={asset.url} src={asset.url} className={className} fallback={fallback} />;
  }

  return fallback;
}

// A video's first frame with a play badge; swaps to `fallback` if the file can't load.
function VideoFrame({ src, className, fallback }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return fallback;
  }
  return (
    <div className="relative h-full w-full bg-surface-card">
      <video
        src={`${src}#t=0.5`}
        preload="metadata"
        muted
        playsInline
        onError={() => setFailed(true)}
        className={cn("h-full w-full object-cover", className)}
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-foreground backdrop-blur-sm">
          <Play className="ml-0.5 h-4 w-4 fill-current" />
        </span>
      </div>
    </div>
  );
}

// Compact row thumbnail: the image itself for images, otherwise the type chip.
export function AssetChip({ asset }) {
  const chip = <TypeGlyph type={asset.mediaType} />;
  if (!asset.url || asset.mediaType !== "image") {
    return chip;
  }
  return (
    <div className="h-9 w-9 shrink-0">
      <SafeImage
        key={asset.url}
        src={asset.url}
        alt=""
        fallback={chip}
        className="h-full w-full rounded-md border border-border bg-surface-card object-cover"
      />
    </div>
  );
}

// Full-size preview for the detail sheet, with native controls for media.
export function AssetPreview({ asset }) {
  const meta = mediaMeta(asset.mediaType);
  const noPreview = (
    <div className="flex h-56 w-full flex-col items-center justify-center gap-3 bg-surface-card px-6 text-center">
      <TypeGlyph type={asset.mediaType} size="xl" />
      <div>
        <p className="text-sm font-medium text-foreground">{fileExtension(asset.name) || meta.label} file</p>
        <p className="mt-0.5 text-xs text-text-secondary">No preview available. Open or download it to view.</p>
      </div>
    </div>
  );

  if (!asset.url) {
    return noPreview;
  }

  if (asset.mediaType === "image") {
    return (
      <div className={cn("flex max-h-80 min-h-48 items-center justify-center", CHECKERBOARD)}>
        <SafeImage
          key={asset.url}
          src={asset.url}
          alt={asset.name}
          fallback={noPreview}
          className="max-h-80 w-full object-contain"
        />
      </div>
    );
  }

  if (asset.mediaType === "video" || asset.mediaType === "audio") {
    return <MediaPlayer key={asset.url} asset={asset} fallback={noPreview} />;
  }

  return noPreview;
}

// Native video/audio player; swaps to `fallback` if the file can't load.
function MediaPlayer({ asset, fallback }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return fallback;
  }
  if (asset.mediaType === "video") {
    return (
      <video
        src={asset.url}
        controls
        preload="metadata"
        playsInline
        onError={() => setFailed(true)}
        className="max-h-80 w-full bg-background"
      />
    );
  }
  return (
    <div className="flex flex-col items-center gap-4 bg-surface-card px-5 pb-5 pt-8">
      <TypeGlyph type={asset.mediaType} size="xl" />
      <audio
        src={asset.url}
        controls
        preload="metadata"
        onError={() => setFailed(true)}
        className="w-full"
      />
    </div>
  );
}
