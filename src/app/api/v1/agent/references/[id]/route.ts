/**
 * Agent API — reference update/delete.
 * Checklist: every DB query is hard-scoped to ctx.companyId from the API key.
 */
import type { NextRequest } from "next/server";
import { parseJsonBody, withAgentAuth } from "@/features/agent-api/handler";
import { agentOptions } from "@/features/agent-api/http";
import {
  deleteReferenceCore,
  updateReferenceCore,
} from "@/features/references/core";
import { createAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ id: string }> };

export function OPTIONS() {
  return agentOptions();
}

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
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

    const parsed = await parseJsonBody<{
      client_name?: string;
      service?: string;
      started_year?: string;
      ongoing?: boolean;
      ended_year?: string | null;
    }>(req);

    if (!parsed.ok) {
      return {
        status: 422,
        body: {
          error: { code: "invalid_request", message: parsed.message },
        },
        auditAction: "reference.update",
        auditSummary: "Rejected invalid body",
      };
    }

    const result = await updateReferenceCore(admin, {
      companyId: ctx.companyId,
      referenceId: id,
      clientName: parsed.data.client_name,
      service: parsed.data.service,
      startedYear: parsed.data.started_year,
      ongoing: parsed.data.ongoing,
      endedYear: parsed.data.ended_year,
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
        auditAction: "reference.update",
        auditSummary: result.error,
      };
    }

    return {
      status: 200,
      body: { data: { id: result.data.id } },
      auditAction: "reference.update",
      auditSummary: `Updated reference ${id}`,
    };
  });
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return withAgentAuth(request, "content:write", async (_req, ctx) => {
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

    const result = await deleteReferenceCore(admin, ctx.companyId, id);
    if (!result.ok) {
      return {
        status: 404,
        body: {
          error: { code: "not_found", message: result.error },
        },
        auditAction: "reference.delete",
        auditSummary: result.error,
      };
    }

    return {
      status: 200,
      body: { data: { id: result.data.id, deleted: true } },
      auditAction: "reference.delete",
      auditSummary: `Deleted reference ${id}`,
    };
  });
}
