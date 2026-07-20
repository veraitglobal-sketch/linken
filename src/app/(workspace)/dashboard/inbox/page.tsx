import type { Metadata } from "next";
import Link from "next/link";
import { InboxFlash } from "@/components/inbox/inbox-flash";
import { InboxTabs } from "@/components/inbox/inbox-tabs";
import { DashboardInquiries } from "@/components/inquiries/dashboard-inquiries";
import { DashboardIntros } from "@/components/intros/dashboard-intros";
import { WorkspacePage } from "@/components/dashboard/workspace-page";
import { SwitchCompanyNotice } from "@/components/dashboard/switch-company-notice";
import { getInquiriesForOwnerCompany } from "@/features/inquiries/queries";
import { listReceivedIntros } from "@/features/intros/queries";
import { assertCompanySection } from "@/features/workspace/company-gate";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Inbox",
};

type Props = {
  searchParams: Promise<{ error?: string; tab?: string }>;
};

export default async function DashboardInboxPage({ searchParams }: Props) {
  const { error, tab } = await searchParams;
  const active = tab === "intros" ? "intros" : "inquiries";
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

  const [inquiryData, intros] = await Promise.all([
    getInquiriesForOwnerCompany(company.id),
    listReceivedIntros(company.id),
  ]);

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
      title="Inbox"
      description="Inquiries from your profile. Intros from Radar — kept separate."
      action={
        <Link
          href={`/c/${company.slug}`}
          className="inline-flex h-9 items-center rounded-full border border-line bg-surface px-3.5 text-[11px] font-semibold text-ink transition-colors hover:bg-paper"
        >
          Public profile
        </Link>
      }
    >
      <div className="space-y-5">
        <InboxTabs
          active={active}
          inquiryNew={inquiryData.newCount}
          introsCount={intros.length}
        />

        {error ? <InboxFlash tone="error">{error}</InboxFlash> : null}

        {active === "inquiries" ? (
          <DashboardInquiries
            inquiries={inquiryData.inquiries}
            newCount={inquiryData.newCount}
            monthCount={inquiryData.monthCount}
            companySlug={company.slug}
          />
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
