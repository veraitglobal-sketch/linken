import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Resolve an existing case_studies row for confirmation requests.
 * Does not invent rows from mock data — case must already exist in DB.
 */
export async function ensureCaseStudyRow(
  supabase: SupabaseClient,
  companyId: string,
  _companySlug: string,
  caseSlug: string,
) {
  const existing = await supabase
    .from("case_studies")
    .select("id")
    .eq("company_id", companyId)
    .eq("slug", caseSlug)
    .maybeSingle();

  if (existing.error) {
    console.error("[ensureCaseStudyRow]", existing.error.message);
    return null;
  }

  return (existing.data?.id as string | undefined) ?? null;
}
