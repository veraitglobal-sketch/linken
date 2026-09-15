import "server-only";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { hashDomainVerificationToken } from "@/features/verification/email-token";
import { scheduleCompanyLogoFetch } from "@/features/logo/schedule";
import { matchCompanyToSearches } from "@/features/radar-leads/match";
import { createAdminClient } from "@/lib/supabase/admin";

type ConfirmOk = { ok: true; slug: string | null };
type ConfirmErr = { ok: false; error: string };

function succeed(companyId: string, slug: string | null): ConfirmOk {
  scheduleCompanyLogoFetch(companyId);
  after(() => {
    void matchCompanyToSearches(companyId, "became_verified");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/verification");
    if (slug) revalidatePath(`/c/${slug}`);
  });
  return { ok: true, slug };
}

/** Consume the email-verify token. Safe to call from a Server Component GET. */
export async function confirmDomainVerificationToken(
  token: string,
): Promise<ConfirmOk | ConfirmErr> {
  const trimmed = token.trim();
  if (!trimmed) return { ok: false, error: "Invalid verification link." };

  const admin = createAdminClient();
  if (!admin) {
    return { ok: false, error: "Verification is temporarily unavailable." };
  }

  const tokenHash = hashDomainVerificationToken(trimmed);
  const { data, error } = await admin.rpc(
    "consume_domain_verification_email_token",
    { p_token_hash: tokenHash },
  );

  const row = (data as { company_id?: string; company_slug?: string }[] | null)?.[0];
  if (row?.company_id) {
    return succeed(row.company_id, row.company_slug ?? null);
  }

  const reused = await lookupUsedVerifiedToken(admin, tokenHash);
  if (reused) return succeed(reused.companyId, reused.slug);

  return {
    ok: false,
    error: error?.message || "Invalid or expired verification link.",
  };
}

async function lookupUsedVerifiedToken(
  admin: NonNullable<ReturnType<typeof createAdminClient>>,
  tokenHash: string,
) {
  const { data: tokenRow } = await admin
    .from("domain_verification_email_tokens")
    .select("company_id, used_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();
  if (!tokenRow?.used_at || !tokenRow.company_id) return null;

  const { data: company } = await admin
    .from("companies")
    .select("id, slug, verified")
    .eq("id", tokenRow.company_id)
    .maybeSingle();
  if (!company?.verified) return null;

  return { companyId: company.id as string, slug: (company.slug as string) ?? null };
}
