/**
 * Agent API — create testimonial invite (author writes via token link).
 * Invite only — author text stays immutable; humans publish via /testimonial/{token}.
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
import { createTestimonialInviteCore } from "@/features/testimonials/core";
import { sendTestimonialInviteEmail } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  inviteLimitBody,
  parseInviteBody,
} from "@/features/testimonials/agent-invite-parse";

export function OPTIONS() {
  return agentOptions();
}

export async function POST(request: NextRequest) {
  return withAgentAuth(request, "invites:send", async (req, ctx) => {
    if (!canSendInvite(ctx.keyId)) {
      return {
        status: 429,
        body: inviteLimitBody(),
        headers: { "Retry-After": "86400" },
        auditAction: "testimonial.invite",
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

    const parsed = await parseJsonBody<Record<string, unknown>>(req);
    if (!parsed.ok) {
      return {
        status: 422,
        body: {
          error: { code: "invalid_request", message: parsed.message },
        },
        auditAction: "testimonial.invite",
        auditSummary: "Rejected invalid body",
      };
    }

    const body = parseInviteBody(parsed.data);
    if (!body.ok) {
      return {
        status: 422,
        body: { error: { code: "invalid_request", message: body.error } },
        auditAction: "testimonial.invite",
        auditSummary: body.error,
      };
    }

    const result = await createTestimonialInviteCore(admin, {
      companyId: ctx.companyId,
      source: body.source,
      sourceId: body.sourceId,
      authorEmail: body.email,
      authorCompanyId: body.authorCompanyId,
      mode: "agent",
    });

    if (!result.ok) {
      return {
        status: 422,
        body: {
          error: { code: "invalid_request", message: result.error },
        },
        auditAction: "testimonial.invite",
        auditSummary: result.error,
      };
    }

    let email_sent = false;
    if (body.sendEmail) {
      const sent = await sendTestimonialInviteEmail({
        to: body.email,
        providerName: meta.name,
        testimonialUrl: result.data.url,
      });
      email_sent = sent.ok;
    }

    recordInviteSent(ctx.keyId);
    return {
      status: 201,
      body: {
        data: {
          token: result.data.token,
          url: result.data.url,
          email_sent,
        },
      },
      auditAction: "testimonial.invite",
      auditSummary: `Created testimonial invite for ${maskEmail(body.email)}`,
    };
  });
}
