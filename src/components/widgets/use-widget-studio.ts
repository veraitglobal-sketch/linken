"use client";

import { useMemo, useState } from "react";
import { tokenizeShell } from "@/components/developers/highlight";
import {
  buildEmbedSnippet,
  buildEmbedSrc,
  widgetHeight,
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

  const width = widthMode === "100%" ? "100%" : `${widthPx || "320"}px`;
  const height = widgetHeight(widget.id);

  const previewSrc = useMemo(
    () =>
      buildEmbedSrc({
        siteUrl,
        slug,
        variant: widget.id,
        theme,
        width: widthMode === "100%" ? undefined : widthPx,
        preview: true,
      }),
    [siteUrl, slug, widget.id, theme, widthMode, widthPx],
  );

  const snippet = useMemo(
    () =>
      buildEmbedSnippet({
        siteUrl,
        slug,
        variant: widget.id,
        theme,
        width,
      }),
    [siteUrl, slug, widget.id, theme, width],
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
    height,
    previewSrc,
    snippet,
    tokens,
  };
}
