"use client";

import Link from "next/link";
import { LogoMark } from "@/components/ui/logo-mark";
import { cn } from "@/lib/cn";
import type {
  CategorySearchHit,
  CompanySearchHit,
} from "@/features/companies/search-action";

type Props = {
  companies: CompanySearchHit[];
  categories: CategorySearchHit[];
  /** `light` on the washed homepage hero, `dark` on a navy stage. */
  tone?: "dark" | "light";
};

/**
 * Typeahead under the home field: sector first (opens every firm in that
 * sector), then named companies.
 */
export function HomeHeroSearchResults({
  companies,
  categories,
  tone = "dark",
}: Props) {
  const light = tone === "light";
  const empty = companies.length === 0 && categories.length === 0;

  return (
    <div
      id="hero-search-results"
      role="listbox"
      className={cn(
        "absolute top-[calc(100%+8px)] right-0 left-0 z-20 max-h-72 overflow-y-auto rounded-2xl border py-1.5 text-left shadow-chapter",
        light ? "border-line bg-surface" : "border-white/15 bg-navy/92",
      )}
    >
      {categories.map((cat) => (
        <a
          key={cat.slug}
          role="option"
          href={`/search?q=${encodeURIComponent(cat.label)}`}
          className={cn(
            "flex min-h-11 w-full items-center gap-3 px-3.5",
            light ? "hover:bg-mute" : "hover:bg-white/[0.06]",
          )}
        >
          <span
            className={cn(
              "font-label text-[10px] font-semibold tracking-[0.14em] uppercase",
              light ? "text-blue" : "text-blue-soft",
            )}
          >
            Sector
          </span>
          <span
            className={cn(
              "min-w-0 truncate text-[14px] font-medium",
              light ? "text-ink" : "text-on-navy",
            )}
          >
            {cat.label}
          </span>
          <span
            className={cn(
              "ml-auto shrink-0 text-[12px] font-semibold",
              light ? "text-ink" : "text-on-navy",
            )}
          >
            See all →
          </span>
        </a>
      ))}
      {companies.map((hit) => (
        <Link
          key={hit.id}
          role="option"
          href={`/c/${hit.slug}?src=search`}
          className={cn(
            "flex min-h-12 items-center gap-3 px-3.5",
            light ? "hover:bg-mute" : "hover:bg-white/[0.06]",
          )}
        >
          <LogoMark
            initials={hit.logoInitials}
            logoUrl={hit.logoUrl}
            size="sm"
            className={light ? "border-line" : "border-white/15"}
          />
          <span className="min-w-0 flex-1">
            <span
              className={cn(
                "block truncate text-[14px] font-medium",
                light ? "text-ink" : "text-on-navy",
              )}
            >
              {hit.name}
            </span>
            <span
              className={cn(
                "block truncate text-[12px]",
                light ? "text-muted" : "text-on-navy-muted",
              )}
            >
              {[hit.category, hit.city].filter(Boolean).join(" · ")}
            </span>
          </span>
        </Link>
      ))}
      {empty ? (
        <p
          className={cn(
            "px-3.5 py-3 text-[13px]",
            light ? "text-muted" : "text-on-navy-muted",
          )}
        >
          No companies match this search.
        </p>
      ) : null}
    </div>
  );
}
