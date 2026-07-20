"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getOperatorActiveCompany } from "@/features/workspace/require-operator";
import type { ApiTrustLevelKey } from "@/types/radar-leads";

const MAX_SAVED_SEARCHES = 5;
const RADAR = "/dashboard/radar";

async function requireOperatorCompany() {
  return getOperatorActiveCompany();
}

function parseMinLevel(raw: string): ApiTrustLevelKey | null {
  const v = raw.trim().toLowerCase();
  if (
    v === "member" ||
    v === "established" ||
    v === "trusted" ||
    v === "pillar"
  ) {
    return v;
  }
  return null;
}

function emptyToNull(value: string): string | null {
  const t = value.trim();
  return t ? t : null;
}

export async function createSavedSearch(formData: FormData) {
  const { supabase, user, company } = await requireOperatorCompany();
  if (!user) redirect(`/login?next=${encodeURIComponent(RADAR)}`);
  if (!company) redirect("/onboarding");
  if (!company.radar) {
    redirect(`${RADAR}?error=${encodeURIComponent("Radar — coming soon.")}`);
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    redirect(`${RADAR}?tab=leads&error=${encodeURIComponent("Name is required.")}`);
  }

  const { count } = await supabase
    .from("saved_searches")
    .select("id", { count: "exact", head: true })
    .eq("company_id", company.id);

  if ((count ?? 0) >= MAX_SAVED_SEARCHES) {
    redirect(
      `${RADAR}?tab=leads&error=${encodeURIComponent("Maximum 5 saved searches.")}`,
    );
  }

  const { data: created, error } = await supabase
    .from("saved_searches")
    .insert({
      company_id: company.id,
      name,
      category: emptyToNull(String(formData.get("category") ?? "")),
      country: emptyToNull(String(formData.get("country") ?? "")),
      city: emptyToNull(String(formData.get("city") ?? "")),
      min_trust_level: parseMinLevel(String(formData.get("min_trust_level") ?? "")),
      only_verified: formData.has("only_verified"),
      only_accepting: formData.has("only_accepting"),
    })
    .select("id")
    .single();

  if (error || !created) {
    redirect(
      `${RADAR}?tab=leads&error=${encodeURIComponent(error?.message ?? "Could not save search.")}`,
    );
  }

  const { error: backfillError } = await supabase.rpc(
    "backfill_saved_search_feed",
    { p_search_id: created.id },
  );
  if (backfillError) {
    console.error("backfill_saved_search_feed:", backfillError.message);
  }

  revalidatePath(RADAR);
  redirect(`${RADAR}?tab=leads&searchSaved=1`);
}

export async function deleteSavedSearch(formData: FormData) {
  const { supabase, user, company } = await requireOperatorCompany();
  if (!user) redirect(`/login?next=${encodeURIComponent(RADAR)}`);
  if (!company) redirect("/onboarding");

  const id = String(formData.get("search_id") ?? "").trim();
  if (!id) redirect(RADAR);

  const { error } = await supabase
    .from("saved_searches")
    .delete()
    .eq("id", id)
    .eq("company_id", company.id);

  if (error) {
    redirect(
      `${RADAR}?tab=leads&error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(RADAR);
  redirect(`${RADAR}?tab=leads&searchDeleted=1`);
}

export async function dismissCompanyLead(formData: FormData) {
  const { supabase, user, company } = await requireOperatorCompany();
  if (!user) redirect(`/login?next=${encodeURIComponent(RADAR)}`);
  if (!company) redirect("/onboarding");

  const id = Number(formData.get("feed_id"));
  if (!Number.isFinite(id) || id <= 0) redirect(`${RADAR}?tab=leads`);

  const { error } = await supabase
    .from("radar_feed_items")
    .update({ seen_at: new Date().toISOString() })
    .eq("id", id)
    .eq("company_id", company.id);

  if (error) {
    redirect(
      `${RADAR}?tab=leads&error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(RADAR);
  redirect(`${RADAR}?tab=leads`);
}
