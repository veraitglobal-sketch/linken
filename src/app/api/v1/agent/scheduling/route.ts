/**
 * Agent API — Calendly / Cal.com booking link on the company profile.
 * OAuth login stays in the browser; agents set a public booking URL.
 */
import type { NextRequest } from "next/server";
import { parseJsonBody, withAgentAuth } from "@/features/agent-api/handler";
import { agentOptions } from "@/features/agent-api/http";
import {
  clearSchedulingAgentCore,
  getSchedulingAgentCore,
  setSchedulingAgentCore,
} from "@/features/scheduling/agent-core";
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
  return withAgentAuth(request, "read", async (_req, ctx) => {
    const admin = createAdminClient();
    if (!admin) return unavailable();

    const result = await getSchedulingAgentCore(admin, ctx.companyId);
    if (!result.ok) {
      return {
        status: 404,
        body: { error: { code: "not_found", message: result.error } },
      };
    }

    return { status: 200, body: { data: result.data }, skipAudit: true };
  });
}

export async function PUT(request: NextRequest) {
  return withAgentAuth(request, "settings:write", async (req, ctx) => {
    const admin = createAdminClient();
    if (!admin) return unavailable();

    const parsed = await parseJsonBody<Record<string, unknown>>(req);
    if (!parsed.ok) {
      return {
        status: 422,
        body: { error: { code: "invalid_request", message: parsed.message } },
        auditAction: "scheduling.update",
        auditSummary: "Invalid body",
      };
    }

    const result = await setSchedulingAgentCore(admin, ctx.companyId, parsed.data);
    if (!result.ok) {
      return {
        status: 422,
        body: { error: { code: "invalid_request", message: result.error } },
        auditAction: "scheduling.update",
        auditSummary: result.error,
      };
    }

    return {
      status: 200,
      body: { data: result.data },
      auditAction: "scheduling.update",
      auditSummary: `Connected ${result.data.provider}`,
    };
  });
}

export async function DELETE(request: NextRequest) {
  return withAgentAuth(request, "settings:write", async (_req, ctx) => {
    const admin = createAdminClient();
    if (!admin) return unavailable();

    const result = await clearSchedulingAgentCore(admin, ctx.companyId);
    if (!result.ok) {
      return {
        status: 422,
        body: { error: { code: "invalid_request", message: result.error } },
        auditAction: "scheduling.disconnect",
        auditSummary: result.error,
      };
    }

    return {
      status: 200,
      body: { data: result.data },
      auditAction: "scheduling.disconnect",
      auditSummary: "Disconnected booking link",
    };
  });
}
