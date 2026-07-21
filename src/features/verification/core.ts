import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { scheduleCompanyLogoFetch } from "@/features/logo/schedule";
import { matchCompanyToSearches } from "@/features/radar-leads/match";
import {
  domainsMatch,
  extractDomain,
} from "@/features/verification/domain";
import {
  fetchCompanySite,
  resolveTxtRecords,
} from "@/features/verification/safe-fetch";
import { getSiteUrl } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/admin";

export type CoreResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export type VerificationMethod =
  | "email_domain"
  | "dns_txt"
  | "meta_tag"
  | "backlink";

async function markVerified(
  companyId: string,
  method: "email_domain" | "dns_txt" | "meta_tag",
) {
  const admin = createAdminClient();
  if (!admin) throw new Error("Service role required for verification.");
  const { error } = await admin.rpc("set_domain_verified", {
    p_company_id: companyId,
    p_method: method,
  });
  if (error) throw new Error(error.message);
  void matchCompanyToSearches(companyId, "became_verified");
}

async function markWebsiteLinked(companyId: string, linked: boolean) {
  const admin = createAdminClient();
  if (!admin) throw new Error("Service role required for verification.");
  const { error } = await admin.rpc("set_website_linked", {
    p_company_id: companyId,
    p_linked: linked,
  });
  if (error) throw new Error(error.message);
}

export async function getVerificationStatusCore(
  admin: SupabaseClient,
  companyId: string,
): Promise<
  CoreResult<{
    verified: boolean;
    method: string | null;
    verified_at: string | null;
    website_linked: boolean;
    website_linked_at: string | null;
    last_check: string | null;
    website: string;
    slug: string;
    domain: string | null;
    verify_token: string;
    instructions: {
      dns_txt: string;
      meta_tag: string;
      well_known: string;
      backlink: string;
    };
  }>
> {
  const { data: company } = await admin
    .from("companies")
    .select("id, slug, website, verified")
    .eq("id", companyId)
    .maybeSingle();
  if (!company) return { ok: false, error: "Company not found." };

  let { data: ver } = await admin
    .from("company_verifications")
    .select(
      "verification_method, verified_at, website_linked, website_linked_at, last_verification_check, verify_token",
    )
    .eq("company_id", companyId)
    .maybeSingle();

  if (!ver) {
    await admin.from("company_verifications").insert({ company_id: companyId });
    const again = await admin
      .from("company_verifications")
      .select(
        "verification_method, verified_at, website_linked, website_linked_at, last_verification_check, verify_token",
      )
      .eq("company_id", companyId)
      .maybeSingle();
    ver = again.data;
  }

  const token = String(ver?.verify_token ?? "");
  if (!token) return { ok: false, error: "Could not load verify token." };

  const domain = extractDomain((company.website as string) ?? "");
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const slug = company.slug as string;

  return {
    ok: true,
    data: {
      verified: Boolean(company.verified),
      method: (ver?.verification_method as string | null) ?? null,
      verified_at: (ver?.verified_at as string | null) ?? null,
      website_linked: Boolean(ver?.website_linked),
      website_linked_at: (ver?.website_linked_at as string | null) ?? null,
      last_check: (ver?.last_verification_check as string | null) ?? null,
      website: (company.website as string) ?? "",
      slug,
      domain,
      verify_token: token,
      instructions: {
        dns_txt: `Add TXT record on ${domain ?? "your domain"}: linken-verify=${token}`,
        meta_tag: `<meta name="linken-verify" content="${token}" />`,
        well_known: `Serve plain text token at https://${domain ?? "your-domain"}/.well-known/linken-verify.txt`,
        backlink: `Link to ${siteUrl}/c/${slug} or embed ${siteUrl}/embed/${slug} on your homepage.`,
      },
    },
  };
}

export async function runVerificationCheckCore(
  admin: SupabaseClient,
  input: {
    companyId: string;
    method: VerificationMethod;
    ownerEmail?: string | null;
  },
): Promise<CoreResult<{ verified?: boolean; website_linked?: boolean; method: string }>> {
  const { data: company } = await admin
    .from("companies")
    .select("id, slug, website")
    .eq("id", input.companyId)
    .maybeSingle();
  if (!company) return { ok: false, error: "Company not found." };

  const { data: allowed, error: rateError } = await admin.rpc(
    "agent_record_verification_attempt",
    { p_company_id: input.companyId },
  );
  if (rateError) return { ok: false, error: rateError.message };
  if (allowed === false) {
    return {
      ok: false,
      error: "Rate limit: max 5 verification checks per hour. Try again later.",
    };
  }

  const domain = extractDomain((company.website as string) ?? "");
  if (!domain && input.method !== "email_domain") {
    return { ok: false, error: "Add a valid company website first." };
  }

  try {
    if (input.method === "email_domain") {
      const match = domainsMatch(
        (company.website as string) ?? "",
        input.ownerEmail ?? "",
      );
      if (!match.ok) {
        return {
          ok: false,
          error: match.reason ?? "Email domain does not match website.",
        };
      }
      await markVerified(input.companyId, "email_domain");
      scheduleCompanyLogoFetch(input.companyId);
      return { ok: true, data: { verified: true, method: "email_domain" } };
    }

    const { data: ver } = await admin
      .from("company_verifications")
      .select("verify_token")
      .eq("company_id", input.companyId)
      .maybeSingle();
    const token = String(ver?.verify_token ?? "");
    if (!token && input.method !== "backlink") {
      return { ok: false, error: "Could not load verify token." };
    }

    if (input.method === "dns_txt") {
      const expected = `linken-verify=${token}`;
      const records = await resolveTxtRecords(domain!);
      if (!records.some((r) => r.includes(expected))) {
        return {
          ok: false,
          error: `TXT record not found. Add: ${expected} on ${domain}`,
        };
      }
      await markVerified(input.companyId, "dns_txt");
      scheduleCompanyLogoFetch(input.companyId);
      return { ok: true, data: { verified: true, method: "dns_txt" } };
    }

    if (input.method === "meta_tag") {
      const wellKnown = await fetchCompanySite(
        domain!,
        "/.well-known/linken-verify.txt",
      );
      if (wellKnown.ok && wellKnown.body.trim() === token) {
        await markVerified(input.companyId, "meta_tag");
        scheduleCompanyLogoFetch(input.companyId);
        return { ok: true, data: { verified: true, method: "meta_tag" } };
      }

      const home = await fetchCompanySite(domain!, "/");
      if (!home.ok) return { ok: false, error: home.error };

      const tokenLower = token.toLowerCase();
      const html = home.body.toLowerCase();
      const hasMeta =
        html.includes('name="linken-verify"') &&
        (html.includes(`content="${tokenLower}"`) ||
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
        return {
          ok: false,
          error:
            "Meta tag / well-known file not found. Add the tag or file, then try again.",
        };
      }
      await markVerified(input.companyId, "meta_tag");
      scheduleCompanyLogoFetch(input.companyId);
      return { ok: true, data: { verified: true, method: "meta_tag" } };
    }

    // backlink
    const siteUrl = getSiteUrl().replace(/\/$/, "");
    const slug = company.slug as string;
    const profilePath = `/c/${slug}`;
    const embedPath = `/embed/${slug}`;
    const home = await fetchCompanySite(domain!, "/");
    if (!home.ok) return { ok: false, error: home.error };
    const body = home.body;
    const linked =
      body.includes(`${siteUrl}${profilePath}`) ||
      body.includes(profilePath) ||
      body.includes(`${siteUrl}${embedPath}`) ||
      body.includes(embedPath);

    await markWebsiteLinked(input.companyId, linked);
    if (!linked) {
      return {
        ok: false,
        error: `No Hansala link found. Add a link to ${siteUrl}${profilePath} or an embed iframe.`,
      };
    }
    return {
      ok: true,
      data: { website_linked: true, method: "backlink" },
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Verification check failed.",
    };
  }
}
