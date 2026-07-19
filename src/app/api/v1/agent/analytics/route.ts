/**
 * Agent API — profile analytics for the key's company.
 * Checklist: every DB query is hard-scoped to ctx.companyId from the API key.
 */
import type { NextRequest } from "next/server";
import { withAgentAuth } from "@/features/agent-api/handler";
import { agentOptions } from "@/features/agent-api/http";
import { getAgentAnalytics } from "@/features/agent-api/queries";
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

    const days = Number(new URL(req.url).searchParams.get("days") ?? 30) || 30;
    const analytics = await getAgentAnalytics(admin, ctx.companyId, days);

    return {
      status: 200,
      body: { data: analytics },
      skipAudit: true,
    };
  });
}
