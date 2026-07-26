import type { LogoWallOverride } from "@/features/widgets/settings";
import { isFaviconLogoUrl } from "@/features/logo/display-url";

export type LogoWallLogoState =
  | "profile"
  | "auto"
  | "custom"
  | "low_quality"
  | "no_logo"
  | "opted_out";

export function isLowQualityLogoUrl(url: string | null | undefined): boolean {
  return isFaviconLogoUrl(url);
}

export function resolveLogoWallState(input: {
  showLogo: boolean;
  overrideLogoUrl?: string | null;
  logoUrl: string | null;
  logoSource: string | null;
}): LogoWallLogoState {
  if (!input.showLogo) return "opted_out";
  if (input.overrideLogoUrl?.trim()) return "custom";
  if (!input.logoUrl?.trim()) return "no_logo";
  if (isLowQualityLogoUrl(input.logoUrl)) return "low_quality";
  if (input.logoSource === "manual") return "profile";
  if (input.logoSource === "auto") return "auto";
  return "profile";
}

export function applyLogoWallOrder<T extends { id: string }>(
  entries: T[],
  order: string[],
): T[] {
  if (order.length === 0) return entries;
  const byId = new Map(entries.map((e) => [e.id, e]));
  const seen = new Set<string>();
  const ordered: T[] = [];
  for (const id of order) {
    const e = byId.get(id);
    if (e && !seen.has(id)) {
      ordered.push(e);
      seen.add(id);
    }
  }
  for (const e of entries) {
    if (!seen.has(e.id)) ordered.push(e);
  }
  return ordered;
}

/**
 * Logo wall display precedence (highest first):
 * 1. Wall owner's override for THIS wall
 * 2. Partner profile logo (logo_url / logo_source=manual)
 * 3. Auto-fetched logo (logo_url / logo_source=auto)
 * 4. Initials (caller / EmbedBareLogo)
 *
 * `allow_logo_in_partner_widgets = false` forces text — overrides are ignored.
 * Changing a partner profile logo never clears another wall's override.
 */
export function displayLogoForWall(input: {
  showLogo: boolean;
  profileLogoUrl: string | null;
  override: LogoWallOverride | null | undefined;
}): {
  logoUrl: string | null;
  scale: number;
  padding: number;
  grayscale: boolean;
  invertOnDark: boolean;
} {
  if (!input.showLogo) {
    return {
      logoUrl: null,
      scale: 1,
      padding: 0,
      grayscale: false,
      invertOnDark: false,
    };
  }
  const o = input.override;
  const overrideUrl = o?.logoUrl?.trim() || null;
  // Override always wins when set. Profile/auto never show favicons on the wall.
  let logoUrl = overrideUrl || input.profileLogoUrl?.trim() || null;
  if (logoUrl && !overrideUrl && isFaviconLogoUrl(logoUrl)) {
    logoUrl = null;
  }
  return {
    logoUrl,
    scale: o?.scale ?? 1,
    padding: o?.padding ?? 0,
    grayscale: o?.grayscale === true,
    invertOnDark: o?.invertOnDark === true,
  };
}
