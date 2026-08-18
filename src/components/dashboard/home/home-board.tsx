import { GettingStartedCard } from "@/components/activation/getting-started-card";
import { HomeCompleteness } from "@/components/dashboard/home/home-completeness";
import { HomePerformance } from "@/components/dashboard/home/home-performance";
import { HomePrimaryCard } from "@/components/dashboard/home/home-primary-card";
import { HomeQuickLinks } from "@/components/dashboard/home/home-quick-links";
import { HomeStatsRow } from "@/components/dashboard/home/home-stats-row";
import { HomeTips } from "@/components/dashboard/home/home-tips";
import type { DashboardHomeModel } from "@/features/dashboard/home-data";

type Props = {
  companyId: string;
  companySlug: string;
  model: DashboardHomeModel;
};

export function HomeBoard({
  companyId,
  companySlug,
  model,
}: Props) {
  return (
    <div className="space-y-5">
      <HomePrimaryCard action={model.primary} companyId={companyId} />
      <HomeStatsRow
        pendingOutgoing={model.pendingOutgoing}
        pendingIncoming={model.pendingIncoming}
        confirmedRefs={model.confirmedRefs}
        confirmedPartners={model.confirmedPartners}
        caseCount={model.caseCount}
        companySlug={companySlug}
      />
      {model.checklist && !model.checklist.complete ? (
        <GettingStartedCard checklist={model.checklist} />
      ) : null}
      <div className="grid items-stretch gap-5 sm:grid-cols-2">
        <HomeCompleteness data={model.completeness} />
        <HomePerformance analytics={model.analytics} isPro={model.isPro} />
        <HomeQuickLinks
          companyId={companyId}
          companySlug={companySlug}
          showDeveloperLinks={model.showDeveloperLinks}
          proofShared={model.proofShared}
        />
        <HomeTips kind={model.kind} />
      </div>
    </div>
  );
}
