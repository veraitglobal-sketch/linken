/**
 * Agent API — create auto-confirmed subsidiary (owner structure statement).
 * Checklist: every DB query is hard-scoped to ctx.companyId from the API key.
 */
import type { NextRequest } from "next/server";
import { getAgentCompanyOwnerMeta } from "@/features/agent-api/company-meta";
import { parseJsonBody, withAgentAuth } from "@/features/agent-api/handler";
import { agentOptions } from "@/features/agent-api/http";
import { createSubsidiaryCore } from "@/features/groups/core";
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
      name?: string;
      category?: string;
      city?: string;
      country?: string;
      website?: string;
      parent_company_id?: string;
    }>(req);

    if (!parsed.ok) {
      return {
        status: 422,
        body: { error: { code: "invalid_request", message: parsed.message } },
        auditAction: "group.subsidiary.create",
        auditSummary: "Invalid body",
      };
    }

    const result = await createSubsidiaryCore(admin, {
      ownerUserId: meta.ownerUserId,
      companyId: ctx.companyId,
      name: String(parsed.data.name ?? ""),
      category: String(parsed.data.category ?? ""),
      city: String(parsed.data.city ?? ""),
      country: String(parsed.data.country ?? ""),
      website: parsed.data.website,
      parentCompanyId: parsed.data.parent_company_id,
    });

    if (!result.ok) {
      return {
        status: 422,
        body: { error: { code: "invalid_request", message: result.error } },
        auditAction: "group.subsidiary.create",
        auditSummary: result.error,
      };
    }

    return {
      status: 201,
      body: { data: result.data },
      auditAction: "group.subsidiary.create",
      auditSummary: `Created subsidiary ${result.data.slug}`,
    };
  });
}
