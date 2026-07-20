import "server-only";

import { redirect } from "next/navigation";
import { resolveActiveWorkspace } from "@/features/workspace/context";
import type { OwnedCompanyRow } from "@/features/workspace/require-owned";
import { createClient } from "@/lib/supabase/server";

const SELECT =
  "id, name, slug, website, verified, accepting_clients, logo_source, radar, widget_settings, claimed, created_by_company_id" as const;

export type OperatorCompanyRow = OwnedCompanyRow & {
  claimed: boolean | null;
  created_by_company_id: string | null;
};

/**
 * Active company where the viewer is is_company_operator (true owner, or
 * admin of the creator firm for an unclaimed branch).
 */
export async function requireOperatorActiveCompany(opts: { loginNext: string }) {
  const loginNext = opts.loginNext;
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

  const { data: allowed } = await supabase.rpc("is_company_operator", {
    p_company_id: workspace.company.id,
  });
  if (!allowed) {
    redirect(
      "/dashboard?error=" + encodeURIComponent("Not allowed for this company."),
    );
  }

  const { data: company } = await supabase
    .from("companies")
    .select(SELECT)
    .eq("id", workspace.company.id)
    .maybeSingle();

  if (!company) redirect("/onboarding");
  return {
    supabase,
    user,
    company: company as OperatorCompanyRow,
  };
}

/** Soft variant — null company when not an operator of the active workspace. */
export async function getOperatorActiveCompany() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { supabase, user: null, company: null as OperatorCompanyRow | null };
  }

  const workspace = await resolveActiveWorkspace();
  if (!workspace?.company || workspace.active?.type !== "company") {
    return { supabase, user, company: null };
  }

  const { data: allowed } = await supabase.rpc("is_company_operator", {
    p_company_id: workspace.company.id,
  });
  if (!allowed) return { supabase, user, company: null };

  const { data: company } = await supabase
    .from("companies")
    .select(SELECT)
    .eq("id", workspace.company.id)
    .maybeSingle();

  return {
    supabase,
    user,
    company: (company as OperatorCompanyRow | null) ?? null,
  };
}
