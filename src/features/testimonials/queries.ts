import "server-only";
import { isUndisclosedPublic, parseDisclosure } from "@/features/confirmations/meta";
import { formatTestimonialProvenance } from "@/features/testimonials/provenance";
import { parseTestimonialsSettings } from "@/features/testimonials/settings";
import type { PublicTestimonial, TestimonialRow } from "@/features/testimonials/types";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site";

type RawRow = {
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

function mapRow(r: RawRow): TestimonialRow {
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

/** Undisclosed underlying confirmations never surface as public testimonials. */
async function filterUndisclosed(
  rows: TestimonialRow[],
): Promise<TestimonialRow[]> {
  if (!rows.length) return [];

  const supabase = await createClient();
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

async function loadAuthorCompanies(
  ids: string[],
): Promise<Map<string, { name: string; slug: string }>> {
  if (!ids.length) return new Map();
  const supabase = await createClient();
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

function applySelection(
  rows: TestimonialRow[],
  excluded: Set<string>,
  order: string[],
  limit: number,
): TestimonialRow[] {
  let list = rows.filter((r) => !excluded.has(r.id));
  if (order.length) {
    const rank = new Map(order.map((id, i) => [id, i]));
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
  return list.slice(0, limit);
}

export async function getPublishedTestimonials(
  companyId: string,
): Promise<TestimonialRow[]> {
  if (!companyId) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select(
      "id, company_id, author_company_id, body, author_name, author_role, source, source_id, status, consent_public, created_at, published_at, author_domain, author_domain_verified, author_is_free_provider, author_company_claimed",
    )
    .eq("company_id", companyId)
    .eq("status", "published")
    .eq("consent_public", true);

  if (error || !data?.length) return [];
  const rows = data.map((r) => mapRow(r as RawRow));
  return filterUndisclosed(rows);
}

/** Embed/widget path — applies widget_settings selection (exclusion-based). */
export async function getSelectedTestimonials(
  companyId: string,
  widgetSettings: unknown,
): Promise<TestimonialRow[]> {
  const cfg = parseTestimonialsSettings(
    widgetSettings && typeof widgetSettings === "object"
      ? (widgetSettings as Record<string, unknown>).testimonials
      : undefined,
  );
  const all = await getPublishedTestimonials(companyId);
  return applySelection(
    all,
    new Set(cfg.excludedIds),
    cfg.order,
    cfg.limit,
  );
}

export async function hasPublishedTestimonialForCase(
  caseStudyId: string,
): Promise<boolean> {
  if (!caseStudyId) return false;
  const supabase = await createClient();
  const { data } = await supabase
    .from("testimonials")
    .select("id")
    .eq("source", "case_study")
    .eq("source_id", caseStudyId)
    .eq("status", "published")
    .maybeSingle();
  return Boolean(data);
}

export type TestimonialStudioEntry = {
  id: string;
  body: string;
  authorName: string;
  authorRole: string;
  authorCompanyName: string | null;
  publishedAt: string | null;
  included: boolean;
  belowCut: boolean;
};

/** Dashboard studio — published testimonials with selection flags. */
export async function getTestimonialsStudioEntries(
  companyId: string,
  widgetSettings: unknown,
): Promise<TestimonialStudioEntry[]> {
  const cfg = parseTestimonialsSettings(
    widgetSettings && typeof widgetSettings === "object"
      ? (widgetSettings as Record<string, unknown>).testimonials
      : undefined,
  );
  const excluded = new Set(cfg.excludedIds);
  const rows = await getPublishedTestimonials(companyId);
  const authorIds = [
    ...new Set(rows.map((r) => r.authorCompanyId).filter(Boolean)),
  ] as string[];
  const authors = await loadAuthorCompanies(authorIds);

  let ordered = [...rows];
  if (cfg.order.length) {
    const rank = new Map(cfg.order.map((id, i) => [id, i]));
    ordered.sort((a, b) => {
      const ra = rank.get(a.id);
      const rb = rank.get(b.id);
      if (ra !== undefined && rb !== undefined) return ra - rb;
      if (ra !== undefined) return -1;
      if (rb !== undefined) return 1;
      return (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "");
    });
  }

  let includedSeen = 0;
  return ordered.map((r) => {
    const included = !excluded.has(r.id);
    let belowCut = false;
    if (included) {
      includedSeen += 1;
      belowCut = includedSeen > cfg.limit;
    }
    const author = r.authorCompanyId ? authors.get(r.authorCompanyId) : null;
    return {
      id: r.id,
      body: r.body,
      authorName: r.authorName,
      authorRole: r.authorRole,
      authorCompanyName: author?.name ?? null,
      publishedAt: r.publishedAt,
      included,
      belowCut,
    };
  });
}

export async function countPublishedTestimonials(companyId: string): Promise<number> {
  const rows = await getPublishedTestimonials(companyId);
  return rows.length;
}

export async function toPublicTestimonials(
  rows: TestimonialRow[],
  companySlug: string,
): Promise<PublicTestimonial[]> {
  const siteUrl = getSiteUrl();
  const authorIds = [
    ...new Set(rows.map((r) => r.authorCompanyId).filter(Boolean)),
  ] as string[];
  const authors = await loadAuthorCompanies(authorIds);

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
