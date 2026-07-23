import type { ClientConfirmation } from "@/types/client-confirmation";

export type CaseStudyMetric = { label: string; value: string };

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
  duration: string;
  /** Client industry — e.g. Logistics, Healthcare */
  sector: string;
  /** Deliverables — one item per line in studio */
  scope: string;
  /** Display name before client confirms — e.g. "European logistics group" */
  clientLabel: string;
  /** Hero highlight — e.g. "40% faster delivery" */
  highlightStat: string;
  /** Shown when client confirmed — optional pull quote */
  clientQuote: string;
  metrics: CaseStudyMetric[];
  services: string[];
  coverImageUrl: string | null;
  galleryUrls: string[];
  partners: CaseStudyPartner[];
  clientConfirmation?: ClientConfirmation | null;
};
