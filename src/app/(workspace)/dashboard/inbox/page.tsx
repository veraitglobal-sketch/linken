import type { Metadata } from "next";
import Link from "next/link";
import { WorkspacePage } from "@/components/dashboard/workspace-page";
import { DashboardInquiries } from "@/components/inquiries/dashboard-inquiries";
import { getDashboardSession } from "@/features/dashboard/session";
import { getInquiriesForOwnerCompany } from "@/features/inquiries/queries";

export const metadata: Metadata = {
  title: "Inquiries",
};

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function DashboardInboxPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const { user, company } = await getDashboardSession();

  if (!user) {
    return (
      <p className="py-10 text-[14px] text-ink-soft">
        <Link href="/login?next=/dashboard/inbox" className="font-semibold underline">
          Sign in
        </Link>{" "}
        to view inquiries.
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

  const data = await getInquiriesForOwnerCompany(company.id);

  return (
    <WorkspacePage
      title="Inquiries"
      description="Leads from your public Linken profile. Reply by email — status stays in the workspace."
    >
      {error ? (
        <p className="mb-5 rounded-xl border border-ember/35 bg-ember/10 px-4 py-3 text-sm text-ink">
          {error}
        </p>
      ) : null}

      <DashboardInquiries
        inquiries={data.inquiries}
        newCount={data.newCount}
        monthCount={data.monthCount}
      />
    </WorkspacePage>
  );
}
