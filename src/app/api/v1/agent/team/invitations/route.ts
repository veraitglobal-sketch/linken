/**
 * Agent API — create team invitation (human accepts via /join).
 * Checklist: every DB query is hard-scoped to ctx.companyId from the API key.
 */
import type { NextRequest } from "next/server";
import { maskEmail } from "@/features/agent-api/audit";
import { getAgentCompanyOwnerMeta } from "@/features/agent-api/company-meta";
import { parseJsonBody, withAgentAuth } from "@/features/agent-api/handler";
import { agentOptions } from "@/features/agent-api/http";
import { inviteTeamMemberCore } from "@/features/team/core";
import { createAdminClient } from "@/lib/supabase/admin";

export function OPTIONS() {
  return agentOptions();
}

export async function POST(request: NextRequest) {
  return withAgentAuth(request, "team:manage", async (req, ctx) => {
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
      first_name?: string;
      last_name?: string;
      title?: string;
      email?: string;
      role?: string;
    }>(req);

    if (!parsed.ok) {
      return {
        status: 422,
        body: { error: { code: "invalid_request", message: parsed.message } },
        auditAction: "team.invite",
        auditSummary: "Invalid body",
      };
    }

    const role =
      parsed.data.role === "admin" ? ("admin" as const) : ("member" as const);
    const email = String(parsed.data.email ?? "");

    const result = await inviteTeamMemberCore(admin, {
      companyId: ctx.companyId,
      ownerUserId: meta.ownerUserId,
      companyName: meta.name,
      firstName: String(parsed.data.first_name ?? ""),
      lastName: String(parsed.data.last_name ?? ""),
      title: String(parsed.data.title ?? ""),
      email,
      role,
    });

    if (!result.ok) {
      return {
        status: 422,
        body: { error: { code: "invalid_request", message: result.error } },
        auditAction: "team.invite",
        auditSummary: result.error,
      };
    }

    return {
      status: 201,
      body: { data: { invited: true, email: result.data.email, role } },
      auditAction: "team.invite",
      auditSummary: `Invited teammate ${maskEmail(email)} as ${role}`,
    };
  });
}
