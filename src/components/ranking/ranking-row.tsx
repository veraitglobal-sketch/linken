import Link from "next/link";
import { LogoMark } from "@/components/ui/logo-mark";
import type { RankedCompany } from "@/features/ranking/queries";
import { cn } from "@/lib/cn";

/**
 * One company in a ranking, and why it is there.
 *
 * The reason is not decoration: a list of names in an order is every other
 * directory. The counts under the name are the confirmed records that produced
 * the points, so a reader can see the position is earned rather than sold.
 */
export function RankingRow({
  company,
  position,
}: {
  company: RankedCompany;
  /** Null while the list is too small to be a field. */
  position: number | null;
}) {
  const place = [company.city, company.country].filter(Boolean).join(", ");
  const reasons = [
    company.distinctPartners > 0
      ? `${company.distinctPartners} confirmed ${company.distinctPartners === 1 ? "company" : "companies"}`
      : null,
    company.confirmedRecords > 0
      ? `${company.confirmedRecords} confirmed ${company.confirmedRecords === 1 ? "record" : "records"}`
      : null,
  ].filter(Boolean) as string[];

  return (
    <li>
      <Link
        href={`/c/${company.slug}?src=ranking`}
        className="group flex items-center gap-4 rounded-[22px] bg-surface p-4 ring-1 ring-line/70 transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-24px_rgba(14,31,28,0.35)] hover:ring-ink/15 sm:gap-5 sm:p-5"
      >
        {position ? (
          <span
            className={cn(
              "grid size-11 shrink-0 place-items-center rounded-2xl font-display text-[18px] font-semibold tabular-nums",
              position === 1 ? "bg-navy text-lime" : "bg-wash text-ink",
            )}
          >
            {position}
          </span>
        ) : null}

        <LogoMark
          initials={company.logoInitials}
          logoUrl={company.logoUrl}
          size="lg"
          className="rounded-2xl! bg-surface"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-display text-[17px] font-semibold tracking-[-0.025em] text-ink">
              {company.name}
            </p>
            {company.verified ? (
              <span
                title="Verified domain"
                className="grid size-[18px] shrink-0 place-items-center rounded-full bg-lime text-navy"
              >
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="m3.5 8.5 3 3 6-7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="sr-only">Verified domain</span>
              </span>
            ) : null}
          </div>
          {place ? <p className="mt-0.5 truncate text-[14px] text-muted">{place}</p> : null}
          {reasons.length > 0 ? (
            <p className="mt-1.5 truncate text-[13px] text-ink-soft">{reasons.join(" · ")}</p>
          ) : null}
        </div>

        <span
          aria-hidden
          className="hidden shrink-0 rounded-full bg-wash px-3 py-1.5 text-[13px] font-semibold text-ink tabular-nums sm:block"
          title="Points from confirmed records"
        >
          {company.points.toFixed(1)}
        </span>
        <span
          aria-hidden
          className="grid size-10 shrink-0 place-items-center rounded-full bg-wash text-ink transition-colors group-hover:bg-navy group-hover:text-lime"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </Link>
    </li>
  );
}
