/**
 * Agent API — cancel pending team invitation.
 * Checklist: every DB query is hard-scoped to ctx.companyId from the API key.
 */
import type { NextRequest } from "next/server";
import { withAgentAuth } from "@/features/agent-api/handler";
import { agentOptions } from "@/features/agent-api/http";
import { cancelTeamInvitationCore } from "@/features/team/core";
import { createAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ id: string }> };

export function OPTIONS() {
  return agentOptions();
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
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

    const result = await cancelTeamInvitationCore(admin, ctx.companyId, id);
    if (!result.ok) {
      return {
        status: 404,
        body: { error: { code: "not_found", message: result.error } },
        auditAction: "team.invite.cancel",
        auditSummary: result.error,
      };
    }

    return {
      status: 200,
      body: { data: { id: result.data.id, cancelled: true } },
      auditAction: "team.invite.cancel",
      auditSummary: `Cancelled invitation ${id}`,
    };
  });
}
