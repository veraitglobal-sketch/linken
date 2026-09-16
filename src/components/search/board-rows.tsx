import Link from "next/link";
import { LogoMark } from "@/components/ui/logo-mark";
import type { CompanySearchHit } from "@/features/companies/search-action";
import type { RankedCompany } from "@/features/ranking/rank-row";
import { cn } from "@/lib/cn";

/**
 * A line on the board.
 *
 * Every figure here was produced by another company clicking confirm, so the
 * row shows the count and the weight rather than a badge: the bar is points
 * against the leader of the same list, which is the only thing a position
 * actually means.
 */

export function VerifiedMark({ className }: { className?: string }) {
  return (
    <span
      title="Verified domain"
      className={cn("grid size-[17px] shrink-0 place-items-center rounded-full bg-lime text-navy", className)}
    >
      <svg width="9" height="9" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="m3.5 8.5 3 3 6-7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="sr-only">Verified domain</span>
    </span>
  );
}

const ROW =
  "group grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl px-2 py-2.5 transition-colors hover:bg-wash sm:gap-4 sm:px-3";

export function RankedRow({
  company,
  position,
  share,
}: {
  company: RankedCompany;
  /** Null while the list is too short to be a field. */
  position: number | null;
  /** Points against the top of this list, 0-1. Null hides the bar. */
  share: number | null;
}) {
  const place = [company.city, company.country].filter(Boolean).join(", ");
  return (
    <li>
      <Link href={`/c/${company.slug}?src=ranking`} className={ROW}>
        <span className="flex items-center gap-2 sm:gap-3">
          {position !== null ? (
            <span
              className={cn(
                "w-6 text-right font-display text-[15px] font-semibold tabular-nums",
                position === 1 ? "text-ink" : "text-muted",
              )}
            >
              {position}
            </span>
          ) : null}
          <LogoMark
            initials={company.logoInitials}
            logoUrl={company.logoUrl}
            size="sm"
            className="rounded-xl! bg-surface"
          />
        </span>

        <span className="min-w-0">
          <span className="flex items-center gap-1.5">
            <span className="truncate font-display text-[16px] font-semibold tracking-[-0.025em] text-ink">
              {company.name}
            </span>
            {company.verified ? <VerifiedMark /> : null}
          </span>
          <span className="mt-0.5 block truncate text-[13px] text-muted">
            {place || "—"}
          </span>
        </span>

        <span className="flex items-center gap-3 sm:gap-5">
          <span className="hidden text-right sm:block">
            <span className="block text-[13px] text-ink-soft tabular-nums">
              {company.distinctPartners} confirmed
            </span>
            <span className="block text-[12px] text-muted tabular-nums">
              {company.confirmedRecords} {company.confirmedRecords === 1 ? "record" : "records"}
            </span>
          </span>
          {share !== null ? (
            <span aria-hidden className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-mute lg:block">
              <span
                className="block h-full rounded-full bg-lime"
                style={{ width: `${Math.max(6, Math.round(share * 100))}%` }}
              />
            </span>
          ) : null}
          <span className="w-10 text-right font-display text-[15px] font-semibold text-ink tabular-nums">
            {company.points.toFixed(1)}
          </span>
        </span>
      </Link>
    </li>
  );
}

/** A name-search hit. Same line, different right-hand fact. */
export function CompanyRow({ hit }: { hit: CompanySearchHit }) {
  const place = [hit.category, hit.city].filter(Boolean).join(" · ");
  return (
    <li>
      <Link href={`/c/${hit.slug}?src=search`} className={ROW}>
        <LogoMark
          initials={hit.logoInitials}
          logoUrl={hit.logoUrl}
          size="sm"
          className="rounded-xl! bg-surface"
        />
        <span className="min-w-0">
          <span className="flex items-center gap-1.5">
            <span className="truncate font-display text-[16px] font-semibold tracking-[-0.025em] text-ink">
              {hit.name}
            </span>
            {hit.verified ? <VerifiedMark /> : null}
          </span>
          <span className="mt-0.5 block truncate text-[13px] text-muted">{place || "—"}</span>
        </span>
        <span className="text-right text-[13px] text-ink-soft">
          {hit.claimed ? (
            <>
              <span className="block tabular-nums">{hit.confirmedPartnerCount} confirmed</span>
              <span className="block text-[12px] text-muted">
                {hit.confirmedPartnerCount === 1 ? "company" : "companies"}
              </span>
            </>
          ) : (
            <>
              <span className="block">Unclaimed</span>
              <span className="block text-[12px] text-muted">added by a partner</span>
            </>
          )}
        </span>
      </Link>
    </li>
  );
}
