import { cache } from "react";
import { resolveActiveWorkspace } from "@/features/workspace/context";
import type { WorkspaceContext } from "@/features/workspace/types";
import { createClient } from "@/lib/supabase/server";

/**
 * Dashboard session: active workspace from cookie (validated) + company/group.
 * Prefer this over ad-hoc owner_id maybeSingle() queries.
 */
export const getDashboardSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      company: null,
      group: null,
      active: null as WorkspaceContext | null,
      contexts: [] as WorkspaceContext[],
    };
  }

  const workspace = await resolveActiveWorkspace();
  return {
    user,
    company: workspace?.company ?? null,
    group: workspace?.group ?? null,
    active: workspace?.active ?? null,
    contexts: workspace?.contexts ?? [],
  };
});
