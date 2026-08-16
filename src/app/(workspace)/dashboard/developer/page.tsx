import type { Metadata } from "next";
import Link from "next/link";
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
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Earnings" };

export default async function DeveloperPartnersPage() {
  const { user, company, needsCompanySwitch } = await assertCompanyWorkspace();

  if (needsCompanySwitch) {
    return <SwitchCompanyNotice title="Earnings" />;
  }

  if (!user) {
    return (
      <WorkspacePage title="Earnings">
        <Link
          href="/login?next=/dashboard/developer"
          className="font-semibold text-ink underline"
        >
          Sign in
        </Link>
      </WorkspacePage>
    );
  }

  if (!company) {
    return (
      <WorkspacePage title="Earnings">
        <Link href="/onboarding" className="font-semibold text-ink underline">
          Create your company
        </Link>
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
      referralUrl={referralUrl}
      siteUrl={siteUrl}
      totals={totals}
      series={series}
      clients={clients}
    />
  );
}
