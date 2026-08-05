import type { Metadata } from "next";
import Link from "next/link";
import { SwitchCompanyNotice } from "@/components/dashboard/switch-company-notice";
import { WorkspacePage } from "@/components/dashboard/workspace-page";
import { PartnerPageFlashes } from "@/components/partners/partner-page-flashes";
import { PartnershipInbox } from "@/components/partners/partnership-inbox";
import { getPartnershipInbox } from "@/features/partners/inbox";
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

  const inbox = await getPartnershipInbox(mine.id);

  return (
    <WorkspacePage
      title="Partner requests"
      description="Accept or decline incoming requests. To invite someone, use Company."
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
          tmPath={
            params.tm?.startsWith("/testimonial/") ? params.tm : null
          }
        />
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
          accepted={inbox.accepted}
        />
      </div>
    </WorkspacePage>
  );
}
