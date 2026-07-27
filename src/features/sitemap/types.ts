export type SitemapCompanyRow = {
  slug: string;
  verified: boolean;
  updatedAt: string;
  logoUrl: string | null;
  hasWebsite: boolean;
  hasBooking: boolean;
  hasCaseStudies: boolean;
  partnerCount: number;
};

export type SitemapCaseStudyRow = {
  companySlug: string;
  caseSlug: string;
  createdAt: string;
  coverImageUrl: string | null;
  clientConfirmed: boolean;
};

export type SitemapGroupRow = {
  slug: string;
  createdAt: string;
  memberCount: number;
};

export const SITEMAP_CHUNK_SIZE = 5_000;

export const SITEMAP_STATIC_ID = 0;
export const SITEMAP_GROUP_ID = 1;
export const SITEMAP_CASE_STUDY_BASE_ID = 2_000;
export const SITEMAP_COMPANY_BASE_ID = 1_000;
