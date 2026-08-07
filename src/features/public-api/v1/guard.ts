import type { NextResponse } from "next/server";
import {
  assertPublicApiRateLimit,
} from "@/features/public-api/v1/http";
import { clientIpFromHeaders } from "@/features/security/rate-limit";

/** Call at the top of public API GET handlers. */
export function guardPublicApi(request: Request): NextResponse | null {
  return assertPublicApiRateLimit(clientIpFromHeaders(request.headers));
}
