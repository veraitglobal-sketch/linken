/**
 * Agent API — list own inquiries (triage).
 * Checklist: every DB query is hard-scoped to ctx.companyId from the API key.
 */
import type { NextRequest } from "next/server";
import { withAgentAuth } from "@/features/agent-api/handler";
import { agentOptions } from "@/features/agent-api/http";
import { listAgentInquiries } from "@/features/agent-api/queries";
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

    const url = new URL(req.url);
    const status = url.searchParams.get("status") ?? undefined;
    const limit = Math.min(
      Math.max(Number(url.searchParams.get("limit") ?? 50) || 50, 1),
      100,
    );

    const inquiries = await listAgentInquiries(admin, ctx.companyId, {
      status,
      limit,
    });

    return {
      status: 200,
      body: { data: { inquiries, count: inquiries.length } },
      auditAction: "inquiries.read",
      auditSummary: `Listed ${inquiries.length} inquiries`,
    };
  });
}
