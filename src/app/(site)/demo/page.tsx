import type { Metadata } from "next";
import Link from "next/link";
import { CompanyProfile } from "@/components/company/company-profile";
import {
  DEMO_ASSESSMENT,
  DEMO_CASE_STUDIES,
  DEMO_COMPANY,
  DEMO_PARTNERS,
  DEMO_REFERENCES,
  getDemoTrust,
} from "@/data/mock/demo-profile";
import { getSiteUrl } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Demo profile",
  description:
    "An illustrative example of a confirmed company network on Hansala — not a real company.",
  robots: { index: false, follow: false },
};

/** Same layout as `/c/[slug]` — mock data only. */
export default function DemoPage() {
  return (
    <div>
      <div className="sticky top-0 z-50 border-b border-[#1a5c51]/20 bg-[#eafaf3] px-4 py-2.5 text-center">
        <p className="text-[13px] font-medium text-[#1a5c51]">
          <strong className="font-semibold">Demo profile</strong> — illustrative
          example, not a real company.{" "}
          <Link
            href="/onboarding"
            className="underline underline-offset-2 hover:no-underline"
          >
            Create your own company link →
          </Link>
        </p>
      </div>

      <CompanyProfile
        company={DEMO_COMPANY}
        partners={DEMO_PARTNERS}
        caseStudies={DEMO_CASE_STUDIES}
        references={DEMO_REFERENCES}
        trust={getDemoTrust()}
        assessmentSummary={DEMO_ASSESSMENT}
        siteUrl={getSiteUrl()}
        caseStudyBase="/demo"
      />
    </div>
  );
}
