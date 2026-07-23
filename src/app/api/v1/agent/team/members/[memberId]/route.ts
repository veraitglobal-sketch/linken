/**
 * Agent API — update/remove team member.
 */
import type { NextRequest } from "next/server";
import { parseJsonBody, withAgentAuth } from "@/features/agent-api/handler";
import { agentOptions } from "@/features/agent-api/http";
import {
  removeTeamMemberCore,
} from "@/features/team/core";
import {
  setMemberPermissionsCore,
  updateTeamMemberCore,
} from "@/features/team/member-core";
import { parseSectionPermissions } from "@/features/workspace/sections";
import { createAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ memberId: string }> };

export function OPTIONS() {
  return agentOptions();
}

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const { memberId } = await params;
  return withAgentAuth(request, "team:manage", async (req, ctx) => {
    const admin = createAdminClient();
    if (!admin) {
      return {
        status: 503,
        body: { error: { code: "service_unavailable", message: "Unavailable." } },
      };
    }

    const parsed = await parseJsonBody<{
      display_name?: string;
      display_title?: string;
      public_visible?: boolean;
      role?: string;
      permissions?: string[];
    }>(req);

    if (!parsed.ok) {
      return {
        status: 422,
        body: { error: { code: "invalid_request", message: parsed.message } },
        auditAction: "team.member.update",
        auditSummary: "Invalid body",
      };
    }

    if (parsed.data.permissions !== undefined) {
      const permResult = await setMemberPermissionsCore(admin, {
        companyId: ctx.companyId,
        memberId,
        permissions: parseSectionPermissions(parsed.data.permissions),
      });
      if (!permResult.ok) {
        return {
          status: 422,
          body: { error: { code: "invalid_request", message: permResult.error } },
          auditAction: "team.member.permissions",
          auditSummary: permResult.error,
        };
      }
    }

    const hasProfileFields =
      parsed.data.display_name !== undefined ||
      parsed.data.display_title !== undefined ||
      parsed.data.public_visible !== undefined ||
      parsed.data.role !== undefined;

    if (hasProfileFields) {
      const role =
        parsed.data.role === "admin"
          ? ("admin" as const)
          : parsed.data.role === "member"
            ? ("member" as const)
            : undefined;

      const result = await updateTeamMemberCore(admin, {
        companyId: ctx.companyId,
        memberId,
        display_name: parsed.data.display_name,
        display_title: parsed.data.display_title,
        public_visible: parsed.data.public_visible,
        role,
      });

      if (!result.ok) {
        const status = result.error === "Member not found." ? 404 : 422;
        return {
          status,
          body: {
            error: {
              code: status === 404 ? "not_found" : "invalid_request",
              message: result.error,
            },
          },
          auditAction: "team.member.update",
          auditSummary: result.error,
        };
      }
    }

    return {
      status: 200,
      body: { data: { member_id: memberId, updated: true } },
      auditAction: "team.member.update",
      auditSummary: `Updated member ${memberId}`,
    };
  });
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  const { memberId } = await params;
  return withAgentAuth(request, "team:manage", async (_req, ctx) => {
    const admin = createAdminClient();
    if (!admin) {
      return {
        status: 503,
        body: { error: { code: "service_unavailable", message: "Unavailable." } },
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
