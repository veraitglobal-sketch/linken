import type { CaseStudy } from "@/types/case-study";

function confirmedCase(
  id: string,
  slug: string,
  title: string,
  year: string,
  location: string,
  summary: string,
  services: string[],
  partner: { slug: string; name: string; initials: string },
  cover: string,
): CaseStudy {
  return {
    id,
    slug,
    title,
    summary,
    challenge: "The client needed verified delivery partners, not logo claims.",
    outcome: summary,
    process: "Discovery, joint delivery, and mutual confirmation on Hansala.",
    location,
    year,
    duration: "4 months",
    sector: "Technology",
    scope: services.join("\n"),
    clientLabel: "European product company",
    highlightStat: "Confirmed on both profiles",
    clientQuote: "We finally see who actually delivered with them.",
    metrics: [{ label: "Partners", value: "Confirmed" }],
    services,
    coverImageUrl: cover,
    galleryUrls: [],
    partners: [
      {
        slug: partner.slug,
        name: partner.name,
        role: "Delivery partner",
        logoInitials: partner.initials,
        confirmed: true,
      },
    ],
    clientConfirmation: {
      id: `${id}-cc`,
      caseStudyId: id,
      status: "confirmed",
      email: "client@example.com",
      token: "demo",
      confirmedAt: `${year}-06-01`,
    },
  };
}

export const DEMO_CASE_STUDIES: CaseStudy[] = [
  confirmedCase(
    "cs1",
    "fintech-onboarding",
    "Relaunching a fintech onboarding flow",
    "2026",
    "Berlin, Germany",
    "Redesigned account opening for a challenger bank, cutting drop-off by a third — delivered jointly with engineering.",
    ["Product design", "Engineering"],
    { slug: "bramble-engineering", name: "Bramble Engineering", initials: "BE" },
    "/images/story-projects.jpg",
  ),
  confirmedCase(
    "cs2",
    "legal-tech-brand",
    "Brand system for a legal-tech platform",
    "2025",
    "Hamburg, Germany",
    "A full identity and voice for a contract-review startup, built alongside outside counsel.",
    ["Brand strategy", "Positioning"],
    { slug: "ostra-legal", name: "Ostra Legal Partners", initials: "OL" },
    "/images/story-collaboration-v2.jpg",
  ),
  confirmedCase(
    "cs3",
    "logistics-gtm",
    "Go-to-market for a logistics marketplace",
    "2025",
    "Munich, Germany",
    "Launch strategy and press for a two-sided freight marketplace, coordinated from day one.",
    ["Marketing", "Launch strategy"],
    { slug: "fielder-voss", name: "Fielder & Voss", initials: "FV" },
    "/images/story-team.jpg",
  ),
];

export function getDemoCaseStudy(caseSlug: string): CaseStudy | null {
  return DEMO_CASE_STUDIES.find((c) => c.slug === caseSlug) ?? null;
}
