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

export function apiOptions() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export function apiJson<T>(body: T, status = 200) {
  return NextResponse.json(body, { status, headers: CORS });
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
