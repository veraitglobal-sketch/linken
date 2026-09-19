export type PartnerStatus = "accepted" | "pending" | "none";

export type Partner = {
  id: string;
  slug: string;
  name: string;
  category: string;
  city: string;
  verified: boolean;
  sharedProjects: number;
  logoInitials: string;
  logoUrl?: string | null;
  status: PartnerStatus;
  /** partnerships.id — for owner manage actions; omit on public-only cards. */
  partnershipId?: string;
  /** When the other side accepted (responded_at, else created_at). */
  confirmedAt?: string | null;
  /** Partner published this company on their own website. */
  liveOnSite?: boolean;
};
