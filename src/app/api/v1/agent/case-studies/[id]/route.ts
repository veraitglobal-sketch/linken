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

    const parsed = await parseJsonBody<CaseStudyAgentJson>(req);
    if (!parsed.ok) {
      return {
        status: 422,
        body: { error: { code: "invalid_request", message: parsed.message } },
        auditAction: "case_study.update",
        auditSummary: "Rejected invalid body",
      };
    }

    const result = await updateCaseStudyCore(admin, {
      companyId: ctx.companyId,
      caseStudyId: id,
      ...mapCaseStudyAgentInput(parsed.data),
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

    const caseStudy = await getAgentCaseStudy(admin, ctx.companyId, id);
    return {
      status: 200,
      body: { data: { id: result.data.id, case_study: caseStudy } },
      auditAction: "case_study.update",
      auditSummary: `Updated case study ${id}`,
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
