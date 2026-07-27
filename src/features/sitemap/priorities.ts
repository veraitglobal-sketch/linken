import type { SitemapCompanyRow } from "@/features/sitemap/types";

export function companyProfilePriority(row: SitemapCompanyRow): number {
  if (row.verified) return row.hasCaseStudies ? 0.9 : 0.86;
  if (row.hasWebsite) return 0.76;
  return 0.68;
}

export function companyPartnersPriority(profile: number): number {
  return Math.max(0.52, profile - 0.14);
}

export function companyBookPriority(row: SitemapCompanyRow): number {
  return row.verified ? 0.72 : 0.64;
}

export function caseStudyPriority(hasCover: boolean, clientConfirmed: boolean): number {
  let p = 0.72;
  if (hasCover) p += 0.04;
  if (clientConfirmed) p += 0.06;
  return Math.min(p, 0.88);
}
