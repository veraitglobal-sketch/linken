import { WIDGET_CATALOG, type WidgetVariant } from "@/features/widgets/catalog";

const LEGACY: Record<string, string> = {
  compact: "micro",
  badge: "horizontal",
  "proof-panel": "horizontal",
  "network-card": "score",
  "logo-wall": "starter",
};

export function normalizeEmbedVariant(raw: string): string {
  return LEGACY[raw] ?? raw;
}

export function isProEmbedVariant(variant: string): boolean {
  const id = normalizeEmbedVariant(variant) as WidgetVariant;
  return Boolean(WIDGET_CATALOG.find((w) => w.id === id)?.pro);
}

/**
 * Public embeds: Pro variants require premiumEmbeds.
 * Dashboard preview (?preview=1) may still render locked variants.
 */
export function resolvePublicEmbedVariant(input: {
  variant: string;
  premiumEmbeds: boolean;
  preview?: boolean;
}): { variant: string; locked: boolean } {
  const variant = normalizeEmbedVariant(input.variant);
  if (input.preview || input.premiumEmbeds || !isProEmbedVariant(variant)) {
    return { variant, locked: false };
  }
  return { variant: "horizontal", locked: true };
}
