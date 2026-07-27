/**
 * Agent API — create testimonial invite (author writes via token link).
 */
import type { NextRequest } from "next/server";
import { maskEmail } from "@/features/agent-api/audit";
import { parseJsonBody, withAgentAuth } from "@/features/agent-api/handler";
import { agentOptions } from "@/features/agent-api/http";
import { createTestimonialInviteCore } from "@/features/testimonials/core";
import { createAdminClient } from "@/lib/supabase/admin";

export function OPTIONS() {
  return agentOptions();
}

export async function POST(request: NextRequest) {
  return withAgentAuth(request, "invites:send", async (req, ctx) => {
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
      source?: string;
      source_id?: string;
      author_email?: string;
      author_company_id?: string;
    }>(req);

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

    const source = parsed.data.source ?? "standalone";
    if (
      !["standalone", "reference", "case_study", "partnership"].includes(source)
    ) {
      return {
        status: 422,
        body: {
          error: { code: "invalid_request", message: "Invalid source." },
        },
        auditAction: "testimonial.invite",
        auditSummary: "Invalid source",
      };
    }

    const result = await createTestimonialInviteCore(admin, {
      companyId: ctx.companyId,
      source: source as "standalone" | "reference" | "case_study" | "partnership",
      sourceId: parsed.data.source_id ?? null,
      authorEmail: parsed.data.author_email ?? null,
      authorCompanyId: parsed.data.author_company_id ?? null,
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

    const email = String(parsed.data.author_email ?? "");
    return {
      status: 201,
      body: { data: result.data },
      auditAction: "testimonial.invite",
      auditSummary: email
        ? `Created testimonial invite for ${maskEmail(email)}`
        : "Created testimonial invite",
    };
  });
}
