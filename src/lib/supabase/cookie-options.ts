import type { CookieOptionsWithName } from "@supabase/ssr";

/**
 * Shared cookie attributes for browser + server + middleware.
 * On hansala.com (www + apex), Domain=.hansala.com shares the session.
 * Localhost and Vercel preview keep host-only cookies.
 */
export function getAuthCookieOptions(): CookieOptionsWithName | undefined {
  const configured =
    process.env.AUTH_COOKIE_DOMAIN?.trim() ||
    process.env.NEXT_PUBLIC_AUTH_COOKIE_DOMAIN?.trim();

  if (configured) {
    return cookieAttrs(configured);
  }

  const host = resolveHost();
  if (host === "hansala.com" || host.endsWith(".hansala.com")) {
    return cookieAttrs(".hansala.com");
  }

  return undefined;
}

function resolveHost(): string {
  if (typeof window !== "undefined") {
    return window.location.hostname;
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return vercelUrl.replace(/^https?:\/\//, "").split("/")[0] ?? "";
  }

  try {
    const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    if (site) return new URL(site).hostname;
  } catch {
    /* ignore */
  }

  return "";
}

function cookieAttrs(domain: string): CookieOptionsWithName {
  return {
    domain,
    path: "/",
    sameSite: "lax",
    secure: true,
  };
}
