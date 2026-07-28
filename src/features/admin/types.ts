export type AdminStats = {
  companiesTotal: number;
  companiesClaimed: number;
  companiesVerified: number;
  companiesNewWeek: number;
  testimonialsPending: number;
  testimonialsPublished: number;
  testimonialsWithdrawn: number;
  partnershipsPending: number;
  confirmationsPending: number;
};

export type AdminCompanyRow = {
  id: string;
  name: string;
  slug: string;
  claimed: boolean;
  verified: boolean;
  plan: string | null;
  website: string | null;
  createdAt: string;
};

export type AdminTestimonialRow = {
  id: string;
  status: string;
  body: string;
  authorName: string;
  source: string;
  companyName: string;
  companySlug: string;
  authorDomain: string | null;
  authorDomainVerified: boolean;
  createdAt: string;
  publishedAt: string | null;
};
