import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PartnerNetwork } from "@/components/partners/partner-network";
import { getCompanyForPage } from "@/features/companies/queries";
import { getPartnersForCompany } from "@/features/partners/public-queries";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompanyForPage(slug);
  if (!company) return { title: "Network not found" };

  return {
    title: `Partners · ${company.name}`,
    description: `Confirmed partners and collaborators of ${company.name}.`,
  };
}

export default async function CompanyPartnersPage({ params }: Props) {
  const { slug } = await params;
  const company = await getCompanyForPage(slug);
  if (!company) notFound();

  const partners = await getPartnersForCompany(company.id);

  return <PartnerNetwork company={company} partners={partners} />;
}
