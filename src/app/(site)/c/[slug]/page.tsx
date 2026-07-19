import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CompanyProfile } from "@/components/company/company-profile";
import { getCompanyForPage } from "@/features/companies/queries";
import { isCompanyOwnerSlug } from "@/features/case-studies/queries";
import { getCaseStudiesForCompany } from "@/data/mock/case-studies";
import { getPartnersForCompany } from "@/data/mock/partners";
import { getSiteUrl } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    claimSent?: string;
    claimError?: string;
    claimed?: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompanyForPage(slug);
  if (!company) return { title: "Company not found" };

  const url = `${getSiteUrl()}/c/${company.slug}`;

  return {
    title: company.name,
    description: company.tagline,
    alternates: { canonical: url },
    openGraph: {
      type: "profile",
      title: `${company.name} · Linken`,
      description: company.tagline,
      url,
    },
  };
}

export default async function CompanyPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { claimSent, claimError } = await searchParams;
  const company = await getCompanyForPage(slug);
  if (!company) notFound();

  const partners = getPartnersForCompany(slug).filter(
    (p) => p.status === "accepted",
  );
  const caseStudies = getCaseStudiesForCompany(slug);
  const editable =
    company.claimed !== false && (await isCompanyOwnerSlug(slug));
  const siteUrl = getSiteUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    description: company.description,
    url: company.website || undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: company.city,
      addressCountry: company.country,
    },
    sameAs: [
      company.website,
      ...partners.map((partner) => `${siteUrl}/c/${partner.slug}`),
    ].filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CompanyProfile
        company={company}
        partners={partners}
        caseStudies={caseStudies}
        editable={editable}
        claimSent={claimSent === "1"}
        claimError={claimError}
      />
    </>
  );
}
