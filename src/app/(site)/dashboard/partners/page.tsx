import type { Metadata } from "next";
import { PartnerInviteButton } from "@/components/partners/partner-invite-button";
import { CompanyResult } from "@/components/search/company-result";
import { Input } from "@/components/ui/input";
import { SectionTitle } from "@/components/ui/section-title";
import { companies } from "@/data/mock/companies";

export const metadata: Metadata = {
  title: "Add partners",
};

type Props = {
  searchParams: Promise<{ q?: string; from?: string }>;
};

export default async function DashboardPartnersPage({ searchParams }: Props) {
  const { q = "", from = "acme-architecture" } = await searchParams;
  const query = q.trim().toLowerCase();
  const results = companies.filter((c) => {
    if (c.slug === from) return false;
    if (!query) return true;
    return (
      c.name.toLowerCase().includes(query) ||
      c.category.toLowerCase().includes(query) ||
      c.city.toLowerCase().includes(query)
    );
  });

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <SectionTitle
        eyebrow="Partners"
        title="Search and invite"
        description="Grey + sends a partnership request. It becomes public only after the other company confirms."
      />
      <form className="mt-8" action="/dashboard/partners" method="get">
        <input type="hidden" name="from" value={from} />
        <Input
          name="q"
          defaultValue={q}
          placeholder="Search registered companies"
          aria-label="Search partners"
        />
      </form>
      <div className="mt-6 flex flex-col gap-2.5">
        {results.map((company) => (
          <CompanyResult
            key={company.id}
            company={company}
            action={<PartnerInviteButton companyName={company.name} />}
          />
        ))}
      </div>
    </div>
  );
}
