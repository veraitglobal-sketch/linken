import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CompanyProfile } from "@/components/company/company-profile";
import { getCaseStudiesForCompany } from "@/data/mock/case-studies";
import { getCompanyBySlug } from "@/data/mock/companies";
import { getPartnersForCompany } from "@/data/mock/partners";
import { getSiteUrl } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = getCompanyBySlug(slug);
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
    twitter: {
      card: "summary",
      title: `${company.name} · Linken`,
      description: company.tagline,
    },
  };
}

export default async function CompanyPage({ params }: Props) {
  const { slug } = await params;
  const company = getCompanyBySlug(slug);
  if (!company) notFound();

  const partners = getPartnersForCompany(slug);
  const caseStudies = getCaseStudiesForCompany(slug);
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
      ...partners
        .filter((partner) => partner.status === "accepted")
        .map((partner) => `${siteUrl}/c/${partner.slug}`),
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
        editable
      />
    </>
  );
}
