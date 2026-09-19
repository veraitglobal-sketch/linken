/** Public pages, sitemap, and metadata — www, because apex 308s there. */
export const CANONICAL_ORIGIN = "https://www.hansala.com";
const APEX_HOST = "hansala.com";
const PUBLIC_HOST = "www.hansala.com";

export const AUTH_HOSTS = new Set(["hansala.com", "www.hansala.com"]);

function normalizeOrigin(value: string) {
  return value.replace(/\/$/, "");
}

/** Always return an absolute origin (scheme + host), never a bare hostname. */
export function asOrigin(value: string): string {
  const trimmed = normalizeOrigin(value.trim());
  if (!trimmed) return CANONICAL_ORIGIN;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function authHost(value: string): string | null {
  try {
    return new URL(asOrigin(value)).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function isLocalhostOrigin(value: string) {
  try {
    const host = new URL(asOrigin(value)).hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
  } catch {
    return false;
  }
}

/** True on Vercel (production, preview, or CI build). */
export function isDeployedRuntime() {
  return (
    process.env.VERCEL === "1" ||
    process.env.VERCEL_ENV === "production" ||
    process.env.VERCEL_ENV === "preview"
  );
}

/** Apex hansala.com 308s to www — emit www so GSC can read the sitemap. */
export function asPublicOrigin(value: string): string {
  const origin = asOrigin(value);
  if (isLocalhostOrigin(origin)) return origin;
  try {
    const url = new URL(origin);
    if (url.hostname === APEX_HOST) {
      url.hostname = PUBLIC_HOST;
      return url.origin;
    }
    return url.origin;
  } catch {
    return CANONICAL_ORIGIN;
  }
}

export { PUBLIC_HOST };
