import Image from "next/image";
import Link from "next/link";
import { caseStudyCoverFocus, caseStudyCoverUrl } from "@/lib/case-study-cover";
import type { CaseStudy } from "@/types/case-study";
import type { Company } from "@/types/company";

type Props = {
  company: Company;
  caseStudy: CaseStudy;
  index?: number;
  companyHref?: string;
};

export function DossierOpener({
  company,
  caseStudy,
  index = 0,
  companyHref,
}: Props) {
  const cover = caseStudyCoverUrl(caseStudy.coverImageUrl, index);
  const confirmed = caseStudy.clientConfirmation?.status === "confirmed";
  const meta = [caseStudy.year, caseStudy.location, caseStudy.sector]
    .filter(Boolean)
    .join("  ·  ");
  const backHref = companyHref ?? `/c/${company.slug}`;

  return (
    <header className="case-file-hero">
      <Image
        src={cover}
        alt=""
        fill
        priority
        className={`object-cover ${caseStudyCoverFocus(index)}`}
        sizes="100vw"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#060a09]/95 via-[#060a09]/35 to-[#060a09]/15"
        aria-hidden
      />

      <div className="absolute inset-x-0 bottom-0 z-10">
        <div className="mx-auto max-w-6xl px-6 pb-12 pt-32 sm:pb-16 sm:pt-40">
          <Link
            href={backHref}
            className="text-[13px] font-medium text-white/45 transition-colors hover:text-white/75"
          >
            {company.name}
          </Link>
          {meta ? (
            <p className="mt-6 text-[12px] font-medium tracking-[0.12em] text-white/40 uppercase">
              {meta}
            </p>
          ) : null}
          <h1 className="mt-4 max-w-4xl font-display text-[clamp(2.75rem,7.5vw,5.5rem)] font-medium leading-[0.92] tracking-[-0.055em] text-white">
            {caseStudy.title}
          </h1>
          {caseStudy.highlightStat ? (
            <p className="mt-5 font-display text-[clamp(1.25rem,2.8vw,2rem)] font-medium tracking-[-0.03em] text-[#c9a67a]">
              {caseStudy.highlightStat}
            </p>
          ) : null}
          <p className="mt-6 max-w-2xl text-[17px] leading-[1.75] text-white/62">
            {caseStudy.summary}
          </p>
          {confirmed ? (
            <p className="mt-8 text-[12px] tracking-[0.08em] text-[#7eb8a4] uppercase">
              Client confirmed on Hansala
            </p>
          ) : null}
        </div>
      </div>
    </header>
  );
}
