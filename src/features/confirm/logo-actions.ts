"use server";

import { revalidatePath } from "next/cache";
import {
  discoverLogoCandidatesForWebsite,
  downloadLogoCandidate,
} from "@/features/logo/discover-candidates";
import { uploadLogoCore } from "@/features/logo/core";
import { createAdminClient } from "@/lib/supabase/admin";

type Kind = "case" | "reference";

const attempts = new Map<string, number[]>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function rateOk(token: string): boolean {
  const now = Date.now();
  const prev = (attempts.get(token) ?? []).filter((t) => now - t < WINDOW_MS);
  if (prev.length >= MAX_ATTEMPTS) {
    attempts.set(token, prev);
    return false;
  }
  prev.push(now);
  attempts.set(token, prev);
  return true;
}

async function companyIdForToken(
  kind: Kind,
  token: string,
): Promise<string | null> {
  const admin = createAdminClient();
  if (!admin || !token) return null;

  if (kind === "case") {
    const { data } = await admin
      .from("case_study_client_confirmation_requests")
      .select("status, confirmed_by_company_id")
      .eq("token", token)
      .maybeSingle();
    if (!data || data.status !== "confirmed") return null;
    return (data.confirmed_by_company_id as string | null) ?? null;
  }

  const { data } = await admin
    .from("service_references")
    .select("status, client_company_id")
    .eq("confirm_token", token)
    .maybeSingle();
  if (!data || data.status !== "confirmed") return null;
  return (data.client_company_id as string | null) ?? null;
}

/** Token-gated: sets PROFILE logo only. Never touches wall overrides. */
export async function uploadConfirmProfileLogo(formData: FormData): Promise<{
  ok: boolean;
  error?: string;
  logoUrl?: string;
}> {
  const kind = String(formData.get("kind") ?? "") as Kind;
  const token = String(formData.get("token") ?? "").trim();
  const file = formData.get("file");

  if (kind !== "case" && kind !== "reference") {
    return { ok: false, error: "Invalid confirmation." };
  }
  if (!rateOk(token)) {
    return { ok: false, error: "Too many logo updates. Try again later." };
  }

  const companyId = await companyIdForToken(kind, token);
  if (!companyId) return { ok: false, error: "Confirmation not found." };

  if (!(file instanceof File)) {
    return { ok: false, error: "Choose an image file." };
  }

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Upload is temporarily unavailable." };

  const bytes = new Uint8Array(await file.arrayBuffer());
  const result = await uploadLogoCore(admin, companyId, {
    bytes,
    contentType: file.type || "image/png",
    ownerUserId: `confirm/${companyId}`,
  });

  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath(`/confirm/${token}`);
  revalidatePath(`/confirm-reference/${token}`);
  return { ok: true, logoUrl: result.data.logo_url };
}

/** On-demand discovery — only after the confirmer asks, never on page load. */
export async function discoverConfirmLogoCandidates(input: {
  kind: Kind;
  token: string;
}): Promise<{ ok: boolean; error?: string; candidates?: string[] }> {
  if (!rateOk(`disc:${input.token}`)) {
    return { ok: false, error: "Too many searches. Try again later." };
  }
  const companyId = await companyIdForToken(input.kind, input.token);
  if (!companyId) return { ok: false, error: "Confirmation not found." };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Unavailable." };

  const { data: company } = await admin
    .from("companies")
    .select("website")
    .eq("id", companyId)
    .maybeSingle();
  const website = (company?.website as string | null) ?? "";
  if (!website.trim()) {
    return { ok: false, error: "Add a website on your profile first." };
  }

  const found = await discoverLogoCandidatesForWebsite(website);
  if (!found.ok) return { ok: false, error: found.error };
  return { ok: true, candidates: found.candidates.slice(0, 8) };
}

export async function applyConfirmLogoCandidate(input: {
  kind: Kind;
  token: string;
  candidateUrl: string;
}): Promise<{ ok: boolean; error?: string; logoUrl?: string }> {
  if (!rateOk(input.token)) {
    return { ok: false, error: "Too many logo updates. Try again later." };
  }
  const companyId = await companyIdForToken(input.kind, input.token);
  if (!companyId) return { ok: false, error: "Confirmation not found." };

  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "Unavailable." };

  const dl = await downloadLogoCandidate(input.candidateUrl);
  if (!dl.ok) return { ok: false, error: dl.error };

  const result = await uploadLogoCore(admin, companyId, {
    bytes: new Uint8Array(dl.image),
    contentType: dl.uploadType,
    ownerUserId: `confirm/${companyId}`,
  });
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath(`/confirm/${input.token}`);
  revalidatePath(`/confirm-reference/${input.token}`);
  return { ok: true, logoUrl: result.data.logo_url };
}
