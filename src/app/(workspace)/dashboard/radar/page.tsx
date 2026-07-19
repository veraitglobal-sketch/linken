import type { Metadata } from "next";
import Link from "next/link";
import { WorkspacePage } from "@/components/dashboard/workspace-page";
import { RadarBoard } from "@/components/project-requests/radar-board";
import { getAnalytics } from "@/features/analytics/queries";
import { getDashboardSession } from "@/features/dashboard/session";
import { getEntitlements } from "@/features/plan/entitlements";
import {
  getCreditBalance,
  listMyRequestResponses,
  listOpenRequests,
} from "@/features/project-requests/queries";

export const metadata: Metadata = {
  title: "Radar",
};

type Props = {
  searchParams: Promise<{
    error?: string;
    responded?: string;
  }>;
};

export default async function DashboardRadarPage({ searchParams }: Props) {
  const { error, responded } = await searchParams;
  const { user, company } = await getDashboardSession();

  if (!user) {
    return (
      <p className="py-10 text-[14px] text-ink-soft">
        <Link href="/login?next=/dashboard/radar" className="font-semibold underline">
          Sign in
        </Link>{" "}
        to open Radar.
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

  const entitlements = getEntitlements(company.plan, { radar: company.radar });
  const radarEnabled = entitlements.radarCredits;

  const [openRequests, history, balance, analytics] = await Promise.all([
    listOpenRequests(company.category, company.city),
    radarEnabled ? listMyRequestResponses() : Promise.resolve([]),
    radarEnabled ? getCreditBalance(company.id) : Promise.resolve(0),
    getAnalytics(company.id, 30),
  ]);

  const respondedIds = new Set(history.map((h) => h.requestId));

  return (
    <WorkspacePage
      title="Radar"
      description="Matching project requests and demand signals. Profile inquiries stay free — credits apply only here."
    >
      <RadarBoard
        openRequests={openRequests}
        history={history}
        balance={balance}
        verified={Boolean(company.verified)}
        radarEnabled={radarEnabled}
        analytics={analytics}
        respondedIds={respondedIds}
        error={error}
        responded={responded === "1"}
      />
    </WorkspacePage>
  );
}
