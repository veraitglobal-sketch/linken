import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PartnerNetwork } from "@/components/partners/partner-network";
import { getCompanyBySlug } from "@/data/mock/companies";
import { getPartnersForCompany } from "@/data/mock/partners";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = getCompanyBySlug(slug);
  if (!company) return { title: "Network not found" };

  return {
    title: `Partners · ${company.name}`,
    description: `Confirmed partners and collaborators of ${company.name}.`,
  };
}

export default async function CompanyPartnersPage({ params }: Props) {
  const { slug } = await params;
  const company = getCompanyBySlug(slug);
  if (!company) notFound();

  const partners = getPartnersForCompany(slug);

  return <PartnerNetwork company={company} partners={partners} />;
}
