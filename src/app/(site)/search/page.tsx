import type { Metadata } from "next";
import { CompanyResult } from "@/components/search/company-result";
import { Input } from "@/components/ui/input";
import { SectionTitle } from "@/components/ui/section-title";
import { companies } from "@/data/mock/companies";

export const metadata: Metadata = {
  title: "Search companies",
};

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const query = q.trim().toLowerCase();
  const results = query
    ? companies.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.category.toLowerCase().includes(query) ||
          c.city.toLowerCase().includes(query),
      )
    : companies;

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <SectionTitle
        eyebrow="Search"
        title="Find a company"
        description="Companies appear in search after their profile exists. Partnerships require a confirmed company account."
      />
      <form className="mt-8" action="/search" method="get">
        <Input
          name="q"
          defaultValue={q}
          placeholder="Search by name, category, or city"
          aria-label="Search companies"
        />
      </form>
      <div className="mt-6 flex flex-col gap-2.5">
        {results.map((company) => (
          <CompanyResult key={company.id} company={company} />
        ))}
        {results.length === 0 ? (
          <p className="text-sm text-muted">No companies match this search.</p>
        ) : null}
      </div>
    </div>
  );
}
