/**
 * Agent API — send reference confirmation invite (human must confirm).
 * Checklist: every DB query is hard-scoped to ctx.companyId from the API key.
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
import { inviteReferenceCore } from "@/features/references/core";
import { createAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ id: string }> };

export function OPTIONS() {
  return agentOptions();
}

export async function POST(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
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
        auditAction: "reference.invite",
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

    const parsed = await parseJsonBody<{ email?: string }>(req);
    if (!parsed.ok) {
      return {
        status: 422,
        body: {
          error: { code: "invalid_request", message: parsed.message },
        },
        auditAction: "reference.invite",
        auditSummary: "Rejected invalid body",
      };
    }

    const email = String(parsed.data.email ?? "");
    const result = await inviteReferenceCore(admin, {
      companyId: ctx.companyId,
      companyName: meta.name,
      referenceId: id,
      email,
    });

    if (!result.ok) {
      const status = result.error === "Reference not found." ? 404 : 422;
      return {
        status,
        body: {
          error: {
            code: status === 404 ? "not_found" : "invalid_request",
            message: result.error,
          },
        },
        auditAction: "reference.invite",
        auditSummary: result.error,
      };
    }

    recordInviteSent(ctx.keyId);
    return {
      status: 200,
      body: { data: { id: result.data.id, invited: true } },
      auditAction: "reference.invite",
      auditSummary: `Sent reference invite to ${maskEmail(email)}`,
    };
  });
}
