/**
 * Agent API — remove team member by opaque member_id (not user_id).
 * Checklist: every DB query is hard-scoped to ctx.companyId from the API key.
 * No accept endpoint — invitees join via /join.
 */
import type { NextRequest } from "next/server";
import { withAgentAuth } from "@/features/agent-api/handler";
import { agentOptions } from "@/features/agent-api/http";
import { removeTeamMemberCore } from "@/features/team/core";
import { createAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ memberId: string }> };

export function OPTIONS() {
  return agentOptions();
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  const { memberId } = await params;
  return withAgentAuth(request, "team:manage", async (_req, ctx) => {
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

    const result = await removeTeamMemberCore(admin, ctx.companyId, memberId);
    if (!result.ok) {
      const status =
        result.error === "Cannot remove the company owner." ? 422 : 404;
      return {
        status,
        body: {
          error: {
            code: status === 404 ? "not_found" : "invalid_request",
            message: result.error,
          },
        },
        auditAction: "team.member.remove",
        auditSummary: result.error,
      };
    }

    return {
      status: 200,
      body: { data: { member_id: result.data.member_id, removed: true } },
      auditAction: "team.member.remove",
      auditSummary: `Removed member ${memberId}`,
    };
  });
}
