import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseStudyDetail } from "@/components/case-studies/case-study-detail";
import {
  DEMO_COMPANY,
  getDemoCaseStudy,
} from "@/data/mock/demo-profile";

type Props = {
  params: Promise<{ caseSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { caseSlug } = await params;
  const caseStudy = getDemoCaseStudy(caseSlug);
  if (!caseStudy) return { title: "Case study not found" };
  return {
    title: caseStudy.title,
    description: caseStudy.summary,
    robots: { index: false, follow: false },
  };
}

export default async function DemoCaseStudyPage({ params }: Props) {
  const { caseSlug } = await params;
  const caseStudy = getDemoCaseStudy(caseSlug);
  if (!caseStudy) notFound();

  return (
    <div>
      <div className="border-b border-line bg-paper px-4 py-2.5 text-center">
        <p className="text-[13px] text-muted">
          Demo case study ·{" "}
          <Link
            href="/demo"
            className="font-semibold text-ink underline-offset-2 hover:underline"
          >
            Back to demo profile
          </Link>
        </p>
      </div>
      <CaseStudyDetail
        company={DEMO_COMPANY}
        caseStudy={caseStudy}
        editable={false}
        index={0}
        companyHref="/demo"
      />
    </div>
  );
}
