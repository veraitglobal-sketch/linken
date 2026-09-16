import "server-only";

import { getSiteUrl } from "@/lib/site";

/** Public URLs worth telling search engines about for one company. */
export function companyIndexNowUrls(slug: string): string[] {
  const site = getSiteUrl().replace(/\/$/, "");
  const clean = slug.trim().replace(/^\/+|\/+$/g, "");
  if (!clean) return [];
  return [`${site}/c/${clean}`];
}
