import type { Metadata } from "next";
import Link from "next/link";
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
    <div className="space-y-6 pb-8">
      <header>
        <p className="text-[11px] font-semibold tracking-[0.14em] text-[#1f6b5c] uppercase">
          Inbox
        </p>
        <h1 className="mt-1 font-display text-[clamp(1.6rem,2.5vw,2rem)] font-medium tracking-[-0.04em] text-ink">
          Inquiries
        </h1>
        <p className="mt-1 max-w-xl text-[13px] text-ink-soft">
          Leads from your public Linken profile. Reply by email — status stays in
          the workspace.
        </p>
      </header>

      {error ? (
        <p className="rounded-2xl border border-ember/35 bg-ember/10 px-4 py-3 text-sm text-ink">
          {error}
        </p>
      ) : null}

      <DashboardInquiries
        inquiries={data.inquiries}
        newCount={data.newCount}
        monthCount={data.monthCount}
      />
    </div>
  );
}
