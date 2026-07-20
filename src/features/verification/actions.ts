"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  domainsMatch,
  extractDomain,
} from "@/features/verification/domain";
import { scheduleCompanyLogoFetch } from "@/features/logo/schedule";
import { matchCompanyToSearches } from "@/features/radar-leads/match";
import {
  fetchCompanySite,
  resolveTxtRecords,
} from "@/features/verification/safe-fetch";
import { getOwnedActiveCompany } from "@/features/workspace/require-owned";
import { getSiteUrl } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function requireOwnedCompany() {
  return getOwnedActiveCompany();
}

async function allowCheck(
  supabase: Awaited<ReturnType<typeof createClient>>,
  companyId: string,
): Promise<true | string> {
  const { data, error } = await supabase.rpc("record_verification_attempt", {
    p_company_id: companyId,
  });
  if (error) return error.message;
  if (data === false) {
    return "Rate limit: max 5 verification checks per hour. Try again later.";
  }
  return true;
}

async function markVerified(
  companyId: string,
  method: "email_domain" | "dns_txt" | "meta_tag",
) {
  const admin = createAdminClient();
  if (!admin) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for verification.");
  }
  const { error } = await admin.rpc("set_domain_verified", {
    p_company_id: companyId,
    p_method: method,
  });
  if (error) throw new Error(error.message);
  void matchCompanyToSearches(companyId, "became_verified");
}

async function markWebsiteLinked(companyId: string, linked: boolean) {
  const admin = createAdminClient();
  if (!admin) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for verification.");
  }
  const { error } = await admin.rpc("set_website_linked", {
    p_company_id: companyId,
    p_linked: linked,
  });
  if (error) throw new Error(error.message);
}

function dash(msg?: string) {
  const q = msg ? `?error=${encodeURIComponent(msg)}` : "";
  return `/dashboard/verification${q}`;
}

export async function checkEmailDomainVerification(formData: FormData) {
  void formData;
  const { supabase, user, company } = await requireOwnedCompany();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent("/dashboard/verification")}`);
  }
  if (!company) redirect("/onboarding");

  const allowed = await allowCheck(supabase, company.id);
  if (allowed !== true) redirect(dash(allowed));

  const match = domainsMatch(company.website ?? "", user.email ?? "");
  if (!match.ok) redirect(dash(match.reason));

  try {
    await markVerified(company.id, "email_domain");
  } catch (e) {
    redirect(dash(e instanceof Error ? e.message : "Verification failed."));
  }

  scheduleCompanyLogoFetch(company.id);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/verification");
  revalidatePath(`/c/${company.slug}`);
  redirect("/dashboard/verification?verified=email");
}

/** Called from createCompany after insert — no redirect, no rate limit burn if no website. */
export async function tryEmailDomainVerificationAfterOnboarding(input: {
  companyId: string;
  website: string;
  ownerEmail: string;
  slug: string;
}) {
  const match = domainsMatch(input.website, input.ownerEmail);
  if (!match.ok) return { ok: false as const, reason: match.reason };

  try {
    await markVerified(input.companyId, "email_domain");
    scheduleCompanyLogoFetch(input.companyId);
    revalidatePath(`/c/${input.slug}`);
    return { ok: true as const };
  } catch (e) {
    return {
      ok: false as const,
      reason: e instanceof Error ? e.message : "Verification failed.",
    };
  }
}

export async function getOwnerVerifyToken(): Promise<{
  token: string | null;
  domain: string | null;
  error?: string;
}> {
  const { supabase, user, company } = await requireOwnedCompany();
  if (!user || !company) return { token: null, domain: null, error: "Not allowed." };

  const domain = extractDomain(company.website ?? "");
  const { data, error } = await supabase.rpc("get_verify_token", {
    p_company_id: company.id,
  });
  if (error) return { token: null, domain, error: error.message };
  return { token: data as string, domain };
}

export async function runDnsCheck() {
  const { supabase, user, company } = await requireOwnedCompany();
  if (!user) redirect(`/login?next=${encodeURIComponent("/dashboard/verification")}`);
  if (!company) redirect("/onboarding");

  const domain = extractDomain(company.website ?? "");
  if (!domain) redirect(dash("Add a valid company website first."));

  const allowed = await allowCheck(supabase, company.id);
  if (allowed !== true) redirect(dash(allowed));

  const { data: token, error: tokenError } = await supabase.rpc(
    "get_verify_token",
    { p_company_id: company.id },
  );
  if (tokenError || !token) {
    redirect(dash(tokenError?.message ?? "Could not load verify token."));
  }

  const expected = `linken-verify=${token}`;
  try {
    const records = await resolveTxtRecords(domain);
    const hit = records.some((r) => r.includes(expected));
    if (!hit) {
      redirect(
        dash(
          `TXT record not found. Add: ${expected} on ${domain}`,
        ),
      );
    }
    await markVerified(company.id, "dns_txt");
  } catch (e) {
    redirect(dash(e instanceof Error ? e.message : "DNS check failed."));
  }

  scheduleCompanyLogoFetch(company.id);
  revalidatePath("/dashboard");
  revalidatePath(`/c/${company.slug}`);
  redirect("/dashboard/verification?verified=dns");
}

export async function runMetaCheck() {
  const { supabase, user, company } = await requireOwnedCompany();
  if (!user) redirect(`/login?next=${encodeURIComponent("/dashboard/verification")}`);
  if (!company) redirect("/onboarding");

  const domain = extractDomain(company.website ?? "");
  if (!domain) redirect(dash("Add a valid company website first."));

  const allowed = await allowCheck(supabase, company.id);
  if (allowed !== true) redirect(dash(allowed));

  const { data: token, error: tokenError } = await supabase.rpc(
    "get_verify_token",
    { p_company_id: company.id },
  );
  if (tokenError || !token) {
    redirect(dash(tokenError?.message ?? "Could not load verify token."));
  }

  const metaNeedle = `name="linken-verify"`;
  const metaContent = `content="${token}"`;
  const wellKnown = await fetchCompanySite(domain, "/.well-known/linken-verify.txt");
  if (wellKnown.ok && wellKnown.body.trim() === String(token)) {
    try {
      await markVerified(company.id, "meta_tag");
    } catch (e) {
      redirect(dash(e instanceof Error ? e.message : "Verification failed."));
    }
    scheduleCompanyLogoFetch(company.id);
    revalidatePath("/dashboard");
    revalidatePath(`/c/${company.slug}`);
    redirect("/dashboard/verification?verified=meta");
  }

  const home = await fetchCompanySite(domain, "/");
  if (!home.ok) {
    redirect(
      dash(
        wellKnown.ok
          ? "Well-known file found but token mismatch; homepage check also failed."
          : home.error,
      ),
    );
  }

  const html = home.body.toLowerCase();
  const tokenLower = String(token).toLowerCase();
  const hasMeta =
    html.includes(metaNeedle) &&
    (html.includes(metaContent.toLowerCase()) ||
      html.includes(`content='${tokenLower}'`) ||
      new RegExp(
        `<meta[^>]+name=["']linken-verify["'][^>]+content=["']${tokenLower}["']`,
        "i",
      ).test(home.body) ||
      new RegExp(
        `<meta[^>]+content=["']${tokenLower}["'][^>]+name=["']linken-verify["']`,
        "i",
      ).test(home.body));

  if (!hasMeta) {
    redirect(
      dash(
        "Meta tag / well-known file not found. Add the tag or file, then try again.",
      ),
    );
  }

  try {
    await markVerified(company.id, "meta_tag");
  } catch (e) {
    redirect(dash(e instanceof Error ? e.message : "Verification failed."));
  }

  scheduleCompanyLogoFetch(company.id);
  revalidatePath("/dashboard");
  revalidatePath(`/c/${company.slug}`);
  redirect("/dashboard/verification?verified=meta");
}

export async function runBacklinkCheck() {
  const { supabase, user, company } = await requireOwnedCompany();
  if (!user) redirect(`/login?next=${encodeURIComponent("/dashboard/verification")}`);
  if (!company) redirect("/onboarding");

  const domain = extractDomain(company.website ?? "");
  if (!domain) redirect(dash("Add a valid company website first."));

  const allowed = await allowCheck(supabase, company.id);
  if (allowed !== true) redirect(dash(allowed));

  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const profilePath = `/c/${company.slug}`;
  const embedPath = `/embed/${company.slug}`;

  const home = await fetchCompanySite(domain, "/");
  if (!home.ok) redirect(dash(home.error));

  const body = home.body;
  const linked =
    body.includes(`${siteUrl}${profilePath}`) ||
    body.includes(profilePath) ||
    body.includes(`${siteUrl}${embedPath}`) ||
    body.includes(embedPath) ||
    body.includes(`src="${siteUrl}${embedPath}`) ||
    body.includes(`src='${siteUrl}${embedPath}`);

  try {
    await markWebsiteLinked(company.id, linked);
  } catch (e) {
    redirect(dash(e instanceof Error ? e.message : "Backlink check failed."));
  }

  revalidatePath("/dashboard");
  revalidatePath(`/c/${company.slug}`);
  redirect(
    linked
      ? "/dashboard/verification?linked=1"
      : dash(
          `No Linken link found. Add a link to ${siteUrl}${profilePath} or an embed iframe.`,
        ),
  );
}
