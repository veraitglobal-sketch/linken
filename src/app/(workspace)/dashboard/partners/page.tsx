import type { Metadata } from "next";
import Link from "next/link";
import {
  WorkspaceCard,
  WorkspacePage,
} from "@/components/dashboard/workspace-page";
import { CreateUnclaimedForm } from "@/components/partners/create-unclaimed-form";
import { PartnerInviteButton } from "@/components/partners/partner-invite-button";
import { PartnershipInbox } from "@/components/partners/partnership-inbox";
import { CompanyResult } from "@/components/search/company-result";
import { Input } from "@/components/ui/input";
import { searchCompanies } from "@/features/companies/queries";
import { getPartnershipInbox } from "@/features/partners/inbox";
import { SwitchCompanyNotice } from "@/components/dashboard/switch-company-notice";
import { assertCompanySection } from "@/features/workspace/company-gate";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Partners",
};

type Props = {
  searchParams: Promise<{
    q?: string;
    error?: string;
    created?: string;
    invited?: string;
    accepted?: string;
    declined?: string;
    resent?: string;
  }>;
};

export default async function DashboardPartnersPage({ searchParams }: Props) {
  const params = await searchParams;
  const { q = "", error, created, invited, accepted, declined, resent } =
    params;
  const { company: mine, needsCompanySwitch } = await assertCompanySection("partners");

  if (needsCompanySwitch) {
    return (
      <WorkspacePage title="Partners" description="Grow confirmed relationships.">
        <SwitchCompanyNotice title="Partners" />
      </WorkspacePage>
    );
  }

  const from = mine?.slug;

  let verified = false;
  if (mine) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("companies")
      .select("verified")
      .eq("id", mine.id)
      .maybeSingle();
    verified = Boolean(data?.verified);
  }

  const results = (await searchCompanies(q)).filter((c) =>
    from ? c.slug !== from : true,
  );
  const emptySearch = Boolean(q.trim()) && results.length === 0;

  const inbox = mine
    ? await getPartnershipInbox(mine.id)
    : { outgoingPending: [], incomingPending: [], accepted: [] };

  const statusBySlug = new Map<string, string>();
  for (const row of inbox.outgoingPending) {
    statusBySlug.set(row.other.slug, "Pending");
  }
  for (const row of inbox.incomingPending) {
    statusBySlug.set(row.other.slug, "Incoming");
  }
  for (const row of inbox.accepted) {
    statusBySlug.set(row.other.slug, "Official");
  }

  return (
    <WorkspacePage
      title="Partners"
      description="Search an existing firm and send a request. They become official partners only after they accept — then the link shows on Network."
    >
      <div className="space-y-5">
        {!verified && mine ? (
          <p className="rounded-xl border border-[#fde68a] bg-[#fffbeb] px-4 py-3 text-[13px] text-[#92400e]">
            Verify your domain before sending or accepting partner requests.{" "}
            <Link
              href="/dashboard/verification"
              className="font-semibold underline underline-offset-2"
            >
              Verify domain →
            </Link>
          </p>
        ) : null}

        {error ? (
          <p className="rounded-xl border border-ember/35 bg-ember/10 px-4 py-3 text-sm text-ink">
            {error}
          </p>
        ) : null}
        {created ? (
          <p className="rounded-xl border border-[#e2e8f0] bg-white px-4 py-3 text-sm text-ink">
            Draft + invite sent for{" "}
            <a href={`/c/${created}`} className="font-semibold underline">
              {created}
            </a>
            . Pending until they claim and confirm — not on the graph yet.
          </p>
        ) : null}
        {invited ? (
          <p className="rounded-xl border border-[#e2e8f0] bg-white px-4 py-3 text-sm text-ink">
            Request sent to{" "}
            <a href={`/c/${invited}`} className="font-semibold underline">
              {invited}
            </a>
            . Official only after they accept.
          </p>
        ) : null}
        {accepted ? (
          <p className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-sm text-ink">
            Partnership accepted — open{" "}
            <Link href="/dashboard" className="font-semibold underline">
              Network
            </Link>{" "}
            to see the partner link.
          </p>
        ) : null}
        {declined ? (
          <p className="rounded-xl border border-[#e2e8f0] bg-white px-4 py-3 text-sm text-ink">
            Request declined.
          </p>
        ) : null}
        {resent ? (
          <p className="rounded-xl border border-[#e2e8f0] bg-white px-4 py-3 text-sm text-ink">
            Invite resent — they still need to join Linken and confirm before
            appearing on your network map.
          </p>
        ) : null}

        <PartnershipInbox
          incomingPending={inbox.incomingPending}
          outgoingPending={inbox.outgoingPending}
          accepted={inbox.accepted}
        />

        <WorkspaceCard>
          <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-ink">
            Find an existing company
          </h3>
          <p className="mt-0.5 text-[12px] text-[#64748b]">
            Claimed firms only — request link; they accept to become official.
          </p>
          <form action="/dashboard/partners" method="get" className="mt-4">
            <Input
              name="q"
              defaultValue={q}
              placeholder="Search registered companies"
              aria-label="Search partners"
            />
          </form>

          <div className="mt-5 flex flex-col gap-2">
            {results.map((company) => {
              const status = statusBySlug.get(company.slug);
              const unclaimed = company.claimed === false;
              return (
                <CompanyResult
                  key={company.id}
                  company={company}
                  action={
                    unclaimed ? (
                      <span className="shrink-0 text-[11px] font-medium text-[#94a3b8]">
                        Use draft below
                      </span>
                    ) : (
                      <PartnerInviteButton
                        companySlug={company.slug}
                        companyName={company.name}
                        disabledReason={
                          !verified
                            ? "Verify first"
                            : status === "Official"
                              ? "Official"
                              : status === "Pending"
                                ? "Pending"
                                : status === "Incoming"
                                  ? "Incoming"
                                  : null
                        }
                      />
                    )
                  }
                />
              );
            })}
            {emptySearch ? (
              <p className="text-sm text-[#94a3b8]">
                No registered company matches “{q.trim()}”. Create a draft invite
                below.
              </p>
            ) : null}
            {!q.trim() && results.length === 0 ? (
              <p className="text-sm text-[#94a3b8]">
                Type a name to search claimed companies.
              </p>
            ) : null}
          </div>
        </WorkspaceCard>

        <CreateUnclaimedForm defaultName={emptySearch ? q.trim() : ""} />
      </div>
    </WorkspacePage>
  );
}
