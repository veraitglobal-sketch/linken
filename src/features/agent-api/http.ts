import { NextResponse } from "next/server";
import type { AgentErrorBody, AgentErrorCode } from "@/features/agent-api/types";

/** Agent API is never CDN-cached — keys + mutations. */
const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Cache-Control": "no-store",
};

export function agentOptions() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export function agentJson<T>(body: T, status = 200, extraHeaders?: Record<string, string>) {
  return NextResponse.json(body, {
    status,
    headers: { ...CORS, ...extraHeaders },
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
    headers: { ...CORS, ...extraHeaders },
  });
}

export function agentMethodNotAllowed(allowed: string, hint: string) {
  return agentError("invalid_request", hint, 405, { Allow: allowed });
}
