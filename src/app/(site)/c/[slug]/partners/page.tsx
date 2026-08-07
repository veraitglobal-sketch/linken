import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { PartnerNetwork } from "@/components/partners/partner-network";
import { JsonLd } from "@/components/seo/json-ld";
import { resolveCompanySlugRedirect } from "@/features/companies/slug-redirect";
import { getCompanyForPage } from "@/features/companies/queries";
import { getPartnersForCompany } from "@/features/partners/public-queries";
import { companyIndexability } from "@/features/seo/indexability";
import {
  absoluteUrl,
  companyPartnersPath,
  companyPath,
} from "@/features/seo/paths";
import { getSiteUrl } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompanyForPage(slug);
  if (!company) {
    return {
      title: "Network not found",
      robots: { index: false, follow: false },
    };
  }
  const siteUrl = getSiteUrl();
  const url = absoluteUrl(siteUrl, companyPartnersPath(company.slug));
  const { index, follow } = companyIndexability(company);
  return {
    title: `Partners · ${company.name}`,
    description: `Confirmed partners and collaborators of ${company.name}. Pending requests are never listed.`,
    robots: { index, follow },
    alternates: { canonical: url },
    openGraph: {
      title: `Partners · ${company.name}`,
      description: `Confirmed partners of ${company.name} on Hansala.`,
      url,
    },
  };
}

export default async function CompanyPartnersPage({ params }: Props) {
  const { slug } = await params;
  const company = await getCompanyForPage(slug);
  if (!company) {
    const redirectSlug = await resolveCompanySlugRedirect(slug);
    if (redirectSlug) permanentRedirect(`/c/${redirectSlug}/partners`);
    notFound();
  }

  const partners = await getPartnersForCompany(company.id);
  const siteUrl = getSiteUrl();
  const crumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Hansala",
        item: absoluteUrl(siteUrl, "/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: company.name,
        item: absoluteUrl(siteUrl, companyPath(company.slug)),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Partners",
        item: absoluteUrl(siteUrl, companyPartnersPath(company.slug)),
      },
    ],
  };

  return (
    <>
      <JsonLd data={crumbLd} />
      <PartnerNetwork company={company} partners={partners} />
    </>
  );
}
