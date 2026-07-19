/**
 * Agent API — case study update/delete.
 * Checklist: every DB query is hard-scoped to ctx.companyId from the API key.
 * Content only — never touches confirmation flags on partners/clients.
 */
import type { NextRequest } from "next/server";
import { parseJsonBody, withAgentAuth } from "@/features/agent-api/handler";
import { agentOptions } from "@/features/agent-api/http";
import {
  deleteCaseStudyCore,
  updateCaseStudyCore,
} from "@/features/case-studies/core";
import { createAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ id: string }> };

export function OPTIONS() {
  return agentOptions();
}

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return withAgentAuth(request, "content:write", async (req, ctx) => {
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

    const parsed = await parseJsonBody<{
      title?: string;
      summary?: string;
      challenge?: string;
      outcome?: string;
      location?: string;
      year?: string;
      services?: string[];
    }>(req);

    if (!parsed.ok) {
      return {
        status: 422,
        body: {
          error: { code: "invalid_request", message: parsed.message },
        },
        auditAction: "case_study.update",
        auditSummary: "Rejected invalid body",
      };
    }

    const result = await updateCaseStudyCore(admin, {
      companyId: ctx.companyId,
      caseStudyId: id,
      ...parsed.data,
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

    return {
      status: 200,
      body: { data: { id: result.data.id } },
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
        body: {
          error: {
            code: "service_unavailable",
            message: "Agent API is unavailable.",
          },
        },
      };
    }

    const result = await deleteCaseStudyCore(admin, ctx.companyId, id);
    if (!result.ok) {
      return {
        status: 404,
        body: {
          error: { code: "not_found", message: result.error },
        },
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
