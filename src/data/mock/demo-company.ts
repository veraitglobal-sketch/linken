import type { Company } from "@/types/company";
import type { Partner } from "@/types/partner";
import type { ServiceReference } from "@/types/service-reference";

export const DEMO_COMPANY: Company = {
  id: "demo-company",
  slug: "demo",
  name: "Nordform Studio",
  tagline:
    "Brand, product, and delivery work — proven with partners who confirm it, not just claim it.",
  description:
    "Nordform helps product companies ship clearer brands and tighter delivery — always with partners who confirm the work on Hansala.",
  category: "Design & product strategy",
  city: "Berlin",
  country: "Germany",
  website: "https://example.com",
  services: ["Brand strategy", "Product design", "Delivery"],
  verified: true,
  verifiedAt: "2026-02-01",
  websiteLinked: true,
  logoInitials: "NS",
  logoUrl: null,
  coverImageUrl: "/images/hero-network.jpg",
  claimed: true,
  acceptingClients: true,
  plan: "pro",
};

export const DEMO_PARTNERS: Partner[] = [
  {
    id: "p1",
    slug: "bramble-engineering",
    name: "Bramble Engineering",
    category: "Software development",
    city: "Berlin",
    verified: true,
    sharedProjects: 2,
    logoInitials: "BE",
    status: "accepted",
  },
  {
    id: "p2",
    slug: "ostra-legal",
    name: "Ostra Legal Partners",
    category: "Professional services",
    city: "Hamburg",
    verified: true,
    sharedProjects: 1,
    logoInitials: "OL",
    status: "accepted",
  },
  {
    id: "p3",
    slug: "fielder-voss",
    name: "Fielder & Voss",
    category: "Marketing & PR",
    city: "Munich",
    verified: false,
    sharedProjects: 1,
    logoInitials: "FV",
    status: "accepted",
  },
];

export const DEMO_REFERENCES: ServiceReference[] = [
  {
    id: "r1",
    clientName: "Harborline AG",
    clientCompanyId: null,
    clientSlug: null,
    clientLogoUrl: null,
    clientWebsite: null,
    service: "Product design retainer",
    startedYear: "2024",
    ongoing: true,
    endedYear: null,
    status: "confirmed",
    confirmedAt: "2024-09-01",
    confirmationLevel: 2,
    disclosure: "named",
  },
  {
    id: "r2",
    clientName: "Nest & Co",
    clientCompanyId: null,
    clientSlug: null,
    clientLogoUrl: null,
    clientWebsite: null,
    service: "Brand system",
    startedYear: "2023",
    ongoing: false,
    endedYear: "2024",
    status: "confirmed",
    confirmedAt: "2024-03-12",
    confirmationLevel: 1,
    disclosure: "named",
  },
];
