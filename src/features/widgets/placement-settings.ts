/**
 * widget_settings.placements — footer / partners / cases embed presets.
 * Partner selection still comes from logoWall (exclude, order, overrides).
 */

import {
  parseLogoMotion,
  parseLogoSize,
  type LogoMotion,
  type LogoSize,
} from "@/features/widgets/logo-motion";

export type FooterPlacement = { limit: number };
export type PartnersPlacement = {
  motion: LogoMotion;
  size: LogoSize;
  limit: number;
};
export type CasesPlacement = {
  limit: number;
  excludedCaseIds: string[];
  order: string[];
};

export type PlacementSettings = {
  footer: FooterPlacement;
  partners: PartnersPlacement;
  cases: CasesPlacement;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function parseLimit(raw: unknown, fallback: number, max: number): number {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return clamp(Math.round(raw), 1, max);
  }
  return fallback;
}

export function defaultPlacements(): PlacementSettings {
  return {
    footer: { limit: 6 },
    partners: { motion: "swap-random", size: "md", limit: 8 },
    cases: { limit: 6, excludedCaseIds: [], order: [] },
  };
}

export function parsePlacements(raw: unknown): PlacementSettings {
  const d = defaultPlacements();
  const obj =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {};

  const footer =
    obj.footer && typeof obj.footer === "object" && !Array.isArray(obj.footer)
      ? (obj.footer as Record<string, unknown>)
      : {};
  const partners =
    obj.partners &&
    typeof obj.partners === "object" &&
    !Array.isArray(obj.partners)
      ? (obj.partners as Record<string, unknown>)
      : {};
  const cases =
    obj.cases && typeof obj.cases === "object" && !Array.isArray(obj.cases)
      ? (obj.cases as Record<string, unknown>)
      : {};

  const excluded = Array.isArray(cases.excludedCaseIds)
    ? cases.excludedCaseIds.filter((id): id is string => typeof id === "string")
    : [];
  const order = Array.isArray(cases.order)
    ? cases.order.filter((id): id is string => typeof id === "string")
    : [];

  return {
    footer: { limit: parseLimit(footer.limit, d.footer.limit, 12) },
    partners: {
      motion:
        typeof partners.motion === "string"
          ? parseLogoMotion(partners.motion)
          : d.partners.motion,
      size:
        typeof partners.size === "string"
          ? parseLogoSize(partners.size)
          : d.partners.size,
      limit: parseLimit(partners.limit, d.partners.limit, 30),
    },
    cases: {
      limit: parseLimit(cases.limit, d.cases.limit, 12),
      excludedCaseIds: excluded,
      order,
    },
  };
}
