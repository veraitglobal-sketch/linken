import { GettingStartedCard } from "@/components/activation/getting-started-card";
import { HomeCompleteness } from "@/components/dashboard/home/home-completeness";
import { HomePerformance } from "@/components/dashboard/home/home-performance";
import { HomePrimaryCard } from "@/components/dashboard/home/home-primary-card";
import { HomeQuickLinks } from "@/components/dashboard/home/home-quick-links";
import { HomeSetupBanner } from "@/components/dashboard/home/home-setup-banner";
import { HomeStatsRow } from "@/components/dashboard/home/home-stats-row";
import { HomeTips } from "@/components/dashboard/home/home-tips";
import type { DashboardHomeModel } from "@/features/dashboard/home-data";

type Props = {
  companyId: string;
  companySlug: string;
  model: DashboardHomeModel;
  showSetupBanner: boolean;
};

export function HomeBoard({
  companyId,
  companySlug,
  model,
  showSetupBanner,
}: Props) {
  return (
    <div className="space-y-5">
      {showSetupBanner && model.checklist && !model.checklist.complete ? (
        <HomeSetupBanner
          companyId={companyId}
          nextLabel={model.checklist.next?.label ?? null}
        />
      ) : null}

      <HomePrimaryCard action={model.primary} companyId={companyId} />

      <HomeStatsRow
        pendingOutgoing={model.pendingOutgoing}
        pendingIncoming={model.pendingIncoming}
        confirmedRefs={model.confirmedRefs}
        confirmedPartners={model.confirmedPartners}
        caseCount={model.caseCount}
        companySlug={companySlug}
      />

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          {model.checklist && !model.checklist.complete ? (
            <GettingStartedCard checklist={model.checklist} />
          ) : null}
          <HomeCompleteness data={model.completeness} />
          <HomeTips kind={model.kind} />
        </div>
        <div className="space-y-5">
          <HomePerformance analytics={model.analytics} isPro={model.isPro} />
          <HomeQuickLinks
            companyId={companyId}
            companySlug={companySlug}
            showDeveloperLinks={model.showDeveloperLinks}
            proofShared={model.proofShared}
          />
        </div>
      </div>
    </div>
  );
}
