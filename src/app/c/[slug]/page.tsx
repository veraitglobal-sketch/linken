import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CompanyProfile } from "@/components/company/company-profile";
import { getCaseStudiesForCompany } from "@/data/mock/case-studies";
import { getCompanyBySlug } from "@/data/mock/companies";
import { getPartnersForCompany } from "@/data/mock/partners";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = getCompanyBySlug(slug);
  if (!company) return { title: "Company not found" };
  return {
    title: company.name,
    description: company.tagline,
  };
}

export default async function CompanyPage({ params }: Props) {
  const { slug } = await params;
  const company = getCompanyBySlug(slug);
  if (!company) notFound();

  return (
    <CompanyProfile
      company={company}
      partners={getPartnersForCompany(slug)}
      caseStudies={getCaseStudiesForCompany(slug)}
      editable
    />
  );
}
