/**
 * Hansala Public API v1 — public contract.
 * Fields may be ADDED in future releases. Never rename, remove, or change meaning.
 * Breaking changes require /api/v2/.
 */

/** Trust level as exposed publicly (lowercase). */
export type ApiTrustLevel =
  | "member"
  | "established"
  | "trusted"
  | "pillar";

export type ApiCompanyStats = {
  /** Accepted mutual partnerships. */
  confirmed_partners: number;
  /** Confirmed finished service references (ongoing=false). */
  confirmed_references: number;
  /** Confirmed ongoing service references. */
  ongoing_references: number;
  /** Case studies with at least one client or partner confirmation. */
  confirmed_case_studies: number;
};

export type ApiStrength = {
  /** Catalog key, e.g. "reliability". */
  key: string;
  /** Human label, e.g. "Reliability". */
  label: string;
  /** How many assessments selected this strength. */
  count: number;
};

export type ApiAssessment = {
  would_work_again_yes: number;
  would_work_again_total: number;
  /** Top strengths, highest count first. */
  top_strengths: ApiStrength[];
};

/**
 * GET /api/v1/companies/{slug}
 * Unclaimed companies return claimed:false with stats/assessment null.
 */
export type ApiCompanyResponse = {
  slug: string;
  name: string;
  category: string;
  city: string;
  country: string;
  website: string;
  verified: boolean;
  claimed: boolean;
  accepting_clients: boolean;
  trust_level: ApiTrustLevel;
  /** Null for unclaimed profiles. */
  stats: ApiCompanyStats | null;
  /** Null until would_work_again_total >= 3 (anonymity rule). */
  assessment: ApiAssessment | null;
  /** Absolute URL to the public profile. */
  profile_url: string;
  /** ISO-8601 generation timestamp. */
  generated_at: string;
};

export type ApiReference = {
  client_name: string;
  /** Public slug when the client has a claimed Hansala profile. */
  client_slug: string | null;
  service: string;
  started_year: string;
  ongoing: boolean;
  ended_year: string | null;
  /** ISO-8601 when the client confirmed. */
  confirmed_at: string;
  /** 1 engagement · 2 scope · 3 outcome */
  confirmation_level: 1 | 2 | 3;
  /** named | undisclosed — undisclosed clients still count */
  disclosure: "named" | "undisclosed";
};

/** GET /api/v1/companies/{slug}/references */
export type ApiReferencesResponse = {
  references: ApiReference[];
  count: number;
};

/** GET /api/v1/companies/{slug}/partners — accepted mutual partnerships only. */
export type ApiPartner = {
  name: string;
  slug: string;
  verified: boolean;
};

export type ApiPartnersResponse = {
  partners: ApiPartner[];
  count: number;
};

export type ApiCaseStudyPartner = {
  name: string;
  slug: string;
};

export type ApiCaseStudy = {
  slug: string;
  title: string;
  summary: string;
  year: string;
  location: string;
  /** Absolute URL to the case study page. */
  url: string;
  client_confirmed: boolean;
  confirmed_partners: ApiCaseStudyPartner[];
};

/** GET /api/v1/companies/{slug}/case-studies */
export type ApiCaseStudiesResponse = {
  case_studies: ApiCaseStudy[];
  count: number;
};

export type ApiTestimonialAuthorCompany = {
  name: string;
  slug: string;
};

/** Client-written testimonial — author text is immutable for the receiving company. */
export type ApiTestimonial = {
  id: string;
  body: string;
  author_name: string;
  author_role: string;
  author_company: ApiTestimonialAuthorCompany | null;
  source: "partnership" | "reference" | "case_study" | "standalone";
  /** ISO-8601 when published. */
  published_at: string;
  /** Factual provenance line for readers. */
  provenance_line: string;
  /** Absolute URL to the company profile. */
  profile_url: string;
};

/** GET /api/v1/companies/{slug}/testimonials */
export type ApiTestimonialsResponse = {
  testimonials: ApiTestimonial[];
  count: number;
};

/**
 * GET /api/v1/verify?domain={domain}
 * Trust oracle — domain → claimed company snapshot (confirmed evidence only).
 * `found: false` is still HTTP 200 so agents can branch without treating absence as an error.
 */
export type ApiVerifyResponse = {
  found: boolean;
  company: {
    name: string;
    slug: string;
    profile_url: string;
  } | null;
  verified: boolean;
  verification_method: "email_domain" | "dns_txt" | "meta_tag" | null;
  /** ISO-8601 when domain was verified; null if not verified. */
  verified_since: string | null;
  trust_level: ApiTrustLevel | null;
  stats: ApiCompanyStats | null;
  assessment: ApiAssessment | null;
  /** Absolute URL to the markdown snapshot for LLMs. */
  llm_md_url: string | null;
  /** Absolute URL to GET /api/v1/companies/{slug}. */
  api_url: string | null;
  generated_at: string;
};

export type ApiErrorCode =
  | "not_found"
  | "invalid_request"
  | "rate_limited"
  | "internal";

/** Consistent error envelope for all v1 endpoints. */
export type ApiErrorBody = {
  error: {
    code: ApiErrorCode;
    message: string;
  };
};
