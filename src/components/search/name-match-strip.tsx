import Link from "next/link";
import { VerifiedMark } from "@/components/search/board-rows";
import { LogoMark } from "@/components/ui/logo-mark";
import type { CompanySearchHit } from "@/features/companies/search-action";

/**
 * Compact strip under sector chips: companies whose *name* matches the query.
 * Shows ~2 rows; the rest scroll in a short viewport.
 */
export function NameMatchStrip({ companies }: { companies: CompanySearchHit[] }) {
  if (companies.length === 0) return null;

  return (
    <div>
      <p className="px-2 pb-2 text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
        Matching names
      </p>
      <ul
        className="max-h-[7.25rem] list-none space-y-0.5 overflow-y-auto overscroll-contain p-0 [scrollbar-width:thin]"
      >
        {companies.map((hit) => {
          const place = [hit.category, hit.city].filter(Boolean).join(" · ");
          return (
            <li key={hit.id}>
              <Link
                href={`/c/${hit.slug}?src=search-name`}
                className="group flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-wash"
              >
                <LogoMark
                  initials={hit.logoInitials}
                  logoUrl={hit.logoUrl}
                  size="sm"
                  className="size-8! rounded-lg! bg-surface"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-[14px] font-semibold tracking-[-0.02em] text-ink">
                      {hit.name}
                    </span>
                    {hit.verified ? <VerifiedMark className="size-3.5!" /> : null}
                  </span>
                  <span className="block truncate text-[12px] text-muted">
                    {place || "—"}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
