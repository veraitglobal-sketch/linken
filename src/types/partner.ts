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
};
