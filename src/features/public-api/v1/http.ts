import { NextResponse } from "next/server";
import type { ApiErrorBody, ApiErrorCode } from "@/features/public-api/v1/types";

export const API_CACHE =
  "public, s-maxage=300, stale-while-revalidate=3600";

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": API_CACHE,
};

/** A route that accepts more than GET must say so, or the browser preflight
 *  rejects the call before the handler ever runs. */
function corsFor(allow: string): Record<string, string> {
  return { ...CORS, "Access-Control-Allow-Methods": allow };
}

export function apiOptions(allow = "GET, OPTIONS") {
  return new NextResponse(null, { status: 204, headers: corsFor(allow) });
}

export function apiJson<T>(body: T, status = 200) {
  return NextResponse.json(body, { status, headers: CORS });
}

/**
 * Next answers an undeclared method with a bare 405 and no body, so a JSON
 * client gets a parse error instead of a reason. `Allow` carries the precise
 * semantics; the code stays inside the documented union.
 */
export function apiMethodNotAllowed(allow = "GET, OPTIONS") {
  const body: ApiErrorBody = {
    error: {
      code: "invalid_request",
      message: `Method not allowed. Allowed: ${allow}.`,
    },
  };
  return NextResponse.json(body, {
    status: 405,
    headers: { ...corsFor(allow), Allow: allow, "Cache-Control": "no-store" },
  });
}

export function apiError(
  code: ApiErrorCode,
  message: string,
  status: number,
) {
  const body: ApiErrorBody = { error: { code, message } };
  // Errors are never cached: a transient 500 must not be served from the CDN
  // for 5 minutes after the backend recovers.
  return NextResponse.json(body, {
    status,
    headers: { ...CORS, "Cache-Control": "no-store" },
  });
}
