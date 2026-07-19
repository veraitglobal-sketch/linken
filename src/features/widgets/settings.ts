/**
 * companies.widget_settings (jsonb) — presentation only.
 *
 * {
 *   logoWall?: {
 *     excludedCompanyIds?: string[]  // default [] → all confirmed shown
 *   }
 * }
 */

export type LogoWallSettings = {
  excludedCompanyIds: string[];
};

export type WidgetSettings = {
  logoWall: LogoWallSettings;
};

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
  return {
    logoWall: { excludedCompanyIds: excluded },
  };
}

export function mergeLogoWallExcluded(
  current: unknown,
  excludedCompanyIds: string[],
): Record<string, unknown> {
  const base =
    current && typeof current === "object" && !Array.isArray(current)
      ? { ...(current as Record<string, unknown>) }
      : {};
  const prevLw =
    base.logoWall && typeof base.logoWall === "object" && !Array.isArray(base.logoWall)
      ? { ...(base.logoWall as Record<string, unknown>) }
      : {};
  return {
    ...base,
    logoWall: {
      ...prevLw,
      excludedCompanyIds,
    },
  };
}
