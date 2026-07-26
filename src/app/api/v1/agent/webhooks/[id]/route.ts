/**
 * Agent API — update / delete one webhook endpoint.
 */
import type { NextRequest } from "next/server";
import { parseJsonBody, withAgentAuth } from "@/features/agent-api/handler";
import { agentOptions } from "@/features/agent-api/http";
import {
  deleteWebhookEndpointCore,
  updateWebhookEndpointCore,
} from "@/features/webhooks/endpoints";
import { createAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ id: string }> };

export function OPTIONS() {
  return agentOptions();
}

function unavailable() {
  return {
    status: 503 as const,
    body: {
      error: {
        code: "service_unavailable" as const,
        message: "Agent API is unavailable.",
      },
    },
  };
}

export async function PATCH(request: NextRequest, { params }: Ctx) {
  return withAgentAuth(request, "webhooks:manage", async (req, ctx) => {
    const admin = createAdminClient();
    if (!admin) return unavailable();
    const { id } = await params;

    const parsed = await parseJsonBody<Record<string, unknown>>(req);
    if (!parsed.ok) {
      return {
        status: 422,
        body: { error: { code: "invalid_request", message: parsed.message } },
        auditAction: "webhooks.update",
        auditSummary: "Invalid body",
      };
    }

    const result = await updateWebhookEndpointCore(
      admin,
      ctx.companyId,
      id,
      parsed.data,
    );
    if (!result.ok) {
      return {
        status: result.status ?? 422,
        body: {
          error: {
            code: result.status === 404 ? "not_found" : "invalid_request",
            message: result.error,
          },
        },
        auditAction: "webhooks.update",
        auditSummary: result.error,
      };
    }

    return {
      status: 200,
      body: { data: result.data },
      auditAction: "webhooks.update",
      auditSummary: id,
    };
  });
}

export async function DELETE(request: NextRequest, { params }: Ctx) {
  return withAgentAuth(request, "webhooks:manage", async (_req, ctx) => {
    const admin = createAdminClient();
    if (!admin) return unavailable();
    const { id } = await params;

    const result = await deleteWebhookEndpointCore(admin, ctx.companyId, id);
    if (!result.ok) {
      return {
        status: result.status ?? 422,
        body: {
          error: {
            code: result.status === 404 ? "not_found" : "invalid_request",
            message: result.error,
          },
        },
        auditAction: "webhooks.delete",
        auditSummary: result.error,
      };
    }

    return {
      status: 200,
      body: { data: result.data },
      auditAction: "webhooks.delete",
      auditSummary: id,
    };
  });
}
