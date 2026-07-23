/**
 * Agent API — company profile.
 * Checklist: every DB query is hard-scoped to ctx.companyId from the API key.
 */
import type { NextRequest } from "next/server";
import { parseJsonBody, withAgentAuth } from "@/features/agent-api/handler";
import { agentOptions } from "@/features/agent-api/http";
import { getAgentCompany } from "@/features/agent-api/queries";
import { updateCompanyAgentCore } from "@/features/company/agent-patch";
import { createAdminClient } from "@/lib/supabase/admin";

export function OPTIONS() {
  return agentOptions();
}

export async function GET(request: NextRequest) {
  return withAgentAuth(request, "read", async (_req, ctx) => {
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

    const company = await getAgentCompany(admin, ctx.companyId);
    if (!company) {
      return {
        status: 404,
        body: {
          error: { code: "not_found", message: "Company not found." },
        },
      };
    }

    return { status: 200, body: { data: company }, skipAudit: true };
  });
}

export async function PATCH(request: NextRequest) {
  return withAgentAuth(request, "content:write", async (req, ctx) => {
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

    const parsed = await parseJsonBody<Record<string, unknown>>(req);
    if (!parsed.ok) {
      return {
        status: 422,
        body: {
          error: { code: "invalid_request", message: parsed.message },
        },
        auditAction: "company.update",
        auditSummary: "Rejected invalid company patch",
      };
    }

    const result = await updateCompanyAgentCore(
      admin,
      ctx.companyId,
      parsed.data,
    );

    if (!result.ok) {
      return {
        status: 422,
        body: {
          error: { code: "invalid_request", message: result.error },
        },
        auditAction: "company.update",
        auditSummary: result.error,
      };
    }

    return {
      status: 200,
      body: {
        data: {
          updated: result.data.updated,
          ...(result.data.slug ? { slug: result.data.slug } : {}),
        },
      },
      auditAction: "company.update",
      auditSummary: `Updated fields: ${result.data.updated.join(", ")}`,
    };
  });
}
