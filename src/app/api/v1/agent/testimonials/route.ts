/**
 * Agent API — list published testimonials for the key's company.
 */
import type { NextRequest } from "next/server";
import { withAgentAuth } from "@/features/agent-api/handler";
import { agentOptions } from "@/features/agent-api/http";
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

    const { data: company } = await admin
      .from("companies")
      .select("slug")
      .eq("id", ctx.companyId)
      .maybeSingle();

    const slug = (company?.slug as string | undefined) ?? "";
    const rows = await getPublishedTestimonials(ctx.companyId);
    const publicRows = slug
      ? await toPublicTestimonials(rows, slug)
      : [];

    return {
      status: 200,
      body: {
        data: {
          count: publicRows.length,
          testimonials: publicRows.map((t) => ({
            id: t.id,
            body: t.body,
            author_name: t.authorName,
            author_role: t.authorRole,
            author_company: t.authorCompany,
            source: t.source,
            published_at: t.publishedAt,
            provenance_line: t.provenanceLine,
            profile_url: t.profileUrl,
          })),
        },
      },
      skipAudit: true,
    };
  });
}
