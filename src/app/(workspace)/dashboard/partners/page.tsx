import type { Metadata } from "next";
import Link from "next/link";
import { SwitchCompanyNotice } from "@/components/dashboard/switch-company-notice";
import { WorkspacePage } from "@/components/dashboard/workspace-page";
import { PartnerPageFlashes } from "@/components/partners/partner-page-flashes";
import { PartnerInboundNote } from "@/components/partners/partner-inbound-note";
import { PartnershipInbox } from "@/components/partners/partnership-inbox";
import { decorateAcceptedCredits } from "@/features/credits/queries";
import { getPartnershipInbox } from "@/features/partners/inbox";
import { buildConfirmedPartnersCsv } from "@/features/partners/csv-export";
import { buildRfpPartnerText } from "@/features/partners/rfp-export";
import { buildConfirmedReferencesCsv } from "@/features/references/csv-export";
import { getReferencesForCompany } from "@/features/references/queries";
import { dissolveSameOwnerPartnerLinks } from "@/features/partners/same-owner-guard";
import { assertCompanySection } from "@/features/workspace/company-gate";
import { PRODUCT } from "@/lib/product-model";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Partner requests",
};

type Props = {
  searchParams: Promise<{
    error?: string;
    created?: string;
    invited?: string;
    accepted?: string;
    declined?: string;
    resent?: string;
    verified?: string;
    tm?: string;
    published?: string;
    introAsked?: string;
  }>;
};

/** Inbox only — inviting happens on Company. */
export default async function DashboardPartnersPage({ searchParams }: Props) {
  const params = await searchParams;
  const { company: mine, needsCompanySwitch } =
    await assertCompanySection("partners");

  if (needsCompanySwitch) {
    return <SwitchCompanyNotice title="Partner requests" />;
  }

  if (!mine) {
    return (
      <WorkspacePage title="Partner requests">
        <p className="text-[14px] text-muted">
          <Link href="/onboarding" className="font-semibold text-ink underline">
            Create your company
          </Link>{" "}
          first.
        </p>
      </WorkspacePage>
    );
  }

  let verified = false;
  const supabase = await createClient();
  const { data } = await supabase
    .from("companies")
    .select("verified")
    .eq("id", mine.id)
    .maybeSingle();
  verified = Boolean(data?.verified);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    await dissolveSameOwnerPartnerLinks(mine.id, user.id);
  }

  const [inbox, references] = await Promise.all([
    getPartnershipInbox(mine.id),
    getReferencesForCompany(mine.id),
  ]);
  const credits = await decorateAcceptedCredits(mine.id, inbox.accepted);
  const partnerCsv = buildConfirmedPartnersCsv(mine.slug, inbox.accepted);
  const referenceCsv = buildConfirmedReferencesCsv(references);

  return (
    <WorkspacePage
      title="Partner requests"
      description="Accept or decline incoming requests. To invite someone, use Company."
      wide
      stats={[
        { label: "Waiting on you", value: inbox.incomingPending.length, attention: inbox.incomingPending.length > 0 },
        { label: "Sent", value: inbox.outgoingPending.length },
        { label: "Confirmed", value: inbox.accepted.length },
      ]}
      action={
        <Link
          href={`/c/${mine.slug}?add=1#add-partner`}
          className="inline-flex h-9 items-center rounded-full bg-navy px-3.5 text-[11px] font-semibold text-white"
        >
          Invite on Company
        </Link>
      }
    >
      <div className="space-y-6">
        <PartnerPageFlashes
          verified={verified}
          hasCompany
          justVerified={params.verified}
          error={params.error}
          created={params.created}
          invited={params.invited}
          accepted={params.accepted}
          declined={params.declined}
          resent={params.resent}
          published={params.published}
          introAsked={params.introAsked}
          tmPath={
            params.tm?.startsWith("/testimonial/") ? params.tm : null
          }
        />
        <PartnerInboundNote companyId={mine.id} />
        <p className="text-[13px] text-muted">
          {PRODUCT.partners.job}{" "}
          <Link
            href={`/c/${mine.slug}?add=1#add-partner`}
            className="font-semibold text-ink underline-offset-2 hover:underline"
          >
            Open invite
          </Link>
        </p>
        <PartnershipInbox
          incomingPending={inbox.incomingPending}
          outgoingPending={inbox.outgoingPending}
          accepted={credits.rows}
          allSnippet={credits.allSnippet}
          companySlug={mine.slug}
          rfpText={buildRfpPartnerText(mine.name, mine.slug, inbox.accepted)}
          partnerCsv={partnerCsv}
          referenceCsv={referenceCsv}
        />
      </div>
    </WorkspacePage>
  );
}
