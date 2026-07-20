import type { Metadata } from "next";
import Link from "next/link";
import { WorkspacePage } from "@/components/dashboard/workspace-page";
import { RadarSearch } from "@/components/intros/radar-search";
import { RadarBoard } from "@/components/project-requests/radar-board";
import { CompanyLeadsFeed } from "@/components/radar-leads/company-leads-feed";
import { SavedSearchesPanel } from "@/components/radar-leads/saved-searches-panel";
import { getAnalytics } from "@/features/analytics/queries";
import { SwitchCompanyNotice } from "@/components/dashboard/switch-company-notice";
import { searchRadarCompanies } from "@/features/intros/search";
import { assertCompanySection } from "@/features/workspace/company-gate";
import { getEntitlements } from "@/features/plan/entitlements";
import {
  getCreditBalance,
  listMyRequestResponses,
  listOpenRequests,
} from "@/features/project-requests/queries";
import {
  listCompanyLeads,
  listSavedSearches,
} from "@/features/radar-leads/queries";
import type { TrustLevel } from "@/features/trust/score";
import { cn } from "@/lib/cn";
import { isTimestampInFuture } from "@/lib/time";

export const metadata: Metadata = {
  title: "Radar",
};

type Props = {
  searchParams: Promise<{
    error?: string;
    responded?: string;
    introSent?: string;
    searchSaved?: string;
    searchDeleted?: string;
    tab?: string;
    category?: string;
    country?: string;
    city?: string;
    level?: string;
    accepting?: string;
  }>;
};

export default async function DashboardRadarPage({ searchParams }: Props) {
  const sp = await searchParams;
  const { user, company, needsCompanySwitch } = await assertCompanySection("radar");

  if (needsCompanySwitch) {
    return <SwitchCompanyNotice title="Radar" />;
  }

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
  const introSuspended = isTimestampInFuture(company.introSuspendedUntil);
  const tab = sp.tab === "requests" ? "requests" : "leads";
  const filters = {
    category: sp.category?.trim() ?? "",
    country: sp.country?.trim() ?? "",
    city: sp.city?.trim() ?? "",
    level: sp.level?.trim() ?? "",
    accepting: sp.accepting?.trim() ?? "",
  };
  const acceptingClients =
    filters.accepting === "1"
      ? true
      : filters.accepting === "0"
        ? false
        : null;

  const [
    openRequests,
    history,
    balance,
    analytics,
    hits,
    leads,
    searches,
  ] = await Promise.all([
    listOpenRequests(company.category, company.city),
    radarEnabled ? listMyRequestResponses() : Promise.resolve([]),
    radarEnabled ? getCreditBalance(company.id) : Promise.resolve(0),
    getAnalytics(company.id, 30),
    searchRadarCompanies({
      category: filters.category,
      country: filters.country,
      city: filters.city,
      level: (filters.level as TrustLevel) || "",
      acceptingClients,
      excludeCompanyId: company.id,
    }),
    radarEnabled
      ? listCompanyLeads(company.id, { unseenOnly: true })
      : Promise.resolve([]),
    radarEnabled ? listSavedSearches(company.id) : Promise.resolve([]),
  ]);

  return (
    <WorkspacePage
      title="Radar"
      description="Company leads, project requests, and intros. Profile inquiries stay free."
    >
      {sp.error ? (
        <p className="mb-5 rounded-xl border border-ember/35 bg-ember/10 px-4 py-3 text-sm">
          {sp.error}
        </p>
      ) : null}
      {sp.introSent === "1" ? (
        <p className="mb-5 rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink-soft">
          Intro sent via Linken Radar (2 credits).
        </p>
      ) : null}
      {sp.searchSaved === "1" ? (
        <p className="mb-5 rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink-soft">
          Search saved. Matching firms are in Company leads.
        </p>
      ) : null}
      {sp.searchDeleted === "1" ? (
        <p className="mb-5 rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink-soft">
          Saved search deleted.
        </p>
      ) : null}

      {radarEnabled ? (
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href="/dashboard/radar?tab=leads"
            className={cn(
              "inline-flex h-9 items-center rounded-full border px-4 text-[13px] font-semibold",
              tab === "leads"
                ? "border-ink bg-ink text-white"
                : "border-line bg-white text-ink-soft hover:text-ink",
            )}
          >
            Company leads
            {leads.length > 0 ? (
              <span className="ml-1.5 tabular-nums opacity-80">
                {leads.length}
              </span>
            ) : null}
          </Link>
          <Link
            href="/dashboard/radar?tab=requests"
            className={cn(
              "inline-flex h-9 items-center rounded-full border px-4 text-[13px] font-semibold",
              tab === "requests"
                ? "border-ink bg-ink text-white"
                : "border-line bg-white text-ink-soft hover:text-ink",
            )}
          >
            Project requests
            {openRequests.length > 0 ? (
              <span className="ml-1.5 tabular-nums opacity-80">
                {openRequests.length}
              </span>
            ) : null}
          </Link>
        </div>
      ) : null}

      <div className="space-y-12">
        {tab === "leads" || !radarEnabled ? (
          <>
            <CompanyLeadsFeed
              leads={leads}
              searchesCount={searches.length}
              radarEnabled={radarEnabled}
              verified={Boolean(company.verified)}
              balance={balance}
              introSuspended={introSuspended}
            />
            <SavedSearchesPanel
              searches={searches}
              radarEnabled={radarEnabled}
            />
            {!radarEnabled ? (
              <RadarBoard
                openRequests={openRequests}
                history={history}
                balance={balance}
                verified={Boolean(company.verified)}
                radarEnabled={false}
                analytics={analytics}
                respondedIds={new Set(history.map((h) => h.requestId))}
              />
            ) : null}
          </>
        ) : (
          <RadarBoard
            openRequests={openRequests}
            history={history}
            balance={balance}
            verified={Boolean(company.verified)}
            radarEnabled={radarEnabled}
            analytics={analytics}
            respondedIds={new Set(history.map((h) => h.requestId))}
            responded={sp.responded === "1"}
          />
        )}

        <RadarSearch
          hits={hits}
          filters={filters}
          radarEnabled={radarEnabled}
          verified={Boolean(company.verified)}
          balance={balance}
          introSuspended={introSuspended}
        />
      </div>
    </WorkspacePage>
  );
}
