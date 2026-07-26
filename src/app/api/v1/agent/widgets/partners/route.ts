/**
 * Agent API — confirmed partners/clients eligible for the Logo wall.
 * GET /api/v1/agent/widgets/partners
 */
import type { NextRequest } from "next/server";
import { withAgentAuth } from "@/features/agent-api/handler";
import { agentOptions } from "@/features/agent-api/http";
import { getLogoWallConfirmedCandidates } from "@/features/widgets/logo-wall";
import { createAdminClient } from "@/lib/supabase/admin";

export function OPTIONS() {
  return agentOptions();
}

function agentLogoState(
  state: string,
): "profile" | "auto" | "custom" | "missing" | "opted_out" {
  if (state === "opted_out") return "opted_out";
  if (state === "custom") return "custom";
  if (state === "profile") return "profile";
  if (state === "auto") return "auto";
  return "missing";
}

export async function GET(request: NextRequest) {
  return withAgentAuth(request, "settings:write", async (_req, ctx) => {
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

    const entries = await getLogoWallConfirmedCandidates(ctx.companyId, admin);
    const partners = entries.map((e) => ({
      company_id: e.id,
      name: e.name,
      slug: e.slug,
      website: e.website,
      logo_state: agentLogoState(e.logoState),
      shown: e.included,
      kind: e.kind,
      scale: e.scale,
      padding: e.padding,
      grayscale: e.grayscale,
      invert_on_dark: e.invertOnDark,
    }));

    return {
      status: 200,
      body: { data: { partners, count: partners.length } },
      skipAudit: true,
    };
  });
}
