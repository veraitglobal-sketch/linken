import Link from "next/link";
import { ClientConfirmedChip } from "@/components/case-studies/client-confirmed-chip";
import { CaseStudyPartners } from "@/components/case-studies/case-study-partners";
import type { CaseStudy } from "@/types/case-study";

type Props = {
  companySlug: string;
  caseStudy: CaseStudy;
  index: number;
  featured?: boolean;
};

export function CaseStudyCard({
  companySlug,
  caseStudy,
  index,
  featured = false,
}: Props) {
  if (featured) {
    return (
      <article className="mesh-stage relative overflow-hidden rounded-[28px] text-white">
        <div className="stage-grain absolute inset-0" />
        <div className="relative z-10 px-6 py-7 sm:px-8 sm:py-8">
          <div className="flex items-center gap-3 text-[12px] text-white/50">
            <span className="font-display text-ember">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span>·</span>
            <span className="tracking-[0.1em] uppercase">{caseStudy.year}</span>
            <span>·</span>
            <span>{caseStudy.location}</span>
          </div>
          <h3 className="mt-4 font-display text-[clamp(1.6rem,3vw,2.1rem)] font-medium tracking-[-0.035em]">
            {caseStudy.title}
          </h3>
          {caseStudy.clientConfirmation ? (
            <div className="mt-3">
              <ClientConfirmedChip onDark />
            </div>
          ) : null}
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/70">
            {caseStudy.summary}
          </p>
          <p className="mt-3 text-[12px] text-white/45">
            {caseStudy.services.join(" · ")}
          </p>
          <Link
            href={`/c/${companySlug}/case-studies/${caseStudy.slug}`}
            className="mt-6 inline-flex h-11 items-center rounded-xl bg-white px-5 text-[13px] font-semibold text-ink"
          >
            Open case study
          </Link>
          <div className="mt-6 border-t border-white/15 pt-4">
            <CaseStudyPartners partners={caseStudy.partners} onDark />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-[24px] border border-line bg-surface px-5 py-6 sm:px-7">
      <Link
        href={`/c/${companySlug}/case-studies/${caseStudy.slug}`}
        className="group block"
      >
        <div className="flex items-center gap-3 text-[12px] text-muted">
          <span className="font-display text-ember">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span>·</span>
          <span className="font-semibold tracking-[0.1em] uppercase">
            {caseStudy.year}
          </span>
          <span>·</span>
          <span>{caseStudy.location}</span>
          <span className="ml-auto font-semibold text-ink underline-offset-4 group-hover:underline">
            Open
          </span>
        </div>
        <h3 className="mt-3 font-display text-[clamp(1.35rem,2.2vw,1.65rem)] font-medium tracking-[-0.03em] text-ink">
          {caseStudy.title}
        </h3>
        {caseStudy.clientConfirmation ? (
          <div className="mt-2">
            <ClientConfirmedChip />
          </div>
        ) : null}
        <p className="mt-2.5 line-clamp-2 text-[14px] leading-relaxed text-ink-soft">
          {caseStudy.summary}
        </p>
        <p className="mt-2 text-[12px] text-muted">
          {caseStudy.services.join(" · ")}
        </p>
      </Link>
      <CaseStudyPartners partners={caseStudy.partners} />
    </article>
  );
}
