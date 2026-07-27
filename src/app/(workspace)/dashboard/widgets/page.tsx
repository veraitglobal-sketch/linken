import type { Metadata } from "next";
import Link from "next/link";
import { WorkspacePage } from "@/components/dashboard/workspace-page";
import { SwitchCompanyNotice } from "@/components/dashboard/switch-company-notice";
import { WidgetAnalyticsSection } from "@/components/widgets/widget-analytics-section";
import { LogoWallStudio } from "@/components/widgets/logo-wall-studio";
import { PlacementStudioControls } from "@/components/widgets/placement-studio-controls";
import { TestimonialsStudio } from "@/components/widgets/testimonials-studio";
import { WidgetsStudio } from "@/components/widgets/widgets-studio";
import { countPublishedTestimonials, getTestimonialsStudioEntries } from "@/features/testimonials/queries";
import { getClientAssessmentSummary } from "@/features/assessments/queries";
import { getEntitlements, parsePlan } from "@/features/plan/entitlements";
import { getReferencesForCompany } from "@/features/references/queries";
import { countConfirmedCases } from "@/features/widgets/case-gallery";
import { getLogoWallConfirmedCandidates } from "@/features/widgets/logo-wall";
import { parseWidgetSettings } from "@/features/widgets/settings";
import { assertCompanySection } from "@/features/workspace/company-gate";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Widgets",
};

export default async function DashboardWidgetsPage() {
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

  const [assessment, references, wallCandidates, settingsRes, confirmedCases, publishedTestimonials] =
    await Promise.all([
      getClientAssessmentSummary(company.id),
      getReferencesForCompany(company.id),
      getLogoWallConfirmedCandidates(company.id),
      (async () => {
        const { createClient } = await import("@/lib/supabase/server");
        const supabase = await createClient();
        return supabase
          .from("companies")
          .select("widget_settings")
          .eq("id", company.id)
          .maybeSingle();
      })(),
      countConfirmedCases(company.id),
      countPublishedTestimonials(company.id),
    ]);

  const confirmedRefs = references.filter((r) => r.status === "confirmed");
  const isPro = getEntitlements(company.plan).premiumEmbeds;
  const hasProof = confirmedRefs.length > 0;
  const domainReady = Boolean(company.verified && company.website?.trim());
  const hasWall = wallCandidates.length > 0;
  const settings = parseWidgetSettings(settingsRes.data?.widget_settings);
  const wallSettings = settings.logoWall;
  const placements = settings.placements;
  const testimonialSettings = settings.testimonials;
  const testimonialEntries = await getTestimonialsStudioEntries(
    company.id,
    settingsRes.data?.widget_settings,
  );

  const availability = {
    "footer-strip": true,
    "partners-rotate": hasWall,
    "case-gallery": confirmedCases > 0,
    testimonials: publishedTestimonials > 0,
    verified: true,
    micro: true,
    horizontal: true,
    starter: true,
    score: hasProof,
    "trust-card": true,
    credentials: true,
    signature: true,
    references: confirmedRefs.length > 0,
    assessment: assessment.wouldWorkAgainTotal >= 3,
    "logo-wall": hasWall,
    "case-stamp": false,
  };

  return (
    <WorkspacePage
      title="Widgets"
      description="Embeds by placement — footer, partners, cases, and proof bars."
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
      <div className="space-y-8">
        <WidgetAnalyticsSection
          companyId={company.id}
          website={company.website}
          plan={parsePlan(company.plan)}
        />
        <LogoWallStudio
          entries={wallCandidates}
          background={wallSettings.background}
          limit={wallSettings.limit}
          motion={wallSettings.motion}
          size={wallSettings.size}
        />
        <TestimonialsStudio
          entries={testimonialEntries}
          layout={testimonialSettings.layout}
          limit={testimonialSettings.limit}
          theme={testimonialSettings.theme}
        />
        <PlacementStudioControls
          footerLimit={placements.footer.limit}
          partnersMotion={placements.partners.motion}
          partnersSize={placements.partners.size}
          partnersLimit={placements.partners.limit}
          casesLimit={placements.cases.limit}
        />
        <WidgetsStudio
          siteUrl={siteUrl}
          slug={company.slug}
          isPro={isPro}
          domainReady={domainReady}
          availability={availability}
        />
      </div>
    </WorkspacePage>
  );
}
