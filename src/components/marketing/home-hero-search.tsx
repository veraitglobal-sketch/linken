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

/** Company typeahead. Failure is an empty list — the page still renders.
 *  `light` is the look-up band on the washed homepage; `dark` the navy stage. */
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
      {/* The ring belongs to the pill, not to the field inside it.
          `globals.css` sets `:focus-visible { outline: 2px solid ... }` on
          everything focusable, so the bare `<input>` was drawing its own square
          ring two pixels inside a rounded pill — two nested rectangles of
          different shapes, which reads as a rendering fault rather than as
          focus. The input's outline is suppressed below and the cue moves out
          here, where it follows the radius the eye already sees.
          `focus-within`, not `:has()`: this must indicate the field being
          focused, and it has to hold while the results list below is open. */}
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
          /* `focus-visible:outline-none` rather than plain `outline-none`: the
             global rule is `:focus-visible`, and a bare `.outline-none` ties it
             on specificity and loses on source order. Matching the pseudo-class
             wins it outright. Nothing is lost for keyboard users — the ring is
             on the pill above. */
          /* `appearance-none` because this is `type="search"`.
             WebKit gives search fields native chrome — an inner field box and
             its own focus ring — that `outline: none` does not remove, which is
             how a square outline appears inside a rounded pill on Safari while
             Chromium shows nothing. Measured here in Chromium the input draws
             no ring either way, so this is the remedy for the browser that does
             rather than a confirmed reproduction. */
          /* Inline, because the unlayered `:focus-visible` rule in
             globals.css beats any Tailwind utility — the class alone left a
             square ring inside the pill. The ring lives on the pill instead. */
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
          categories={categories}
          query={query}
          onPickCategory={(label) => setQuery(label)}
          tone={tone}
        />
      ) : null}
    </form>
  );
}
