import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site";
import type { TestimonialSource } from "@/features/testimonials/types";

export type PendingTestimonialInvite = {
  id: string;
  source: TestimonialSource;
  authorEmail: string | null;
  authorCompanyId: string | null;
  authorCompanyName: string | null;
  createdAt: string;
  url: string;
};

/** Pending invites via owner-only security definer RPC. */
export async function getPendingTestimonialInvites(
  companyId: string,
): Promise<PendingTestimonialInvite[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_pending_testimonial_invites", {
    p_company_id: companyId,
  });
  if (error || !data) return [];

  const site = getSiteUrl();
  return (data as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id),
    source: row.source as TestimonialSource,
    authorEmail: (row.author_email as string | null) ?? null,
    authorCompanyId: (row.author_company_id as string | null) ?? null,
    authorCompanyName: (row.author_company_name as string | null)?.trim() || null,
    createdAt: String(row.created_at),
    url: `${site}/testimonial/${row.submit_token as string}`,
  }));
}
