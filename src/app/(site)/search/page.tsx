import type { Metadata } from "next";
import Link from "next/link";
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
  const empty = results.length === 0;

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
        {empty ? (
          <div className="rounded-2xl border border-line bg-[#fafbfc] px-5 py-8 text-center">
            <p className="text-sm text-muted">
              {q.trim()
                ? "No companies match this search."
                : "No companies on Hansala yet — be the first."}
            </p>
            <Link
              href="/onboarding"
              className="mt-3 inline-block text-[13px] font-semibold text-ink underline-offset-2 hover:underline"
            >
              Create your company link
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
