/**
 * Agent API — outbound webhook endpoints.
 */
import type { NextRequest } from "next/server";
import { parseJsonBody, withAgentAuth } from "@/features/agent-api/handler";
import { agentOptions } from "@/features/agent-api/http";
import {
  createWebhookEndpointCore,
  listWebhookEndpointsCore,
} from "@/features/webhooks/endpoints";
import { createAdminClient } from "@/lib/supabase/admin";

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

export async function GET(request: NextRequest) {
  return withAgentAuth(request, "webhooks:manage", async (_req, ctx) => {
    const admin = createAdminClient();
    if (!admin) return unavailable();

    const result = await listWebhookEndpointsCore(admin, ctx.companyId);
    if (!result.ok) {
      return {
        status: 500,
        body: { error: { code: "internal", message: result.error } },
      };
    }
    return { status: 200, body: { data: result.data }, skipAudit: true };
  });
}

export async function POST(request: NextRequest) {
  return withAgentAuth(request, "webhooks:manage", async (req, ctx) => {
    const admin = createAdminClient();
    if (!admin) return unavailable();

    const parsed = await parseJsonBody<Record<string, unknown>>(req);
    if (!parsed.ok) {
      return {
        status: 422,
        body: { error: { code: "invalid_request", message: parsed.message } },
        auditAction: "webhooks.create",
        auditSummary: "Invalid body",
      };
    }

    const result = await createWebhookEndpointCore(admin, ctx.companyId, parsed.data);
    if (!result.ok) {
      return {
        status: result.status ?? 422,
        body: { error: { code: "invalid_request", message: result.error } },
        auditAction: "webhooks.create",
        auditSummary: result.error,
      };
    }

    return {
      status: 201,
      body: { data: result.data },
      auditAction: "webhooks.create",
      auditSummary: result.data.url,
    };
  });
}
