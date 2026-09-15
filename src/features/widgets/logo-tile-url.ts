/** Client-safe helpers for normalised partner logo tiles. */

export type LogoTone = "original" | "ink" | "white";

/** Bump when the processing changes — it is part of every tile URL, so caches refresh. */
export const TILE_VERSION = 3;

const LOGO_PATH = "/storage/v1/object/public/company-logos/";

/** Only our own logo bucket — the tile route must never fetch an arbitrary URL. */
export function isAllowedLogoSourceUrl(raw: string): boolean {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return false;
  try {
    const u = new URL(raw);
    return u.protocol === "https:" && u.host === new URL(base).host && u.pathname.startsWith(LOGO_PATH);
  } catch {
    return false;
  }
}

/** URL of the normalised tile for a stored logo. Relative — served by this app. */
export function logoTileUrl(logoUrl: string, tone: LogoTone): string {
  return `/api/embed/logo-tile?src=${encodeURIComponent(logoUrl)}&tone=${tone}&p=${TILE_VERSION}`;
}
