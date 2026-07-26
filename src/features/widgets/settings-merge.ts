import {
  parseLogoWallBackground,
  parseLogoWallOverride,
  type LogoWallBackground,
  type LogoWallOverride,
} from "@/features/widgets/settings";

function baseLogoWall(
  current: unknown,
): { base: Record<string, unknown>; prevLw: Record<string, unknown> } {
  const base =
    current && typeof current === "object" && !Array.isArray(current)
      ? { ...(current as Record<string, unknown>) }
      : {};
  const prevLw =
    base.logoWall &&
    typeof base.logoWall === "object" &&
    !Array.isArray(base.logoWall)
      ? { ...(base.logoWall as Record<string, unknown>) }
      : {};
  return { base, prevLw };
}

export function mergeLogoWallExcluded(
  current: unknown,
  excludedCompanyIds: string[],
): Record<string, unknown> {
  const { base, prevLw } = baseLogoWall(current);
  return { ...base, logoWall: { ...prevLw, excludedCompanyIds } };
}

export function mergeLogoWallOrder(
  current: unknown,
  order: string[],
): Record<string, unknown> {
  const { base, prevLw } = baseLogoWall(current);
  return { ...base, logoWall: { ...prevLw, order } };
}

export function mergeLogoWallBackground(
  current: unknown,
  background: LogoWallBackground,
): Record<string, unknown> {
  const { base, prevLw } = baseLogoWall(current);
  return {
    ...base,
    logoWall: { ...prevLw, background: parseLogoWallBackground(background) },
  };
}

export function mergeLogoWallOverride(
  current: unknown,
  partnerId: string,
  patch: Partial<LogoWallOverride> | null,
): Record<string, unknown> {
  const { base, prevLw } = baseLogoWall(current);
  const prevOverrides =
    prevLw.overrides &&
    typeof prevLw.overrides === "object" &&
    !Array.isArray(prevLw.overrides)
      ? { ...(prevLw.overrides as Record<string, unknown>) }
      : {};
  if (patch === null) {
    delete prevOverrides[partnerId];
  } else {
    const existing = parseLogoWallOverride(prevOverrides[partnerId]) ?? {
      scale: 1,
      padding: 0,
      grayscale: false,
      invertOnDark: false,
    };
    prevOverrides[partnerId] = { ...existing, ...patch };
  }
  return { ...base, logoWall: { ...prevLw, overrides: prevOverrides } };
}

/** Deep-merge. Omitted keys stay unchanged — never wipe the whole logoWall. */
export function mergeLogoWallPatch(
  current: unknown,
  patch: {
    excludedCompanyIds?: string[];
    order?: string[];
    background?: unknown;
    overrides?: Record<string, Partial<LogoWallOverride> | null>;
  },
): Record<string, unknown> {
  let next = current;
  if (patch.excludedCompanyIds) {
    next = mergeLogoWallExcluded(next, patch.excludedCompanyIds);
  }
  if (patch.order) {
    next = mergeLogoWallOrder(next, patch.order);
  }
  if ("background" in patch && patch.background !== undefined) {
    next = mergeLogoWallBackground(
      next,
      parseLogoWallBackground(patch.background),
    );
  }
  if (patch.overrides) {
    for (const [id, ov] of Object.entries(patch.overrides)) {
      next = mergeLogoWallOverride(next, id, ov);
    }
  }
  return next as Record<string, unknown>;
}
