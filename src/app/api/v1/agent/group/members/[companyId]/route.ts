/**
 * Agent API — end group membership (unilateral leave/remove).
 * Checklist: keyed company scopes the group; target must be in that group.
 */
import type { NextRequest } from "next/server";
import { getAgentCompanyOwnerMeta } from "@/features/agent-api/company-meta";
import { withAgentAuth } from "@/features/agent-api/handler";
import { agentOptions } from "@/features/agent-api/http";
import { endGroupMembershipCore } from "@/features/groups/core";
import { createAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ companyId: string }> };

export function OPTIONS() {
  return agentOptions();
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  const { companyId: targetCompanyId } = await params;
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

    const result = await endGroupMembershipCore(admin, {
      ownerUserId: meta.ownerUserId,
      companyId: ctx.companyId,
      targetCompanyId,
    });

    if (!result.ok) {
      return {
        status: 422,
        body: { error: { code: "invalid_request", message: result.error } },
        auditAction: "group.member.end",
        auditSummary: result.error,
      };
    }

    return {
      status: 200,
      body: { data: { company_id: result.data.company_id, ended: true } },
      auditAction: "group.member.end",
      auditSummary: `Ended membership for ${targetCompanyId}`,
    };
  });
}
