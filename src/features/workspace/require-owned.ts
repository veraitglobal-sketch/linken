import "server-only";

import { redirect } from "next/navigation";
import { resolveActiveWorkspace } from "@/features/workspace/context";
import { createClient } from "@/lib/supabase/server";

const OWNED_SELECT =
  "id, name, slug, website, verified, accepting_clients, logo_source, radar, widget_settings, plan" as const;

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
  plan: string | null;
};

async function loadOwnedClaimed(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  preferredId?: string | null,
): Promise<OwnedCompanyRow | null> {
  if (preferredId) {
    const { data } = await supabase
      .from("companies")
      .select(OWNED_SELECT)
      .eq("id", preferredId)
      .eq("owner_id", userId)
      .eq("claimed", true)
      .maybeSingle();
    if (data) return data as OwnedCompanyRow;
  }

  const { data } = await supabase
    .from("companies")
    .select(OWNED_SELECT)
    .eq("owner_id", userId)
    .eq("claimed", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return (data as OwnedCompanyRow | null) ?? null;
}

function preferredOwnerId(
  workspace: Awaited<ReturnType<typeof resolveActiveWorkspace>>,
) {
  if (
    workspace?.company &&
    workspace.active?.type === "company" &&
    workspace.company.role === "owner"
  ) {
    return workspace.company.id;
  }
  return null;
}

/**
 * True owner of a claimed company. Cookie is preference only — if it
 * points at a group or is missing, fall back to the oldest owned firm.
 */
export async function requireOwnedActiveCompany(opts: { loginNext: string }) {
  const { supabase, user, company } = await getOwnedActiveCompany();
  if (!user) redirect(`/login?next=${encodeURIComponent(opts.loginNext)}`);
  if (!company) {
    const join = opts.loginNext.includes("?") ? "&" : "?";
    redirect(
      `${opts.loginNext}${join}error=${encodeURIComponent("Create a company profile on this page first.")}`,
    );
  }
  return { supabase, user, company };
}

/** Soft variant — returns nulls instead of redirecting. */
export async function getOwnedActiveCompany() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { supabase, user: null, company: null as OwnedCompanyRow | null };
  }

  const workspace = await resolveActiveWorkspace();
  const company = await loadOwnedClaimed(
    supabase,
    user.id,
    preferredOwnerId(workspace),
  );
  return { supabase, user, company };
}
