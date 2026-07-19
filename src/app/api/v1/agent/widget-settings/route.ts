/**
 * Agent API — widget_settings + related toggles.
 * Checklist: every DB query is hard-scoped to ctx.companyId from the API key.
 */
import type { NextRequest } from "next/server";
import { parseJsonBody, withAgentAuth } from "@/features/agent-api/handler";
import { agentOptions } from "@/features/agent-api/http";
import {
  getWidgetSettingsCore,
  updateWidgetSettingsCore,
} from "@/features/widgets/core";
import { createAdminClient } from "@/lib/supabase/admin";

export function OPTIONS() {
  return agentOptions();
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

    const result = await getWidgetSettingsCore(admin, ctx.companyId);
    if (!result.ok) {
      return {
        status: 404,
        body: { error: { code: "not_found", message: result.error } },
      };
    }

    return {
      status: 200,
      body: { data: result.data },
      skipAudit: true,
    };
  });
}

export async function PATCH(request: NextRequest) {
  return withAgentAuth(request, "settings:write", async (req, ctx) => {
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

    const parsed = await parseJsonBody<Record<string, unknown>>(req);
    if (!parsed.ok) {
      return {
        status: 422,
        body: { error: { code: "invalid_request", message: parsed.message } },
        auditAction: "widget_settings.update",
        auditSummary: "Invalid body",
      };
    }

    const result = await updateWidgetSettingsCore(
      admin,
      ctx.companyId,
      parsed.data,
    );
    if (!result.ok) {
      return {
        status: 422,
        body: { error: { code: "invalid_request", message: result.error } },
        auditAction: "widget_settings.update",
        auditSummary: result.error,
      };
    }

    return {
      status: 200,
      body: { data: { updated: result.data.updated } },
      auditAction: "widget_settings.update",
      auditSummary: `Updated: ${result.data.updated.join(", ")}`,
    };
  });
}
