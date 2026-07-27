import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSiteUrl } from "@/lib/site";

export type CoreResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export type CreateTestimonialInviteInput = {
  companyId: string;
  source?: "standalone" | "reference" | "case_study" | "partnership";
  sourceId?: string | null;
  authorEmail?: string | null;
  authorCompanyId?: string | null;
};

export async function createTestimonialInviteCore(
  supabase: SupabaseClient,
  input: CreateTestimonialInviteInput,
): Promise<CoreResult<{ token: string; url: string }>> {
  const { data: token, error } = await supabase.rpc("create_testimonial_invite", {
    p_company_id: input.companyId,
    p_source: input.source ?? "standalone",
    p_source_id: input.sourceId ?? null,
    p_author_email: input.authorEmail?.trim() || null,
    p_author_company_id: input.authorCompanyId ?? null,
  });

  if (error || !token) {
    return { ok: false, error: error?.message ?? "Could not create invite." };
  }

  const siteUrl = getSiteUrl();
  const id = token as string;
  return {
    ok: true,
    data: { token: id, url: `${siteUrl}/testimonial/${id}` },
  };
}
