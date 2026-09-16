import type { DirectoryCardCompany } from "@/components/search/directory-company-card";
import type { CompanySearchHit } from "@/features/companies/search-action";

export function toDirectoryCards(
  companies: CompanySearchHit[],
): DirectoryCardCompany[] {
  return companies.map((hit) => ({
    slug: hit.slug,
    name: hit.name,
    category: hit.category,
    summary: hit.summary,
    place: [hit.city, hit.country].filter(Boolean).join(", "),
    logoUrl: hit.logoUrl,
    initials: hit.logoInitials,
    verified: hit.verified,
    createdAt: hit.createdAt,
    footerLeft: hit.claimed
      ? `${hit.confirmedPartnerCount} confirmed ${hit.confirmedPartnerCount === 1 ? "company" : "companies"}`
      : "Unclaimed · added by a partner",
    src: "search-sector",
  }));
}
