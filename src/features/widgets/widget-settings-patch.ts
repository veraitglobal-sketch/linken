import "server-only";
import { parseLogoWallOverride, type LogoWallOverride } from "@/features/widgets/settings";
import {
  mergeLogoWallExcluded,
  mergeLogoWallPatch,
} from "@/features/widgets/settings-merge";

/** Apply Agent/API body fields that touch widget_settings (merge, never wipe). */
export function applyWidgetSettingsBody(
  current: unknown,
  body: Record<string, unknown>,
): { ok: true; widgetSettings: unknown; touched: boolean } | { ok: false; error: string } {
  let widgetSettings = current;
  let touched = false;

  if ("excluded_company_ids" in body) {
    if (!Array.isArray(body.excluded_company_ids)) {
      return { ok: false, error: "excluded_company_ids must be an array." };
    }
    const ids = body.excluded_company_ids.filter(
      (id): id is string => typeof id === "string",
    );
    widgetSettings = mergeLogoWallExcluded(widgetSettings, ids);
    touched = true;
  }

  if ("logo_wall" in body) {
    const lw = body.logo_wall;
    if (!lw || typeof lw !== "object" || Array.isArray(lw)) {
      return { ok: false, error: "logo_wall must be an object." };
    }
    const patched = patchFromLogoWallObject(lw as Record<string, unknown>);
    if (!patched.ok) return patched;
    widgetSettings = mergeLogoWallPatch(widgetSettings, patched.patch);
    touched = true;
  }

  if ("widget_settings" in body) {
    if (
      body.widget_settings === null ||
      typeof body.widget_settings !== "object" ||
      Array.isArray(body.widget_settings)
    ) {
      return { ok: false, error: "widget_settings must be an object." };
    }
    const raw = body.widget_settings as Record<string, unknown>;
    const lw = raw.logoWall;
    if (lw && typeof lw === "object" && !Array.isArray(lw)) {
      const patched = patchFromLogoWallObject(lw as Record<string, unknown>, {
        camel: true,
      });
      if (!patched.ok) return patched;
      widgetSettings = mergeLogoWallPatch(widgetSettings, patched.patch);
      touched = true;
    }
  }

  return { ok: true, widgetSettings, touched };
}

function patchFromLogoWallObject(
  o: Record<string, unknown>,
  opts?: { camel?: boolean },
): {
  ok: true;
  patch: {
    excludedCompanyIds?: string[];
    order?: string[];
    background?: unknown;
    limit?: unknown;
    motion?: unknown;
    size?: unknown;
    overrides?: Record<string, Partial<LogoWallOverride> | null>;
  };
} | { ok: false; error: string } {
  const patch: {
    excludedCompanyIds?: string[];
    order?: string[];
    background?: unknown;
    limit?: unknown;
    motion?: unknown;
    size?: unknown;
    overrides?: Record<string, Partial<LogoWallOverride> | null>;
  } = {};

  void opts;
  if ("excludedCompanyIds" in o || "excluded_company_ids" in o) {
    const raw = o.excluded_company_ids ?? o.excludedCompanyIds;
    if (!Array.isArray(raw)) {
      return { ok: false, error: "logo_wall excluded ids must be an array." };
    }
    patch.excludedCompanyIds = raw.filter(
      (id): id is string => typeof id === "string",
    );
  }
  if ("order" in o) {
    if (!Array.isArray(o.order)) {
      return { ok: false, error: "logo_wall.order must be an array." };
    }
    patch.order = o.order.filter((id): id is string => typeof id === "string");
  }
  if ("background" in o) patch.background = o.background;
  if ("limit" in o) patch.limit = o.limit;
  if ("motion" in o) patch.motion = o.motion;
  if ("size" in o) patch.size = o.size;

  if ("overrides" in o) {
    if (!o.overrides || typeof o.overrides !== "object" || Array.isArray(o.overrides)) {
      return { ok: false, error: "logo_wall.overrides must be an object." };
    }
    const overrides: Record<string, Partial<LogoWallOverride> | null> = {};
    for (const [id, value] of Object.entries(
      o.overrides as Record<string, unknown>,
    )) {
      if (value === null) {
        overrides[id] = null;
        continue;
      }
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        return { ok: false, error: `logo_wall.overrides.${id} invalid.` };
      }
      const v = value as Record<string, unknown>;
      const presentation: Partial<LogoWallOverride> = {};
      if ("scale" in v && typeof v.scale === "number") presentation.scale = v.scale;
      if ("padding" in v && typeof v.padding === "number") {
        presentation.padding = v.padding;
      }
      if ("grayscale" in v && typeof v.grayscale === "boolean") {
        presentation.grayscale = v.grayscale;
      }
      if ("invertOnDark" in v && typeof v.invertOnDark === "boolean") {
        presentation.invertOnDark = v.invertOnDark;
      }
      overrides[id] = parseLogoWallOverride({
        scale: 1,
        padding: 0,
        grayscale: false,
        invertOnDark: false,
        ...presentation,
      });
    }
    patch.overrides = overrides;
  }

  return { ok: true, patch };
}
