export type Company = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  city: string;
  country: string;
  website: string;
  services: string[];
  verified: boolean;
  logoInitials: string;
  /** false = ghost / unclaimed draft profile. Never includes claim_token. */
  claimed?: boolean;
  inviteEmail?: string | null;
  createdBySlug?: string | null;
  createdByName?: string | null;
};
