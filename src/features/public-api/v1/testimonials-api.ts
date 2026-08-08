import "server-only";

import { getCompanyForPage } from "@/features/companies/queries";
import type { ApiTestimonialsResponse } from "@/features/public-api/v1/types";
import { serializeTestimonials } from "@/features/public-api/v1/serializers";
import {
  defaultPublicTheme,
  toPublicTheme,
  type PublicThemePayload,
} from "@/features/public-api/v1/testimonial-theme";
import {
  getPublishedTestimonials,
  selectTestimonialsByStudio,
  toPublicTestimonials,
} from "@/features/testimonials/queries";
import {
  parseTestimonialsSettings,
  type TestimonialLayout,
} from "@/features/testimonials/settings";
import {
  TESTIMONIAL_PRESETS,
  type TestimonialPreset,
} from "@/features/testimonials/theme/presets";
import { themeTokensFromPreset } from "@/features/testimonials/theme/parse";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site";

export type PublicTestimonialsApiBody = ApiTestimonialsResponse & {
  company: { name: string; slug: string; profile_url: string };
  layout: TestimonialLayout;
  theme: PublicThemePayload;
  attribution: { label: string; url: string };
  embed: { iframe_url: string; script_url: string };
};

/** Host-site public API — studio order/exclude/limit + theme. */
export async function getPublicTestimonialsForSites(
  slug: string,
  opts?: { preset?: string | null; limit?: number | null },
): Promise<PublicTestimonialsApiBody | null> {
  const company = await getCompanyForPage(slug);
  if (!company) return null;

  const siteUrl = getSiteUrl();
  const profileUrl = `${siteUrl}/c/${company.slug}`;
  if (company.claimed === false) {
    return emptyBody(company.name, company.slug, profileUrl, siteUrl);
  }

  const supabase = await createClient();
  const { data: settingsRow } = await supabase
    .from("companies")
    .select("widget_settings")
    .eq("id", company.id)
    .maybeSingle();

  const settings = parseTestimonialsSettings(
    (settingsRow?.widget_settings as Record<string, unknown> | null)
      ?.testimonials,
  );

  const preset = parsePreset(opts?.preset ?? null);
  const themeTokens = preset ? themeTokensFromPreset(preset) : settings.theme;
  const limit = Math.min(50, Math.max(1, opts?.limit ?? settings.limit ?? 12));

  const rows = await getPublishedTestimonials(company.id, supabase);
  const publicRows = await toPublicTestimonials(rows, company.slug, supabase);
  const sliced = selectTestimonialsByStudio(publicRows, {
    order: settings.order,
    excludedIds: settings.excludedIds,
    limit,
  });

  return {
    ...serializeTestimonials(sliced),
    company: { name: company.name, slug: company.slug, profile_url: profileUrl },
    layout: settings.layout,
    theme: toPublicTheme(themeTokens),
    attribution: {
      label: "Verified on Hansala",
      url: `${profileUrl}?src=testimonial_api`,
    },
    embed: {
      iframe_url: `${siteUrl}/embed/${company.slug}?variant=testimonials`,
      script_url: `${siteUrl}/hs-testimonials.js?v=2`,
    },
  };
}

function parsePreset(raw: string | null): TestimonialPreset | null {
  if (!raw) return null;
  return TESTIMONIAL_PRESETS.includes(raw as TestimonialPreset)
    ? (raw as TestimonialPreset)
    : null;
}

function emptyBody(
  name: string,
  slug: string,
  profileUrl: string,
  siteUrl: string,
): PublicTestimonialsApiBody {
  return {
    testimonials: [],
    count: 0,
    company: { name, slug, profile_url: profileUrl },
    layout: "grid",
    theme: defaultPublicTheme(),
    attribution: { label: "Verified on Hansala", url: profileUrl },
    embed: {
      iframe_url: `${siteUrl}/embed/${slug}?variant=testimonials`,
      script_url: `${siteUrl}/hs-testimonials.js?v=2`,
    },
  };
}
