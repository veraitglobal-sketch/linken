/** Canonical path helpers — always /c/{slug} for company profiles. */

export function companyPath(slug: string): string {
  return `/c/${slug}`;
}

export function companyPartnersPath(slug: string): string {
  return `/c/${slug}/partners`;
}

export function companyWithPath(slug: string, partnerSlug: string): string {
  return `/c/${slug}/with/${partnerSlug}`;
}

/** Stable order so A↔B is one indexable URL. */
export function canonicalCompanyWithPath(a: string, b: string): string {
  return a.localeCompare(b) <= 0
    ? companyWithPath(a, b)
    : companyWithPath(b, a);
}

export function companyBookPath(slug: string): string {
  return `/c/${slug}/book`;
}

export function companyCaseStudyPath(
  companySlug: string,
  caseSlug: string,
): string {
  return `/c/${companySlug}/case-studies/${caseSlug}`;
}

export function companyReportPath(slug: string): string {
  return `/c/${slug}/report`;
}

export function absoluteUrl(siteUrl: string, path: string): string {
  const base = siteUrl.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
