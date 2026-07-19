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
  /** Domain verification timestamp — public. */
  verifiedAt?: string | null;
  /** Optional “Website linked” signal — not the same as verified. */
  websiteLinked?: boolean;
  logoInitials: string;
  /** false = ghost / unclaimed draft profile. Never includes claim_token. */
  claimed?: boolean;
  /** Public availability — default true when unset. */
  acceptingClients?: boolean;
  /** Billing plan — free | pro | founding. Not user-editable in-app. */
  plan?: "free" | "pro" | "founding";
  inviteEmail?: string | null;
  createdBySlug?: string | null;
  createdByName?: string | null;
};
