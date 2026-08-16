import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { WorkspacePage } from "@/components/dashboard/workspace-page";
import { SwitchCompanyNotice } from "@/components/dashboard/switch-company-notice";
import { DeveloperDashboard } from "@/components/developer/developer-dashboard";
import {
  companyHasReferrals,
  getCommissionTotals,
  getReferredClients,
} from "@/features/commissions/queries";
import { getCommissionMonthSeries } from "@/features/commissions/series";
import { buildPartnerReferralUrl } from "@/features/growth/partner-referral-url";
import { assertCompanyWorkspace } from "@/features/workspace/company-gate";
import { isDeveloperPartnerKind } from "@/features/workspace/partner-mode";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = { title: "Earnings" };

export default async function DeveloperPartnersPage() {
  const { user, company, needsCompanySwitch } = await assertCompanyWorkspace();

  if (!user) {
    redirect("/developers/partners");
  }

  if (needsCompanySwitch) {
    return <SwitchCompanyNotice title="Earnings" />;
  }

  if (!company) {
    return (
      <WorkspacePage title="Earnings">
        <p className="text-[14px] text-muted">
          <Link
            href="/onboarding?kind=developer_partner"
            className="font-semibold text-ink underline"
          >
            Join as a developer partner
          </Link>{" "}
          to open your Earnings book.
        </p>
      </WorkspacePage>
    );
  }

  const partner = isDeveloperPartnerKind(company.organizationKind);
  const hasBook = await companyHasReferrals(company.id);
  if (!partner && !hasBook) redirect("/dashboard");

  const siteUrl = getSiteUrl();
  const referralUrl =
    buildPartnerReferralUrl(siteUrl, company.slug) ??
    `${siteUrl}/onboarding?ref=${company.slug}`;

  const [totals, clients, series] = await Promise.all([
    getCommissionTotals(company.id),
    getReferredClients(company.id),
    getCommissionMonthSeries(company.id),
  ]);

  return (
    <DeveloperDashboard
      companySlug={company.slug}
      companyName={company.name}
      verified={company.verified}
      referralUrl={referralUrl}
      siteUrl={siteUrl}
      totals={totals}
      series={series}
      clients={clients}
    />
  );
}
