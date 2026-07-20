import "server-only";

import { redirect } from "next/navigation";
import { resolveActiveWorkspace } from "@/features/workspace/context";
import type { WorkspaceSection } from "@/features/workspace/sections";
import { createClient } from "@/lib/supabase/server";

/**
 * Server gate for dashboard sections. Owner/admin/operator pass; members need
 * the section in permissions. Does not authorize mutations alone.
 */
export async function assertSectionAccess(
  section: WorkspaceSection,
  opts?: { loginNext?: string },
) {
  const loginNext = opts?.loginNext ?? `/dashboard`;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(loginNext)}`);

  const workspace = await resolveActiveWorkspace();
  if (!workspace?.company || workspace.active?.type !== "company") {
    redirect(
      "/dashboard?error=" + encodeURIComponent("Switch to a company workspace"),
    );
  }

  const role = workspace.company.role;
  if (role === "owner" || role === "admin" || role === "operator") {
    return { user, company: workspace.company, role };
  }

  const { data: ok } = await supabase.rpc("has_section_access", {
    p_company_id: workspace.company.id,
    p_section: section,
  });

  if (!ok) {
    redirect("/dashboard?error=" + encodeURIComponent("No access to that section."));
  }

  return { user, company: workspace.company, role };
}

export async function getMemberSectionPermissions(
  companyId: string,
  userId: string,
): Promise<WorkspaceSection[] | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("company_members")
    .select("role, permissions")
    .eq("company_id", companyId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) return null;
  if (data.role === "owner" || data.role === "admin") return null;
  const { parseSectionPermissions } = await import(
    "@/features/workspace/sections"
  );
  return parseSectionPermissions(data.permissions);
}
