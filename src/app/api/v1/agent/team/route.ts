/**
 * Agent API — list team members + pending invites (no user_id).
 * Checklist: every DB query is hard-scoped to ctx.companyId from the API key.
 */
import type { NextRequest } from "next/server";
import { withAgentAuth } from "@/features/agent-api/handler";
import { agentOptions } from "@/features/agent-api/http";
import { listTeamCore } from "@/features/team/core";
import { createAdminClient } from "@/lib/supabase/admin";

export function OPTIONS() {
  return agentOptions();
}

export async function GET(request: NextRequest) {
  return withAgentAuth(request, "team:manage", async (_req, ctx) => {
    const admin = createAdminClient();
    if (!admin) {
      return {
        status: 503,
        body: {
          error: {
            code: "service_unavailable",
            message: "Agent API is unavailable.",
          },
        },
      };
    }

    const result = await listTeamCore(admin, ctx.companyId);
    if (!result.ok) {
      return {
        status: 500,
        body: { error: { code: "internal", message: result.error } },
      };
    }

    return {
      status: 200,
      body: { data: result.data },
      skipAudit: true,
    };
  });
}
