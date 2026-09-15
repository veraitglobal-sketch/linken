import "server-only";
import { getEntitlements, parsePlan } from "@/features/plan/entitlements";
import type { ConsentCompany } from "@/features/oauth/types";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export type { ConsentCompany };

export async function listConsentCompanies(userId: string): Promise<ConsentCompany[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("company_members")
    .select("role, company:companies!company_id(id, name, plan)")
    .eq("user_id", userId)
    .in("role", ["owner", "admin"]);

  const out: ConsentCompany[] = [];
  for (const row of data ?? []) {
    const company = Array.isArray(row.company) ? row.company[0] : row.company;
    if (!company?.id) continue;
    out.push({
      id: company.id as string,
      name: (company.name as string) || "Company",
      agentApi: getEntitlements(parsePlan(company.plan)).agentApi,
    });
  }
  return out;
}

export async function userCanIssueConnector(
  admin: SupabaseClient,
  userId: string,
  companyId: string,
): Promise<{ ok: true } | { ok: false; reason: "role" | "plan" }> {
  const { data: member } = await admin
    .from("company_members")
    .select("role")
    .eq("company_id", companyId)
    .eq("user_id", userId)
    .maybeSingle();
  const role = member?.role as string | undefined;
  if (role !== "owner" && role !== "admin") return { ok: false, reason: "role" };

  const { data: company } = await admin
    .from("companies")
    .select("plan")
    .eq("id", companyId)
    .maybeSingle();
  if (!getEntitlements(parsePlan(company?.plan)).agentApi) {
    return { ok: false, reason: "plan" };
  }
  return { ok: true };
}
