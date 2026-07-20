import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";
import { parsePlan } from "@/features/plan/entitlements";
import {
  parseWorkspaceCookie,
  WORKSPACE_COOKIE,
} from "@/features/workspace/cookie";
import { pickDefaultWorkspace } from "@/features/workspace/pick-default";
import { parseSectionPermissions } from "@/features/workspace/sections";
import type {
  DashboardCompany,
  WorkspaceContext,
  WorkspaceGroupBrief,
  WorkspaceRole,
} from "@/features/workspace/types";
import { getWorkspaceContexts } from "@/features/workspace/workspace-contexts";
import { createClient } from "@/lib/supabase/server";

export { getWorkspaceContexts };

export type ActiveWorkspace = {
  userId: string;
  contexts: WorkspaceContext[];
  active: WorkspaceContext | null;
  company: DashboardCompany | null;
  group: WorkspaceGroupBrief | null;
};

async function loadCompanySession(
  companyId: string,
  role: WorkspaceRole,
): Promise<DashboardCompany | null> {
  const supabase = await createClient();
  const claimedRequired = role !== "operator";
  let query = supabase
    .from("companies")
    .select(
      "id, name, slug, category, city, verified, accepting_clients, plan, radar, receive_intros, intro_suspended_until, claimed",
    )
    .eq("id", companyId);

  if (claimedRequired) query = query.eq("claimed", true);
  else query = query.eq("claimed", false);

  const { data } = await query.maybeSingle();
  if (!data) return null;

  let permissions: DashboardCompany["permissions"] = null;
  if (role === "member") {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: mem } = await supabase
        .from("company_members")
        .select("permissions")
        .eq("company_id", companyId)
        .eq("user_id", user.id)
        .maybeSingle();
      permissions = parseSectionPermissions(mem?.permissions);
    } else {
      permissions = [];
    }
  }

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    category: (data.category as string) ?? "",
    city: (data.city as string) ?? "",
    verified: Boolean(data.verified),
    acceptingClients: data.accepting_clients !== false,
    plan: parsePlan(data.plan),
    radar: Boolean(data.radar),
    receiveIntros: data.receive_intros !== false,
    introSuspendedUntil: (data.intro_suspended_until as string | null) ?? null,
    role,
    claimed: data.claimed !== false,
    permissions,
  };
}

/**
 * Cookie preference + validated access. Never authorizes — only picks display context.
 */
export const resolveActiveWorkspace = cache(
  async (): Promise<ActiveWorkspace | null> => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const contexts = await getWorkspaceContexts(user.id);
    const jar = await cookies();
    const pref = parseWorkspaceCookie(jar.get(WORKSPACE_COOKIE)?.value);

    let active: WorkspaceContext | null = null;
    if (pref) {
      active =
        contexts.find((c) => c.type === pref.type && c.id === pref.id) ?? null;
    }
    if (!active) active = pickDefaultWorkspace(contexts);

    let company: DashboardCompany | null = null;
    let group: WorkspaceGroupBrief | null = null;

    if (active?.type === "company") {
      company = await loadCompanySession(active.id, active.role);
      if (!company) {
        active = pickDefaultWorkspace(
          contexts.filter((c) => !(c.type === "company" && c.id === active!.id)),
        );
        if (active?.type === "company") {
          company = await loadCompanySession(active.id, active.role);
        }
      }
    }

    if (active?.type === "group") {
      group = {
        id: active.id,
        name: active.name,
        slug: active.slug,
        logoUrl: active.logoUrl,
        website: active.website,
      };
    }

    return { userId: user.id, contexts, active, company, group };
  },
);
