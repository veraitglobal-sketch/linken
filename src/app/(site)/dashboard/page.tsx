import type { Metadata } from "next";
import Link from "next/link";
import { AnalyticsCard } from "@/components/analytics/analytics-card";
import { PrivateFeedbackCard } from "@/components/assessments/private-feedback-card";
import { AvailabilityToggle } from "@/components/company/availability-toggle";
import { PendingGroupInvites } from "@/components/groups/pending-group-invites";
import { DashboardInquiries } from "@/components/inquiries/dashboard-inquiries";
import { VerificationCard } from "@/components/verification/verification-card";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/section-title";
import { getAnalytics } from "@/features/analytics/queries";
import { getPrivateFeedbackForOwner } from "@/features/assessments/queries";
import { getPendingGroupInvitesForOwner } from "@/features/groups/queries";
import { getInquiriesForOwnerCompany } from "@/features/inquiries/queries";
import { viewerOwnsClaimedCompany } from "@/features/partners/queries";
import { getCompanyVerification } from "@/features/verification/queries";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Dashboard",
};

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function DashboardPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const { user, company } = await viewerOwnsClaimedCompany();
  const siteUrl = getSiteUrl();

  let website = "";
  let verifyToken: string | null = null;
  let verification = null as Awaited<
    ReturnType<typeof getCompanyVerification>
  >;

  if (company) {
    const supabase = await createClient();
    const [{ data: full }, tokenRes] = await Promise.all([
      supabase
        .from("companies")
        .select("website")
        .eq("id", company.id)
        .maybeSingle(),
      supabase.rpc("get_verify_token", { p_company_id: company.id }),
    ]);
    website = full?.website ?? "";
    verifyToken = (tokenRes.data as string | null) ?? null;
    verification = await getCompanyVerification(company.id);
  }

  const [inquiryData, privateFeedback, analytics, groupInvites] = company
    ? await Promise.all([
        getInquiriesForOwnerCompany(company.id),
        getPrivateFeedbackForOwner(company.id),
        getAnalytics(company.id, 30),
        getPendingGroupInvitesForOwner(),
      ])
    : [
        { inquiries: [], newCount: 0, monthCount: 0 },
        [] as Awaited<ReturnType<typeof getPrivateFeedbackForOwner>>,
        null,
        user ? await getPendingGroupInvitesForOwner() : [],
      ];

  const items = [
    {
      href: company ? `/c/${company.slug}` : "/onboarding",
      title: "Public profile",
      body: "Preview how visitors see your company and partners.",
    },
    {
      href: company ? `/c/${company.slug}/one-pager` : "/onboarding",
      title: "Verified one-pager",
      body: "Printable page with only confirmed evidence — attach to every proposal.",
    },
    {
      href: "/dashboard/partners",
      title: "Partner requests",
      body: "Search companies and send mutual partnership invites.",
    },
    {
      href: "/dashboard/group",
      title: "Company group",
      body: "Branches, subsidiaries, and confirmed group membership.",
    },
    {
      href: "/dashboard/team",
      title: "Team members",
      body: "Invite colleagues to help manage this company.",
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

      {user ? (
        <div className="mt-8">
          <PendingGroupInvites invites={groupInvites} />
        </div>
      ) : null}

      {user && company ? (
        <div className="mt-4 flex flex-col gap-4">
          {analytics ? (
            <AnalyticsCard analytics={analytics} plan={company.plan} />
          ) : null}
          {verification ? (
            <VerificationCard
              verification={verification}
              website={website}
              ownerEmail={user.email ?? ""}
              token={verifyToken}
              companySlug={company.slug}
              siteUrl={siteUrl}
            />
          ) : null}
          <AvailabilityToggle acceptingClients={company.acceptingClients} />
          <DashboardInquiries
            inquiries={inquiryData.inquiries}
            newCount={inquiryData.newCount}
            monthCount={inquiryData.monthCount}
          />
          <PrivateFeedbackCard items={privateFeedback} />
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
