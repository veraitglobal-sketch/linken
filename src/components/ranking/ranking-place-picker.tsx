import Link from "next/link";
import type { RankedCountry } from "@/features/ranking/queries";
import { cn } from "@/lib/cn";

/**
 * Where to look. Only countries that actually have companies in this category
 * appear, each with its real count — a list of every country on earth with
 * zeroes behind it would be a menu of dead ends.
 */
export function RankingPlacePicker({
  categorySlug,
  countries,
  active,
  hrefFor,
}: {
  categorySlug: string;
  countries: RankedCountry[];
  /** ISO code, or null for worldwide. */
  active: string | null;
  /** Where a place links to. Defaults to the /best pages. */
  hrefFor?: (countryCode: string | null) => string;
}) {
  const href =
    hrefFor ??
    ((code: string | null) =>
      code ? `/best/${categorySlug}/${code.toLowerCase()}` : `/best/${categorySlug}`);
  const pill =
    "inline-flex h-10 items-center gap-2 rounded-full px-4 text-[14px] font-semibold transition-colors";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={href(null)}
        aria-current={active === null ? "page" : undefined}
        className={cn(pill, active === null ? "bg-navy text-on-navy" : "bg-surface/70 text-ink ring-1 ring-ink/10 hover:bg-surface")}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
          <path d="M3.6 12h16.8M12 3.5c2.2 2.4 3.3 5.3 3.3 8.5S14.2 18.1 12 20.5c-2.2-2.4-3.3-5.3-3.3-8.5S9.8 5.9 12 3.5Z" stroke="currentColor" strokeWidth="1.7" />
        </svg>
        Worldwide
      </Link>
      {countries.map((c) => (
        <Link
          key={c.code}
          href={href(c.code)}
          aria-current={active === c.code ? "page" : undefined}
          className={cn(pill, active === c.code ? "bg-navy text-on-navy" : "bg-surface/70 text-ink ring-1 ring-ink/10 hover:bg-surface")}
        >
          {c.name}
          <span className={cn("text-[13px] tabular-nums", active === c.code ? "text-lime" : "text-muted")}>
            {c.count}
          </span>
        </Link>
      ))}
    </div>
  );
}
