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

/** Merge placement presets — omitted keys stay unchanged. */
export function mergePlacementsPatch(
  current: unknown,
  patch: {
    footer?: { limit?: number };
    partners?: {
      motion?: LogoMotion;
      size?: LogoSize;
      limit?: number;
    };
    cases?: {
      limit?: number;
      excludedCaseIds?: string[];
      order?: string[];
    };
  },
): Record<string, unknown> {
  const base =
    current && typeof current === "object" && !Array.isArray(current)
      ? { ...(current as Record<string, unknown>) }
      : {};
  const prev = parsePlacements(base.placements);
  const next: PlacementSettings = {
    footer: {
      limit:
        patch.footer?.limit !== undefined
          ? Math.min(12, Math.max(1, Math.round(patch.footer.limit)))
          : prev.footer.limit,
    },
    partners: {
      motion: patch.partners?.motion
        ? parseLogoMotion(patch.partners.motion)
        : prev.partners.motion,
      size: patch.partners?.size
        ? parseLogoSize(patch.partners.size)
        : prev.partners.size,
      limit:
        patch.partners?.limit !== undefined
          ? Math.min(30, Math.max(1, Math.round(patch.partners.limit)))
          : prev.partners.limit,
    },
    cases: {
      limit:
        patch.cases?.limit !== undefined
          ? Math.min(12, Math.max(1, Math.round(patch.cases.limit)))
          : prev.cases.limit,
      excludedCaseIds:
        patch.cases?.excludedCaseIds ?? prev.cases.excludedCaseIds,
      order: patch.cases?.order ?? prev.cases.order,
    },
  };
  return { ...base, placements: next };
}
