import type { ClientConfirmation } from "@/types/client-confirmation";

export type CaseStudyPartner = {
  slug: string;
  name: string;
  role: string;
  logoInitials: string;
  confirmed: boolean;
};

export type CaseStudy = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  challenge: string;
  outcome: string;
  /** How the work was delivered — process, approach, timeline. */
  process: string;
  location: string;
  year: string;
  services: string[];
  coverImageUrl: string | null;
  galleryUrls: string[];
  partners: CaseStudyPartner[];
  /** Highest trust layer — confirmed by the client company. */
  clientConfirmation?: ClientConfirmation | null;
};
