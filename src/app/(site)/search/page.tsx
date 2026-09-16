import type { Metadata } from "next";
import { Suspense } from "react";
import { PricingPhotoBand } from "@/components/pricing/pricing-photo-band";
import { CategoryResults } from "@/components/search/category-results";
import { CategoryResultsSkeleton } from "@/components/search/category-results-skeleton";
import { CategorySearch } from "@/components/search/category-search";
import { DirectorySearch } from "@/components/search/directory-search";
import { PositioningPanel } from "@/components/search/positioning-panel";
import { SearchModePills } from "@/components/search/search-mode-pills";
import { canonicalCategorySlug } from "@/features/categories/taxonomy";
import { CATEGORY_BY_SLUG, countryName } from "@/features/ranking/helpers";

export const metadata: Metadata = {
  title: "Search companies",
  description:
    "Find a company on Hansala. Public profiles show confirmed partners only.",
  alternates: { canonical: "/search" },
};

type Props = {
  searchParams: Promise<{
    q?: string;
    mode?: string;
    category?: string;
    country?: string;
    city?: string;
  }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const initialQuery = params.q?.trim().slice(0, 80) ?? "";
  const categorySlug = params.category ? canonicalCategorySlug(params.category) : null;
  /* A sector with no country named means all of them: worldwide is the answer,
     not a step the visitor still has to take. */
  const countryCode = (() => {
    const raw = params.country?.trim().toUpperCase() ?? "";
    if (raw.length !== 2 || !countryName(raw)) return null;
    return raw;
  })();
  const city = params.city?.trim().slice(0, 60) || null;
  const mode =
    params.mode === "categories" || categorySlug ? "categories" : "companies";
  const category = categorySlug ? CATEGORY_BY_SLUG[categorySlug] : undefined;

  const header = (
    <>
      <h1 className="animate-rise max-w-[20ch] font-display text-[clamp(2.3rem,4.3vw,3.875rem)] leading-[1.05] font-semibold tracking-[-0.04em] text-ink text-balance">
        {mode === "categories"
          ? "Find companies by the work they do."
          : "See who a company has really worked with."}
      </h1>
      <p className="animate-rise-delay mt-6 max-w-[54ch] text-[17px] leading-[1.6] text-ink-soft sm:text-[18px]">
        {mode === "categories"
          ? category
            ? `Companies in ${category.name.toLowerCase()} are ordered by work their clients and partners confirmed — worldwide unless you pick a country.`
            : "A sector list only includes companies with work the other side confirmed."
          : "Search by name, sector or city. A profile lists a partner only after both companies confirmed it."}
      </p>
      <SearchModePills mode={mode} query={initialQuery} />
    </>
  );

  return (
    <div className="home-wash bg-wash">
      {mode === "categories" ? (
        <>
          <div className="relative -mt-[4.25rem] px-4 pt-[8rem] text-center sm:px-6 sm:pt-[9rem] lg:px-8">
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 bottom-8 rounded-b-[48px] bg-lime sm:bottom-9 sm:rounded-b-[120px]"
            />
            <div className="relative mx-auto flex max-w-6xl flex-col items-center">
              {header}
            </div>
            <div className="relative">
              <CategorySearch initialQuery={initialQuery} selectedSlug={categorySlug} />
            </div>
          </div>

          <section className="mx-auto max-w-[1180px] px-4 pt-12 sm:px-[18px] sm:pt-14">
            {categorySlug ? (
              <Suspense
                key={`${categorySlug}-${countryCode ?? "ww"}-${city ?? ""}`}
                fallback={<CategoryResultsSkeleton />}
              >
                <CategoryResults
                  categorySlug={categorySlug}
                  countryCode={countryCode}
                  city={city}
                />
              </Suspense>
            ) : (
              <Suspense fallback={<CategoryResultsSkeleton />}>
                <PositioningPanel />
              </Suspense>
            )}
          </section>
        </>
      ) : (
        <DirectorySearch
          initialQuery={initialQuery}
          header={header}
          idle={
            <Suspense fallback={<CategoryResultsSkeleton />}>
              <PositioningPanel />
            </Suspense>
          }
        />
      )}

      <PricingPhotoBand
        title="Not in the directory yet?"
        src="/images/lookup-wide-a1.jpg"
        alt="A small team in conversation around a table in a workshop"
        lead="Create your company profile for free, then invite the clients and partners who can confirm your work."
        href="/onboarding"
        cta="Create your company profile"
      />
      <div className="h-24 sm:h-32" />
    </div>
  );
}
