import { JsonLd } from "@/components/seo/json-ld";
import {
  buildCompanyBreadcrumbLd,
  buildCompanyOrganizationLd,
  buildCompanyPartnersLd,
} from "@/features/seo/company-json-ld";
import { buildCompanyWebPageLd } from "@/features/seo/company-webpage-ld";
import type { Company } from "@/types/company";
import type { Partner } from "@/types/partner";

type Props = {
  company: Company;
  partners: Partner[];
  siteUrl: string;
};

export function CompanyPageLd({ company, partners, siteUrl }: Props) {
  const organization = buildCompanyOrganizationLd({
    name: company.name,
    slug: company.slug,
    description: company.description,
    tagline: company.tagline,
    website: company.website,
    logoUrl: company.logoUrl,
    city: company.city,
    country: company.country,
    category: company.category,
    services: company.services,
    verified: company.verified,
    siteUrl,
  });
  return (
    <JsonLd
      data={[
        buildCompanyWebPageLd({
          name: company.name,
          slug: company.slug,
          description: company.description,
          tagline: company.tagline,
          siteUrl,
          organization,
        }),
        organization,
        buildCompanyBreadcrumbLd({
          name: company.name,
          slug: company.slug,
          siteUrl,
        }),
        buildCompanyPartnersLd({
          siteUrl,
          partners: partners.map((p) => ({ name: p.name, slug: p.slug })),
        }),
      ]}
    />
  );
}
