"use client";

import { useMemo, useState } from "react";
import { tokenizeShell } from "@/components/developers/highlight";
import {
  buildEmbedSnippet,
  buildEmbedSrc,
  widgetHeight,
  type LogoMotion,
  type LogoSize,
  type LogoWallLabel,
  type WidgetDefinition,
  type WidgetTheme,
} from "@/features/widgets/catalog";

export function useWidgetStudio(
  widget: WidgetDefinition,
  siteUrl: string,
  slug: string,
) {
  const [theme, setTheme] = useState<WidgetTheme>("light");
  const [widthMode, setWidthMode] = useState<"100%" | "px">("100%");
  const [widthPx, setWidthPx] = useState("320");
  const [stageBg, setStageBg] = useState<string | null>(null);
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [label, setLabel] = useState<LogoWallLabel>("both");
  const [mono, setMono] = useState(true);
  const [motion, setMotion] = useState<LogoMotion>("row");
  const [logoSize, setLogoSize] = useState<LogoSize>("md");

  const isLogoWall = widget.id === "logo-wall";
  const width = widthMode === "100%" ? "100%" : `${widthPx || "320"}px`;
  const height = widgetHeight(widget.id, {
    motion: isLogoWall ? motion : undefined,
    size: isLogoWall ? logoSize : undefined,
  });

  const previewSrc = useMemo(
    () =>
      buildEmbedSrc({
        siteUrl,
        slug,
        variant: widget.id,
        theme,
        width: widthMode === "100%" ? undefined : widthPx,
        preview: true,
        label: isLogoWall ? label : undefined,
        mono: isLogoWall ? mono : undefined,
        motion: isLogoWall ? motion : undefined,
        size: isLogoWall ? logoSize : undefined,
      }),
    [
      siteUrl,
      slug,
      widget.id,
      theme,
      widthMode,
      widthPx,
      isLogoWall,
      label,
      mono,
      motion,
      logoSize,
    ],
  );

  const snippet = useMemo(
    () =>
      buildEmbedSnippet({
        siteUrl,
        slug,
        variant: widget.id,
        theme,
        width,
        label: isLogoWall ? label : undefined,
        mono: isLogoWall ? mono : undefined,
        motion: isLogoWall ? motion : undefined,
        size: isLogoWall ? logoSize : undefined,
      }),
    [
      siteUrl,
      slug,
      widget.id,
      theme,
      width,
      isLogoWall,
      label,
      mono,
      motion,
      logoSize,
    ],
  );

  const tokens = useMemo(() => tokenizeShell(snippet), [snippet]);

  return {
    theme,
    setTheme,
    widthMode,
    setWidthMode,
    widthPx,
    setWidthPx,
    stageBg,
    setStageBg,
    viewport,
    setViewport,
    label,
    setLabel,
    mono,
    setMono,
    motion,
    setMotion,
    logoSize,
    setLogoSize,
    isLogoWall,
    height,
    previewSrc,
    snippet,
    tokens,
  };
}
