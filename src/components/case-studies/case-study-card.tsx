import Image from "next/image";
import Link from "next/link";
import { ClientConfirmedChip } from "@/components/case-studies/client-confirmed-chip";
import { CaseStudyPartners } from "@/components/case-studies/case-study-partners";
import { caseStudyCoverFocus, caseStudyCoverUrl } from "@/lib/case-study-cover";
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
  const href = `/c/${companySlug}/case-studies/${caseStudy.slug}`;
  const cover = caseStudyCoverUrl(caseStudy.coverImageUrl, index);
  const confirmed = caseStudy.clientConfirmation?.status === "confirmed";

  if (featured) {
    return (
      <article className="group relative overflow-hidden rounded-[32px] bg-navy shadow-[0_22px_56px_rgba(8,20,18,0.14)]">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          <Link href={href} className="relative block min-h-[280px] overflow-hidden lg:min-h-[420px]">
            <Image
              src={cover}
              alt=""
              fill
              className={`media-zoom object-cover ${caseStudyCoverFocus(index)}`}
              sizes="(max-width: 1024px) 100vw, 600px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#081412]/80 via-transparent to-transparent lg:hidden" />
          </Link>
          <div className="relative flex flex-col justify-between px-7 py-8 sm:px-9 sm:py-10">
            <div>
              <div className="flex flex-wrap items-center gap-3 text-[12px] text-white/50">
                <span className="font-display text-ember">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>·</span>
                <span className="tracking-[0.1em] uppercase">{caseStudy.year}</span>
                {caseStudy.location ? (
                  <>
                    <span>·</span>
                    <span>{caseStudy.location}</span>
                  </>
                ) : null}
              </div>
              <Link href={href}>
                <h3 className="mt-4 font-display text-[clamp(1.65rem,3vw,2.25rem)] font-medium tracking-[-0.035em] text-white transition-opacity group-hover:opacity-90">
                  {caseStudy.title}
                </h3>
              </Link>
              {confirmed ? (
                <div className="mt-3">
                  <ClientConfirmedChip onDark />
                </div>
              ) : null}
              <p className="mt-4 line-clamp-3 text-[15px] leading-relaxed text-white/68">
                {caseStudy.summary}
              </p>
              {caseStudy.services.length > 0 ? (
                <p className="mt-4 text-[12px] text-white/45">
                  {caseStudy.services.slice(0, 4).join(" · ")}
                </p>
              ) : null}
            </div>
            <div className="mt-8 border-t border-white/12 pt-5">
              <Link
                href={href}
                className="inline-flex h-11 items-center rounded-xl bg-white px-5 text-[13px] font-semibold text-ink transition-transform hover:scale-[1.02]"
              >
                View case study
              </Link>
              <div className="mt-5">
                <CaseStudyPartners partners={caseStudy.partners} onDark />
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group overflow-hidden rounded-[24px] border border-line bg-surface shadow-[0_8px_28px_rgba(8,20,18,0.03)] transition-shadow hover:shadow-[0_14px_40px_rgba(8,20,18,0.07)]">
      <Link href={href} className="grid sm:grid-cols-[220px_1fr]">
        <div className="relative aspect-[16/10] overflow-hidden sm:aspect-auto sm:min-h-[200px]">
          <Image
            src={cover}
            alt=""
            fill
            className={`media-zoom object-cover ${caseStudyCoverFocus(index)}`}
            sizes="220px"
          />
        </div>
        <div className="flex flex-col justify-center px-5 py-5 sm:px-7">
          <div className="flex items-center gap-3 text-[12px] text-muted">
            <span className="font-display text-ember">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span>·</span>
            <span className="font-semibold tracking-[0.1em] uppercase">
              {caseStudy.year}
            </span>
            {caseStudy.location ? (
              <>
                <span>·</span>
                <span>{caseStudy.location}</span>
              </>
            ) : null}
            <span className="ml-auto font-semibold text-ink opacity-0 transition-opacity group-hover:opacity-100">
              Open →
            </span>
          </div>
          <h3 className="mt-2 font-display text-[clamp(1.25rem,2vw,1.5rem)] font-medium tracking-[-0.03em] text-ink">
            {caseStudy.title}
          </h3>
          {confirmed ? (
            <div className="mt-2">
              <ClientConfirmedChip />
            </div>
          ) : null}
          <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-ink-soft">
            {caseStudy.summary}
          </p>
        </div>
      </Link>
      <div className="border-t border-line px-5 py-4 sm:px-7">
        <CaseStudyPartners partners={caseStudy.partners} />
      </div>
    </article>
  );
}
