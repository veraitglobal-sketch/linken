import Link from "next/link";
import { WorkspaceCard, WorkspacePage } from "@/components/dashboard/workspace-page";
import { DeveloperClients } from "@/components/developer/developer-clients";
import { DeveloperEarnings } from "@/components/developer/developer-earnings";
import { DeveloperGapList } from "@/components/developer/developer-gap-list";
import { DeveloperReferralLink } from "@/components/developer/developer-referral-link";
import type { CommissionTotals } from "@/features/commissions/queries";
import type { ReferredClientRow } from "@/features/commissions/types";

type Props = {
  companySlug: string;
  referralUrl: string;
  siteUrl: string;
  totals: CommissionTotals;
  clients: ReferredClientRow[];
};

export function DeveloperDashboard({
  companySlug,
  referralUrl,
  siteUrl,
  totals,
  clients,
}: Props) {
  const paying = clients.filter((c) => c.plan !== "free");
  const free = clients.filter((c) => c.plan === "free");

  return (
    <WorkspacePage
      title="Developer partners"
      description="10% of every paid invoice from companies you referred."
      wide
    >
      <div className="mx-auto max-w-3xl space-y-8">
        <DeveloperEarnings totals={totals} />
        <DeveloperReferralLink url={referralUrl} />
        <DeveloperClients clients={paying} siteUrl={siteUrl} />
        <DeveloperGapList clients={free} siteUrl={siteUrl} />
        {clients.length === 0 ? (
          <WorkspaceCard>
            <div className="py-6 text-center sm:py-8">
              <p className="text-[14px] font-medium text-ink">
                No referred companies yet
              </p>
              <p className="mx-auto mt-2 max-w-sm text-[12px] leading-relaxed text-muted">
                Share your referral link. When someone creates a company from
                it, they appear here.
              </p>
              <Link
                href={`/c/${companySlug}`}
                className="mt-5 inline-flex h-9 items-center rounded-full border border-line/80 bg-paper px-4 text-[12px] font-semibold text-ink transition-colors hover:bg-surface"
              >
                Open your profile
              </Link>
            </div>
          </WorkspaceCard>
        ) : null}
      </div>
    </WorkspacePage>
  );
}
