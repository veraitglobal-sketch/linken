import Link from "next/link";
import { ProfileIcons, ProfileSection } from "@/components/company/profile-section";
import { CaseStudyCard } from "@/components/case-studies/case-study-card";
import type { CaseStudy } from "@/types/case-study";
import type { Company } from "@/types/company";

type Props = {
  company: Company;
  companySlug: string;
  caseStudies: CaseStudy[];
  editable?: boolean;
  caseStudyBase?: string;
};

export function CaseStudyList({
  company,
  companySlug,
  caseStudies,
  editable = false,
  caseStudyBase,
}: Props) {
  if (caseStudies.length === 0 && !editable) return null;

  return (
    <ProfileSection
      id="case-studies"
      icon={ProfileIcons.cases}
      title="Case files"
      description="Selected work, each one sent to the client to confirm."
      action={
        editable ? (
          <Link
            href="/dashboard/cases"
            className="inline-flex h-9 items-center rounded-full bg-wash px-4 text-[13px] font-semibold text-ink ring-1 ring-line/70 transition-colors hover:bg-lime-soft"
          >
            Add case study
          </Link>
        ) : null
      }
    >
      {caseStudies.length > 0 ? (
        <div className="flex flex-col gap-3.5">
          {caseStudies.map((caseStudy, index) => (
            <CaseStudyCard
              key={caseStudy.id}
              company={company}
              companySlug={companySlug}
              caseStudy={caseStudy}
              index={index}
              featured={index === 0}
              caseStudyBase={caseStudyBase}
            />
          ))}
        </div>
      ) : editable ? (
        <div className="rounded-2xl border border-dashed border-ink/15 px-5 py-6">
          <p className="text-[13px] font-semibold text-ink">No case studies yet</p>
          <p className="mt-1.5 text-[13px] text-ink-soft">
            Create one in the dashboard — we email the client for confirmation
            in the same step.
          </p>
          <Link
            href="/dashboard/cases"
            className="mt-3 inline-flex text-[12px] font-semibold text-ink underline-offset-2 hover:underline"
          >
            Create &amp; send confirmation →
          </Link>
        </div>
      ) : null}
    </ProfileSection>
  );
}
