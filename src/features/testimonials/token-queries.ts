import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { TestimonialSource, TestimonialStatus } from "@/features/testimonials/types";

export type TestimonialTokenView = {
  id: string;
  status: TestimonialStatus;
  body: string;
  authorName: string;
  authorRole: string;
  companyId: string;
  companyName: string;
  companySlug: string;
  authorCompanyId: string | null;
  authorCompanyName: string | null;
  authorCompanySlug: string | null;
  source: TestimonialSource;
  sourceId: string | null;
  consentPublic: boolean;
  publishedAt: string | null;
  authorEmail: string | null;
  authorDomain: string | null;
  authorDomainVerified: boolean;
  authorIsFreeProvider: boolean;
  authorCompanyClaimed: boolean;
};

export async function getTestimonialByToken(
  token: string,
): Promise<TestimonialTokenView | null> {
  if (!token.trim()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_testimonial_by_token", {
      p_token: token.trim(),
    });

    if (error || !data?.[0]) return null;
    const row = data[0] as Record<string, unknown>;

    return {
      id: row.id as string,
      status: row.status as TestimonialStatus,
      body: (row.body as string) ?? "",
      authorName: (row.author_name as string) ?? "",
      authorRole: (row.author_role as string) ?? "",
      companyId: row.company_id as string,
      companyName: (row.company_name as string) ?? "",
      companySlug: (row.company_slug as string) ?? "",
      authorCompanyId: (row.author_company_id as string | null) ?? null,
      authorCompanyName: (row.author_company_name as string | null) ?? null,
      authorCompanySlug: (row.author_company_slug as string | null) ?? null,
      source: row.source as TestimonialSource,
      sourceId: (row.source_id as string | null) ?? null,
      consentPublic: Boolean(row.consent_public),
      publishedAt: (row.published_at as string | null) ?? null,
      authorEmail: (row.author_email as string | null) ?? null,
      authorDomain: (row.author_domain as string | null) ?? null,
      authorDomainVerified: Boolean(row.author_domain_verified),
      authorIsFreeProvider: Boolean(row.author_is_free_provider),
      authorCompanyClaimed: Boolean(row.author_company_claimed),
    };
  } catch (err) {
    console.error("[getTestimonialByToken]", err);
    return null;
  }
}
