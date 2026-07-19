/**
 * Agent API — triage inquiry status (own inquiries only).
 * Checklist: every DB query is hard-scoped to ctx.companyId from the API key.
 */
import type { NextRequest } from "next/server";
import { parseJsonBody, withAgentAuth } from "@/features/agent-api/handler";
import { agentOptions } from "@/features/agent-api/http";
import { updateInquiryStatusCore } from "@/features/inquiries/core";
import { createAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ id: string }> };

export function OPTIONS() {
  return agentOptions();
}

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return withAgentAuth(request, "inquiries:manage", async (req, ctx) => {
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

    const parsed = await parseJsonBody<{ status?: string }>(req);
    if (!parsed.ok) {
      return {
        status: 422,
        body: { error: { code: "invalid_request", message: parsed.message } },
        auditAction: "inquiry.update",
        auditSummary: "Invalid body",
      };
    }

    const result = await updateInquiryStatusCore(
      admin,
      ctx.companyId,
      id,
      String(parsed.data.status ?? ""),
    );

    if (!result.ok) {
      const status = result.error === "Inquiry not found." ? 404 : 422;
      return {
        status,
        body: {
          error: {
            code: status === 404 ? "not_found" : "invalid_request",
            message: result.error,
          },
        },
        auditAction: "inquiry.update",
        auditSummary: result.error,
      };
    }

    return {
      status: 200,
      body: { data: result.data },
      auditAction: "inquiry.update",
      auditSummary: `Inquiry ${id} → ${result.data.status}`,
    };
  });
}
