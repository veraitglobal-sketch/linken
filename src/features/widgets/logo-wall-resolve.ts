import type { LogoWallOverride } from "@/features/widgets/settings";

export type LogoWallLogoState =
  | "profile"
  | "auto"
  | "custom"
  | "low_quality"
  | "no_logo"
  | "opted_out";

export function isLowQualityLogoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const u = url.toLowerCase();
  return (
    u.includes("favicon") ||
    u.includes("google.com/s2/favicons") ||
    u.includes("icons.duckduckgo.com") ||
    /\/favicon\.(ico|png)/.test(u)
  );
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
  return {
    logoUrl: o?.logoUrl?.trim() || input.profileLogoUrl,
    scale: o?.scale ?? 1,
    padding: o?.padding ?? 0,
    grayscale: o?.grayscale === true,
    invertOnDark: o?.invertOnDark === true,
  };
}
