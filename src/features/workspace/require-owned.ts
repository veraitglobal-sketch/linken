import "server-only";

import { redirect } from "next/navigation";
import { resolveActiveWorkspace } from "@/features/workspace/context";
import { requireActiveCompany } from "@/features/workspace/require-company";
import { createClient } from "@/lib/supabase/server";

const OWNED_SELECT =
  "id, name, slug, website, verified, accepting_clients, logo_source, radar, widget_settings" as const;

export type OwnedCompanyRow = {
  id: string;
  name: string;
  slug: string;
  website: string | null;
  verified: boolean | null;
  accepting_clients: boolean | null;
  logo_source: string | null;
  radar: boolean | null;
  widget_settings: unknown;
};

/**
 * True owner of the active claimed company. Cookie is not authorization —
 * owner_id is re-checked. Use requireOperatorActiveCompany for operational
 * mutations that should also work on unclaimed branches.
 */
export async function requireOwnedActiveCompany(opts: { loginNext: string }) {
  const { company: active } = await requireActiveCompany({
    ownerOnly: true,
    loginNext: opts.loginNext,
  });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(opts.loginNext)}`);

  const { data: company } = await supabase
    .from("companies")
    .select(OWNED_SELECT)
    .eq("id", active.id)
    .eq("owner_id", user.id)
    .eq("claimed", true)
    .maybeSingle();

  if (!company) redirect("/onboarding");
  return { supabase, user, company: company as OwnedCompanyRow };
}

/** Soft variant — returns nulls instead of redirecting. */
export async function getOwnedActiveCompany() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, company: null as OwnedCompanyRow | null };

  const workspace = await resolveActiveWorkspace();
  if (
    !workspace?.company ||
    workspace.active?.type !== "company" ||
    workspace.company.role !== "owner"
  ) {
    return { supabase, user, company: null };
  }

  const { data: company } = await supabase
    .from("companies")
    .select(OWNED_SELECT)
    .eq("id", workspace.company.id)
    .eq("owner_id", user.id)
    .eq("claimed", true)
    .maybeSingle();

  return {
    supabase,
    user,
    company: (company as OwnedCompanyRow | null) ?? null,
  };
}
