import Link from "next/link";
import { DirectoryPagedGrid } from "@/components/search/directory-paged-grid";
import { NameMatchStrip } from "@/components/search/name-match-strip";
import { CompanyRow } from "@/components/search/board-rows";
import { SectorOpenLink } from "@/components/search/sector-open-link";
import { HansalaSpinner } from "@/components/ui/hansala-spinner";
import type { CompanySearchHit } from "@/features/companies/search-action";
import type { CategorySuggestion } from "@/features/ranking/suggest-action";
import {
  sectorChipsForQuery,
  visibleSectorChips,
} from "@/features/search/sector-chips";
import {
  nameMatchingCompanies,
  sectorBrowseCompanies,
} from "@/features/search/split-hits";
import { toDirectoryCards } from "@/components/search/search-cards";

export function SearchHits({
  query,
  sectorHits,
  companies,
  sectorBrowse,
}: {
  query: string;
  sectorHits: CategorySuggestion[];
  companies: CompanySearchHit[];
  sectorBrowse: boolean;
}) {
  const rawChips = sectorBrowse
    ? sectorChipsForQuery(query, sectorHits)
    : sectorHits;
  const chips = visibleSectorChips(query, rawChips, sectorBrowse);
  const sectorSlugs = rawChips.map((s) => s.slug);
  const named = sectorBrowse ? nameMatchingCompanies(query, companies) : [];
  const rest = sectorBrowse
    ? sectorBrowseCompanies(query, companies, sectorSlugs)
    : companies;

  return (
    <div className="grid gap-5">
      {chips.length > 0 ? (
        <div>
          <p className="px-2 pb-2 text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
            Open a sector
          </p>
          <ul className="flex list-none flex-wrap gap-2 p-0 px-2">
            {chips.map((s) => (
              <li key={s.slug}>
                <SectorOpenLink slug={s.slug} name={s.name} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {sectorBrowse ? (
        <>
          <NameMatchStrip companies={named} />
          {rest.length > 0 ? (
            <div>
              <p className="px-2 pb-2 text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
                In this sector
              </p>
              <DirectoryPagedGrid
                initial={toDirectoryCards(rest)}
                sectorSlugs={sectorSlugs}
                total={sectorHits[0]?.count}
              />
            </div>
          ) : null}
        </>
      ) : companies.length > 0 ? (
        <div>
          <p className="px-2 pb-2 text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
            Companies
          </p>
          <ul className="grid list-none gap-0.5 p-0">
            {companies.map((hit) => (
              <CompanyRow key={hit.id} hit={hit} />
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function SearchEmpty({ searched }: { searched: string }) {
  return (
    <div className="px-2 py-10 text-center">
      <p className="font-display text-[19px] font-semibold tracking-[-0.03em] text-ink">
        Nothing matches “{searched}”.
      </p>
      <p className="mx-auto mt-2 max-w-[46ch] text-[14px] leading-relaxed text-ink-soft">
        Try the sector or the city instead of the name. A company that is not on Hansala yet can
        create its profile for free.
      </p>
      <Link
        href="/onboarding"
        className="mt-5 inline-flex h-10 items-center rounded-full bg-navy px-4 text-[14px] font-semibold text-on-navy transition-colors hover:bg-navy-deep"
      >
        Create your company profile
      </Link>
    </div>
  );
}

export function SearchResultSkeleton({ sectorBrowse }: { sectorBrowse: boolean }) {
  if (sectorBrowse) {
    return (
      <div className="flex flex-col items-center gap-6 px-2 py-6">
        <HansalaSpinner size={48} label="Searching" showLabel />
        <ul
          aria-hidden
          className="grid w-full list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-44 animate-pulse rounded-[22px] bg-mute" />
          ))}
        </ul>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-6 px-2 py-10">
      <HansalaSpinner size={48} label="Searching" showLabel />
      <ul aria-hidden className="grid w-full list-none gap-1 p-0">
        {[0, 1, 2].map((i) => (
          <li key={i} className="flex items-center gap-3 px-2 py-2.5 sm:px-3">
            <span className="size-9 animate-pulse rounded-xl bg-mute" />
            <span className="flex-1 space-y-2">
              <span className="block h-3.5 w-1/3 animate-pulse rounded-full bg-mute" />
              <span className="block h-3 w-1/5 animate-pulse rounded-full bg-mute" />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
