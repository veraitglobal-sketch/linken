import type { Metadata } from "next";
import Link from "next/link";
import { WorkspacePage } from "@/components/dashboard/workspace-page";
import { SwitchCompanyNotice } from "@/components/dashboard/switch-company-notice";
import { LogoOptOutCard } from "@/components/widgets/logo-opt-out-card";
import { WidgetsFlash } from "@/components/widgets/widgets-flash";
import { WidgetsStudio } from "@/components/widgets/widgets-studio";
import { getClientAssessmentSummary } from "@/features/assessments/queries";
import { getEntitlements } from "@/features/plan/entitlements";
import { getReferencesForCompany } from "@/features/references/queries";
import { assertCompanySection } from "@/features/workspace/company-gate";
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
  const { user, company, needsCompanySwitch } =
    await assertCompanySection("widgets");
  const siteUrl = getSiteUrl();

  if (needsCompanySwitch) {
    return <SwitchCompanyNotice title="Widgets" />;
  }

  if (!user) {
    return (
      <WorkspacePage title="Widgets" description="Embed Hansala on your website.">
        <p className="text-[14px] text-muted">
          <Link
            href="/login?next=/dashboard/widgets"
            className="font-semibold text-ink underline-offset-2 hover:underline"
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
      <WorkspacePage title="Widgets" description="Embed Hansala on your website.">
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

  const availability = {
    compact: true,
    badge: true,
    references: confirmedRefs.length > 0,
    assessment: assessment.wouldWorkAgainTotal >= 3,
    "logo-wall": logoConfirmed.length > 0,
  };

  return (
    <WorkspacePage
      title="Widgets"
      description="Pick an embed, tune it, copy the iframe to your site."
      wide
      action={
        <Link
          href={`/c/${company.slug}`}
          className="inline-flex h-9 items-center rounded-full border border-line bg-surface px-3.5 text-[11px] font-semibold text-ink transition-colors hover:bg-paper"
        >
          Public profile
        </Link>
      }
    >
      <div className="space-y-10">
        {(error || logoOpt || wallSaved || wallInvited || resent) && (
          <div className="space-y-2.5">
            {error ? <WidgetsFlash tone="error">{error}</WidgetsFlash> : null}
            {logoOpt ? (
              <WidgetsFlash>
                {logoOpt === "on"
                  ? "Partners may show your logo in their Logo wall widgets."
                  : "Partners will show your company name as text (no logo) in Logo wall widgets."}
              </WidgetsFlash>
            ) : null}
            {wallSaved ? (
              <WidgetsFlash>
                Logo wall selection saved — public widget updated.
              </WidgetsFlash>
            ) : null}
            {wallInvited ? (
              <WidgetsFlash>
                Invite sent for{" "}
                <span className="font-semibold">{wallInvited}</span>. They
                appear on the wall only after they accept.
              </WidgetsFlash>
            ) : null}
            {resent ? <WidgetsFlash>Invite email resent.</WidgetsFlash> : null}
          </div>
        )}

        <WidgetsStudio
          siteUrl={siteUrl}
          slug={company.slug}
          isPro={isPro}
          logoWallConfirmed={logoConfirmed}
          logoWallPending={logoPending}
          logoWallExcludedIds={wallSettings.logoWall.excludedCompanyIds}
          availability={availability}
        />

        <LogoOptOutCard allowed={allowLogo} />
      </div>
    </WorkspacePage>
  );
}
