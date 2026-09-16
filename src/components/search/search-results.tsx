import { BoardShell } from "@/components/search/board-shell";
import {
  SearchEmpty,
  SearchHits,
  SearchResultSkeleton,
} from "@/components/search/search-hits";
import type { CompanySearchHit } from "@/features/companies/search-action";
import type { CategorySuggestion } from "@/features/ranking/suggest-action";
import { isSectorBrowseQuery } from "@/features/search/sector-browse";

/**
 * What the field returns once someone has typed: matching sectors, then
 * companies. Sector browse uses the same card grid as New on Hansala.
 */
export function SearchResults({
  query,
  searched,
  answered,
  pending,
  failed,
  sectorHits,
  companies,
}: {
  query: string;
  searched: string;
  answered: boolean;
  pending: boolean;
  failed: boolean;
  sectorHits: CategorySuggestion[];
  companies: CompanySearchHit[];
}) {
  const sectorBrowse =
    Boolean(query) && isSectorBrowseQuery(query, sectorHits, companies);

  return (
    <BoardShell
      title={`Results for “${query}”`}
      subtitle={
        answered && !failed
          ? `${sectorHits.length} ${sectorHits.length === 1 ? "sector" : "sectors"} · ${companies.length} ${companies.length === 1 ? "company" : "companies"}`
          : "Searching…"
      }
      status={
        <>
          <span>A partner is counted only after the other company accepted.</span>
          <span>Unclaimed profiles were added by a partner.</span>
        </>
      }
    >
      {!answered || pending ? (
        <SearchResultSkeleton sectorBrowse={sectorBrowse} />
      ) : failed ? (
        <p className="px-2 py-10 text-center text-[15px] text-ink-soft">
          Search is not answering right now. Try again in a moment.
        </p>
      ) : sectorHits.length === 0 && companies.length === 0 ? (
        <SearchEmpty searched={searched} />
      ) : (
        <SearchHits
          query={query}
          sectorHits={sectorHits}
          companies={companies}
          sectorBrowse={sectorBrowse}
        />
      )}
    </BoardShell>
  );
}
