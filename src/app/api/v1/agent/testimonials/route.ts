/**
 * Agent API — list published testimonials for the key's company.
 * Same public shape as serializeTestimonials (no pending / tokens / email).
 */
import type { NextRequest } from "next/server";
import { withAgentAuth } from "@/features/agent-api/handler";
import { agentOptions } from "@/features/agent-api/http";
import { getCompanyMetaForAgent } from "@/features/agent-api/queries";
import { serializeTestimonials } from "@/features/public-api/v1/serializers";
import {
  getPublishedTestimonials,
  toPublicTestimonials,
} from "@/features/testimonials/queries";
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
        skipAudit: true,
      };
    }

    const meta = await getCompanyMetaForAgent(admin, ctx.companyId);
    if (!meta?.slug) {
      return {
        status: 404,
        body: {
          error: { code: "not_found", message: "Company not found." },
        },
        skipAudit: true,
      };
    }

    const rows = await getPublishedTestimonials(ctx.companyId, admin);
    const publicRows = await toPublicTestimonials(rows, meta.slug, admin);

    return {
      status: 200,
      body: { data: serializeTestimonials(publicRows) },
      skipAudit: true,
    };
  });
}
