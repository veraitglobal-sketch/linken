/**
 * Agent API — send a test event to one webhook endpoint.
 */
import type { NextRequest } from "next/server";
import { parseJsonBody, withAgentAuth } from "@/features/agent-api/handler";
import { agentOptions } from "@/features/agent-api/http";
import { emitWebhookEvent } from "@/features/webhooks/dispatch";
import {
  WEBHOOK_EVENTS,
  type WebhookEventType,
} from "@/features/webhooks/types";
import { createAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ id: string }> };

export function OPTIONS() {
  return agentOptions();
}

export async function POST(request: NextRequest, { params }: Ctx) {
  return withAgentAuth(request, "webhooks:manage", async (req, ctx) => {
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

    const { id } = await params;
    const parsed = await parseJsonBody<{ event?: string }>(req);
    const eventRaw = parsed.ok ? parsed.data.event : "inquiry.created";
    const type = (WEBHOOK_EVENTS as readonly string[]).includes(
      eventRaw ?? "",
    )
      ? (eventRaw as WebhookEventType)
      : null;

    if (!type) {
      return {
        status: 422,
        body: {
          error: {
            code: "invalid_request",
            message: `event must be one of: ${WEBHOOK_EVENTS.join(", ")}`,
          },
        },
        auditAction: "webhooks.test",
        auditSummary: "Invalid event",
      };
    }

    const { data: ep } = await admin
      .from("webhook_endpoints")
      .select("id, events, active")
      .eq("id", id)
      .eq("company_id", ctx.companyId)
      .maybeSingle();

    if (!ep?.active) {
      return {
        status: 404,
        body: { error: { code: "not_found", message: "Endpoint not found." } },
        auditAction: "webhooks.test",
        auditSummary: "Not found",
      };
    }

    emitWebhookEvent(ctx.companyId, type, {
      test: true,
      endpoint_id: id,
      message: "Hansala webhook test event",
    });

    return {
      status: 202,
      body: { data: { queued: true, event: type } },
      auditAction: "webhooks.test",
      auditSummary: type,
    };
  });
}
