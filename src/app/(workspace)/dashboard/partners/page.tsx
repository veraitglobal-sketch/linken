import type { Metadata } from "next";
import Link from "next/link";
import { SwitchCompanyNotice } from "@/components/dashboard/switch-company-notice";
import { WorkspacePage } from "@/components/dashboard/workspace-page";
import { CreateUnclaimedForm } from "@/components/partners/create-unclaimed-form";
import { PartnerFlash } from "@/components/partners/partner-flash";
import { PartnerSearchSection } from "@/components/partners/partner-search-section";
import { PartnershipInbox } from "@/components/partners/partnership-inbox";
import { searchCompanies } from "@/features/companies/queries";
import { getPartnershipInbox } from "@/features/partners/inbox";
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
    verified?: string;
  }>;
};

export default async function DashboardPartnersPage({ searchParams }: Props) {
  const params = await searchParams;
  const { q = "", error, created, invited, accepted, declined, resent, verified: justVerified } =
    params;
  const { company: mine, needsCompanySwitch } =
    await assertCompanySection("partners");

  if (needsCompanySwitch) {
    return <SwitchCompanyNotice title="Partners" />;
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
      description="Request a link with an existing firm. Official only after they accept — then it shows on Network."
      action={
        <Link
          href="/dashboard"
          className="inline-flex h-9 items-center rounded-full border border-line bg-surface px-3.5 text-[11px] font-semibold text-ink transition-colors hover:bg-paper"
        >
          Network map
        </Link>
      }
    >
      <div className="space-y-8">
        {!verified && mine ? (
          <PartnerFlash tone="warn">
            Verify your domain before sending or accepting partner requests.{" "}
            <Link
              href="/dashboard/verification"
              className="font-semibold underline-offset-2 hover:underline"
            >
              Verify domain
            </Link>
          </PartnerFlash>
        ) : null}

        {justVerified === "1" && verified ? (
          <PartnerFlash>
            Domain verified. Search a firm below or create a draft invite —
            official only after they accept.
          </PartnerFlash>
        ) : null}

        {error ? <PartnerFlash tone="error">{error}</PartnerFlash> : null}
        {created ? (
          <PartnerFlash>
            Draft + invite sent for{" "}
            <a
              href={`/c/${created}`}
              className="font-semibold underline-offset-2 hover:underline"
            >
              {created}
            </a>
            . Pending until they claim and confirm.
          </PartnerFlash>
        ) : null}
        {invited ? (
          <PartnerFlash>
            Request sent to{" "}
            <a
              href={`/c/${invited}`}
              className="font-semibold underline-offset-2 hover:underline"
            >
              {invited}
            </a>
            . Official only after they accept.
          </PartnerFlash>
        ) : null}
        {accepted ? (
          <PartnerFlash>
            Partnership accepted — open{" "}
            <Link
              href="/dashboard"
              className="font-semibold underline-offset-2 hover:underline"
            >
              Network
            </Link>{" "}
            to see the partner link.
          </PartnerFlash>
        ) : null}
        {declined ? <PartnerFlash>Request declined.</PartnerFlash> : null}
        {resent ? (
          <PartnerFlash>
            Invite resent — they still need to join and confirm.
          </PartnerFlash>
        ) : null}

        <PartnershipInbox
          incomingPending={inbox.incomingPending}
          outgoingPending={inbox.outgoingPending}
          accepted={inbox.accepted}
        />

        <PartnerSearchSection
          q={q}
          results={results}
          emptySearch={emptySearch}
          verified={verified}
          statusBySlug={statusBySlug}
        />

        <CreateUnclaimedForm defaultName={emptySearch ? q.trim() : ""} />
      </div>
    </WorkspacePage>
  );
}
