"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  suggestCategories,
  type CategorySuggestion,
} from "@/features/ranking/suggest-action";

/**
 * Search by sector. A suggestion only appears if companies in that category
 * already have confirmed records — empty lists are not offered.
 */
export function CategorySearch({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [hits, setHits] = useState<CategorySuggestion[]>([]);
  const [pending, start] = useTransition();

  useEffect(() => {
    const q = query.trim();
    const t = window.setTimeout(() => {
      start(async () => {
        setHits(await suggestCategories(q));
      });
    }, 180);
    return () => window.clearTimeout(t);
  }, [query]);

  const empty = query.trim().length >= 2 && !pending && hits.length === 0;

  return (
    <div className="relative mx-auto mt-10 w-full max-w-[680px]">
      <label htmlFor="category-search" className="sr-only">
        What kind of company
      </label>
      <div className="flex h-16 items-center gap-3 rounded-full bg-surface pr-2 pl-6 shadow-[0_20px_50px_-24px_rgba(14,31,28,0.35)] ring-1 ring-ink/10 focus-within:ring-2 focus-within:ring-navy/60 sm:h-[72px]">
        <input
          id="category-search"
          type="search"
          autoComplete="off"
          placeholder="What kind of company? e.g. cleaning"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && hits[0]) {
              e.preventDefault();
              router.push(`/best/${hits[0].slug}`);
            }
          }}
          style={{ outline: "none", boxShadow: "none" }}
          className="min-w-0 flex-1 appearance-none border-0 bg-transparent text-[16px] text-ink placeholder:text-muted sm:text-[18px]"
        />
      </div>
      <div className="mx-auto mt-6 w-full max-w-[680px]" aria-live="polite">
        {empty ? (
          <p className="text-center text-[15px] text-ink-soft">
            No category matches “{query.trim()}” yet.{" "}
            <Link href="/search" className="font-semibold text-ink underline-offset-2 hover:underline">
              Search companies by name
            </Link>
          </p>
        ) : (
          <ul className="grid list-none gap-2 p-0">
            {hits.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/best/${c.slug}`}
                  className="flex items-center justify-between rounded-[20px] bg-surface px-5 py-4 ring-1 ring-line/70 transition-colors hover:ring-ink/15"
                >
                  <span className="font-display text-[17px] font-semibold tracking-[-0.025em] text-ink">
                    {c.name}
                  </span>
                  <span className="text-[13px] text-muted tabular-nums">
                    {c.count} {c.count === 1 ? "company" : "companies"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
