import Image from "next/image";
import Link from "next/link";
import type { ConfirmedCaseCard } from "@/features/case-studies/queries-public";
import { caseStudyCoverFocus, caseStudyCoverUrl } from "@/lib/case-study-cover";

/**
 * Projects from this list whose client confirmed them.
 *
 * It sits above the ranking because it answers the question a position only
 * implies: what the work actually was. Rendered only when such records exist —
 * an empty row of placeholders would say the opposite of what this page claims.
 */
export function ConfirmedCaseStrip({
  cases,
  heading,
}: {
  cases: ConfirmedCaseCard[];
  heading: string;
}) {
  if (cases.length === 0) return null;

  return (
    <section aria-label={heading}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-[20px] font-semibold tracking-[-0.03em] text-ink sm:text-[22px]">
          {heading}
        </h2>
        <p className="text-[13px] text-muted">Each one confirmed by the client</p>
      </div>

      <ul className="-mx-4 mt-4 flex list-none snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
        {cases.map((item, i) => (
          <li key={`${item.companySlug}-${item.caseSlug}`} className="w-[78%] shrink-0 snap-start sm:w-auto">
            <Link
              href={`/c/${item.companySlug}/case-studies/${item.caseSlug}`}
              className="group flex h-full flex-col overflow-hidden rounded-[22px] bg-surface ring-1 ring-line/70 transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-24px_rgba(14,31,28,0.35)]"
            >
              <span className="relative block aspect-[16/10] overflow-hidden bg-wash">
                <Image
                  src={caseStudyCoverUrl(item.coverImageUrl, i)}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 78vw, 380px"
                  className={`object-cover transition-transform duration-700 group-hover:scale-[1.02] ${caseStudyCoverFocus()}`}
                />
              </span>
              <span className="flex flex-1 flex-col p-4 sm:p-5">
                <span className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
                  {[item.year, item.location].filter(Boolean).join(" · ") || item.companyName}
                </span>
                <span className="mt-2 line-clamp-2 font-display text-[17px] leading-snug font-semibold tracking-[-0.025em] text-ink">
                  {item.title}
                </span>
                {item.summary ? (
                  <span className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-ink-soft">
                    {item.summary}
                  </span>
                ) : null}
                <span className="mt-auto flex items-center gap-2 pt-4 text-[13px] text-ink-soft">
                  <span aria-hidden className="grid size-[18px] shrink-0 place-items-center rounded-full bg-lime text-navy">
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                      <path d="m3.5 8.5 3 3 6-7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="truncate">
                    <span className="font-semibold text-ink">{item.companyName}</span>
                    {" · confirmed by "}
                    {item.confirmedBy}
                  </span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
