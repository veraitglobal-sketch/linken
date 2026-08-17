import type { ReactNode } from "react";
import { EmbedCaseGallery } from "@/components/embed/embed-case-gallery";
import { EmbedFooterStrip } from "@/components/embed/embed-footer-strip";
import { EmbedLogoWallGrid } from "@/components/embed/embed-logo-wall-grid";
import { EmbedPartnersRotate } from "@/components/embed/embed-partners-rotate";
import { EmbedTestimonials } from "@/components/embed/embed-testimonials";
import {
  TESTIMONIAL_LAYOUTS,
  type TestimonialLayout,
} from "@/features/testimonials/settings";
import { EmbedProLockedNote } from "@/components/embed/embed-pro-locked-note";
import type { EmbedTheme } from "@/components/embed/embed-theme";
import { getCaseGalleryEntries } from "@/features/widgets/case-gallery";
import {
  getSelectedTestimonials,
  toPublicTestimonials,
} from "@/features/testimonials/queries";
import { resolveLogoWallPresentation } from "@/features/widgets/logo-wall-background";
import { getLogoWallEntries } from "@/features/widgets/logo-wall";
import { parseWidgetSettings } from "@/features/widgets/settings";
import { wrapEmbed } from "@/features/widgets/wrap-embed";
import type { Company } from "@/types/company";
import { getSiteUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

type Resolve = { variant: string; locked: boolean };

async function loadWidgetSettings(companyId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("companies")
    .select("widget_settings")
    .eq("id", companyId)
    .maybeSingle();
  return parseWidgetSettings(data?.widget_settings);
}

/** Logo wall + placement embeds that need partner/case data. */
export async function renderPlacementEmbed(input: {
  company: Company;
  theme: EmbedTheme;
  variant: string;
  w?: string;
  resolved: Resolve;
  viaHost?: string | null;
  confirmedCount?: number;
  /** Testimonials only: the shape this placement declared in its own URL. */
  layoutOverride?: string;
}): Promise<ReactNode | null> {
  const { company, theme, variant, w, resolved, viaHost, layoutOverride } = input;
  const siteUrl = getSiteUrl();
  const profileUrl = `${siteUrl}/c/${company.slug}?src=embed`;

  if (variant === "logo-wall") {
    const settings = (await loadWidgetSettings(company.id)).logoWall;
    const presentation = resolveLogoWallPresentation(settings.background, theme);
    const entries = await getLogoWallEntries(company.id, {
      applySelection: true,
    });
    const node = (
      <>
        <EmbedLogoWallGrid
          ownerProfileUrl={profileUrl}
          ownerCompanyId={company.id}
          viaHost={viaHost}
          entries={entries}
          theme={presentation.theme}
          siteUrl={siteUrl}
          motion={settings.motion}
          size={settings.size}
        />
        {resolved.locked ? (
          <EmbedProLockedNote
            name={company.name}
            profileUrl={profileUrl}
            theme={presentation.theme}
          />
        ) : null}
      </>
    );
    return wrapEmbed(node, presentation.theme, w, {
      center: false,
      wrapBackground: presentation.wrapBackground,
      bare: presentation.bare,
    });
  }

  if (variant === "footer-strip") {
    const settings = await loadWidgetSettings(company.id);
    const all = await getLogoWallEntries(company.id, { applySelection: true });
    const entries = all.slice(0, settings.placements.footer.limit);
    const node = (
      <>
        <EmbedFooterStrip
          ownerProfileUrl={profileUrl}
          ownerCompanyId={company.id}
          viaHost={viaHost}
          entries={entries}
          theme={theme}
          siteUrl={siteUrl}
          confirmedCount={input.confirmedCount ?? entries.length}
        />
        {resolved.locked ? (
          <EmbedProLockedNote
            name={company.name}
            profileUrl={profileUrl}
            theme={theme}
          />
        ) : null}
      </>
    );
    return wrapEmbed(node, theme, w, { transparent: true });
  }

  if (variant === "partners-rotate") {
    const settings = await loadWidgetSettings(company.id);
    const p = settings.placements.partners;
    const all = await getLogoWallEntries(company.id, { applySelection: true });
    const entries = all.slice(0, p.limit);
    const node = (
      <>
        <EmbedPartnersRotate
          ownerCompanyId={company.id}
          viaHost={viaHost}
          entries={entries}
          theme={theme}
          siteUrl={siteUrl}
          motion={p.motion}
          size={p.size}
          profileUrl={profileUrl}
        />
        {resolved.locked ? (
          <EmbedProLockedNote
            name={company.name}
            profileUrl={profileUrl}
            theme={theme}
          />
        ) : null}
      </>
    );
    return wrapEmbed(node, theme, w, { transparent: true });
  }

  if (variant === "case-gallery") {
    const entries = await getCaseGalleryEntries(company.id);
    const node = (
      <>
        <EmbedCaseGallery
          companySlug={company.slug}
          siteUrl={siteUrl}
          entries={entries}
          theme={theme}
          profileUrl={profileUrl}
        />
        {resolved.locked ? (
          <EmbedProLockedNote
            name={company.name}
            profileUrl={profileUrl}
            theme={theme}
          />
        ) : null}
      </>
    );
    return wrapEmbed(node, theme, w, { transparent: true });
  }

  if (variant === "testimonials") {
    const settings = await loadWidgetSettings(company.id);
    const rows = await getSelectedTestimonials(company.id, settings);
    const items = await toPublicTestimonials(rows, company.slug);
    /* The placement's own shape wins when it names a real one, so a company can
       run a wall and a strip side by side.
       Checked against the list rather than passed through `parseTestimonialLayout`
       alone: that helper answers "grid" for anything it does not recognise, so a
       mistyped or stale URL would quietly replace the owner's chosen layout with
       a grid. Falling back to the saved setting is the honest failure. */
    const override = TESTIMONIAL_LAYOUTS.includes(layoutOverride as TestimonialLayout)
      ? (layoutOverride as TestimonialLayout)
      : null;
    const layout = override ?? settings.testimonials.layout;
    const node = (
      <>
        <EmbedTestimonials
          items={items}
          layout={layout}
          theme={settings.testimonials.theme}
          themeParam={theme}
          profileUrl={profileUrl}
          companyName={company.name}
        />
        {resolved.locked ? (
          <EmbedProLockedNote
            name={company.name}
            profileUrl={profileUrl}
            theme={theme}
          />
        ) : null}
      </>
    );
    return wrapEmbed(node, theme, w, { transparent: true });
  }

  return null;
}

export function isPlacementVariant(variant: string): boolean {
  return (
    variant === "logo-wall" ||
    variant === "footer-strip" ||
    variant === "partners-rotate" ||
    variant === "case-gallery" ||
    variant === "testimonials"
  );
}
