import type { Partner } from "@/types/partner";

export const partnersByCompany: Record<string, Partner[]> = {
  "acme-architecture": [
    {
      id: "c2",
      slug: "baupro",
      name: "BauPro GmbH",
      category: "Construction",
      city: "Berlin",
      verified: true,
      sharedProjects: 6,
      logoInitials: "BP",
      status: "accepted",
    },
    {
      id: "c3",
      slug: "beta-elektro",
      name: "Beta Elektro",
      category: "Electrical",
      city: "Potsdam",
      verified: true,
      sharedProjects: 3,
      logoInitials: "BE",
      status: "accepted",
    },
    {
      id: "c6",
      slug: "stahlwerk-structures",
      name: "Stahlwerk Structures",
      category: "Structural engineering",
      city: "Leipzig",
      verified: true,
      sharedProjects: 4,
      logoInitials: "SS",
      status: "accepted",
    },
    {
      id: "c5",
      slug: "nordlicht-hvac",
      name: "Nordlicht HVAC",
      category: "HVAC",
      city: "Hamburg",
      verified: true,
      sharedProjects: 2,
      logoInitials: "NH",
      status: "accepted",
    },
    {
      id: "c4",
      slug: "studio-interior",
      name: "Studio Interior",
      category: "Interior design",
      city: "Munich",
      verified: false,
      sharedProjects: 1,
      logoInitials: "SI",
      status: "accepted",
    },
    {
      id: "c7",
      slug: "grünraum-landscape",
      name: "Grünraum Landscape",
      category: "Landscape",
      city: "Cologne",
      verified: true,
      sharedProjects: 2,
      logoInitials: "GL",
      status: "accepted",
    },
    {
      id: "c8",
      slug: "optik-facades",
      name: "Optik Facades",
      category: "Facades",
      city: "Frankfurt",
      verified: false,
      sharedProjects: 1,
      logoInitials: "OF",
      status: "accepted",
    },
  ],
  baupro: [
    {
      id: "c1",
      slug: "acme-architecture",
      name: "Acme Architecture",
      category: "Architecture",
      city: "Berlin",
      verified: true,
      sharedProjects: 6,
      logoInitials: "AA",
      status: "accepted",
    },
    {
      id: "c3",
      slug: "beta-elektro",
      name: "Beta Elektro",
      category: "Electrical",
      city: "Potsdam",
      verified: true,
      sharedProjects: 2,
      logoInitials: "BE",
      status: "accepted",
    },
  ],
};

/** Verified first, then most shared work, then name. */
export function sortPartners(partners: Partner[]) {
  return [...partners].sort((a, b) => {
    if (a.verified !== b.verified) return a.verified ? -1 : 1;
    if (b.sharedProjects !== a.sharedProjects) {
      return b.sharedProjects - a.sharedProjects;
    }
    return a.name.localeCompare(b.name);
  });
}

export function getPartnersForCompany(slug: string) {
  return sortPartners(partnersByCompany[slug] ?? []);
}
