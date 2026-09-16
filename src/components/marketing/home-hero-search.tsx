"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { focusRingClass } from "@/components/a11y/focus";
import { HomeHeroSearchResults } from "@/components/marketing/home-hero-search-results";
import { searchPublicDirectory } from "@/features/companies/search-action";
import type {
  CategorySearchHit,
  CompanySearchHit,
} from "@/features/companies/search-action";
import { suggestCategories } from "@/features/categories/suggest";
import { cn } from "@/lib/cn";

/**
 * Home typeahead. Sector row → every claimed firm in that sector.
 * Company row → that profile. Submit prefers a sector when the text matches one.
 */
export function HomeHeroSearch({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const light = tone === "light";
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

  function goSearch() {
    const q = query.trim();
    if (!q) return;
    window.location.assign(`/search?q=${encodeURIComponent(q)}`);
  }

  /** Sector row must show even when the query is an exact category name. */
  const sectors = useMemo(() => {
    const bySlug = new Map(categories.map((c) => [c.slug, c]));
    for (const cat of suggestCategories(query.trim(), 3)) {
      if (!bySlug.has(cat.slug)) {
        bySlug.set(cat.slug, { label: cat.name, slug: cat.slug, count: 0 });
      }
    }
    return [...bySlug.values()];
  }, [categories, query]);

  return (
    <form
      className="relative max-w-md"
      onSubmit={(e) => {
        e.preventDefault();
        goSearch();
      }}
    >
      <label htmlFor="hero-company-search" className="sr-only">
        Search companies or categories
      </label>
      <div
        className={cn(
          "flex h-12 items-center rounded-full border pr-1 pl-4 outline-offset-2 focus-within:outline-2 focus-within:outline-[var(--blue-soft)]",
          light
            ? "border-line bg-surface focus-within:border-ink/30"
            : "border-white/28 bg-white/[0.08] focus-within:border-white/48 focus-within:bg-white/[0.12]",
        )}
      >
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
          style={{ outline: "none", boxShadow: "none" }}
          className={cn(
            "min-w-0 flex-1 appearance-none border-0 bg-transparent text-[14px] outline-none focus-visible:outline-none [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none",
            light
              ? "text-ink placeholder:text-muted"
              : "text-on-navy placeholder:text-on-navy-muted",
          )}
        />
        <button
          type="submit"
          className={cn(
            "inline-flex h-10 shrink-0 items-center rounded-full px-4 text-[13px] font-semibold transition-colors",
            light
              ? "bg-navy text-on-navy hover:bg-navy-deep"
              : "bg-white text-ink hover:bg-[#f2f4f2]",
            focusRingClass,
          )}
        >
          Search
        </button>
      </div>
      {open ? (
        <HomeHeroSearchResults
          companies={companies}
          categories={sectors}
          tone={tone}
        />
      ) : null}
    </form>
  );
}
