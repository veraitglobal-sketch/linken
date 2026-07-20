import type { Metadata } from "next";
import Link from "next/link";
import { InboxTabs } from "@/components/inbox/inbox-tabs";
import { DashboardInquiries } from "@/components/inquiries/dashboard-inquiries";
import { DashboardIntros } from "@/components/intros/dashboard-intros";
import { WorkspacePage } from "@/components/dashboard/workspace-page";
import { getDashboardSession } from "@/features/dashboard/session";
import { getInquiriesForOwnerCompany } from "@/features/inquiries/queries";
import { listReceivedIntros } from "@/features/intros/queries";
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
  const { user, company } = await getDashboardSession();

  if (!user) {
    return (
      <p className="py-10 text-[14px] text-ink-soft">
        <Link href="/login?next=/dashboard/inbox" className="font-semibold underline">
          Sign in
        </Link>{" "}
        to view your inbox.
      </p>
    );
  }

  if (!company) {
    return (
      <p className="py-10 text-[14px] text-ink-soft">
        <Link href="/onboarding" className="font-semibold underline">
          Create your company
        </Link>{" "}
        first.
      </p>
    );
  }

  return (
    <WorkspacePage
      title="Inbox"
      description="Profile inquiries and Radar intros stay in separate tabs — never mixed."
    >
      <InboxTabs active={active} />

      {error ? (
        <p className="mb-5 rounded-xl border border-ember/35 bg-ember/10 px-4 py-3 text-sm text-ink">
          {error}
        </p>
      ) : null}

      {active === "inquiries" ? (
        <InquiriesPanel companyId={company.id} />
      ) : (
        <IntrosPanel
          companyId={company.id}
          receiveIntros={company.receiveIntros !== false}
        />
      )}
    </WorkspacePage>
  );
}

async function InquiriesPanel({ companyId }: { companyId: string }) {
  const data = await getInquiriesForOwnerCompany(companyId);
  return (
    <DashboardInquiries
      inquiries={data.inquiries}
      newCount={data.newCount}
      monthCount={data.monthCount}
    />
  );
}

async function IntrosPanel({
  companyId,
  receiveIntros,
}: {
  companyId: string;
  receiveIntros: boolean;
}) {
  const intros = await listReceivedIntros(companyId);
  const supabase = await createClient();
  await Promise.all(
    intros
      .filter((i) => i.status === "sent")
      .map((i) =>
        supabase.rpc("mark_intro_seen", { p_intro_id: i.id }),
      ),
  );

  return (
    <DashboardIntros intros={intros} receiveIntros={receiveIntros} />
  );
}
