"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { SearchLegend } from "@/components/search/search-legend";
import { SearchResults } from "@/components/search/search-results";
import type { CompanySearchHit } from "@/features/companies/search-action";
import type { CategorySuggestion } from "@/features/ranking/suggest-action";
import { searchBoard } from "@/features/search/board-action";

/**
 * One field for everything: a company name, a sector or a city.
 *
 * Search hits when typing; New on Hansala stays visible underneath either way.
 */
export function SearchConsole({
  initialQuery = "",
  header,
  board,
  newStrip,
}: {
  initialQuery?: string;
  header: ReactNode;
  /** Case studies and other idle-only content below New on Hansala. */
  board: ReactNode;
  /** Latest joined companies — always shown under results or on an empty field. */
  newStrip: ReactNode;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [companies, setCompanies] = useState<CompanySearchHit[]>([]);
  const [sectorHits, setSectorHits] = useState<CategorySuggestion[]>([]);
  const [searched, setSearched] = useState("");
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const q = query.trim();

  useEffect(() => {
    const url = new URL(window.location.href);
    if (q) url.searchParams.set("q", q);
    else url.searchParams.delete("q");
    url.searchParams.delete("category");
    window.history.replaceState(window.history.state, "", url);

    if (!q) return;
    let cancelled = false;
    const t = window.setTimeout(() => {
      startTransition(async () => {
        try {
          const result = await searchBoard(q);
          if (cancelled) return;
          setCompanies(result.companies);
          setSectorHits(result.sectors);
          setFailed(false);
        } catch {
          if (cancelled) return;
          setCompanies([]);
          setSectorHits([]);
          setFailed(true);
        }
        setSearched(q);
      });
    }, 220);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [q]);

  const answered = Boolean(q) && searched === q;

  return (
    <>
      <div className="relative -mt-[4.25rem] px-4 pt-[8rem] pb-24 text-center sm:px-6 sm:pt-[9rem] sm:pb-28 lg:px-8">
        <div
          aria-hidden
          className="absolute inset-0 rounded-b-[48px] bg-lime sm:rounded-b-[120px]"
        >
          <div className="lime-halftone" />
        </div>
        <div className="relative mx-auto flex max-w-6xl flex-col items-center">{header}</div>

        <form
          role="search"
          className="relative mx-auto mt-9 w-full max-w-[760px]"
          onSubmit={(e) => {
            e.preventDefault();
            inputRef.current?.blur();
          }}
        >
          <label htmlFor="search-console" className="sr-only">
            Search by company name, sector or city
          </label>
          <div className="flex h-16 items-center gap-3 rounded-full bg-surface pr-2 pl-6 shadow-[0_24px_50px_-26px_rgba(14,31,28,0.45)] ring-1 ring-ink/10 transition-shadow focus-within:ring-2 focus-within:ring-navy/60 sm:h-[72px]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-muted">
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
              <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              ref={inputRef}
              id="search-console"
              type="search"
              autoComplete="off"
              placeholder="Company name, sector or city"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ outline: "none", boxShadow: "none" }}
              className="min-w-0 flex-1 appearance-none border-0 bg-transparent text-[16px] text-ink placeholder:text-muted sm:text-[18px] [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
            />
            {query ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="grid size-10 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-mute hover:text-ink"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="m4 4 8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              </button>
            ) : null}
            <button
              type="submit"
              className="hidden h-12 shrink-0 items-center rounded-full bg-navy px-6 text-[15px] font-semibold text-on-navy transition-colors hover:bg-navy-deep sm:inline-flex sm:h-14 sm:px-7"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      <div className="relative mx-auto -mt-16 w-full max-w-[1180px] px-4 sm:-mt-20 sm:px-[18px]" aria-live="polite">
        {q ? (
          <SearchResults
            query={q}
            searched={searched}
            answered={answered}
            pending={pending}
            failed={failed}
            sectorHits={sectorHits}
            companies={companies}
          />
        ) : null}
        <div className={q ? "mt-14 sm:mt-16" : undefined}>{newStrip}</div>
        {!q && board ? <div className="mt-14 sm:mt-16">{board}</div> : null}
        {!q ? (
          <div className="mt-14 sm:mt-16">
            <SearchLegend />
          </div>
        ) : null}
      </div>
    </>
  );
}
