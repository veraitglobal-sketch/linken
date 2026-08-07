import { NextResponse } from "next/server";
import type { AgentErrorBody, AgentErrorCode } from "@/features/agent-api/types";

/**
 * Agent API uses bearer keys — do not enable browser CORS.
 * Callers are servers / agents, not arbitrary web origins.
 */
const BASE: Record<string, string> = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

export function agentOptions() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...BASE,
      Allow: "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    },
  });
}

export function agentJson<T>(
  body: T,
  status = 200,
  extraHeaders?: Record<string, string>,
) {
  return NextResponse.json(body, {
    status,
    headers: { ...BASE, ...extraHeaders },
  });
}

export function agentError(
  code: AgentErrorCode,
  message: string,
  status: number,
  extraHeaders?: Record<string, string>,
) {
  const body: AgentErrorBody = { error: { code, message } };
  return NextResponse.json(body, {
    status,
    headers: { ...BASE, ...extraHeaders },
  });
}

export function agentMethodNotAllowed(allowed: string, hint: string) {
  return agentError("invalid_request", hint, 405, { Allow: allowed });
}
