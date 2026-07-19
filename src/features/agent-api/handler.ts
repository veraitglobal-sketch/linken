import "server-only";
import type { NextRequest } from "next/server";
import { authenticateAgentRequest } from "@/features/agent-api/auth";
import { writeAgentAudit } from "@/features/agent-api/audit";
import { agentError, agentJson } from "@/features/agent-api/http";
import type { AgentAuthContext, AgentScope } from "@/features/agent-api/types";

export type AgentHandlerResult = {
  status: number;
  body: unknown;
  /** Semantic action for audit (mutations + inquiries.read). */
  auditAction?: string;
  auditSummary?: string;
  /** Skip audit entirely (e.g. reading the audit log). */
  skipAudit?: boolean;
  headers?: Record<string, string>;
};

type Handler = (
  request: NextRequest,
  ctx: AgentAuthContext,
) => Promise<AgentHandlerResult>;

/**
 * Shared Agent route wrapper: auth → scope → rate limit → handler → optional audit.
 */
export async function withAgentAuth(
  request: NextRequest,
  requiredScope: AgentScope,
  handler: Handler,
) {
  const auth = await authenticateAgentRequest(request, requiredScope);
  if (!auth.ok) {
    const headers =
      auth.retryAfter != null
        ? { "Retry-After": String(auth.retryAfter) }
        : undefined;
    return agentError(auth.code, auth.message, auth.status, headers);
  }

  try {
    const result = await handler(request, auth.ctx);
    const path = new URL(request.url).pathname;
    const shouldAudit =
      !result.skipAudit &&
      (Boolean(result.auditAction) ||
        !["GET", "HEAD", "OPTIONS"].includes(request.method));

    if (shouldAudit && result.auditAction) {
      await writeAgentAudit({
        apiKeyId: auth.ctx.keyId,
        companyId: auth.ctx.companyId,
        method: request.method,
        path,
        action: result.auditAction,
        status: result.status,
        summary: result.auditSummary,
      });
    }

    return agentJson(result.body, result.status, result.headers);
  } catch (err) {
    console.error("[agent-api]", err);
    return agentError("internal", "Internal server error.", 500);
  }
}

export async function parseJsonBody<T>(
  request: NextRequest,
): Promise<{ ok: true; data: T } | { ok: false; message: string }> {
  try {
    const data = (await request.json()) as T;
    if (data === null || typeof data !== "object" || Array.isArray(data)) {
      return { ok: false, message: "Request body must be a JSON object." };
    }
    return { ok: true, data };
  } catch {
    return { ok: false, message: "Invalid JSON body." };
  }
}
