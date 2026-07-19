import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyDetail } from "@/components/case-studies/case-study-detail";
import { getCaseStudy } from "@/data/mock/case-studies";
import { getCompanyBySlug } from "@/data/mock/companies";

type Props = {
  params: Promise<{ slug: string; caseSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, caseSlug } = await params;
  const caseStudy = getCaseStudy(slug, caseSlug);
  if (!caseStudy) return { title: "Case study not found" };
  return {
    title: caseStudy.title,
    description: caseStudy.summary,
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug, caseSlug } = await params;
  const company = getCompanyBySlug(slug);
  const caseStudy = getCaseStudy(slug, caseSlug);
  if (!company || !caseStudy) notFound();

  return <CaseStudyDetail company={company} caseStudy={caseStudy} />;
}
