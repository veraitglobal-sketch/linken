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
  const hasGallery = caseStudy.galleryUrls.length > 0;
  const hasCover = Boolean(caseStudy.coverImageUrl);
  const storyReady =
    Boolean(caseStudy.challenge.trim()) &&
    Boolean(caseStudy.outcome.trim()) &&
    Boolean(caseStudy.process.trim());

  return (
    <article className="group overflow-hidden rounded-[24px] border border-line bg-surface shadow-[0_8px_28px_rgba(8,20,18,0.04)] transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(8,20,18,0.08)]">
      <Link
        href={`/dashboard/cases/${caseStudy.slug}`}
        className="relative block aspect-[16/10] overflow-hidden bg-paper"
      >
        <Image
          src={cover}
          alt=""
          fill
          className={`object-cover transition-transform duration-700 group-hover:scale-[1.03] ${caseStudyCoverFocus(index)}`}
          sizes="(max-width:768px) 100vw, 360px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#081412]/75 via-[#081412]/15 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-[11px] font-semibold tracking-[0.12em] text-white/55 uppercase">
            {caseStudy.year}
            {caseStudy.location ? ` · ${caseStudy.location}` : ""}
          </p>
          <h3 className="mt-1 font-display text-lg font-medium tracking-[-0.03em] text-white line-clamp-2">
            {caseStudy.title}
          </h3>
        </div>
      </Link>

      <div className="space-y-3 p-4">
        <div className="flex flex-wrap gap-1.5">
          {confirmed ? (
            <span className="rounded-full bg-[#1a5c51]/10 px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] text-blue uppercase">
              Client confirmed
            </span>
          ) : (
            <span className="rounded-full bg-paper px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] text-muted uppercase">
              Pending confirm
            </span>
          )}
          {!hasCover ? (
            <span className="rounded-full bg-ember/10 px-2.5 py-1 text-[10px] font-semibold text-ember">
              Needs cover
            </span>
          ) : null}
          {!hasGallery ? (
            <span className="rounded-full bg-paper px-2.5 py-1 text-[10px] font-semibold text-muted">
              No gallery
            </span>
          ) : null}
          {storyReady ? (
            <span className="rounded-full bg-paper px-2.5 py-1 text-[10px] font-semibold text-muted">
              Story complete
            </span>
          ) : null}
        </div>

        <p className="line-clamp-2 text-[13px] leading-relaxed text-ink-soft">
          {caseStudy.summary || "Add a summary in the editor."}
        </p>

        <div className="flex gap-2 pt-1">
          <Link
            href={`/dashboard/cases/${caseStudy.slug}`}
            className="inline-flex h-9 flex-1 items-center justify-center rounded-xl bg-accent text-[12px] font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            Edit in studio
          </Link>
          <Link
            href={`/c/${companySlug}/case-studies/${caseStudy.slug}`}
            className="inline-flex h-9 flex-1 items-center justify-center rounded-xl border border-line bg-surface text-[12px] font-semibold text-ink transition-colors hover:bg-paper"
          >
            Preview
          </Link>
        </div>
      </div>
    </article>
  );
}
