import type { Metadata } from "next";
import Link from "next/link";
import { InboxFlash } from "@/components/inbox/inbox-flash";
import { InboxTabs } from "@/components/inbox/inbox-tabs";
import { DashboardInquiries } from "@/components/inquiries/dashboard-inquiries";
import { DashboardIntros } from "@/components/intros/dashboard-intros";
import { PartnershipInbox } from "@/components/partners/partnership-inbox";
import { WorkspacePage } from "@/components/dashboard/workspace-page";
import { SwitchCompanyNotice } from "@/components/dashboard/switch-company-notice";
import { OwnerLoopBar } from "@/components/product/owner-loop-bar";
import { getInquiriesForOwnerCompany } from "@/features/inquiries/queries";
import { listReceivedIntros } from "@/features/intros/queries";
import { getPartnershipInbox } from "@/features/partners/inbox";
import { assertCompanySection } from "@/features/workspace/company-gate";
import { PRODUCT } from "@/lib/product-model";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Inbox",
};

type Props = {
  searchParams: Promise<{ error?: string; tab?: string }>;
};

export default async function DashboardInboxPage({ searchParams }: Props) {
  const { error, tab } = await searchParams;
  const active =
    tab === "intros" ? "intros" : tab === "partners" ? "partners" : "inquiries";
  const { user, company, needsCompanySwitch } =
    await assertCompanySection("inbox");

  if (needsCompanySwitch) {
    return <SwitchCompanyNotice title="Inbox" />;
  }

  if (!user) {
    return (
      <WorkspacePage title="Inbox" description="Inquiries and Radar intros.">
        <p className="text-[14px] text-muted">
          <Link
            href="/login?next=/dashboard/inbox"
            className="font-semibold text-ink underline-offset-2 hover:underline"
          >
            Sign in
          </Link>{" "}
          to view your inbox.
        </p>
      </WorkspacePage>
    );
  }

  if (!company) {
    return (
      <WorkspacePage title="Inbox" description="Inquiries and Radar intros.">
        <p className="text-[14px] text-muted">
          <Link
            href="/onboarding"
            className="font-semibold text-ink underline-offset-2 hover:underline"
          >
            Create your company
          </Link>{" "}
          first.
        </p>
      </WorkspacePage>
    );
  }

  const [inquiryData, intros, partnerInbox] = await Promise.all([
    getInquiriesForOwnerCompany(company.id),
    listReceivedIntros(company.id),
    getPartnershipInbox(company.id),
  ]);
  const partnersPendingCount =
    partnerInbox.incomingPending.length + partnerInbox.outgoingPending.length;

  if (active === "intros") {
    const supabase = await createClient();
    await Promise.all(
      intros
        .filter((i) => i.status === "sent")
        .map((i) => supabase.rpc("mark_intro_seen", { p_intro_id: i.id })),
    );
  }

  return (
    <WorkspacePage
      title={PRODUCT.inbox.label}
      description={PRODUCT.inbox.job}
    >
      <div className="space-y-5">
        <OwnerLoopBar companySlug={company.slug} active="inbox" />
        <InboxTabs
          active={active}
          inquiryNew={inquiryData.newCount}
          introsCount={intros.length}
          partnersCount={partnersPendingCount}
        />

        {error ? <InboxFlash tone="error">{error}</InboxFlash> : null}

        {active === "inquiries" ? (
          <DashboardInquiries
            inquiries={inquiryData.inquiries}
            newCount={inquiryData.newCount}
            monthCount={inquiryData.monthCount}
            companySlug={company.slug}
          />
        ) : active === "partners" ? (
          partnersPendingCount > 0 || partnerInbox.accepted.length > 0 ? (
            <PartnershipInbox
              incomingPending={partnerInbox.incomingPending}
              outgoingPending={partnerInbox.outgoingPending}
              accepted={partnerInbox.accepted}
            />
          ) : (
            <p className="rounded-2xl border border-dashed border-line bg-surface/60 px-5 py-8 text-center text-[13px] text-muted">
              No partner requests yet.{" "}
              <Link
                href={`/c/${company.slug}?add=1#add-partner`}
                className="font-semibold text-ink underline-offset-2 hover:underline"
              >
                Invite a partner
              </Link>{" "}
              from your Company page.
            </p>
          )
        ) : (
          <DashboardIntros
            intros={intros}
            receiveIntros={company.receiveIntros !== false}
          />
        )}
      </div>
    </WorkspacePage>
  );
}
