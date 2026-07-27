"use server";

import { revalidatePath } from "next/cache";
import { extractDomain } from "@/features/verification/domain";
import { fetchCompanyResource } from "@/features/verification/safe-fetch";
import { extractSiteThemeFromHtml } from "@/features/testimonials/theme/match-site";
import type { TestimonialThemeTokens } from "@/features/testimonials/theme/presets";
import { parseTestimonialTheme } from "@/features/testimonials/theme/parse";
import {
  mergeTestimonialsTheme,
} from "@/features/testimonials/testimonials-merge";
import { getOperatorActiveCompany } from "@/features/workspace/require-operator";

function revalidate(slug: string) {
  revalidatePath("/dashboard/widgets");
  revalidatePath(`/embed/${slug}`);
}

export async function saveTestimonialPreset(
  preset: TestimonialThemeTokens["preset"],
) {
  const { supabase, user, company } = await getOperatorActiveCompany();
  if (!user || !company) return { ok: false as const, error: "Not signed in." };
  const next = mergeTestimonialsTheme(company.widget_settings, preset);
  const { error } = await supabase
    .from("companies")
    .update({ widget_settings: next })
    .eq("id", company.id);
  if (error) return { ok: false as const, error: error.message };
  revalidate(company.slug);
  return { ok: true as const };
}

export async function saveTestimonialThemeTokens(
  patch: Partial<TestimonialThemeTokens>,
) {
  const { supabase, user, company } = await getOperatorActiveCompany();
  if (!user || !company) return { ok: false as const, error: "Not signed in." };
  const next = mergeTestimonialsTheme(company.widget_settings, patch);
  const { error } = await supabase
    .from("companies")
    .update({ widget_settings: next })
    .eq("id", company.id);
  if (error) return { ok: false as const, error: error.message };
  revalidate(company.slug);
  return { ok: true as const };
}

export async function matchTestimonialSiteTheme(): Promise<
  | { ok: true; preview: TestimonialThemeTokens }
  | { ok: false; error: string }
> {
  const { supabase, user, company } = await getOperatorActiveCompany();
  if (!user || !company) return { ok: false, error: "Not signed in." };

  const domain = extractDomain(company.website ?? "");
  if (!domain) {
    return { ok: false, error: "Add and verify your website domain first." };
  }

  const { data: allowed, error: rateError } = await supabase.rpc(
    "record_logo_refresh_attempt",
    { p_company_id: company.id },
  );
  if (rateError) return { ok: false, error: rateError.message };
  if (!allowed) {
    return { ok: false, error: "Daily site fetch limit reached. Try again tomorrow." };
  }

  const fetched = await fetchCompanyResource(domain, "/");
  if (!fetched.ok) return { ok: false, error: fetched.error };

  const html = new TextDecoder().decode(fetched.body).slice(0, 500_000);
  const extracted = extractSiteThemeFromHtml(html);
  const ws =
    company.widget_settings &&
    typeof company.widget_settings === "object" &&
    !Array.isArray(company.widget_settings)
      ? (company.widget_settings as Record<string, unknown>)
      : {};
  const tm =
    ws.testimonials && typeof ws.testimonials === "object" && !Array.isArray(ws.testimonials)
      ? (ws.testimonials as Record<string, unknown>)
      : {};
  const current = parseTestimonialTheme(tm.theme);
  const preview = parseTestimonialTheme({ ...current, ...extracted });
  return { ok: true, preview };
}

export async function applyMatchedTestimonialTheme(
  preview: TestimonialThemeTokens,
) {
  const { supabase, user, company } = await getOperatorActiveCompany();
  if (!user || !company) return { ok: false as const, error: "Not signed in." };
  const next = mergeTestimonialsTheme(company.widget_settings, preview);
  const { error } = await supabase
    .from("companies")
    .update({ widget_settings: next })
    .eq("id", company.id);
  if (error) return { ok: false as const, error: error.message };
  revalidate(company.slug);
  return { ok: true as const };
}
