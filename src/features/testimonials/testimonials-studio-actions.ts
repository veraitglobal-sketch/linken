"use server";

import { revalidatePath } from "next/cache";
import {
  mergeTestimonialsExcluded,
  mergeTestimonialsLayout,
  mergeTestimonialsLimit,
  mergeTestimonialsOrder,
} from "@/features/testimonials/testimonials-merge";
import type { TestimonialLayout } from "@/features/testimonials/settings";
import { parseWidgetSettings } from "@/features/widgets/settings";
import { getOperatorActiveCompany } from "@/features/workspace/require-operator";

async function requireStudio() {
  return getOperatorActiveCompany();
}

function revalidateTestimonials(slug: string) {
  revalidatePath("/dashboard/widgets");
  revalidatePath(`/embed/${slug}`);
}

export async function saveTestimonialOrder(order: string[]) {
  const { supabase, user, company } = await requireStudio();
  if (!user || !company) return { ok: false as const, error: "Not signed in." };
  const next = mergeTestimonialsOrder(company.widget_settings, order);
  const { error } = await supabase
    .from("companies")
    .update({ widget_settings: next })
    .eq("id", company.id);
  if (error) return { ok: false as const, error: error.message };
  revalidateTestimonials(company.slug);
  return { ok: true as const };
}

export async function toggleTestimonialIncluded(id: string, included: boolean) {
  const { supabase, user, company } = await requireStudio();
  if (!user || !company) return { ok: false as const, error: "Not signed in." };
  const settings = parseWidgetSettings(company.widget_settings);
  const excluded = new Set(settings.testimonials.excludedIds);
  if (included) excluded.delete(id);
  else excluded.add(id);
  const next = mergeTestimonialsExcluded(company.widget_settings, [...excluded]);
  const { error } = await supabase
    .from("companies")
    .update({ widget_settings: next })
    .eq("id", company.id);
  if (error) return { ok: false as const, error: error.message };
  revalidateTestimonials(company.slug);
  return { ok: true as const };
}

export async function saveTestimonialLayout(layout: TestimonialLayout) {
  const { supabase, user, company } = await requireStudio();
  if (!user || !company) return { ok: false as const, error: "Not signed in." };
  const next = mergeTestimonialsLayout(company.widget_settings, layout);
  const { error } = await supabase
    .from("companies")
    .update({ widget_settings: next })
    .eq("id", company.id);
  if (error) return { ok: false as const, error: error.message };
  revalidateTestimonials(company.slug);
  return { ok: true as const };
}

export async function saveTestimonialLimit(limit: number) {
  const { supabase, user, company } = await requireStudio();
  if (!user || !company) return { ok: false as const, error: "Not signed in." };
  const next = mergeTestimonialsLimit(company.widget_settings, limit);
  const { error } = await supabase
    .from("companies")
    .update({ widget_settings: next })
    .eq("id", company.id);
  if (error) return { ok: false as const, error: error.message };
  revalidateTestimonials(company.slug);
  return { ok: true as const };
}
