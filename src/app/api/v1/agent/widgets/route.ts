/**
 * Agent API — embed variant catalog with URLs/snippets for the keyed company.
 * Checklist: slug resolved only from ctx.companyId.
 */
import type { NextRequest } from "next/server";
import { getAgentCompanyOwnerMeta } from "@/features/agent-api/company-meta";
import { withAgentAuth } from "@/features/agent-api/handler";
import { agentOptions } from "@/features/agent-api/http";
import { listWidgetVariantsCore } from "@/features/widgets/core";
import { createAdminClient } from "@/lib/supabase/admin";

export function OPTIONS() {
  return agentOptions();
}

export async function GET(request: NextRequest) {
  return withAgentAuth(request, "settings:write", async (_req, ctx) => {
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

    const variants = listWidgetVariantsCore(meta.slug);
    return {
      status: 200,
      body: { data: { variants, count: variants.length } },
      skipAudit: true,
    };
  });
}
