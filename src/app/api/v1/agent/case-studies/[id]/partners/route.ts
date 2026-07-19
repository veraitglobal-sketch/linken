/**
 * Agent API — tag/untag case study partners (confirmed=false always).
 * Checklist: every DB query is hard-scoped to ctx.companyId from the API key.
 */
import type { NextRequest } from "next/server";
import { parseJsonBody, withAgentAuth } from "@/features/agent-api/handler";
import { agentOptions } from "@/features/agent-api/http";
import {
  tagCaseStudyPartnerCore,
  untagCaseStudyPartnerCore,
} from "@/features/case-studies/core";
import { createAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ id: string }> };

export function OPTIONS() {
  return agentOptions();
}

export async function POST(request: NextRequest, { params }: Ctx) {
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
      partner_company_slug?: string;
      role?: string;
    }>(req);

    if (!parsed.ok) {
      return {
        status: 422,
        body: { error: { code: "invalid_request", message: parsed.message } },
        auditAction: "case_study.partner.tag",
        auditSummary: "Invalid body",
      };
    }

    const result = await tagCaseStudyPartnerCore(admin, {
      companyId: ctx.companyId,
      caseStudyId: id,
      partnerCompanySlug: String(parsed.data.partner_company_slug ?? ""),
      role: String(parsed.data.role ?? ""),
    });

    if (!result.ok) {
      const status = result.error.includes("not found") ? 404 : 422;
      return {
        status,
        body: {
          error: {
            code: status === 404 ? "not_found" : "invalid_request",
            message: result.error,
          },
        },
        auditAction: "case_study.partner.tag",
        auditSummary: result.error,
      };
    }

    return {
      status: 201,
      body: {
        data: {
          partner_company_id: result.data.partner_company_id,
          confirmed: false,
        },
      },
      auditAction: "case_study.partner.tag",
      auditSummary: `Tagged partner on case study ${id} (unconfirmed)`,
    };
  });
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
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

    const url = new URL(req.url);
    const partnerCompanyId =
      url.searchParams.get("partner_company_id") ??
      url.searchParams.get("partner_id") ??
      "";

    if (!partnerCompanyId) {
      return {
        status: 422,
        body: {
          error: {
            code: "invalid_request",
            message: "partner_company_id query param is required.",
          },
        },
        auditAction: "case_study.partner.untag",
        auditSummary: "Missing partner_company_id",
      };
    }

    const result = await untagCaseStudyPartnerCore(admin, {
      companyId: ctx.companyId,
      caseStudyId: id,
      partnerCompanyId,
    });

    if (!result.ok) {
      return {
        status: 404,
        body: { error: { code: "not_found", message: result.error } },
        auditAction: "case_study.partner.untag",
        auditSummary: result.error,
      };
    }

    return {
      status: 200,
      body: {
        data: {
          partner_company_id: result.data.partner_company_id,
          removed: true,
        },
      },
      auditAction: "case_study.partner.untag",
      auditSummary: `Removed partner tag on case study ${id}`,
    };
  });
}
