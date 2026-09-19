import "server-only";

import { getSiteUrl } from "@/lib/site";
import { canonicalCompanyWithPath } from "@/features/seo/paths";

function origin() {
  return getSiteUrl().replace(/\/$/, "");
}

function cleanSlug(slug: string) {
  return slug.trim().replace(/^\/+|\/+$/g, "");
}

/** Public URLs worth telling search engines about for one company. */
export function companyIndexNowUrls(slug: string): string[] {
  const site = origin();
  const clean = cleanSlug(slug);
  if (!clean) return [];
  return [
    `${site}/c/${clean}`,
    `${site}/c/${clean}/partners`,
    `${site}/c/${clean}/llm.md`,
  ];
}

export function partnershipIndexNowUrls(left: string, right: string): string[] {
  const a = cleanSlug(left);
  const b = cleanSlug(right);
  if (!a || !b) return [];
  const site = origin();
  return [
    ...companyIndexNowUrls(a),
    ...companyIndexNowUrls(b),
    `${site}${canonicalCompanyWithPath(a, b)}`,
    `${site}/companies`,
  ];
}
