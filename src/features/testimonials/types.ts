export type TestimonialSource =
  | "partnership"
  | "reference"
  | "case_study"
  | "standalone";

export type TestimonialStatus = "pending" | "published" | "withdrawn";

export type TestimonialRow = {
  id: string;
  companyId: string;
  authorCompanyId: string | null;
  body: string;
  authorName: string;
  authorRole: string;
  source: TestimonialSource;
  sourceId: string | null;
  status: TestimonialStatus;
  consentPublic: boolean;
  createdAt: string;
  publishedAt: string | null;
  authorDomain: string | null;
  authorDomainVerified: boolean;
  authorIsFreeProvider: boolean;
  authorCompanyClaimed: boolean;
};

export type PublicTestimonial = {
  id: string;
  body: string;
  authorName: string;
  authorRole: string;
  /**
   * `logoUrl` is the author company's own logo, uploaded by that company — the
   * only picture we are entitled to put next to their words. There is no
   * per-person photograph on a record and none is invented; when the logo is
   * absent the card sets the initials instead.
   */
  authorCompany: { name: string; slug: string; logoUrl: string | null } | null;
  source: TestimonialSource;
  publishedAt: string;
  profileUrl: string;
  provenanceLine: string;
};
