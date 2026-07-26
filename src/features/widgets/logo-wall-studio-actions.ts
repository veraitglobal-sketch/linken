"use server";

import { revalidatePath } from "next/cache";
import {
  mergeLogoWallBackground,
  mergeLogoWallExcluded,
  mergeLogoWallLimit,
  mergeLogoWallMotion,
  mergeLogoWallOrder,
  mergeLogoWallOverride,
  mergeLogoWallSize,
} from "@/features/widgets/settings-merge";
import { parseWidgetSettings } from "@/features/widgets/settings";
import type { LogoMotion, LogoSize } from "@/features/widgets/logo-motion";
import { getLogoWallConfirmedCandidates } from "@/features/widgets/logo-wall";
import { getOperatorActiveCompany } from "@/features/workspace/require-operator";

async function requireStudio() {
  return getOperatorActiveCompany();
}

function revalidateWall(slug: string) {
  revalidatePath("/dashboard/widgets");
  revalidatePath(`/embed/${slug}`);
}

export async function saveLogoWallSelection(formData: FormData) {
  const included = formData.getAll("included_id").map(String).filter(Boolean);
  const allIds = formData.getAll("candidate_id").map(String).filter(Boolean);
  const { supabase, user, company } = await requireStudio();
  if (!user || !company) return { ok: false as const, error: "Not signed in." };

  const includedSet = new Set(included);
  const excludedCompanyIds = allIds.filter((id) => !includedSet.has(id));
  const next = mergeLogoWallExcluded(
    company.widget_settings,
    excludedCompanyIds,
  );
  const { error } = await supabase
    .from("companies")
    .update({ widget_settings: next })
    .eq("id", company.id);
  if (error) return { ok: false as const, error: error.message };
  revalidateWall(company.slug);
  return { ok: true as const };
}

export async function saveLogoWallOrder(order: string[]) {
  const { supabase, user, company } = await requireStudio();
  if (!user || !company) return { ok: false as const, error: "Not signed in." };
  const candidates = await getLogoWallConfirmedCandidates(company.id);
  const allowed = new Set(candidates.map((c) => c.id));
  const clean = order.filter((id) => allowed.has(id));
  const next = mergeLogoWallOrder(company.widget_settings, clean);
  const { error } = await supabase
    .from("companies")
    .update({ widget_settings: next })
    .eq("id", company.id);
  if (error) return { ok: false as const, error: error.message };
  revalidateWall(company.slug);
  return { ok: true as const };
}

export async function saveLogoWallBackground(background: string) {
  const { supabase, user, company } = await requireStudio();
  if (!user || !company) return { ok: false as const, error: "Not signed in." };
  const next = mergeLogoWallBackground(company.widget_settings, background);
  const { error } = await supabase
    .from("companies")
    .update({ widget_settings: next })
    .eq("id", company.id);
  if (error) return { ok: false as const, error: error.message };
  revalidateWall(company.slug);
  return { ok: true as const };
}

export async function saveLogoWallLimit(limit: number) {
  const { supabase, user, company } = await requireStudio();
  if (!user || !company) return { ok: false as const, error: "Not signed in." };
  const next = mergeLogoWallLimit(company.widget_settings, limit);
  const { error } = await supabase
    .from("companies")
    .update({ widget_settings: next })
    .eq("id", company.id);
  if (error) return { ok: false as const, error: error.message };
  revalidateWall(company.slug);
  return { ok: true as const };
}

export async function saveLogoWallMotion(motion: LogoMotion) {
  const { supabase, user, company } = await requireStudio();
  if (!user || !company) return { ok: false as const, error: "Not signed in." };
  const next = mergeLogoWallMotion(company.widget_settings, motion);
  const { error } = await supabase
    .from("companies")
    .update({ widget_settings: next })
    .eq("id", company.id);
  if (error) return { ok: false as const, error: error.message };
  revalidateWall(company.slug);
  return { ok: true as const };
}

export async function saveLogoWallSize(size: LogoSize) {
  const { supabase, user, company } = await requireStudio();
  if (!user || !company) return { ok: false as const, error: "Not signed in." };
  const next = mergeLogoWallSize(company.widget_settings, size);
  const { error } = await supabase
    .from("companies")
    .update({ widget_settings: next })
    .eq("id", company.id);
  if (error) return { ok: false as const, error: error.message };
  revalidateWall(company.slug);
  return { ok: true as const };
}

export async function toggleLogoWallIncluded(
  partnerId: string,
  included: boolean,
) {
  const { supabase, user, company } = await requireStudio();
  if (!user || !company) return { ok: false as const, error: "Not signed in." };
  const settings = parseWidgetSettings(company.widget_settings);
  const excluded = new Set(settings.logoWall.excludedCompanyIds);
  if (included) excluded.delete(partnerId);
  else excluded.add(partnerId);
  const next = mergeLogoWallExcluded(company.widget_settings, [...excluded]);
  const { error } = await supabase
    .from("companies")
    .update({ widget_settings: next })
    .eq("id", company.id);
  if (error) return { ok: false as const, error: error.message };
  revalidateWall(company.slug);
  return { ok: true as const };
}

export async function saveLogoWallAdjust(
  partnerId: string,
  patch: {
    scale?: number;
    padding?: number;
    grayscale?: boolean;
    invertOnDark?: boolean;
  },
) {
  const { supabase, user, company } = await requireStudio();
  if (!user || !company) return { ok: false as const, error: "Not signed in." };
  const next = mergeLogoWallOverride(company.widget_settings, partnerId, patch);
  const { error } = await supabase
    .from("companies")
    .update({ widget_settings: next })
    .eq("id", company.id);
  if (error) return { ok: false as const, error: error.message };
  revalidateWall(company.slug);
  return { ok: true as const };
}

export async function clearLogoWallOverride(partnerId: string) {
  const { supabase, user, company } = await requireStudio();
  if (!user || !company) return { ok: false as const, error: "Not signed in." };
  const next = mergeLogoWallOverride(company.widget_settings, partnerId, null);
  const { error } = await supabase
    .from("companies")
    .update({ widget_settings: next })
    .eq("id", company.id);
  if (error) return { ok: false as const, error: error.message };
  revalidateWall(company.slug);
  return { ok: true as const };
}
