/**
 * Agent API — references list/create.
 * Checklist: every DB query is hard-scoped to ctx.companyId from the API key.
 * No confirm endpoints — pending references only until a human confirms via email.
 */
import type { NextRequest } from "next/server";
import { parseJsonBody, withAgentAuth } from "@/features/agent-api/handler";
import { agentOptions } from "@/features/agent-api/http";
import {
  getCompanyMetaForAgent,
  listAgentReferences,
} from "@/features/agent-api/queries";
import {
  normalizeReferenceCreateBody,
  REFERENCE_REQUIRED_FIELDS,
  type ReferenceCreateJson,
} from "@/features/agent-api/reference-body";
import { createReferenceCore, inviteReferenceCore } from "@/features/references/core";
import { createAdminClient } from "@/lib/supabase/admin";

export function OPTIONS() {
  return agentOptions();
}

export async function GET(request: NextRequest) {
  return withAgentAuth(request, "read", async (req, ctx) => {
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
    const status = url.searchParams.get("status") ?? undefined;
    const limit = Math.min(
      Math.max(Number(url.searchParams.get("limit") ?? 50) || 50, 1),
      100,
    );
    const offset = Math.max(Number(url.searchParams.get("offset") ?? 0) || 0, 0);

    const { references, count } = await listAgentReferences(admin, ctx.companyId, {
      status,
      limit,
      offset,
    });

    return {
      status: 200,
      body: { data: { references, count, limit, offset } },
      skipAudit: true,
    };
  });
}

export async function POST(request: NextRequest) {
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

    const meta = await getCompanyMetaForAgent(admin, ctx.companyId);
    if (!meta) {
      return {
        status: 404,
        body: {
          error: { code: "not_found", message: "Company not found." },
        },
      };
    }

    const parsed = await parseJsonBody<ReferenceCreateJson>(req);

    if (!parsed.ok) {
      return {
        status: 422,
        body: {
          error: { code: "invalid_request", message: parsed.message },
        },
        auditAction: "reference.create",
        auditSummary: "Rejected invalid body",
      };
    }

    const normalized = normalizeReferenceCreateBody(parsed.data);
    if (!normalized.clientName || !normalized.service || !normalized.startedYear) {
      return {
        status: 422,
        body: {
          error: {
            code: "invalid_request",
            message: `Required fields: ${REFERENCE_REQUIRED_FIELDS}.`,
          },
        },
        auditAction: "reference.create",
        auditSummary: "Missing required reference fields",
      };
    }

    const result = await createReferenceCore(admin, {
      companyId: ctx.companyId,
      companyName: meta.name,
      clientName: normalized.clientName,
      service: normalized.service,
      startedYear: normalized.startedYear,
      ongoing: normalized.ongoing,
      endedYear: normalized.endedYear,
      inviteEmail: null,
      createGhost: false,
      website: normalized.website,
    });

    if (!result.ok) {
      return {
        status: 422,
        body: {
          error: { code: "invalid_request", message: result.error },
        },
        auditAction: "reference.create",
        auditSummary: result.error,
      };
    }

    let invited = false;
    let inviteSkipped: string | undefined;
    if (normalized.inviteEmail) {
      if (!ctx.scopes.includes("invites:send")) {
        inviteSkipped =
          "invite_email ignored — key needs invites:send scope. Use POST /references/{id}/invite.";
      } else {
        const invite = await inviteReferenceCore(admin, {
          companyId: ctx.companyId,
          companyName: meta.name,
          referenceId: result.data.id,
          email: normalized.inviteEmail,
        });
        if (!invite.ok) {
          return {
            status: 422,
            body: {
              error: { code: "invalid_request", message: invite.error },
            },
            auditAction: "reference.create",
            auditSummary: invite.error,
          };
        }
        invited = true;
      }
    }

    return {
      status: 201,
      body: {
        data: {
          id: result.data.id,
          ...(invited ? { invited: true } : {}),
          ...(inviteSkipped ? { invite_skipped: inviteSkipped } : {}),
        },
      },
      auditAction: "reference.create",
      auditSummary: `Added reference: ${normalized.service} for ${normalized.clientName}`,
    };
  });
}
