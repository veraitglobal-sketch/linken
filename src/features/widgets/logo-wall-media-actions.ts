"use server";

import { revalidatePath } from "next/cache";
import {
  discoverLogoCandidatesForWebsite,
  downloadLogoCandidate,
} from "@/features/logo/discover-candidates";
import {
  getLogoWallConfirmedCandidates,
  type LogoWallEntry,
} from "@/features/widgets/logo-wall";
import {
  applyPartnerWallLogoFromDownload,
  applyPartnerWallLogoOverride,
} from "@/features/widgets/wall-override-apply";
import {
  getOperatorActiveCompany,
  type OperatorCompanyRow,
} from "@/features/workspace/require-operator";
import { createAdminClient } from "@/lib/supabase/admin";
import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

type StudioGate = {
  ok: true;
  supabase: SupabaseClient;
  user: User;
  company: OperatorCompanyRow;
  partner: LogoWallEntry;
};

async function requirePartnerOnWall(
  partnerId: string,
): Promise<StudioGate | { ok: false; error: string }> {
  const ctx = await getOperatorActiveCompany();
  if (!ctx.user || !ctx.company) {
    return { ok: false, error: "Not signed in." };
  }
  const candidates = await getLogoWallConfirmedCandidates(ctx.company.id);
  const partner = candidates.find((c) => c.id === partnerId);
  if (!partner) {
    return { ok: false, error: "Partner is not on your wall." };
  }
  return {
    ok: true,
    supabase: ctx.supabase,
    user: ctx.user,
    company: ctx.company,
    partner,
  };
}

function revalidateWall(slug: string) {
  revalidatePath("/dashboard/widgets");
  revalidatePath(`/embed/${slug}`);
}

export async function updatePartnerWebsiteForWall(
  partnerId: string,
  website: string,
) {
  const gate = await requirePartnerOnWall(partnerId);
  if (!gate.ok) return gate;

  const admin = createAdminClient();
  if (!admin) {
    return { ok: false as const, error: "Service role key required." };
  }

  const { data: row } = await admin
    .from("companies")
    .select("id, claimed, created_by_company_id, website")
    .eq("id", partnerId)
    .maybeSingle();
  if (!row) return { ok: false as const, error: "Company not found." };

  const canEdit =
    row.claimed === false ||
    row.created_by_company_id === gate.company.id ||
    !(row.website as string | null)?.trim();
  if (!canEdit) {
    return {
      ok: false as const,
      error: "This firm manages its own website on Hansala.",
    };
  }

  const { error } = await admin
    .from("companies")
    .update({ website: website.trim() || null })
    .eq("id", partnerId);
  if (error) return { ok: false as const, error: error.message };

  revalidateWall(gate.company.slug);
  return { ok: true as const };
}

export async function discoverWallLogoCandidates(partnerId: string) {
  const gate = await requirePartnerOnWall(partnerId);
  if (!gate.ok) return gate;
  if (!gate.partner.website?.trim()) {
    return { ok: false as const, error: "Add a website first." };
  }
  const result = await discoverLogoCandidatesForWebsite(gate.partner.website);
  if (!result.ok) return result;
  return { ok: true as const, candidates: result.candidates };
}

export async function applyWallLogoCandidate(
  partnerId: string,
  candidateUrl: string,
) {
  const gate = await requirePartnerOnWall(partnerId);
  if (!gate.ok) return gate;
  if (!gate.partner.website?.trim()) {
    return { ok: false as const, error: "Add a website first." };
  }

  const admin = createAdminClient();
  if (!admin) {
    return { ok: false as const, error: "Service role key required." };
  }

  const downloaded = await downloadLogoCandidate(candidateUrl);
  if (!downloaded.ok) return downloaded;

  const stored = await applyPartnerWallLogoFromDownload(admin, {
    ownerCompanyId: gate.company.id,
    ownerName: gate.company.name,
    ownerSlug: gate.company.slug,
    partnerCompanyId: partnerId,
    partnerName: gate.partner.name,
    currentSettings: gate.company.widget_settings,
    image: downloaded.image,
    ext: downloaded.ext,
    uploadType: downloaded.uploadType,
  });
  if (!stored.ok) return stored;

  revalidateWall(gate.company.slug);
  return { ok: true as const, logoUrl: stored.data.logo_url };
}

export async function uploadWallOverrideLogo(
  partnerId: string,
  formData: FormData,
) {
  const gate = await requirePartnerOnWall(partnerId);
  if (!gate.ok) return gate;

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false as const, error: "Choose an image file." };
  }

  const admin = createAdminClient();
  if (!admin) {
    return { ok: false as const, error: "Service role key required." };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const stored = await applyPartnerWallLogoOverride(admin, {
    ownerCompanyId: gate.company.id,
    ownerName: gate.company.name,
    ownerSlug: gate.company.slug,
    partnerCompanyId: partnerId,
    currentSettings: gate.company.widget_settings,
    bytes,
    contentType: file.type || "image/png",
  });
  if (!stored.ok) return stored;

  revalidateWall(gate.company.slug);
  return { ok: true as const, logoUrl: stored.data.logo_url };
}
