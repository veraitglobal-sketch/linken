/**
 * Agent API — list own partnerships (read-only).
 * Checklist: every DB query is hard-scoped to ctx.companyId from the API key.
 * No accept/decline endpoints — confirmations are human-only.
 */
import type { NextRequest } from "next/server";
import { withAgentAuth } from "@/features/agent-api/handler";
import { agentOptions } from "@/features/agent-api/http";
import { listAgentPartnerships } from "@/features/agent-api/queries";
import { createAdminClient } from "@/lib/supabase/admin";

export function OPTIONS() {
  return agentOptions();
}

export async function GET(request: NextRequest) {
  return withAgentAuth(request, "read", async (req, ctx) => {
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

    const status = new URL(req.url).searchParams.get("status") ?? undefined;
    const partnerships = await listAgentPartnerships(
      admin,
      ctx.companyId,
      status ?? undefined,
    );

    return {
      status: 200,
      body: { data: { partnerships, count: partnerships.length } },
      skipAudit: true,
    };
  });
}
