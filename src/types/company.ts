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
  linkedinUrl?: string | null;
  facebookUrl?: string | null;
  services: string[];
  verified: boolean;
  /** Domain verification timestamp — public. */
  verifiedAt?: string | null;
  /** Optional “Website linked” signal — not the same as verified. */
  websiteLinked?: boolean;
  logoInitials: string;
  logoUrl?: string | null;
  /** Hero banner photo — falls back to the default stock image when unset. */
  coverImageUrl?: string | null;
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
