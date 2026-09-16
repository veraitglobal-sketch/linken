import type { Metadata } from "next";
import { PricingPhotoBand } from "@/components/pricing/pricing-photo-band";
import { CategorySearch } from "@/components/search/category-search";
import { DirectorySearch } from "@/components/search/directory-search";
import { SearchModePills } from "@/components/search/search-mode-pills";

export const metadata: Metadata = {
  title: "Search companies",
  description:
    "Find a company on Hansala. Public profiles show confirmed partners only.",
  alternates: { canonical: "/search" },
};

type Props = {
  searchParams: Promise<{ q?: string; mode?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q, mode: modeRaw } = await searchParams;
  const initialQuery = q?.trim().slice(0, 80) ?? "";
  const mode = modeRaw === "categories" ? "categories" : "companies";

  const header = (
    <>
      <h1 className="animate-rise max-w-[20ch] font-display text-[clamp(2.3rem,4.3vw,3.875rem)] leading-[1.05] font-semibold tracking-[-0.04em] text-ink text-balance">
        {mode === "categories"
          ? "Find companies by the work they do."
          : "See who a company has really worked with."}
      </h1>
      <p className="animate-rise-delay mt-6 max-w-[54ch] text-[17px] leading-[1.6] text-ink-soft sm:text-[18px]">
        {mode === "categories"
          ? "A sector list only includes companies with work the other side confirmed."
          : "Search by name, sector or city. A profile lists a partner only after both companies confirmed it."}
      </p>
      <SearchModePills mode={mode} query={initialQuery} />
    </>
  );

  return (
    <div className="home-wash bg-wash">
      {mode === "categories" ? (
        <div className="relative -mt-[4.25rem] px-4 pt-[8rem] text-center sm:px-6 sm:pt-[9rem] lg:px-8">
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 bottom-8 rounded-b-[48px] bg-lime sm:bottom-9 sm:rounded-b-[120px]"
          />
          <div className="relative mx-auto flex max-w-6xl flex-col items-center">
            {header}
          </div>
          <div className="relative">
            <CategorySearch initialQuery={initialQuery} />
          </div>
        </div>
      ) : (
        <DirectorySearch initialQuery={initialQuery} header={header} />
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
