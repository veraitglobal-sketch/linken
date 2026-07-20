import type { Metadata } from "next";
import Link from "next/link";
import { WorkspacePage } from "@/components/dashboard/workspace-page";
import { LogoOptOutCard } from "@/components/widgets/logo-opt-out-card";
import { WidgetsStudio } from "@/components/widgets/widgets-studio";
import { getClientAssessmentSummary } from "@/features/assessments/queries";
import { SwitchCompanyNotice } from "@/components/dashboard/switch-company-notice";
import { getEntitlements } from "@/features/plan/entitlements";
import { assertCompanySection } from "@/features/workspace/company-gate";
import { getReferencesForCompany } from "@/features/references/queries";
import {
  getLogoWallConfirmedCandidates,
  getLogoWallPendingInvites,
} from "@/features/widgets/logo-wall";
import { parseWidgetSettings } from "@/features/widgets/settings";
import { getSiteUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Widgets",
};

type Props = {
  searchParams: Promise<{
    error?: string;
    logoOpt?: string;
    wallSaved?: string;
    wallInvited?: string;
    resent?: string;
  }>;
};

export default async function DashboardWidgetsPage({ searchParams }: Props) {
  const { error, logoOpt, wallSaved, wallInvited, resent } = await searchParams;
  const { user, company, needsCompanySwitch } = await assertCompanySection("widgets");
  const siteUrl = getSiteUrl();

  if (needsCompanySwitch) {
    return <SwitchCompanyNotice title="Widgets" />;
  }

  if (!user) {
    return (
      <WorkspacePage
        title="Widgets"
        description="Embed Linken on your website."
      >
        <p className="text-sm text-[#64748b]">
          <Link
            href="/login?next=/dashboard/widgets"
            className="font-semibold underline"
          >
            Sign in
          </Link>{" "}
          to configure website widgets.
        </p>
      </WorkspacePage>
    );
  }

  if (!company) {
    return (
      <WorkspacePage
        title="Widgets"
        description="Embed Linken on your website."
      >
        <p className="text-sm text-[#64748b]">
          <Link href="/onboarding" className="font-semibold underline">
            Create your company
          </Link>{" "}
          first.
        </p>
      </WorkspacePage>
    );
  }

  const supabase = await createClient();
  const [assessment, references, logoConfirmed, logoPending, optRes] =
    await Promise.all([
      getClientAssessmentSummary(company.id),
      getReferencesForCompany(company.id),
      getLogoWallConfirmedCandidates(company.id),
      getLogoWallPendingInvites(company.id),
      supabase
        .from("companies")
        .select("allow_logo_in_partner_widgets, plan, widget_settings")
        .eq("id", company.id)
        .maybeSingle(),
    ]);
  const optRow = optRes.data;
  const confirmedRefs = references.filter((r) => r.status === "confirmed");
  const isPro = getEntitlements(optRow?.plan ?? company.plan).logoWallWidget;
  const allowLogo = optRow?.allow_logo_in_partner_widgets !== false;
  const wallSettings = parseWidgetSettings(optRow?.widget_settings);

  return (
    <WorkspacePage
      title="Widgets"
      description="Choose how Linken appears on your website — configure theme and size, then copy the iframe."
      wide
    >
      <div className="space-y-5">
        {error ? (
          <p className="rounded-xl border border-ember/35 bg-ember/10 px-4 py-3 text-sm text-ink">
            {error}
          </p>
        ) : null}
        {logoOpt ? (
          <p className="rounded-xl border border-[#e2e8f0] bg-white px-4 py-3 text-sm text-ink">
            {logoOpt === "on"
              ? "Partners may show your logo in their Logo wall widgets."
              : "Partners will show your company name as text (no logo) in Logo wall widgets."}
          </p>
        ) : null}
        {wallSaved ? (
          <p className="rounded-xl border border-[#e2e8f0] bg-white px-4 py-3 text-sm text-ink">
            Logo wall selection saved — public widget updated.
          </p>
        ) : null}
        {wallInvited ? (
          <p className="rounded-xl border border-[#e2e8f0] bg-white px-4 py-3 text-sm text-ink">
            Invite sent for{" "}
            <span className="font-semibold">{wallInvited}</span>. They appear
            on the wall only after they accept.
          </p>
        ) : null}
        {resent ? (
          <p className="rounded-xl border border-[#e2e8f0] bg-white px-4 py-3 text-sm text-ink">
            Invite email resent.
          </p>
        ) : null}

        <LogoOptOutCard allowed={allowLogo} />

        <WidgetsStudio
          siteUrl={siteUrl}
          slug={company.slug}
          isPro={isPro}
          logoWallConfirmed={logoConfirmed}
          logoWallPending={logoPending}
          logoWallExcludedIds={wallSettings.logoWall.excludedCompanyIds}
          availability={{
            compact: true,
            badge: true,
            references: confirmedRefs.length > 0,
            assessment: assessment.wouldWorkAgainTotal >= 3,
            "logo-wall": logoConfirmed.length > 0,
          }}
        />
      </div>
    </WorkspacePage>
  );
}
