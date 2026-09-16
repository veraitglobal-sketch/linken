import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveCategoryWrite, resolveCountryWrite } from "@/features/categories/apply";
import { recordCategoryUnmatched } from "@/features/categories/unmatched";
import {
  COMPANY_PATCH_ALLOWLIST,
  type CompanyPatchField,
  updateCompanyProfileCore,
} from "@/features/company/core";

export type CoreResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const AGENT_EXTRA_FIELDS = ["name", "category", "slug"] as const;
export type AgentCompanyPatchField =
  | CompanyPatchField
  | (typeof AGENT_EXTRA_FIELDS)[number];

export async function updateCompanyAgentCore(
  supabase: SupabaseClient,
  companyId: string,
  body: Record<string, unknown>,
): Promise<CoreResult<{ updated: AgentCompanyPatchField[]; slug?: string }>> {
  const extra: Record<string, unknown> = {};
  const base: Record<string, unknown> = {};
  const updated: AgentCompanyPatchField[] = [];

  for (const [key, value] of Object.entries(body)) {
    if ((AGENT_EXTRA_FIELDS as readonly string[]).includes(key)) {
      extra[key] = value;
    } else if ((COMPANY_PATCH_ALLOWLIST as readonly string[]).includes(key)) {
      base[key] = value;
    } else {
      return {
        ok: false,
        error: `Field(s) not allowed: ${key}. Allowed: ${[...COMPANY_PATCH_ALLOWLIST, ...AGENT_EXTRA_FIELDS].join(", ")}.`,
      };
    }
  }

  let countryCode: string | null | undefined;
  if ("country" in base && typeof base.country === "string") {
    const geo = resolveCountryWrite("", base.country);
    base.country = geo.country;
    countryCode = geo.country_code;
  }

  if (Object.keys(base).length > 0) {
    const baseResult = await updateCompanyProfileCore(supabase, companyId, base);
    if (!baseResult.ok) return baseResult;
    updated.push(...baseResult.data.updated);
    if (countryCode !== undefined) {
      const { error } = await supabase
        .from("companies")
        .update({ country_code: countryCode })
        .eq("id", companyId);
      if (error) return { ok: false, error: error.message };
    }
  }

  if ("name" in extra) {
    const name = String(extra.name ?? "").trim();
    if (!name || name.length > 120) {
      return { ok: false, error: "name is required (max 120 characters)." };
    }
    const { error } = await supabase
      .from("companies")
      .update({ name })
      .eq("id", companyId);
    if (error) return { ok: false, error: error.message };
    updated.push("name");
  }

  if ("category" in extra) {
    const cat = resolveCategoryWrite(String(extra.category ?? ""));
    const { error } = await supabase
      .from("companies")
      .update({ category: cat.category, category_slug: cat.category_slug })
      .eq("id", companyId);
    if (error) return { ok: false, error: error.message };
    if (cat.unmatched) void recordCategoryUnmatched(cat.category);
    updated.push("category");
  }

  let newSlug: string | undefined;
  if ("slug" in extra) {
    const slugRaw = String(extra.slug ?? "").trim().toLowerCase();
    if (!slugRaw) return { ok: false, error: "slug cannot be empty." };
    const { data, error } = await supabase.rpc("update_company_slug", {
      p_company_id: companyId,
      p_new_slug: slugRaw,
    });
    if (error) return { ok: false, error: error.message };
    newSlug = String(data);
    updated.push("slug");
  }

  if (updated.length === 0) {
    return { ok: false, error: "No allowed fields to update." };
  }

  if ("category" in extra || countryCode !== undefined) {
    void import("@/features/ranking/refresh").then(({ refreshRank }) =>
      refreshRank(companyId),
    );
  }

  return { ok: true, data: { updated, slug: newSlug } };
}
