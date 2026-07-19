import type { Metadata } from "next";
import { CompanyResult } from "@/components/search/company-result";
import { Input } from "@/components/ui/input";
import { SectionTitle } from "@/components/ui/section-title";
import { searchCompanies } from "@/features/companies/queries";

export const metadata: Metadata = {
  title: "Search companies",
};

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const results = await searchCompanies(q);

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <SectionTitle
        eyebrow="Search"
        title="Find a company"
        description="Registered and draft profiles appear here. Partnerships stay pending until both sides confirm."
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
