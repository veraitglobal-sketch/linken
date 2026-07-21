import { RadarSearch } from "@/components/intros/radar-search";
import { RadarBoard } from "@/components/project-requests/radar-board";
import { RadarCreditsBar } from "@/components/radar/radar-credits-bar";
import { CompanyLeadsFeed } from "@/components/radar-leads/company-leads-feed";
import { SavedSearchesPanel } from "@/components/radar-leads/saved-searches-panel";
import type { AnalyticsSummary } from "@/features/analytics/queries";
import type { RadarCompanyHit } from "@/types/intro";
import type {
  MyRequestResponse,
  OpenProjectRequest,
} from "@/types/project-request";
import type { RadarCompanyLead, SavedSearch } from "@/types/radar-leads";

type Filters = {
  category: string;
  country: string;
  city: string;
  level: string;
  accepting: string;
};

type Props = {
  tab: "leads" | "requests";
  radarEnabled: boolean;
  verified: boolean;
  balance: number;
  introSuspended: boolean;
  leads: RadarCompanyLead[];
  searches: SavedSearch[];
  hits: RadarCompanyHit[];
  filters: Filters;
  openRequests: OpenProjectRequest[];
  history: MyRequestResponse[];
  analytics: AnalyticsSummary;
  responded?: boolean;
};

export function RadarPageBody({
  tab,
  radarEnabled,
  verified,
  balance,
  introSuspended,
  leads,
  searches,
  hits,
  filters,
  openRequests,
  history,
  analytics,
  responded,
}: Props) {
  const respondedIds = new Set(history.map((h) => h.requestId));

  if (tab === "leads" || !radarEnabled) {
    return (
      <div className="space-y-10">
        {radarEnabled ? (
          <RadarCreditsBar balance={balance} verified={verified} />
        ) : null}
        <CompanyLeadsFeed
          leads={leads}
          searchesCount={searches.length}
          radarEnabled={radarEnabled}
          verified={verified}
          balance={balance}
          introSuspended={introSuspended}
        />
        <SavedSearchesPanel searches={searches} radarEnabled={radarEnabled} />
        <RadarSearch
          hits={hits}
          filters={filters}
          radarEnabled={radarEnabled}
          verified={verified}
          balance={balance}
          introSuspended={introSuspended}
        />
        {!radarEnabled ? (
          <RadarBoard
            openRequests={openRequests}
            history={history}
            balance={balance}
            verified={verified}
            radarEnabled={false}
            analytics={analytics}
            respondedIds={respondedIds}
            hideCredits
          />
        ) : null}
      </div>
    );
  }

  return (
    <RadarBoard
      openRequests={openRequests}
      history={history}
      balance={balance}
      verified={verified}
      radarEnabled={radarEnabled}
      analytics={analytics}
      respondedIds={respondedIds}
      responded={responded}
    />
  );
}
