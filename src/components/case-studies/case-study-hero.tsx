import Image from "next/image";
import Link from "next/link";
import { ClientConfirmedBadge } from "@/components/case-studies/client-confirmed-badge";
import { caseStudyCoverFocus, caseStudyCoverUrl } from "@/lib/case-study-cover";
import type { CaseStudy } from "@/types/case-study";
import type { Company } from "@/types/company";

type Props = {
  company: Company;
  caseStudy: CaseStudy;
  index?: number;
};

export function CaseStudyHero({ company, caseStudy, index = 0 }: Props) {
  const cover = caseStudyCoverUrl(caseStudy.coverImageUrl, index);
  const hasCustomCover = Boolean(caseStudy.coverImageUrl);
  const confirmed = caseStudy.clientConfirmation?.status === "confirmed";

  return (
    <header className="relative mx-auto max-w-6xl px-4 pt-3">
      <div className="relative min-h-[min(88svh,760px)] overflow-hidden rounded-[32px] bg-navy shadow-[0_28px_90px_rgba(8,20,18,0.28)]">
        <Image
          src={cover}
          alt=""
          fill
          priority
          className={`media-zoom object-cover ${caseStudyCoverFocus(index)}`}
          sizes="(max-width: 768px) 100vw, 1152px"
        />
        <div className="stage-grain absolute inset-0 z-[1]" />
        <div
          className="absolute inset-0 z-[2] bg-gradient-to-t from-[#081412] via-[#081412]/72 to-[#081412]/25"
          aria-hidden
        />
        <div
          className="absolute inset-0 z-[2] bg-gradient-to-r from-[#081412]/55 via-transparent to-transparent"
          aria-hidden
        />

        <div className="relative z-10 flex min-h-[min(88svh,760px)] flex-col justify-between px-7 py-8 sm:px-11 sm:py-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href={`/c/${company.slug}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-[#081412]/48 px-3.5 py-1.5 text-[12px] font-medium text-white/75 backdrop-blur-md transition-colors hover:border-white/25 hover:text-white"
            >
              ← {company.name}
            </Link>
            {!hasCustomCover ? (
              <span className="rounded-full border border-white/12 bg-white/5 px-3 py-1 text-[10px] font-semibold tracking-[0.12em] text-white/45 uppercase">
                Add cover photo in dashboard
              </span>
            ) : null}
          </div>

          <div className="max-w-3xl pb-2">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px] font-medium tracking-[0.1em] text-white/50 uppercase">
              <span>Case study</span>
              {caseStudy.year ? (
                <>
                  <span className="text-white/25">·</span>
                  <span>{caseStudy.year}</span>
                </>
              ) : null}
              {caseStudy.location ? (
                <>
                  <span className="text-white/25">·</span>
                  <span>{caseStudy.location}</span>
                </>
              ) : null}
              {caseStudy.sector ? (
                <>
                  <span className="text-white/25">·</span>
                  <span>{caseStudy.sector}</span>
                </>
              ) : null}
              {caseStudy.duration ? (
                <>
                  <span className="text-white/25">·</span>
                  <span>{caseStudy.duration}</span>
                </>
              ) : null}
            </div>
            <h1 className="mt-5 font-display text-[clamp(2.2rem,5.5vw,4rem)] leading-[0.95] font-medium tracking-[-0.045em] text-white">
              {caseStudy.title}
            </h1>
            {caseStudy.highlightStat ? (
              <p className="mt-4 font-display text-[clamp(1.25rem,2.5vw,1.75rem)] font-medium tracking-[-0.03em] text-ember">
                {caseStudy.highlightStat}
              </p>
            ) : null}
            <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-white/68">
              {caseStudy.summary}
            </p>
            {confirmed && caseStudy.clientConfirmation ? (
              <div className="mt-7">
                <ClientConfirmedBadge confirmation={caseStudy.clientConfirmation} />
              </div>
            ) : null}
            {caseStudy.services.length > 0 ? (
              <div className="mt-7 flex flex-wrap gap-2">
                {caseStudy.services.map((service) => (
                  <span
                    key={service}
                    className="rounded-full border border-white/14 bg-white/8 px-3 py-1 text-[11px] font-semibold tracking-[0.06em] text-white/75 uppercase backdrop-blur-sm"
                  >
                    {service}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
