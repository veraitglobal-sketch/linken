import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { NewCompanies } from "@/components/search/new-companies";
import { SearchConsole } from "@/components/search/search-console";
import { SearchJoin } from "@/components/search/search-join";
import { SearchProjects } from "@/components/search/search-projects";
import { categoryBySlug, canonicalCategorySlug } from "@/features/categories/taxonomy";
import { getNewestCompanies } from "@/features/companies/queries-newest";
import { getRecentConfirmedCases } from "@/features/case-studies/queries-public";

export const metadata: Metadata = {
  title: "Search companies",
  description:
    "Find a company on Hansala by name, sector or city. A profile lists a partner only after both companies confirmed it.",
  alternates: { canonical: "/search" },
};

type Props = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    country?: string;
    city?: string;
  }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;

  // Old category URLs → type-to-search. Sector lists only appear while typing.
  if (params.category && !params.q?.trim()) {
    const slug = canonicalCategorySlug(params.category);
    const category = slug ? categoryBySlug(slug) : undefined;
    if (category) {
      redirect(`/search?q=${encodeURIComponent(category.name)}`);
    }
  }

  const initialQuery = params.q?.trim().slice(0, 80) ?? "";

  const header = (
    <>
      <h1 className="animate-rise max-w-[20ch] font-display text-[clamp(2.3rem,4.3vw,3.875rem)] leading-[1.05] font-semibold tracking-[-0.04em] text-ink text-balance">
        See who a company has really worked with.
      </h1>
      <p className="animate-rise-delay mt-6 max-w-[54ch] text-[17px] leading-[1.6] text-ink-soft sm:text-[18px]">
        Search by name, sector or city. A profile lists a partner only after both companies confirmed it. Or{" "}
        <a href="/companies" className="font-semibold text-navy hover:underline">
          browse companies by name
        </a>
        .
      </p>
    </>
  );

  return (
    <div className="home-wash bg-wash pb-24 sm:pb-32">
      <SearchConsole
        key={initialQuery ? `q-${initialQuery}` : "search"}
        initialQuery={initialQuery}
        header={header}
        newStrip={
          <Suspense fallback={null}>
            <NewOnHansalaStrip />
          </Suspense>
        }
        board={
          <Suspense fallback={null}>
            <IdleBoard />
          </Suspense>
        }
      />
      <SearchJoin />
    </div>
  );
}

async function NewOnHansalaStrip() {
  const companies = await getNewestCompanies(8);
  return <NewCompanies companies={companies} />;
}

async function IdleBoard() {
  const cases = await getRecentConfirmedCases(12);
  if (cases.length === 0) return null;
  return <SearchProjects cases={cases} heading="Confirmed case studies" />;
}
