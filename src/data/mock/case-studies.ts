import type { CaseStudy } from "@/types/case-study";

export const caseStudiesByCompany: Record<string, CaseStudy[]> = {
  "acme-architecture": [
    {
      id: "cs1",
      slug: "residence-berlin",
      title: "Residence Berlin-Mitte",
      summary:
        "A multi-unit renovation delivered through a verified project network — architecture, construction, and electrical under one coordinated plan.",
      challenge:
        "The client needed one accountable planning lead and trusted partners for execution, without managing each trade separately.",
      outcome:
        "Permit-ready design, coordinated site delivery, and a shared reference both firms can show on their Linken profiles.",
      location: "Berlin",
      year: "2025",
      services: ["Architecture", "Project oversight"],
      partners: [
        {
          slug: "baupro",
          name: "BauPro GmbH",
          role: "General contracting",
          logoInitials: "BP",
          confirmed: true,
        },
        {
          slug: "beta-elektro",
          name: "Beta Elektro",
          role: "Electrical systems",
          logoInitials: "BE",
          confirmed: true,
        },
      ],
    },
    {
      id: "cs2",
      slug: "office-campus-spandau",
      title: "Office Campus Spandau",
      summary:
        "Workplace campus from concept through permit stage, with interior and construction partners confirmed on the record.",
      challenge:
        "Fast concept cycles and clear trade responsibilities before construction start.",
      outcome:
        "Aligned design package, confirmed partner roles, and a public case study both sides can share with clients.",
      location: "Berlin",
      year: "2024",
      services: ["Concept design", "Building permits"],
      partners: [
        {
          slug: "baupro",
          name: "BauPro GmbH",
          role: "Construction advisory",
          logoInitials: "BP",
          confirmed: true,
        },
        {
          slug: "studio-interior",
          name: "Studio Interior",
          role: "Interior architecture",
          logoInitials: "SI",
          confirmed: true,
        },
      ],
    },
  ],
};

export function getCaseStudiesForCompany(slug: string) {
  return caseStudiesByCompany[slug] ?? [];
}

export function getCaseStudy(companySlug: string, caseSlug: string) {
  return getCaseStudiesForCompany(companySlug).find((c) => c.slug === caseSlug);
}
