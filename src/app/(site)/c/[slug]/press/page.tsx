import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { PressKit } from "@/components/company/press-kit";
import { getCompanyForPage } from "@/features/companies/queries";
import { resolveCompanySlugRedirect } from "@/features/companies/slug-redirect";
import { getPartnersForCompany } from "@/features/partners/public-queries";
import { companyPath } from "@/features/seo/paths";
import { getSiteUrl } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompanyForPage(slug);
  if (!company || company.claimed === false) {
    return { title: "Press kit", robots: { index: false, follow: false } };
  }
  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}${companyPath(company.slug)}/press`;
  return {
    title: `Cite ${company.name}`,
    description: `Logo and factual citation line for ${company.name} on Hansala.`,
    alternates: { canonical },
    robots: { index: true, follow: true },
  };
}

export default async function CompanyPressPage({ params }: Props) {
  const { slug } = await params;
  const company = await getCompanyForPage(slug);
  if (!company) {
    const redirectSlug = await resolveCompanySlugRedirect(slug);
    if (redirectSlug) permanentRedirect(`/c/${redirectSlug}/press`);
    notFound();
  }
  if (company.claimed === false) notFound();

  const partners = await getPartnersForCompany(company.id);
  const siteUrl = getSiteUrl();

  return (
    <PressKit
      name={company.name}
      slug={company.slug}
      category={company.category}
      city={company.city}
      country={company.country}
      logoUrl={company.logoUrl ?? null}
      logoInitials={company.logoInitials}
      siteUrl={siteUrl}
      partners={partners}
    />
  );
}
