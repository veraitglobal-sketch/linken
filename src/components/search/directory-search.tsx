"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { Check, DirectoryResultCard, Link2 } from "@/components/search/directory-result-card";
import {
  searchCompaniesForGraph,
  type CompanySearchHit,
} from "@/features/companies/search-action";
import { cn } from "@/lib/cn";

type Filter = "all" | "verified" | "partners";

const FILTERS: { id: Filter; label: string; test: (h: CompanySearchHit) => boolean }[] = [
  { id: "all", label: "All", test: () => true },
  { id: "verified", label: "Verified domain", test: (h) => h.verified },
  { id: "partners", label: "Has confirmed partners", test: (h) => h.confirmedPartnerCount > 0 },
];

/**
 * The public directory: one large field, results as cards, and filters that
 * only narrow what the search already returned — every count on screen is
 * the length of a real list. The query is mirrored into `?q=` so a search
 * can be shared or reloaded.
 */
export function DirectorySearch({
  initialQuery = "",
  header,
}: {
  initialQuery?: string;
  /** Heading block; drawn on the lime band together with the field. */
  header: ReactNode;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<CompanySearchHit[]>([]);
  const [searched, setSearched] = useState("");
  const [failed, setFailed] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const q = query.trim();

  useEffect(() => {
    const url = new URL(window.location.href);
    if (q) url.searchParams.set("q", q);
    else url.searchParams.delete("q");
    window.history.replaceState(null, "", url);

    if (!q) return;
    let cancelled = false;
    const t = window.setTimeout(() => {
      startTransition(async () => {
        try {
          const rows = await searchCompaniesForGraph(q, { includeUnclaimed: true });
          if (cancelled) return;
          setResults(rows);
          setFailed(false);
        } catch {
          if (cancelled) return;
          setResults([]);
          setFailed(true);
        }
        setSearched(q);
        setFilter("all");
      });
    }, 220);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [q]);

  const showing = q && searched === q;
  const active = FILTERS.find((f) => f.id === filter)!;
  const visible = showing ? results.filter(active.test) : [];

  return (
    <>
      {/* The band ends through the middle of the field, so the pill visibly
          sits across the colour edge — and typing never changes its height. */}
      <div className="relative -mt-[4.25rem] px-4 pt-[8rem] text-center sm:px-6 sm:pt-[9rem] lg:px-8">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 bottom-8 rounded-b-[48px] bg-lime sm:bottom-9 sm:rounded-b-[120px]"
        />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center">{header}</div>
        <form
          role="search"
          className="relative mx-auto mt-10 w-full max-w-[680px]"
          onSubmit={(e) => {
            e.preventDefault();
            inputRef.current?.blur();
          }}
        >
          <label htmlFor="directory-search" className="sr-only">
            Search companies by name, sector or city
          </label>
          <div className="flex h-16 items-center gap-3 rounded-full bg-surface pr-2 pl-6 shadow-[0_20px_50px_-24px_rgba(14,31,28,0.35)] ring-1 ring-ink/10 transition-shadow focus-within:ring-2 focus-within:ring-navy/60 sm:h-[72px]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-muted">
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
              <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            {/* Inline outline: the global :focus-visible rule outranks utilities
                and would draw a square ring inside the pill. */}
            <input
              ref={inputRef}
              id="directory-search"
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

      <div className="mx-auto mt-14 w-full max-w-[1180px] px-4 sm:mt-16 sm:px-[18px]" aria-live="polite">
        {!q ? (
          <DirectoryLegend />
        ) : !showing ? (
          <ResultSkeleton />
        ) : failed ? (
          <DirectoryEmpty
            title="Search is not answering right now."
            lead="Nothing is wrong with your query. Try again in a moment."
          />
        ) : results.length === 0 ? (
          <DirectoryEmpty
            title={`No company matches “${searched}”.`}
            lead="Try the sector or the city instead of the name. If the company is not on Hansala yet, it can create its profile for free."
            cta
          />
        ) : (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <p className="text-[15px] text-ink-soft">
                <span className="font-display text-[22px] font-semibold tracking-[-0.03em] text-ink tabular-nums">
                  {visible.length}
                </span>{" "}
                {visible.length === 1 ? "company" : "companies"} for “{searched}”
                {pending ? <span className="ml-2 text-muted">· updating</span> : null}
              </p>
              <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 sm:pb-0" role="group" aria-label="Filter results">
                {FILTERS.map((f) => {
                  const count = results.filter(f.test).length;
                  const on = f.id === filter;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      aria-pressed={on}
                      disabled={count === 0 && !on}
                      onClick={() => setFilter(f.id)}
                      className={cn(
                        "inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[14px] font-semibold whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-45",
                        on
                          ? "bg-navy text-on-navy"
                          : "bg-surface text-ink ring-1 ring-line hover:ring-ink/25",
                      )}
                    >
                      {f.label}
                      <span className={cn("tabular-nums", on ? "text-lime" : "text-muted")}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <ul className="mt-6 grid list-none gap-3 p-0 md:grid-cols-2">
              {visible.map((hit) => (
                <li key={hit.id} className="min-w-0">
                  <DirectoryResultCard hit={hit} />
                </li>
              ))}
            </ul>

            <p className="mt-8 text-center text-[14px] text-muted">
              Partner counts include only links both companies accepted.{" "}
              <Link href="/onboarding" className="font-semibold text-ink underline-offset-2 hover:underline">
                Missing a company? Create your profile
              </Link>
            </p>
          </>
        )}
      </div>
    </>
  );
}

function ResultSkeleton() {
  return (
    <ul className="grid list-none gap-3 p-0 md:grid-cols-2" aria-label="Loading results">
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className="flex h-[92px] items-center gap-4 rounded-[24px] bg-surface p-5 ring-1 ring-line/70">
          <span className="size-12 animate-pulse rounded-2xl bg-mute" />
          <span className="flex-1 space-y-2">
            <span className="block h-4 w-2/5 animate-pulse rounded-full bg-mute" />
            <span className="block h-3 w-1/4 animate-pulse rounded-full bg-mute" />
          </span>
        </li>
      ))}
    </ul>
  );
}

function DirectoryEmpty({ title, lead, cta = false }: { title: string; lead: string; cta?: boolean }) {
  return (
    <div className="mx-auto max-w-[560px] rounded-[28px] bg-surface px-6 py-12 text-center ring-1 ring-line/70 sm:px-10">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-lime-soft text-navy">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
      <p className="mt-5 font-display text-[22px] leading-tight font-semibold tracking-[-0.03em] text-ink text-balance">
        {title}
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{lead}</p>
      {cta ? (
        <Link
          href="/onboarding"
          className="mt-7 inline-flex h-12 items-center rounded-full bg-navy px-6 text-[15px] font-semibold text-on-navy transition-colors hover:bg-navy-deep"
        >
          Create a company profile
        </Link>
      ) : null}
    </div>
  );
}

/* Before the first keystroke: what each part of a result means. These are
   the real labels a card can carry — no sample company, no sample number. */
const LEGEND = [
  {
    chip: (
      <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-lime px-3 text-[13px] font-semibold text-navy">
        <Check /> Verified domain
      </span>
    ),
    title: "The website is theirs",
    body: "The company proved it controls the domain on its profile.",
  },
  {
    chip: (
      <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-surface px-3 text-[13px] font-semibold text-ink ring-1 ring-line">
        <Link2 /> Confirmed partners
      </span>
    ),
    title: "Both sides said yes",
    body: "A partner is counted only after the other company accepted the link. Pending requests never show.",
  },
  {
    chip: (
      <span className="inline-flex h-8 items-center rounded-full bg-mute px-3 text-[13px] font-semibold text-ink-soft">
        Unclaimed profile
      </span>
    ),
    title: "Added by a partner",
    body: "Another company listed it. The company itself has not taken the profile over yet.",
  },
];

function DirectoryLegend() {
  return (
    <div>
      <p className="text-center text-[13px] font-semibold tracking-[0.14em] text-muted uppercase">
        Reading a result
      </p>
      <ul className="mt-6 grid list-none gap-3 p-0 md:grid-cols-3">
        {LEGEND.map((item) => (
          <li key={item.title} className="flex flex-col rounded-[24px] bg-surface p-6 ring-1 ring-line/70">
            <div className="flex h-24 items-center justify-center rounded-2xl bg-wash">{item.chip}</div>
            <p className="mt-6 font-display text-[19px] font-semibold tracking-[-0.025em] text-ink">{item.title}</p>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{item.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
