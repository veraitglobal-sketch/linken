import type { Metadata } from "next";
import Link from "next/link";
import { CompanyResult } from "@/components/search/company-result";
import { Input } from "@/components/ui/input";
import { SectionTitle } from "@/components/ui/section-title";
import { searchCompanies } from "@/features/companies/queries";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Search companies",
};

type Props = {
  searchParams: Promise<{
    q?: string;
    verified?: string;
    partners?: string;
    caseStudies?: string;
  }>;
};

const FILTERS = [
  { param: "verified", label: "Verified" },
  { param: "partners", label: "Has confirmed partners" },
  { param: "caseStudies", label: "Has case studies" },
] as const;

export default async function SearchPage({ searchParams }: Props) {
  const { q = "", verified, partners, caseStudies } = await searchParams;
  const active = {
    verified: verified === "1",
    partners: partners === "1",
    caseStudies: caseStudies === "1",
  };
  const results = await searchCompanies(q, {
    verifiedOnly: active.verified,
    hasPartners: active.partners,
    hasCaseStudies: active.caseStudies,
  });
  const empty = results.length === 0;
  const unclaimedIndex = results.findIndex((c) => c.claimed === false);
  const claimedResults =
    unclaimedIndex === -1 ? results : results.slice(0, unclaimedIndex);
  const unclaimedResults =
    unclaimedIndex === -1 ? [] : results.slice(unclaimedIndex);

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
        <div className="mt-3 flex flex-wrap gap-2">
          {FILTERS.map((filter) => {
            const isActive = active[filter.param as keyof typeof active];
            return (
              <label
                key={filter.param}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors",
                  isActive
                    ? "border-accent bg-accent-soft text-ink"
                    : "border-line bg-surface text-muted hover:bg-paper",
                )}
              >
                <input
                  type="checkbox"
                  name={filter.param}
                  value="1"
                  defaultChecked={isActive}
                  className="sr-only"
                />
                {filter.label}
              </label>
            );
          })}
          <button
            type="submit"
            className="rounded-full border border-line bg-ink px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-ink/90"
          >
            Apply
          </button>
        </div>
      </form>
      <div className="mt-6 flex flex-col gap-2.5">
        {claimedResults.map((company) => (
          <CompanyResult key={company.id} company={company} />
        ))}
        {unclaimedResults.length > 0 ? (
          <>
            <p className="mt-4 mb-0.5 text-[11px] font-semibold tracking-[0.1em] text-muted uppercase">
              Unclaimed drafts
            </p>
            {unclaimedResults.map((company) => (
              <CompanyResult key={company.id} company={company} />
            ))}
          </>
        ) : null}
        {empty ? (
          <div className="rounded-2xl border border-line bg-[#fafbfc] px-5 py-8 text-center">
            <p className="text-sm text-muted">
              {q.trim() || active.verified || active.partners || active.caseStudies
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
