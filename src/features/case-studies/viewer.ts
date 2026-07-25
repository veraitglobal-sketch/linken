import { resolveActiveWorkspace } from "@/features/workspace/context";
import { createClient } from "@/lib/supabase/server";

/**
 * True if the signed-in user can operate the company at this public slug.
 * Does not depend on the workspace cookie — cookie is preference only.
 */
export async function isCompanyOwnerSlug(slug: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: company } = await supabase
      .from("companies")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!company) return false;

    const { data: allowed } = await supabase.rpc("is_company_operator", {
      p_company_id: company.id,
    });

    return Boolean(allowed);
  } catch {
    return false;
  }
}

export async function getViewerCompany() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { user: null, company: null };

    const workspace = await resolveActiveWorkspace();
    if (
      workspace?.company &&
      workspace.active?.type === "company" &&
      workspace.company.role === "owner"
    ) {
      const { data: company } = await supabase
        .from("companies")
        .select("id, name, slug, logo_url")
        .eq("id", workspace.company.id)
        .eq("owner_id", user.id)
        .eq("claimed", true)
        .maybeSingle();
      if (company) return { user, company };
    }

    const { data: company } = await supabase
      .from("companies")
      .select("id, name, slug, logo_url")
      .eq("owner_id", user.id)
      .eq("claimed", true)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    return { user, company };
  } catch {
    return { user: null, company: null };
  }
}
