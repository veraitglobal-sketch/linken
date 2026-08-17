import type { Metadata } from "next";
import Link from "next/link";
import { SwitchCompanyNotice } from "@/components/dashboard/switch-company-notice";
import { WorkspacePage } from "@/components/dashboard/workspace-page";
import { TestimonialInviteForm } from "@/components/widgets/testimonial-invite-form";
import { TestimonialPendingList } from "@/components/widgets/testimonial-pending-list";
import { TestimonialsEmbedPanel } from "@/components/widgets/testimonials-embed-panel";
import { TestimonialsStudio } from "@/components/widgets/testimonials-studio";
import { WIDGET_CATALOG } from "@/features/widgets/catalog";
import { getSiteUrl } from "@/lib/site";
import { getPendingTestimonialInvites } from "@/features/testimonials/pending-queries";
import {
  countPublishedTestimonials,
  getTestimonialsStudioEntries,
} from "@/features/testimonials/queries";
import { parseWidgetSettings } from "@/features/widgets/settings";
import { assertCompanySection } from "@/features/workspace/company-gate";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Testimonials",
};

export default async function DashboardTestimonialsPage() {
  const { user, company, needsCompanySwitch } =
    await assertCompanySection("widgets");

  if (needsCompanySwitch) {
    return <SwitchCompanyNotice title="Testimonials" />;
  }

  if (!user) {
    return (
      <WorkspacePage
        title="Testimonials"
        description="Client-written words on your Hansala profile."
      >
        <p className="text-[14px] text-muted">
          <Link
            href="/login?next=/dashboard/testimonials"
            className="font-semibold text-ink underline-offset-2 hover:underline"
          >
            Sign in
          </Link>{" "}
          to manage testimonials.
        </p>
      </WorkspacePage>
    );
  }

  if (!company) {
    return (
      <WorkspacePage
        title="Testimonials"
        description="Client-written words on your Hansala profile."
      >
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
  const { data: row } = await supabase
    .from("companies")
    .select("widget_settings")
    .eq("id", company.id)
    .maybeSingle();

  const settings = parseWidgetSettings(row?.widget_settings);
  const testimonialSettings = settings.testimonials;
  /* Same derivation as the widgets gallery — a second rule here would drift. */
  const domainReady = Boolean(company.verified && company.website?.trim());
  const testimonialsWidget = WIDGET_CATALOG.find((w) => w.id === "testimonials");
  const [entries, publishedCount, pending] = await Promise.all([
    getTestimonialsStudioEntries(company.id, row?.widget_settings),
    countPublishedTestimonials(company.id),
    getPendingTestimonialInvites(company.id),
  ]);

  return (
    <WorkspacePage
      title="Testimonials"
      description="Client-written words — you cannot edit their text. They appear on your profile and in embeds after clients publish."
      wide
      action={
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/c/${company.slug}#testimonials`}
            className="inline-flex h-9 items-center rounded-full border border-line bg-surface px-3.5 text-[11px] font-semibold text-ink transition-colors hover:bg-paper"
          >
            View on profile
          </Link>
          <Link
            href="/dashboard/widgets"
            className="inline-flex h-9 items-center rounded-full border border-line bg-surface px-3.5 text-[11px] font-semibold text-ink transition-colors hover:bg-paper"
          >
            Embed code
          </Link>
        </div>
      }
    >
      {/* Ordered by what someone came here to do: see the thing, tune it, take
          the code — then arrange, then chase more. The embed used to be a link
          off to `/dashboard/widgets`, which meant leaving the list you were in
          the middle of ordering. With nothing published yet the order inverts:
          there is no widget to show, so the invite is the page. */}
      <div className="space-y-6">
        {publishedCount > 0 && testimonialsWidget ? (
          <TestimonialsEmbedPanel
            widget={testimonialsWidget}
            siteUrl={getSiteUrl()}
            slug={company.slug}
            isPro={company.plan === "pro"}
            domainReady={domainReady}
          />
        ) : (
          <div className="rounded-2xl border border-line bg-surface px-5 py-4 text-[13px] leading-relaxed text-ink-soft">
            <p>
              Testimonials are written by the other side. Invite someone below,
              or collect them after a confirmed partnership, case study, or
              reference — attached confirms score higher than standalone
              invites.
            </p>
            {/* Absence is not a negative finding — nothing here says unverified
                or missing, only that the widget has nothing to render yet. */}
            <p className="mt-2 text-muted">
              Nothing published yet, so there is no widget to show. The embed
              appears here as soon as your first client publishes.
            </p>
          </div>
        )}

        <TestimonialsStudio
          entries={entries}
          layout={testimonialSettings.layout}
          limit={testimonialSettings.limit}
          theme={testimonialSettings.theme}
        />
        <TestimonialInviteForm />
        <TestimonialPendingList rows={pending} />
      </div>
    </WorkspacePage>
  );
}
