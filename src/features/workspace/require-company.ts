import "server-only";

import { redirect } from "next/navigation";
import { resolveActiveWorkspace } from "@/features/workspace/context";
import { createClient } from "@/lib/supabase/server";

const SWITCH = "/dashboard?error=" + encodeURIComponent("Switch to a company workspace");

/**
 * Active company for mutations. Cookie is preference only —
 * re-verifies membership (and optional owner_id) on the chosen id.
 */
export async function requireActiveCompany(opts?: {
  /** Default: any member role. Owner-only actions set this. */
  ownerOnly?: boolean;
  loginNext?: string;
}) {
  const loginNext = opts?.loginNext ?? "/dashboard";
  const workspace = await resolveActiveWorkspace();
  if (!workspace) redirect(`/login?next=${encodeURIComponent(loginNext)}`);

  if (!workspace.company || workspace.active?.type !== "company") {
    redirect(SWITCH);
  }

  const companyId = workspace.company.id;
  const supabase = await createClient();
  const workspaceRole = workspace.company.role;

  if (workspaceRole === "operator") {
    const { data: allowed } = await supabase.rpc("is_company_operator", {
      p_company_id: companyId,
    });
    if (!allowed) redirect(SWITCH);
    if (opts?.ownerOnly) redirect(SWITCH);
    return {
      supabase,
      userId: workspace.userId,
      company: workspace.company,
      role: "operator",
    };
  }

  const { data: membership } = await supabase
    .from("company_members")
    .select("role")
    .eq("company_id", companyId)
    .eq("user_id", workspace.userId)
    .maybeSingle();

  if (!membership) redirect(SWITCH);

  if (opts?.ownerOnly) {
    const { data: owned } = await supabase
      .from("companies")
      .select("id")
      .eq("id", companyId)
      .eq("owner_id", workspace.userId)
      .eq("claimed", true)
      .maybeSingle();
    if (!owned) redirect(SWITCH);
  }

  return {
    supabase,
    userId: workspace.userId,
    company: workspace.company,
    role: membership.role as string,
  };
}
