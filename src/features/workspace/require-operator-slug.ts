import "server-only";

import { redirect } from "next/navigation";
import type { OperatorCompanyRow } from "@/features/workspace/require-operator";
import { createClient } from "@/lib/supabase/server";

const SELECT =
  "id, name, slug, website, verified, accepting_clients, logo_source, radar, widget_settings, claimed, created_by_company_id" as const;

/**
 * Authorize by company slug (public profile / wall forms).
 * Does not depend on the workspace cookie — cookie is preference only.
 */
export async function requireOperatorForCompanySlug(opts: {
  slug: string;
  loginNext: string;
}) {
  const slug = opts.slug.trim();
  const loginNext = opts.loginNext;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(loginNext)}`);

  if (!slug) {
    redirect(
      `${loginNext}?error=${encodeURIComponent("Missing company.")}`,
    );
  }

  const { data: company } = await supabase
    .from("companies")
    .select(SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (!company) {
    redirect(
      `${loginNext}?error=${encodeURIComponent("Company not found.")}`,
    );
  }

  const { data: allowed } = await supabase.rpc("is_company_operator", {
    p_company_id: company.id,
  });
  if (!allowed) {
    redirect(
      `${loginNext}?error=${encodeURIComponent("Not allowed for this company.")}`,
    );
  }

  return {
    supabase,
    user,
    company: company as OperatorCompanyRow,
  };
}
