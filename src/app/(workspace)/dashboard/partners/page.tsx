import type { Metadata } from "next";
import { CreateUnclaimedForm } from "@/components/partners/create-unclaimed-form";
import { PartnerInviteButton } from "@/components/partners/partner-invite-button";
import { CompanyResult } from "@/components/search/company-result";
import { Input } from "@/components/ui/input";
import { SectionTitle } from "@/components/ui/section-title";
import { searchCompanies } from "@/features/companies/queries";
import { viewerOwnsClaimedCompany } from "@/features/partners/queries";

export const metadata: Metadata = {
  title: "Add partners",
};

type Props = {
  searchParams: Promise<{
    q?: string;
    error?: string;
    created?: string;
  }>;
};

export default async function DashboardPartnersPage({ searchParams }: Props) {
  const { q = "", error, created } = await searchParams;
  const { company: mine } = await viewerOwnsClaimedCompany();
  const from = mine?.slug;
  const results = (await searchCompanies(q)).filter((c) =>
    from ? c.slug !== from : true,
  );
  const emptySearch = Boolean(q.trim()) && results.length === 0;

  return (
    <div className="max-w-3xl space-y-2 pb-8">
      <SectionTitle
        eyebrow="Network"
        title="Search and invite"
        description="Invite registered firms, or create a draft profile for a partner who is not on Linken yet. Nothing shows as verified until they claim and confirm."
      />

      {error ? (
        <p className="mt-6 rounded-2xl border border-ember/35 bg-ember/10 px-4 py-3 text-sm text-ink">
          {error}
        </p>
      ) : null}
      {created ? (
        <p className="mt-6 rounded-2xl border border-[#1f6b5c]/30 bg-[#1f6b5c]/10 px-4 py-3 text-sm text-ink">
          Draft profile created for{" "}
          <a href={`/c/${created}`} className="font-semibold underline">
            {created}
          </a>
          . Partnership stays pending until they claim and confirm.
        </p>
      ) : null}

      <form className="mt-8" action="/dashboard/partners" method="get">
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
            action={
              company.claimed === false ? null : (
                <PartnerInviteButton companyName={company.name} />
              )
            }
          />
        ))}
        {emptySearch ? (
          <p className="text-sm text-muted">
            No registered company matches “{q.trim()}”.
          </p>
        ) : null}
      </div>

      <div className="mt-10">
        <CreateUnclaimedForm defaultName={emptySearch ? q.trim() : ""} />
      </div>
    </div>
  );
}
