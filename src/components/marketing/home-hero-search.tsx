"use client";

import { useEffect, useState, useTransition } from "react";
import { focusRingClass } from "@/components/a11y/focus";
import { HomeHeroSearchResults } from "@/components/marketing/home-hero-search-results";
import { searchPublicDirectory } from "@/features/companies/search-action";
import type {
  CategorySearchHit,
  CompanySearchHit,
} from "@/features/companies/search-action";
import { cn } from "@/lib/cn";

/** Typeahead on the hero. Failure is an empty list — the page still renders. */
export function HomeHeroSearch() {
  const [query, setQuery] = useState("");
  const [companies, setCompanies] = useState<CompanySearchHit[]>([]);
  const [categories, setCategories] = useState<CategorySearchHit[]>([]);
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setCompanies([]);
      setCategories([]);
      setOpen(false);
      return;
    }
    let cancelled = false;
    const t = window.setTimeout(() => {
      startTransition(async () => {
        try {
          const next = await searchPublicDirectory(q);
          if (cancelled) return;
          setCompanies(next.companies);
          setCategories(next.categories);
          setOpen(true);
        } catch {
          if (cancelled) return;
          setCompanies([]);
          setCategories([]);
          setOpen(true);
        }
      });
    }, 220);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [query]);

  return (
    <form
      className="relative max-w-md"
      onSubmit={(e) => {
        e.preventDefault();
        setOpen(Boolean(query.trim()));
      }}
    >
      <label htmlFor="hero-company-search" className="sr-only">
        Search companies or categories
      </label>
      <div className="flex h-12 items-center rounded-full border border-white/28 bg-white/[0.08] pr-1 pl-4 focus-within:border-white/48 focus-within:bg-white/[0.12]">
        <input
          id="hero-company-search"
          type="search"
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls="hero-search-results"
          aria-autocomplete="list"
          placeholder="Company or category"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim()) setOpen(true);
          }}
          className="min-w-0 flex-1 bg-transparent text-[14px] text-on-navy outline-none placeholder:text-on-navy-muted"
        />
        <button
          type="submit"
          className={cn(
            "inline-flex h-10 shrink-0 items-center rounded-full bg-white px-4 text-[13px] font-semibold text-ink transition-colors hover:bg-[#f2f4f2]",
            focusRingClass,
          )}
        >
          Search
        </button>
      </div>
      {open ? (
        <HomeHeroSearchResults
          companies={companies}
          categories={categories}
          query={query}
          onPickCategory={(label) => setQuery(label)}
        />
      ) : null}
    </form>
  );
}
