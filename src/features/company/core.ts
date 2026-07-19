import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export type CoreFail = { ok: false; error: string };
export type CoreOk<T> = { ok: true; data: T };
export type CoreResult<T> = CoreOk<T> | CoreFail;

/** Explicit allowlist — verified/plan/slug/claimed etc. are never writable via Agent API. */
export const COMPANY_PATCH_ALLOWLIST = [
  "tagline",
  "description",
  "services",
  "city",
  "country",
  "website",
  "accepting_clients",
  "linkedin_url",
  "facebook_url",
] as const;

export type CompanyPatchField = (typeof COMPANY_PATCH_ALLOWLIST)[number];

export type CompanyPatchInput = Partial<{
  tagline: string;
  description: string;
  services: string[];
  city: string;
  country: string;
  website: string;
  accepting_clients: boolean;
  linkedin_url: string | null;
  facebook_url: string | null;
}>;

export async function updateCompanyProfileCore(
  supabase: SupabaseClient,
  companyId: string,
  body: Record<string, unknown>,
): Promise<CoreResult<{ updated: CompanyPatchField[] }>> {
  const rejected = Object.keys(body).filter(
    (k) => !(COMPANY_PATCH_ALLOWLIST as readonly string[]).includes(k),
  );
  if (rejected.length > 0) {
    return {
      ok: false,
      error: `Field(s) not allowed: ${rejected.join(", ")}. Allowed: ${COMPANY_PATCH_ALLOWLIST.join(", ")}.`,
    };
  }

  const patch: Record<string, unknown> = {};
  const updated: CompanyPatchField[] = [];

  for (const key of COMPANY_PATCH_ALLOWLIST) {
    if (!(key in body)) continue;
    const value = body[key];

    if (key === "services") {
      if (!Array.isArray(value)) {
        return { ok: false, error: "services must be an array of strings." };
      }
      patch.services = value.map((s) => String(s).trim()).filter(Boolean);
      updated.push(key);
      continue;
    }

    if (key === "accepting_clients") {
      if (typeof value !== "boolean") {
        return { ok: false, error: "accepting_clients must be a boolean." };
      }
      patch.accepting_clients = value;
      updated.push(key);
      continue;
    }

    if (key === "linkedin_url" || key === "facebook_url") {
      if (value !== null && typeof value !== "string") {
        return { ok: false, error: `${key} must be a string or null.` };
      }
      patch[key] = value === null ? null : String(value).trim() || null;
      updated.push(key);
      continue;
    }

    if (typeof value !== "string") {
      return { ok: false, error: `${key} must be a string.` };
    }
    patch[key] = value.trim();
    updated.push(key);
  }

  if (updated.length === 0) {
    return { ok: false, error: "No allowed fields to update." };
  }

  const { error } = await supabase
    .from("companies")
    .update(patch)
    .eq("id", companyId);

  if (error) return { ok: false, error: error.message };
  return { ok: true, data: { updated } };
}
