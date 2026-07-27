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
};

export type PublicTestimonial = {
  id: string;
  body: string;
  authorName: string;
  authorRole: string;
  authorCompany: { name: string; slug: string } | null;
  source: TestimonialSource;
  publishedAt: string;
  profileUrl: string;
};
