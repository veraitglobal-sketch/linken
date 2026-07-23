/**
 * Agent API — team member photo upload.
 */
import type { NextRequest } from "next/server";
import { parseImageBody } from "@/features/agent-api/parse-image";
import { withAgentAuth } from "@/features/agent-api/handler";
import { agentOptions } from "@/features/agent-api/http";
import { uploadTeamMemberPhotoCore } from "@/features/team/member-core";
import { createAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ memberId: string }> };

export function OPTIONS() {
  return agentOptions();
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  const { memberId } = await params;
  return withAgentAuth(request, "team:manage", async (req, ctx) => {
    const admin = createAdminClient();
    if (!admin) {
      return {
        status: 503,
        body: { error: { code: "service_unavailable", message: "Unavailable." } },
      };
    }

    const image = await parseImageBody(req);
    if (!image.ok) {
      return {
        status: 422,
        body: { error: { code: "invalid_request", message: image.message } },
        auditAction: "team.member.photo",
        auditSummary: image.message,
      };
    }

    const result = await uploadTeamMemberPhotoCore(admin, {
      companyId: ctx.companyId,
      memberId,
      bytes: image.bytes,
      contentType: image.contentType,
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
        auditAction: "team.member.photo",
        auditSummary: result.error,
      };
    }

    return {
      status: 200,
      body: { data: result.data },
      auditAction: "team.member.photo",
      auditSummary: `Photo uploaded for ${memberId}`,
    };
  });
}
