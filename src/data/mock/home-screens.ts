import type { ClientConfirmationView } from "@/types/client-confirmation";

/**
 * Props for the real product components rendered on the marketing page.
 *
 * The homepage must never depend on runtime data — a missing record would
 * render a 404 document mid-section. These feed the same components the
 * product uses, so the pixels are real while the network is not touched.
 *
 * Content matches the labelled demo (`/demo`) so a visitor who follows the
 * link sees the same companies. Every screen built from this data carries a
 * visible "Illustrative example" label: we never imply customers we do not
 * have.
 */
export const DEMO_CONFIRMATION: ClientConfirmationView = {
  id: "demo-confirmation",
  caseStudyId: "cs1",
  requestedByCompanyId: "demo-company",
  email: "you@bramble.example",
  token: "demo",
  status: "pending",
  confirmedByCompanyId: null,
  createdAt: "2026-03-02",
  confirmedAt: null,
  caseTitle: "Relaunching a fintech onboarding flow",
  caseSlug: "fintech-onboarding",
  caseSummary:
    "Redesigned account opening for a challenger bank, cutting drop-off by a third — delivered jointly with engineering.",
  caseYear: "2026",
  caseLocation: "Berlin, Germany",
  requesterName: "Nordform Studio",
  requesterSlug: "demo",
  confirmerName: "Bramble Engineering",
  confirmerSlug: "bramble-engineering",
  confirmerLogoUrl: null,
};

export const DEMO_CONFIRMER_NAME = "Bramble Engineering";
