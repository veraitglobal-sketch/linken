/**
 * Agent API — case study cover upload/clear.
 */
import type { NextRequest } from "next/server";
import { parseImageBody } from "@/features/agent-api/parse-image";
import { withAgentAuth } from "@/features/agent-api/handler";
import { agentOptions } from "@/features/agent-api/http";
import {
  clearCaseStudyCoverCore,
  uploadCaseStudyCoverCore,
} from "@/features/case-studies/media-core";
import { createAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ id: string }> };

export function OPTIONS() {
  return agentOptions();
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return withAgentAuth(request, "content:write", async (req, ctx) => {
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
        auditAction: "case_study.cover.upload",
        auditSummary: image.message,
      };
    }

    const result = await uploadCaseStudyCoverCore(admin, {
      companyId: ctx.companyId,
      caseStudyId: id,
      bytes: image.bytes,
      contentType: image.contentType,
    });

    if (!result.ok) {
      const status = result.error === "Case study not found." ? 404 : 422;
      return {
        status,
        body: {
          error: {
            code: status === 404 ? "not_found" : "invalid_request",
            message: result.error,
          },
        },
        auditAction: "case_study.cover.upload",
        auditSummary: result.error,
      };
    }

    return {
      status: 200,
      body: { data: result.data },
      auditAction: "case_study.cover.upload",
      auditSummary: `Cover uploaded for ${id}`,
    };
  });
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return withAgentAuth(request, "content:write", async (_req, ctx) => {
    const admin = createAdminClient();
    if (!admin) {
      return {
        status: 503,
        body: { error: { code: "service_unavailable", message: "Unavailable." } },
      };
    }

    const result = await clearCaseStudyCoverCore(admin, ctx.companyId, id);
    if (!result.ok) {
      return {
        status: 404,
        body: { error: { code: "not_found", message: result.error } },
        auditAction: "case_study.cover.clear",
        auditSummary: result.error,
      };
    }

    return {
      status: 200,
      body: { data: result.data },
      auditAction: "case_study.cover.clear",
      auditSummary: `Cover cleared for ${id}`,
    };
  });
}
