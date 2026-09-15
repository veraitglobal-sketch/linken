import Link from "next/link";
import { LogoMark } from "@/components/ui/logo-mark";
import type { CompanySearchHit } from "@/features/companies/search-action";

/** One directory hit — only what the record holds: name, sector, city,
 *  domain proof, and the count of accepted partnerships. */
export function DirectoryResultCard({ hit }: { hit: CompanySearchHit }) {
  const place = [hit.category, hit.city].map((s) => s?.trim()).filter(Boolean).join(" · ");
  const partners = hit.confirmedPartnerCount;

  return (
    <Link
      href={`/c/${hit.slug}?src=search`}
      className="group flex h-full items-center gap-4 rounded-[24px] bg-surface p-4 ring-1 ring-line/70 transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-24px_rgba(14,31,28,0.35)] hover:ring-ink/15 sm:p-5"
    >
      <LogoMark
        initials={hit.logoInitials}
        logoUrl={hit.logoUrl}
        size="lg"
        className="rounded-2xl! bg-surface"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-[17px] font-semibold tracking-[-0.025em] text-ink">
          {hit.name}
        </p>
        {place ? <p className="mt-0.5 truncate text-[14px] text-muted">{place}</p> : null}
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {!hit.claimed ? (
            <span className="inline-flex h-7 items-center rounded-full bg-mute px-2.5 text-[12px] font-semibold text-ink-soft">
              Unclaimed profile
            </span>
          ) : null}
          {hit.verified ? (
            <span className="inline-flex h-7 items-center gap-1 rounded-full bg-lime px-2.5 text-[12px] font-semibold text-navy">
              <Check /> Verified domain
            </span>
          ) : null}
          {partners > 0 ? (
            <span className="inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-[12px] font-semibold text-ink ring-1 ring-line">
              <Link2 />
              {partners} confirmed {partners === 1 ? "partner" : "partners"}
            </span>
          ) : null}
        </div>
      </div>
      <span
        aria-hidden
        className="grid size-10 shrink-0 place-items-center rounded-full bg-wash text-ink transition-colors group-hover:bg-navy group-hover:text-lime"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </Link>
  );
}

export function Check() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="m3.5 8.5 3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Link2() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M6.5 9.5 9.5 6.5M7 4.5l1-1a2.8 2.8 0 0 1 4 4l-1 1M9 11.5l-1 1a2.8 2.8 0 0 1-4-4l1-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
