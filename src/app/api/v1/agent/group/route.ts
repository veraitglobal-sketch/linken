/**
 * Agent API — company group read/create.
 * Checklist: every DB query is hard-scoped to ctx.companyId from the API key.
 */
import type { NextRequest } from "next/server";
import { getAgentCompanyOwnerMeta } from "@/features/agent-api/company-meta";
import { parseJsonBody, withAgentAuth } from "@/features/agent-api/handler";
import { agentOptions } from "@/features/agent-api/http";
import { createGroupCore, getGroupForCompanyCore } from "@/features/groups/core";
import { createAdminClient } from "@/lib/supabase/admin";

export function OPTIONS() {
  return agentOptions();
}

export async function GET(request: NextRequest) {
  return withAgentAuth(request, "structure:manage", async (_req, ctx) => {
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

    const result = await getGroupForCompanyCore(
      admin,
      ctx.companyId,
      meta.ownerUserId,
    );
    if (!result.ok) {
      return {
        status: 404,
        body: { error: { code: "not_found", message: result.error } },
      };
    }

    return {
      status: 200,
      body: { data: result.data },
      skipAudit: true,
    };
  });
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
      description?: string;
      website?: string;
    }>(req);
    if (!parsed.ok) {
      return {
        status: 422,
        body: { error: { code: "invalid_request", message: parsed.message } },
        auditAction: "group.create",
        auditSummary: "Invalid body",
      };
    }

    const result = await createGroupCore(admin, {
      ownerUserId: meta.ownerUserId,
      companyId: ctx.companyId,
      name: String(parsed.data.name ?? ""),
      description: parsed.data.description,
      website: parsed.data.website,
    });

    if (!result.ok) {
      return {
        status: 422,
        body: { error: { code: "invalid_request", message: result.error } },
        auditAction: "group.create",
        auditSummary: result.error,
      };
    }

    return {
      status: 201,
      body: { data: result.data },
      auditAction: "group.create",
      auditSummary: `Created group ${result.data.slug}`,
    };
  });
}
