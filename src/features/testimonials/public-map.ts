import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isUndisclosedPublic, parseDisclosure } from "@/features/confirmations/meta";
import { formatTestimonialProvenance } from "@/features/testimonials/provenance";
import type { PublicTestimonial, TestimonialRow } from "@/features/testimonials/types";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site";

export type TestimonialRawRow = {
  id: string;
  company_id: string;
  author_company_id: string | null;
  body: string;
  author_name: string;
  author_role: string;
  source: string;
  source_id: string | null;
  status: string;
  consent_public: boolean;
  created_at: string;
  published_at: string | null;
  author_domain: string | null;
  author_domain_verified: boolean;
  author_is_free_provider: boolean;
  author_company_claimed: boolean;
};

export function mapTestimonialRow(r: TestimonialRawRow): TestimonialRow {
  return {
    id: r.id,
    companyId: r.company_id,
    authorCompanyId: r.author_company_id,
    body: r.body,
    authorName: r.author_name,
    authorRole: r.author_role,
    source: r.source as TestimonialRow["source"],
    sourceId: r.source_id,
    status: r.status as TestimonialRow["status"],
    consentPublic: r.consent_public,
    createdAt: r.created_at,
    publishedAt: r.published_at,
    authorDomain: r.author_domain,
    authorDomainVerified: Boolean(r.author_domain_verified),
    authorIsFreeProvider: Boolean(r.author_is_free_provider),
    authorCompanyClaimed: Boolean(r.author_company_claimed),
  };
}

/** Studio / public site curation — order, exclude, limit. */
export function selectTestimonialsByStudio<
  T extends { id: string; publishedAt?: string | null },
>(
  rows: T[],
  opts: { order: string[]; excludedIds: string[]; limit: number },
): T[] {
  const ban = new Set(opts.excludedIds);
  let list = rows.filter((r) => !ban.has(r.id));
  if (opts.order.length) {
    const rank = new Map(opts.order.map((id, i) => [id, i]));
    list = [...list].sort((a, b) => {
      const ra = rank.get(a.id);
      const rb = rank.get(b.id);
      if (ra !== undefined && rb !== undefined) return ra - rb;
      if (ra !== undefined) return -1;
      if (rb !== undefined) return 1;
      return (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "");
    });
  } else {
    list.sort((a, b) =>
      (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""),
    );
  }
  return list.slice(0, opts.limit);
}

/** Undisclosed underlying confirmations never surface as public testimonials. */
export async function filterUndisclosedTestimonials(
  rows: TestimonialRow[],
  supabase: SupabaseClient,
): Promise<TestimonialRow[]> {
  if (!rows.length) return [];

  const caseIds = rows
    .filter((r) => r.source === "case_study" && r.sourceId)
    .map((r) => r.sourceId!);
  const refIds = rows
    .filter((r) => r.source === "reference" && r.sourceId)
    .map((r) => r.sourceId!);

  const undisclosedCase = new Set<string>();
  const undisclosedRef = new Set<string>();

  if (caseIds.length) {
    const { data } = await supabase
      .from("case_study_client_confirmation_requests")
      .select("case_study_id, disclosure")
      .in("case_study_id", caseIds);
    for (const r of data ?? []) {
      if (isUndisclosedPublic(parseDisclosure(r.disclosure))) {
        undisclosedCase.add(r.case_study_id as string);
      }
    }
  }

  if (refIds.length) {
    const { data } = await supabase
      .from("service_references")
      .select("id, disclosure")
      .in("id", refIds);
    for (const r of data ?? []) {
      if (isUndisclosedPublic(parseDisclosure(r.disclosure))) {
        undisclosedRef.add(r.id as string);
      }
    }
  }

  return rows.filter((r) => {
    if (r.source === "case_study" && r.sourceId && undisclosedCase.has(r.sourceId)) {
      return false;
    }
    if (r.source === "reference" && r.sourceId && undisclosedRef.has(r.sourceId)) {
      return false;
    }
    return true;
  });
}

export async function loadAuthorCompanies(
  supabase: SupabaseClient,
  ids: string[],
): Promise<Map<string, { name: string; slug: string }>> {
  if (!ids.length) return new Map();
  const { data } = await supabase
    .from("companies")
    .select("id, name, slug")
    .in("id", ids);
  return new Map(
    (data ?? []).map((c) => [
      c.id as string,
      { name: c.name as string, slug: c.slug as string },
    ]),
  );
}

export async function toPublicTestimonials(
  rows: TestimonialRow[],
  companySlug: string,
  client?: SupabaseClient,
): Promise<PublicTestimonial[]> {
  const supabase = client ?? (await createClient());
  const siteUrl = getSiteUrl();
  const authorIds = [
    ...new Set(rows.map((r) => r.authorCompanyId).filter(Boolean)),
  ] as string[];
  const authors = await loadAuthorCompanies(supabase, authorIds);

  return rows.map((r) => {
    const author = r.authorCompanyId ? authors.get(r.authorCompanyId) : null;
    return {
      id: r.id,
      body: r.body,
      authorName: r.authorName,
      authorRole: r.authorRole,
      authorCompany: author
        ? { name: author.name, slug: author.slug }
        : null,
      source: r.source,
      publishedAt: r.publishedAt ?? r.createdAt,
      profileUrl: `${siteUrl}/c/${companySlug}?src=testimonial`,
      provenanceLine: formatTestimonialProvenance({
        source: r.source,
        authorDomain: r.authorDomain,
        authorDomainVerified: r.authorDomainVerified,
        authorIsFreeProvider: r.authorIsFreeProvider,
      }),
    };
  });
}
