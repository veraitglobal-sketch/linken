/**
 * Agent API — case study read/update/delete.
 */
import type { NextRequest } from "next/server";
import {
  mapCaseStudyAgentInput,
  type CaseStudyAgentJson,
} from "@/features/agent-api/case-study-body";
import { parseJsonBody, withAgentAuth } from "@/features/agent-api/handler";
import { agentOptions } from "@/features/agent-api/http";
import { getAgentCaseStudy } from "@/features/agent-api/queries";
import { fetchRemoteImage } from "@/features/agent-api/fetch-image";
import {
  uploadCaseStudyCoverCore,
} from "@/features/case-studies/media-core";
import {
  deleteCaseStudyCore,
  updateCaseStudyCore,
} from "@/features/case-studies/core";
import { createAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ id: string }> };

export function OPTIONS() {
  return agentOptions();
}

export async function GET(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return withAgentAuth(request, "read", async (_req, ctx) => {
    const admin = createAdminClient();
    if (!admin) {
      return {
        status: 503,
        body: { error: { code: "service_unavailable", message: "Unavailable." } },
      };
    }

    const caseStudy = await getAgentCaseStudy(admin, ctx.companyId, id);
    if (!caseStudy) {
      return {
        status: 404,
        body: { error: { code: "not_found", message: "Case study not found." } },
      };
    }

    return {
      status: 200,
      body: { data: { case_study: caseStudy } },
      skipAudit: true,
    };
  });
}

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return withAgentAuth(request, "content:write", async (req, ctx) => {
    const admin = createAdminClient();
    if (!admin) {
      return {
        status: 503,
        body: { error: { code: "service_unavailable", message: "Unavailable." } },
      };
    }

    const parsed = await parseJsonBody<CaseStudyAgentJson & { cover_image_url?: string }>(req);
    if (!parsed.ok) {
      return {
        status: 422,
        body: { error: { code: "invalid_request", message: parsed.message } },
        auditAction: "case_study.update",
        auditSummary: "Rejected invalid body",
      };
    }

    const { cover_image_url, ...content } = parsed.data;
    if (cover_image_url) {
      const remote = await fetchRemoteImage(String(cover_image_url));
      if (!remote.ok) {
        return {
          status: 422,
          body: { error: { code: "invalid_request", message: remote.message } },
          auditAction: "case_study.cover.upload",
          auditSummary: remote.message,
        };
      }
      const coverResult = await uploadCaseStudyCoverCore(admin, {
        companyId: ctx.companyId,
        caseStudyId: id,
        bytes: remote.bytes,
        contentType: remote.contentType,
      });
      if (!coverResult.ok) {
        const status = coverResult.error === "Case study not found." ? 404 : 422;
        return {
          status,
          body: {
            error: {
              code: status === 404 ? "not_found" : "invalid_request",
              message: coverResult.error,
            },
          },
          auditAction: "case_study.cover.upload",
          auditSummary: coverResult.error,
        };
      }
    }

    const mapped = mapCaseStudyAgentInput(content);
    const hasContent = Object.values(mapped).some((v) => v !== undefined);

    if (!hasContent && !cover_image_url) {
      return {
        status: 422,
        body: {
          error: {
            code: "invalid_request",
            message:
              "No fields to update. Send content fields or cover_image_url (remote URL). For binary uploads use PUT /case-studies/{id}/cover.",
          },
        },
        auditAction: "case_study.update",
        auditSummary: "No fields to update",
      };
    }

    let caseStudyId = id;
    if (hasContent) {
      const result = await updateCaseStudyCore(admin, {
        companyId: ctx.companyId,
        caseStudyId: id,
        ...mapped,
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
          auditAction: "case_study.update",
          auditSummary: result.error,
        };
      }
      caseStudyId = result.data.id;
    }

    const caseStudy = await getAgentCaseStudy(admin, ctx.companyId, caseStudyId);
    return {
      status: 200,
      body: { data: { id: caseStudyId, case_study: caseStudy } },
      auditAction: cover_image_url ? "case_study.cover.upload" : "case_study.update",
      auditSummary: cover_image_url
        ? `Updated cover for case study ${id}`
        : `Updated case study ${id}`,
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

    const result = await deleteCaseStudyCore(admin, ctx.companyId, id);
    if (!result.ok) {
      return {
        status: 404,
        body: { error: { code: "not_found", message: result.error } },
        auditAction: "case_study.delete",
        auditSummary: result.error,
      };
    }

    return {
      status: 200,
      body: { data: { id: result.data.id, deleted: true } },
      auditAction: "case_study.delete",
      auditSummary: `Deleted case study ${id}`,
    };
  });
}
