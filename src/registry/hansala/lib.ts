/** Shared helpers for installable Hansala registry components (slug-only). */

export const HANSALA_ORIGIN = (
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_HANSALA_URL
    ? process.env.NEXT_PUBLIC_HANSALA_URL
    : "https://hansala.com"
).replace(/\/$/, "");

/** Profile link — src=embed (DB source); via= host for placement attribution. */
export function profileHref(slug: string, via: string) {
  const host = via.trim().toLowerCase().slice(0, 253) || "unknown";
  const q = new URLSearchParams({ src: "embed", via: host });
  return `${HANSALA_ORIGIN}/c/${encodeURIComponent(slug)}?${q}`;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export async function getJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T | null> {
  try {
    const res = await fetch(`${HANSALA_ORIGIN}${path}`, {
      ...init,
      headers: { Accept: "application/json", ...(init?.headers ?? {}) },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** RSC: caller's host from request headers. */
export async function requestViaHost(): Promise<string> {
  try {
    const { headers } = await import("next/headers");
    const h = await headers();
    const raw = h.get("x-forwarded-host") ?? h.get("host") ?? "";
    return raw.split(":")[0]?.toLowerCase() || "unknown";
  } catch {
    return "unknown";
  }
}
