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
import { createReferenceCore } from "@/features/references/core";
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

    const parsed = await parseJsonBody<{
      client_name?: string;
      service?: string;
      started_year?: string;
      ongoing?: boolean;
      ended_year?: string;
    }>(req);

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

    const body = parsed.data;
    const result = await createReferenceCore(admin, {
      companyId: ctx.companyId,
      companyName: meta.name,
      clientName: String(body.client_name ?? ""),
      service: String(body.service ?? ""),
      startedYear: String(body.started_year ?? ""),
      ongoing: body.ongoing !== false,
      endedYear: body.ended_year ?? null,
      // Invites require invites:send — never send email from content:write
      inviteEmail: null,
      createGhost: false,
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

    return {
      status: 201,
      body: { data: { id: result.data.id } },
      auditAction: "reference.create",
      auditSummary: `Added reference: ${String(body.service ?? "")} for ${String(body.client_name ?? "")}`,
    };
  });
}
