/**
 * Agent API — set/propose group parent (existing set_group_parent rules).
 * Checklist: every DB query is hard-scoped to ctx.companyId from the API key.
 */
import type { NextRequest } from "next/server";
import { getAgentCompanyOwnerMeta } from "@/features/agent-api/company-meta";
import { parseJsonBody, withAgentAuth } from "@/features/agent-api/handler";
import { agentOptions } from "@/features/agent-api/http";
import { setGroupParentCore } from "@/features/groups/core";
import { createAdminClient } from "@/lib/supabase/admin";

export function OPTIONS() {
  return agentOptions();
}

export async function POST(request: NextRequest) {
  return withAgentAuth(request, "structure:manage", async (req, ctx) => {
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

    const parsed = await parseJsonBody<{
      company_id?: string;
      parent_company_id?: string | null;
    }>(req);

    if (!parsed.ok) {
      return {
        status: 422,
        body: { error: { code: "invalid_request", message: parsed.message } },
        auditAction: "group.parent",
        auditSummary: "Invalid body",
      };
    }

    const childId = String(parsed.data.company_id ?? "").trim();
    if (!childId) {
      return {
        status: 422,
        body: {
          error: {
            code: "invalid_request",
            message: "company_id is required.",
          },
        },
        auditAction: "group.parent",
        auditSummary: "Missing company_id",
      };
    }

    const parentRaw = parsed.data.parent_company_id;
    const parentCompanyId =
      parentRaw === null || parentRaw === undefined || parentRaw === ""
        ? null
        : String(parentRaw);

    const result = await setGroupParentCore(admin, {
      ownerUserId: meta.ownerUserId,
      companyId: ctx.companyId,
      childCompanyId: childId,
      parentCompanyId,
    });

    if (!result.ok) {
      return {
        status: 422,
        body: { error: { code: "invalid_request", message: result.error } },
        auditAction: "group.parent",
        auditSummary: result.error,
      };
    }

    return {
      status: 200,
      body: { data: result.data },
      auditAction: "group.parent",
      auditSummary: `Parent ${result.data.status} for ${childId}`,
    };
  });
}
