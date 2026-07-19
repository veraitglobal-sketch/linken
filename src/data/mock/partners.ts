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
  ],
};

export function getPartnersForCompany(slug: string) {
  return partnersByCompany[slug] ?? [];
}
