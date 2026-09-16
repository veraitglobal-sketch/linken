import Image from "next/image";
import Link from "next/link";
import type { ConfirmedCaseCard } from "@/features/case-studies/queries-public";
import { caseStudyCoverFocus } from "@/lib/case-study-cover";

/**
 * Confirmed projects as cubes, left to right.
 *
 * A cover only when the company uploaded one — a missing picture is a wash
 * square with initials, never a stock photograph of someone else's work.
 */
export function CaseCubes({
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
        <h2 className="font-display text-[clamp(1.6rem,3vw,2.3rem)] leading-tight font-semibold tracking-[-0.035em] text-ink">
          {heading}
        </h2>
        <p className="text-[13px] text-muted">Each one confirmed by the client</p>
      </div>

      <ul className="-mx-4 mt-5 flex list-none snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {cases.map((item) => (
          <li key={`${item.companySlug}-${item.caseSlug}`} className="w-[220px] shrink-0 snap-start sm:w-[240px]">
            <Cube item={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function Cube({ item }: { item: ConfirmedCaseCard }) {
  const meta = [item.year, item.location].filter(Boolean).join(" · ");

  return (
    <Link
      href={`/c/${item.companySlug}/case-studies/${item.caseSlug}`}
      className="group flex h-full flex-col overflow-hidden rounded-card bg-surface ring-1 ring-line/70 transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-card"
    >
      <span className="relative block aspect-square overflow-hidden bg-wash">
        {item.coverImageUrl ? (
          <Image
            src={item.coverImageUrl}
            alt=""
            fill
            sizes="240px"
            className={`object-cover transition-transform duration-700 group-hover:scale-[1.03] ${caseStudyCoverFocus()}`}
          />
        ) : (
          <span className="grid h-full place-items-center font-display text-[28px] font-semibold tracking-[-0.04em] text-ink/25">
            {item.companyInitials}
          </span>
        )}
      </span>
      <span className="flex flex-1 flex-col p-4">
        <span className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
          {meta || item.companyName}
        </span>
        <span className="mt-2 line-clamp-2 font-display text-[16px] leading-snug font-semibold tracking-[-0.025em] text-ink">
          {item.title}
        </span>
        <span className="mt-auto flex items-center gap-2 pt-4 text-[12.5px] text-ink-soft">
          <span aria-hidden className="grid size-[18px] shrink-0 place-items-center rounded-full bg-lime text-navy">
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
              <path d="m3.5 8.5 3 3 6-7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="truncate">
            <span className="font-semibold text-ink">{item.companyName}</span>
            {" · "}
            {item.confirmedBy}
          </span>
        </span>
      </span>
    </Link>
  );
}
