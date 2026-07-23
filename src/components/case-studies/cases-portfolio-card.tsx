import Image from "next/image";
import Link from "next/link";
import { caseStudyCoverFocus, caseStudyCoverUrl } from "@/lib/case-study-cover";
import type { CaseStudy } from "@/types/case-study";

type Props = {
  companySlug: string;
  caseStudy: CaseStudy;
  index: number;
};

export function CasesPortfolioCard({ companySlug, caseStudy, index }: Props) {
  const cover = caseStudyCoverUrl(caseStudy.coverImageUrl, index);
  const confirmed = caseStudy.clientConfirmation?.status === "confirmed";

  return (
    <article className="group border border-[var(--cf-line,#e2e6e3)] bg-white">
      <Link href={`/dashboard/cases/${caseStudy.slug}`} className="block">
        <div className="relative aspect-[3/2] overflow-hidden bg-paper">
          <Image
            src={cover}
            alt=""
            fill
            className={`object-cover transition-transform duration-700 group-hover:scale-[1.02] ${caseStudyCoverFocus(index)}`}
            sizes="360px"
          />
        </div>
        <div className="p-5">
          <p className="text-[11px] tracking-[0.1em] text-muted uppercase">
            {caseStudy.year}
            {caseStudy.location ? ` · ${caseStudy.location}` : ""}
          </p>
          <h3 className="mt-2 font-display text-lg font-medium tracking-[-0.03em] text-ink line-clamp-2">
            {caseStudy.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-ink-soft">
            {caseStudy.summary || "Continue editing this case file."}
          </p>
          <p className="mt-4 text-[11px] text-muted">
            {confirmed ? "Client confirmed" : "Awaiting confirmation"}
          </p>
        </div>
      </Link>
      <div className="flex border-t border-line text-[12px] font-semibold">
        <Link
          href={`/dashboard/cases/${caseStudy.slug}`}
          className="flex-1 py-3 text-center text-ink hover:bg-paper"
        >
          Edit
        </Link>
        <Link
          href={`/c/${companySlug}/case-studies/${caseStudy.slug}`}
          className="flex-1 border-l border-line py-3 text-center text-muted hover:bg-paper hover:text-ink"
        >
          View
        </Link>
      </div>
    </article>
  );
}
