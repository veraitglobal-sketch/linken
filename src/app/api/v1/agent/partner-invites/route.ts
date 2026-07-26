/**
 * Agent API — invite unclaimed partner (pending partnership + claim email).
 * Ghost stubs are not workspaces for the inviter — only Inbox / Company.
 * Never auto-accepts — confirmations stay human-only.
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
import { createUnclaimedPartnerCore } from "@/features/partners/core";
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
        auditAction: "partner.invite",
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
      name?: string;
      category?: string;
      city?: string;
      website?: string;
      email?: string;
    }>(req);

    if (!parsed.ok) {
      return {
        status: 422,
        body: {
          error: { code: "invalid_request", message: parsed.message },
        },
        auditAction: "partner.invite",
        auditSummary: "Rejected invalid body",
      };
    }

    const result = await createUnclaimedPartnerCore(admin, {
      companyId: ctx.companyId,
      companyName: meta.name,
      companyVerified: Boolean(meta.verified),
      name: String(parsed.data.name ?? ""),
      category: String(parsed.data.category ?? ""),
      city: String(parsed.data.city ?? ""),
      website: parsed.data.website,
      email: parsed.data.email,
    });

    if (!result.ok) {
      return {
        status: 422,
        body: {
          error: { code: "invalid_request", message: result.error },
        },
        auditAction: "partner.invite",
        auditSummary: result.error,
      };
    }

    recordInviteSent(ctx.keyId);
    const email = String(parsed.data.email ?? "").trim();
    return {
      status: 201,
      body: {
        data: {
          id: result.data.id,
          slug: result.data.slug,
          name: result.data.name,
        },
      },
      auditAction: "partner.invite",
      auditSummary: email
        ? `Invited partner ${result.data.name} → ${maskEmail(email)}`
        : `Created partner draft ${result.data.name}`,
    };
  });
}
