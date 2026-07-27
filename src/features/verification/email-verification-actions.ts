"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { manualEntryLockDomain } from "@/features/verification/email-discovery";
import { getEmailVerificationContext } from "@/features/verification/email-verification-context";
import {
  hashDomainVerificationToken,
  newDomainVerificationToken,
} from "@/features/verification/email-token";
import { emailAllowedOnWebsite } from "@/features/verification/domain";
import { isRoleEmailAddress } from "@/features/verification/domain-role";
import { scheduleCompanyLogoFetch } from "@/features/logo/schedule";
import { matchCompanyToSearches } from "@/features/radar-leads/match";
import { getOwnedActiveCompany } from "@/features/workspace/require-owned";
import { sendDomainVerificationEmail } from "@/lib/email/domain-verification";
import { getRequestIpHash } from "@/lib/request-ip";
import { createAdminClient } from "@/lib/supabase/admin";

const TOKEN_TTL_MINUTES = 60;

function dash(msg?: string) {
  const q = msg ? `?error=${encodeURIComponent(msg)}` : "";
  return `/dashboard/verification${q}`;
}

function resolveTargetEmail(formData: FormData, website: string, lockDomain: string | null) {
  const picked = String(formData.get("picked_email") ?? "").trim().toLowerCase();
  if (picked.includes("@")) return picked;

  const local = String(formData.get("local_part") ?? "").trim().toLowerCase();
  const suffix = lockDomain ?? manualEntryLockDomain(website);
  if (!local || !suffix) return "";
  if (!/^[a-z0-9._%+-]+$/.test(local)) return "";
  return `${local}@${suffix}`;
}

export async function sendDomainVerificationEmailAction(formData: FormData) {
  const { supabase, user, company } = await getOwnedActiveCompany();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/dashboard/verification")}`);
  }
  if (!company) redirect("/onboarding");

  const allowed = await supabase.rpc("record_verification_attempt", {
    p_company_id: company.id,
  });
  if (allowed.error) redirect(dash(allowed.error.message));
  if (allowed.data === false) {
    redirect(dash("Rate limit: max 5 verification checks per hour. Try again later."));
  }

  const website = company.website ?? "";
  const ctx = await getEmailVerificationContext(company.id);
  const lockDomain = ctx?.lockDomain ?? manualEntryLockDomain(website);
  const target = resolveTargetEmail(formData, website, lockDomain);
  if (!target) redirect(dash("Enter a valid email address on your domain."));

  if (!emailAllowedOnWebsite(website, target)) {
    redirect(dash("That address is not on an allowed domain for your website."));
  }
  if (ctx?.roleOnly && !isRoleEmailAddress(target)) {
    redirect(
      dash("When claiming an existing profile, use a role address (info@, kontakt@, admin@, …)."),
    );
  }

  const ipHash = await getRequestIpHash();
  const { data: sendAllowed, error: sendError } = await supabase.rpc(
    "allow_domain_verification_email_send",
    { p_company_id: company.id, p_email: target, p_ip_hash: ipHash },
  );
  if (sendError) redirect(dash(sendError.message));
  if (sendAllowed === false) {
    redirect(
      dash(
        "Rate limit: too many verification emails for this address or from your network. Try again later.",
      ),
    );
  }

  const token = newDomainVerificationToken();
  const tokenHash = hashDomainVerificationToken(token);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60_000).toISOString();

  const { error: issueError } = await supabase.rpc(
    "issue_domain_verification_email_token",
    {
      p_company_id: company.id,
      p_email: target,
      p_token_hash: tokenHash,
      p_expires_at: expiresAt,
    },
  );
  if (issueError) redirect(dash(issueError.message));

  const domain = lockDomain ?? target.split("@")[1] ?? "your domain";
  const sent = await sendDomainVerificationEmail({
    to: target,
    domain,
    token,
    expiresMinutes: TOKEN_TTL_MINUTES,
  });
  if (!sent.ok) redirect(dash(sent.error ?? "Could not send verification email."));

  redirect(
    `/dashboard/verification?sent=${encodeURIComponent(target)}&ok=email_pending`,
  );
}

export async function confirmDomainVerificationToken(token: string) {
  const trimmed = token.trim();
  if (!trimmed) {
    return { ok: false as const, error: "Invalid verification link." };
  }

  const admin = createAdminClient();
  if (!admin) {
    return { ok: false as const, error: "Verification is temporarily unavailable." };
  }

  const tokenHash = hashDomainVerificationToken(trimmed);
  const { data, error } = await admin.rpc("consume_domain_verification_email_token", {
    p_token_hash: tokenHash,
  });

  if (error) {
    return { ok: false as const, error: error.message };
  }

  const row = (data as { company_id?: string; company_slug?: string }[] | null)?.[0];
  if (!row?.company_id) {
    return { ok: false as const, error: "Invalid or expired verification link." };
  }

  scheduleCompanyLogoFetch(row.company_id);
  void matchCompanyToSearches(row.company_id, "became_verified");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/verification");
  if (row.company_slug) revalidatePath(`/c/${row.company_slug}`);

  return {
    ok: true as const,
    slug: row.company_slug ?? null,
  };
}
