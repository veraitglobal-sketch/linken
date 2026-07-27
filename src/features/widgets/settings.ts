/**
 * companies.widget_settings — logoWall + placements (footer/partners/cases).
 */

import {
  parseLogoMotion,
  parseLogoSize,
  type LogoMotion,
  type LogoSize,
} from "@/features/widgets/logo-motion";
import {
  parsePlacements,
  type PlacementSettings,
} from "@/features/widgets/placement-settings";
import {
  parseTestimonialsSettings,
  type TestimonialsSettings,
} from "@/features/testimonials/settings";

export type { PlacementSettings } from "@/features/widgets/placement-settings";
export type { TestimonialsSettings } from "@/features/testimonials/settings";

export type LogoWallOverride = {
  logoUrl?: string;
  scale: number;
  padding: number;
  grayscale: boolean;
  invertOnDark: boolean;
  rejectToken?: string;
};

/** Invalid values fall back to "light". */
export type LogoWallBackground = "transparent" | "light" | "dark" | string;

export type LogoWallSettings = {
  excludedCompanyIds: string[];
  order: string[];
  background: LogoWallBackground;
  /** How many included entries the public wall renders (default 12, max 30). */
  limit: number;
  motion: LogoMotion;
  size: LogoSize;
  overrides: Record<string, LogoWallOverride>;
};

export type WidgetSettings = {
  logoWall: LogoWallSettings;
  placements: PlacementSettings;
  testimonials: TestimonialsSettings;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function parseLogoWallBackground(raw: unknown): LogoWallBackground {
  if (raw === "transparent" || raw === "light" || raw === "dark") return raw;
  if (typeof raw === "string" && /^#[0-9A-Fa-f]{6}$/.test(raw)) return raw;
  return "light";
}

export function parseLogoWallLimit(raw: unknown): number {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return clamp(Math.round(raw), 1, 30);
  }
  return 12;
}

export function parseLogoWallOverride(raw: unknown): LogoWallOverride | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const scale =
    typeof o.scale === "number" && Number.isFinite(o.scale)
      ? clamp(o.scale, 0.5, 1.5)
      : 1;
  const padding =
    typeof o.padding === "number" && Number.isFinite(o.padding)
      ? clamp(Math.round(o.padding), 0, 24)
      : 0;
  const logoUrl =
    typeof o.logoUrl === "string" && o.logoUrl.trim()
      ? o.logoUrl.trim()
      : undefined;
  const rejectToken =
    typeof o.rejectToken === "string" && o.rejectToken.trim()
      ? o.rejectToken.trim()
      : undefined;
  return {
    logoUrl,
    scale,
    padding,
    grayscale: o.grayscale === true,
    invertOnDark: o.invertOnDark === true,
    rejectToken,
  };
}

export function parseWidgetSettings(raw: unknown): WidgetSettings {
  const obj =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};
  const lw =
    obj.logoWall && typeof obj.logoWall === "object" && !Array.isArray(obj.logoWall)
      ? (obj.logoWall as Record<string, unknown>)
      : {};
  const excluded = Array.isArray(lw.excludedCompanyIds)
    ? lw.excludedCompanyIds.filter((id): id is string => typeof id === "string")
    : [];
  const order = Array.isArray(lw.order)
    ? lw.order.filter((id): id is string => typeof id === "string")
    : [];
  const overrides: Record<string, LogoWallOverride> = {};
  if (lw.overrides && typeof lw.overrides === "object" && !Array.isArray(lw.overrides)) {
    for (const [id, value] of Object.entries(
      lw.overrides as Record<string, unknown>,
    )) {
      const parsed = parseLogoWallOverride(value);
      if (parsed) overrides[id] = parsed;
    }
  }
  const background =
    "background" in lw
      ? parseLogoWallBackground(lw.background)
      : "transparent";
  const limit = "limit" in lw ? parseLogoWallLimit(lw.limit) : 12;
  const motion =
    typeof lw.motion === "string" ? parseLogoMotion(lw.motion) : "grid";
  const size = typeof lw.size === "string" ? parseLogoSize(lw.size) : "md";
  return {
    logoWall: {
      excludedCompanyIds: excluded,
      order,
      background,
      limit,
      motion,
      size,
      overrides,
    },
    placements: parsePlacements(obj.placements),
    testimonials: parseTestimonialsSettings(obj.testimonials),
  };
}
