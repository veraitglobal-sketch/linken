import type { Metadata } from "next";
import Link from "next/link";
import { WorkspacePage } from "@/components/dashboard/workspace-page";
import { SwitchCompanyNotice } from "@/components/dashboard/switch-company-notice";
import { RadarSearch } from "@/components/intros/radar-search";
import { RadarBoard } from "@/components/project-requests/radar-board";
import { RadarPageFlashes } from "@/components/radar/radar-page-flashes";
import { RadarTabs } from "@/components/radar/radar-tabs";
import { CompanyLeadsFeed } from "@/components/radar-leads/company-leads-feed";
import { SavedSearchesPanel } from "@/components/radar-leads/saved-searches-panel";
import { getAnalytics } from "@/features/analytics/queries";
import { searchRadarCompanies } from "@/features/intros/search";
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
import { parseRadarFilters } from "@/features/radar-leads/parse-filters";
import { assertCompanySection } from "@/features/workspace/company-gate";
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
  const { user, company, needsCompanySwitch } =
    await assertCompanySection("radar");

  if (needsCompanySwitch) {
    return <SwitchCompanyNotice title="Radar" />;
  }

  if (!user) {
    return (
      <WorkspacePage title="Radar" description="Leads, requests, and intros.">
        <p className="text-[14px] text-muted">
          <Link
            href="/login?next=/dashboard/radar"
            className="font-semibold text-ink underline-offset-2 hover:underline"
          >
            Sign in
          </Link>{" "}
          to open Radar.
        </p>
      </WorkspacePage>
    );
  }

  if (!company) {
    return (
      <WorkspacePage title="Radar" description="Leads, requests, and intros.">
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

  const entitlements = getEntitlements(company.plan, { radar: company.radar });
  const radarEnabled = entitlements.radarCredits;
  const introSuspended = isTimestampInFuture(company.introSuspendedUntil);
  const tab = sp.tab === "requests" ? "requests" : "leads";
  const { filters, acceptingClients, trustLevel } = parseRadarFilters(sp);

  const [openRequests, history, balance, analytics, hits, leads, searches] =
    await Promise.all([
      listOpenRequests(company.category, company.city),
      radarEnabled ? listMyRequestResponses() : Promise.resolve([]),
      radarEnabled ? getCreditBalance(company.id) : Promise.resolve(0),
      getAnalytics(company.id, 30),
      searchRadarCompanies({
        category: filters.category,
        country: filters.country,
        city: filters.city,
        level: trustLevel,
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
      description="Company leads and project requests. Profile inquiries stay free in Inbox."
      action={
        <Link
          href="/dashboard/inbox?tab=intros"
          className="inline-flex h-9 items-center rounded-full border border-line bg-surface px-3.5 text-[11px] font-semibold text-ink transition-colors hover:bg-paper"
        >
          Intros inbox
        </Link>
      }
    >
      <div className="space-y-8">
        <RadarPageFlashes
          params={{
            error: sp.error,
            introSent: sp.introSent,
            searchSaved: sp.searchSaved,
            searchDeleted: sp.searchDeleted,
          }}
        />

        {radarEnabled ? (
          <RadarTabs
            active={tab}
            leadsCount={leads.length}
            requestsCount={openRequests.length}
          />
        ) : null}

        {tab === "leads" || !radarEnabled ? (
          <div className="space-y-10">
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
            <RadarSearch
              hits={hits}
              filters={filters}
              radarEnabled={radarEnabled}
              verified={Boolean(company.verified)}
              balance={balance}
              introSuspended={introSuspended}
            />
          </div>
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
      </div>
    </WorkspacePage>
  );
}
