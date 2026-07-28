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

export type AdminCompanyDetail = {
  id: string;
  name: string;
  slug: string;
  website: string;
  category: string;
  city: string;
  country: string;
  claimed: boolean;
  verified: boolean;
  plan: string | null;
  radar: boolean;
  ownerId: string | null;
  ownerEmail: string | null;
  createdAt: string;
  slugHistory: { slug: string; changedAt: string }[];
  verification: {
    method: string | null;
    verifiedAt: string | null;
    lastCheck: string | null;
    websiteLinked: boolean;
  } | null;
  creditsBalance: number;
  creditLedger: { delta: number; reason: string; createdAt: string }[];
  billing: {
    status: string | null;
    subscriptionId: string | null;
    periodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
  partnersCount: number;
  testimonialsCount: number;
  casesCount: number;
  placementsCount: number;
};
