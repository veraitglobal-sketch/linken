/**
 * companies.widget_settings — logoWall: excludedCompanyIds, order,
 * background ("transparent"|"light"|"dark"|"#RRGGBB"), overrides.
 */

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
  overrides: Record<string, LogoWallOverride>;
};

export type WidgetSettings = {
  logoWall: LogoWallSettings;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function parseLogoWallBackground(raw: unknown): LogoWallBackground {
  if (raw === "transparent" || raw === "light" || raw === "dark") return raw;
  if (typeof raw === "string" && /^#[0-9A-Fa-f]{6}$/.test(raw)) return raw;
  return "light";
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
  return {
    logoWall: { excludedCompanyIds: excluded, order, background, overrides },
  };
}
