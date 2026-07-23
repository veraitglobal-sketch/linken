/**
 * Agent API — case studies list/create.
 * Checklist: every DB query is hard-scoped to ctx.companyId from the API key.
 * Never mutates partner/client confirmation flags.
 */
import type { NextRequest } from "next/server";
import { parseJsonBody, withAgentAuth } from "@/features/agent-api/handler";
import { agentOptions } from "@/features/agent-api/http";
import {
  mapCaseStudyAgentInput,
  type CaseStudyAgentJson,
} from "@/features/agent-api/case-study-body";
import { getAgentCaseStudy, listAgentCaseStudies } from "@/features/agent-api/queries";
import { createCaseStudyCore } from "@/features/case-studies/core";
import { createAdminClient } from "@/lib/supabase/admin";

export function OPTIONS() {
  return agentOptions();
}

export async function GET(request: NextRequest) {
  return withAgentAuth(request, "read", async (_req, ctx) => {
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

    const case_studies = await listAgentCaseStudies(admin, ctx.companyId);
    return {
      status: 200,
      body: { data: { case_studies, count: case_studies.length } },
      skipAudit: true,
    };
  });
}

export async function POST(request: NextRequest) {
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

    const parsed = await parseJsonBody<CaseStudyAgentJson>(req);

    if (!parsed.ok) {
      return {
        status: 422,
        body: {
          error: { code: "invalid_request", message: parsed.message },
        },
        auditAction: "case_study.create",
        auditSummary: "Rejected invalid body",
      };
    }

    const result = await createCaseStudyCore(admin, {
      companyId: ctx.companyId,
      ...mapCaseStudyAgentInput(parsed.data),
      title: String(parsed.data.title ?? ""),
      summary: String(parsed.data.summary ?? ""),
    });

    if (!result.ok) {
      return {
        status: 422,
        body: {
          error: { code: "invalid_request", message: result.error },
        },
        auditAction: "case_study.create",
        auditSummary: result.error,
      };
    }

    const caseStudy = await getAgentCaseStudy(admin, ctx.companyId, result.data.id);

    return {
      status: 201,
      body: { data: { ...result.data, case_study: caseStudy } },
      auditAction: "case_study.create",
      auditSummary: `Created case study: ${String(parsed.data.title ?? "")}`,
    };
  });
}
