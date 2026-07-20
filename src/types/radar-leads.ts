import type { TrustLevel } from "@/features/trust/score";

export type RadarFeedReason =
  | "new_company"
  | "became_verified"
  | "accepting_clients"
  | "level_up";

export type ApiTrustLevelKey =
  | "member"
  | "established"
  | "trusted"
  | "pillar";

export type SavedSearch = {
  id: string;
  companyId: string;
  name: string;
  category: string | null;
  country: string | null;
  city: string | null;
  minTrustLevel: ApiTrustLevelKey | null;
  onlyVerified: boolean;
  onlyAccepting: boolean;
  createdAt: string;
};

export type RadarCompanyLead = {
  id: number;
  reason: RadarFeedReason;
  createdAt: string;
  seenAt: string | null;
  searchName: string | null;
  matched: {
    id: string;
    slug: string;
    name: string;
    category: string;
    city: string;
    country: string;
    website: string | null;
    logoUrl: string | null;
    logoInitials: string;
    verified: boolean;
    acceptingClients: boolean;
    receiveIntros: boolean;
    trustLevel: TrustLevel;
  };
};

export type RadarDigestSummary = {
  companyId: string;
  companyLeads: number;
  projectRequests: number;
  windowDays: number;
};
