import type { Company } from "@/types/company";

export const companies: Company[] = [
  {
    id: "c1",
    slug: "acme-architecture",
    name: "Acme Architecture",
    tagline: "Commercial and residential design across DACH.",
    description:
      "We plan and deliver building projects with a verified network of contractors and technical partners. Our profiles show real collaborations — not logos for hire.",
    category: "Architecture",
    city: "Berlin",
    country: "Germany",
    website: "https://example.com",
    services: ["Concept design", "Building permits", "Project oversight"],
    verified: true,
    logoInitials: "AA",
  },
  {
    id: "c2",
    slug: "baupro",
    name: "BauPro GmbH",
    tagline: "General contracting for complex builds.",
    description:
      "Execution partner for architecture studios. Structural works, site coordination, and handover.",
    category: "Construction",
    city: "Berlin",
    country: "Germany",
    website: "https://example.com",
    services: ["Shell construction", "Fit-out", "Site management"],
    verified: true,
    logoInitials: "BP",
  },
  {
    id: "c3",
    slug: "beta-elektro",
    name: "Beta Elektro",
    tagline: "Electrical systems for commercial projects.",
    description:
      "Planning and installation of electrical systems for offices and residential developments.",
    category: "Electrical",
    city: "Potsdam",
    country: "Germany",
    website: "https://example.com",
    services: ["Elektroinstallationen", "Smart building", "Maintenance"],
    verified: true,
    logoInitials: "BE",
  },
  {
    id: "c4",
    slug: "studio-interior",
    name: "Studio Interior",
    tagline: "Interior architecture for workplaces.",
    description:
      "Material concepts, FF&E coordination, and interior delivery with project partners.",
    category: "Interior design",
    city: "Munich",
    country: "Germany",
    website: "https://example.com",
    services: ["Workplace design", "Material concepts", "FF&E"],
    verified: false,
    logoInitials: "SI",
  },
];

export function getCompanyBySlug(slug: string) {
  return companies.find((c) => c.slug === slug);
}
