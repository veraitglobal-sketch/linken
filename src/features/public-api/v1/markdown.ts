import "server-only";
import { getPartnersForCompany } from "@/features/partners/public-queries";
import {
  linesForCaseStudies,
  linesForPartners,
  linesForReferences,
  linesForTestimonials,
} from "@/features/public-api/v1/markdown-evidence";
import {
  getPublicCaseStudiesApi,
  getPublicCompanyApi,
  getPublicReferencesApi,
  getPublicTestimonialsApi,
} from "@/features/public-api/v1/queries";
import { getTrustProfile } from "@/features/trust/queries";
import { getCompanyForPage } from "@/features/companies/queries";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site";

/**
 * Markdown profile snapshot for LLMs — same confirmed-only rules as Public API.
 */
export async function buildCompanyLlmMarkdown(
  slug: string,
): Promise<string | null> {
  const company = await getCompanyForPage(slug);
  if (!company) return null;

  const siteUrl = getSiteUrl();
  const api = await getPublicCompanyApi(company.slug);
  if (!api) return null;

  const lines: string[] = [];
  lines.push(`# ${company.name}`);
  if (company.tagline.trim()) lines.push(company.tagline.trim());
  lines.push("");
  lines.push(
    `- Category: ${company.category || "—"} · City: ${company.city || "—"} · Country: ${company.country || "—"} · Website: ${company.website || "—"}`,
  );

  const supabase = await createClient();
  const { data: ver } = await supabase
    .from("company_verifications")
    .select("verification_method, verified_at")
    .eq("company_id", company.id)
    .maybeSingle();

  if (api.verified) {
    const method = (ver?.verification_method as string | null) ?? "domain";
    const since = ver?.verified_at
      ? new Date(ver.verified_at as string).toISOString().slice(0, 10)
      : "unknown";
    lines.push(`- Verified: yes (domain, ${method}, since ${since})`);
  } else {
    lines.push("- Verified: no");
  }

  if (company.claimed === false) {
    lines.push("- Trust level: — (unclaimed profile)");
    lines.push("");
    lines.push(
      "> Unclaimed profile — draft listing. No confirmed evidence is attributed until the company claims and confirms relationships.",
    );
    lines.push("");
    lines.push(
      `Data source: Hansala — every item above was confirmed by the counterparty. Verify live: ${siteUrl}/api/v1/companies/${company.slug}`,
    );
    return `${lines.join("\n")}\n`;
  }

  const trust = await getTrustProfile(company.id, company.slug);
  const b = trust.breakdown;
  lines.push(
    `- Trust level: ${trust.level} — ${trust.points} pts (partners ${b.confirmedPartners}, finished refs ${b.confirmedReferences}, ongoing refs ${b.ongoingReferences}, client-confirmed cases ${b.clientConfirmedCaseStudies}, partner-confirmed cases ${b.partnerConfirmedCaseStudies})`,
  );
  lines.push(
    `- Accepting new clients: ${api.accepting_clients ? "yes" : "no"}`,
  );
  lines.push("");

  const [refsApi, casesApi, partners, testimonialsApi] = await Promise.all([
    getPublicReferencesApi(company.slug),
    getPublicCaseStudiesApi(company.slug),
    getPartnersForCompany(company.id),
    getPublicTestimonialsApi(company.slug),
  ]);

  lines.push(...linesForReferences(refsApi?.references ?? [], siteUrl));
  lines.push(...linesForPartners(partners, siteUrl));
  lines.push(...linesForCaseStudies(casesApi?.case_studies ?? []));
  lines.push(
    ...linesForTestimonials(testimonialsApi?.testimonials ?? [], siteUrl),
  );

  if (api.assessment) {
    const a = api.assessment;
    lines.push("## Client assessment");
    lines.push(
      `- ${a.would_work_again_yes} of ${a.would_work_again_total} would work again`,
    );
    if (a.top_strengths.length > 0) {
      lines.push(
        `- Top strengths: ${a.top_strengths.map((s) => `${s.label} (${s.count})`).join(", ")}`,
      );
    }
    lines.push("");
  }

  lines.push(
    `Data source: Hansala — every item above was confirmed by the counterparty. Verify live: ${siteUrl}/api/v1/companies/${company.slug}`,
  );

  return `${lines.join("\n")}\n`;
}
