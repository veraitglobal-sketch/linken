/**
 * Agent API — refresh logo from website.
 * Checklist: every DB query is hard-scoped to ctx.companyId from the API key.
 */
import type { NextRequest } from "next/server";
import { getAgentCompanyOwnerMeta } from "@/features/agent-api/company-meta";
import { withAgentAuth } from "@/features/agent-api/handler";
import { agentOptions } from "@/features/agent-api/http";
import { refreshLogoCore } from "@/features/logo/core";
import { createAdminClient } from "@/lib/supabase/admin";

export function OPTIONS() {
  return agentOptions();
}

export async function POST(request: NextRequest) {
  return withAgentAuth(request, "content:write", async (_req, ctx) => {
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

    const meta = await getAgentCompanyOwnerMeta(admin, ctx.companyId);
    if (!meta) {
      return {
        status: 404,
        body: { error: { code: "not_found", message: "Company not found." } },
      };
    }

    const result = await refreshLogoCore(admin, ctx.companyId);
    if (!result.ok) {
      return {
        status: 422,
        body: { error: { code: "invalid_request", message: result.error } },
        auditAction: "logo.refresh",
        auditSummary: result.error,
      };
    }

    return {
      status: 200,
      body: { data: result.data },
      auditAction: "logo.refresh",
      auditSummary: "Refreshed logo from website",
    };
  });
}
