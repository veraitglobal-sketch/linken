import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  filterUndisclosedTestimonials,
  loadAuthorCompanies,
  mapTestimonialRow,
  selectTestimonialsByStudio,
  toPublicTestimonials,
  type TestimonialRawRow,
} from "@/features/testimonials/public-map";
import { parseTestimonialsSettings } from "@/features/testimonials/settings";
import type { TestimonialRow } from "@/features/testimonials/types";
import { createClient } from "@/lib/supabase/server";

export { toPublicTestimonials, selectTestimonialsByStudio };

const SELECT =
  "id, company_id, author_company_id, body, author_name, author_role, source, source_id, status, consent_public, created_at, published_at, author_domain, author_domain_verified, author_is_free_provider, author_company_claimed";

/** Published + consent; optional client (Agent uses service-role admin). */
export async function getPublishedTestimonials(
  companyId: string,
  client?: SupabaseClient,
): Promise<TestimonialRow[]> {
  if (!companyId) return [];
  const supabase = client ?? (await createClient());
  const { data, error } = await supabase
    .from("testimonials")
    .select(SELECT)
    .eq("company_id", companyId)
    .eq("status", "published")
    .eq("consent_public", true);

  if (error || !data?.length) return [];
  const rows = data.map((r) => mapTestimonialRow(r as TestimonialRawRow));
  return filterUndisclosedTestimonials(rows, supabase);
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
  return selectTestimonialsByStudio(all, {
    order: cfg.order,
    excludedIds: cfg.excludedIds,
    limit: cfg.limit,
  });
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

export async function countPublishedTestimonials(
  companyId: string,
): Promise<number> {
  const rows = await getPublishedTestimonials(companyId);
  return rows.length;
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
  const supabase = await createClient();
  const rows = await getPublishedTestimonials(companyId, supabase);
  const authorIds = [
    ...new Set(rows.map((r) => r.authorCompanyId).filter(Boolean)),
  ] as string[];
  const authors = await loadAuthorCompanies(supabase, authorIds);

  const ordered = selectTestimonialsByStudio(rows, {
    order: cfg.order,
    excludedIds: [],
    limit: rows.length,
  });

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
