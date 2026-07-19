/**
 * Agent API — request client confirmation for a case study (invite only).
 * Checklist: every DB query is hard-scoped to ctx.companyId from the API key.
 * No confirm/respond endpoints — humans confirm via email link.
 */
import type { NextRequest } from "next/server";
import { maskEmail } from "@/features/agent-api/audit";
import { parseJsonBody, withAgentAuth } from "@/features/agent-api/handler";
import { agentOptions } from "@/features/agent-api/http";
import { getCompanyMetaForAgent } from "@/features/agent-api/queries";
import {
  canSendInvite,
  recordInviteSent,
} from "@/features/agent-api/rate-limit";
import { requestClientConfirmationCore } from "@/features/case-studies/core";
import { createAdminClient } from "@/lib/supabase/admin";

export function OPTIONS() {
  return agentOptions();
}

export async function POST(request: NextRequest) {
  return withAgentAuth(request, "invites:send", async (req, ctx) => {
    if (!canSendInvite(ctx.keyId)) {
      return {
        status: 429,
        body: {
          error: {
            code: "rate_limited",
            message: "Invite limit exceeded (20 invites/day per key).",
          },
        },
        headers: { "Retry-After": "86400" },
        auditAction: "client_confirmation.request",
        auditSummary: "Invite daily limit exceeded",
      };
    }

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

    const meta = await getCompanyMetaForAgent(admin, ctx.companyId);
    if (!meta) {
      return {
        status: 404,
        body: {
          error: { code: "not_found", message: "Company not found." },
        },
      };
    }

    const parsed = await parseJsonBody<{
      case_study_slug?: string;
      email?: string;
    }>(req);

    if (!parsed.ok) {
      return {
        status: 422,
        body: {
          error: { code: "invalid_request", message: parsed.message },
        },
        auditAction: "client_confirmation.request",
        auditSummary: "Rejected invalid body",
      };
    }

    const email = String(parsed.data.email ?? "");
    const result = await requestClientConfirmationCore(admin, {
      companyId: ctx.companyId,
      companyName: meta.name,
      companySlug: meta.slug,
      caseStudySlug: String(parsed.data.case_study_slug ?? ""),
      email,
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
        auditAction: "client_confirmation.request",
        auditSummary: result.error,
      };
    }

    recordInviteSent(ctx.keyId);
    return {
      status: 201,
      body: { data: { id: result.data.id } },
      auditAction: "client_confirmation.request",
      auditSummary: `Requested client confirmation → ${maskEmail(email)}`,
    };
  });
}
