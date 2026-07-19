import type { Metadata } from "next";
import Link from "next/link";
import { DashboardInquiries } from "@/components/inquiries/dashboard-inquiries";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/section-title";
import { getInquiriesForOwnerCompany } from "@/features/inquiries/queries";
import { viewerOwnsClaimedCompany } from "@/features/partners/queries";

export const metadata: Metadata = {
  title: "Dashboard",
};

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function DashboardPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const { user, company } = await viewerOwnsClaimedCompany();
  const inquiryData = company
    ? await getInquiriesForOwnerCompany(company.id)
    : { inquiries: [], newCount: 0, monthCount: 0 };

  const items = [
    {
      href: company ? `/c/${company.slug}` : "/onboarding",
      title: "Public profile",
      body: "Preview how visitors see your company and partners.",
    },
    {
      href: "/dashboard/partners",
      title: "Partner requests",
      body: "Search companies and send mutual partnership invites.",
    },
    {
      href: "/onboarding",
      title: "Company setup",
      body: "Create or update the company owned by your account.",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <SectionTitle
        eyebrow="Owner"
        title="Company dashboard"
        description="One owner per company. Manage the public profile, verified partners, and inbound inquiries."
      />

      {error ? (
        <p className="mt-6 rounded-2xl border border-ember/35 bg-ember/10 px-4 py-3 text-sm text-ink">
          {error}
        </p>
      ) : null}

      {!user ? (
        <p className="mt-8 text-sm text-ink-soft">
          <Link href="/login?next=/dashboard" className="font-semibold underline">
            Sign in
          </Link>{" "}
          to see inquiries and manage your company.
        </p>
      ) : null}

      {user && company ? (
        <div className="mt-8">
          <DashboardInquiries
            inquiries={inquiryData.inquiries}
            newCount={inquiryData.newCount}
            monthCount={inquiryData.monthCount}
          />
        </div>
      ) : null}

      {user && !company ? (
        <p className="mt-8 rounded-2xl border border-line bg-[#f7f8fa] px-4 py-3 text-sm text-ink-soft">
          Create your company first to receive inquiries on your Linken profile.{" "}
          <Link href="/onboarding" className="font-semibold text-ink underline">
            Set up company
          </Link>
        </p>
      ) : null}

      <div className="mt-8 flex flex-col gap-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-[10px] border border-line bg-surface p-4 transition-colors hover:border-ink/20"
          >
            <h2 className="text-sm font-medium text-ink">{item.title}</h2>
            <p className="mt-1 text-sm text-ink-soft">{item.body}</p>
          </Link>
        ))}
      </div>
      <div className="mt-8">
        <Button href="/search" variant="secondary">
          Open company search
        </Button>
      </div>
    </div>
  );
}
