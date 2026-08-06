import {
  apiError,
  apiJson,
  apiMethodNotAllowed,
  apiOptions,
} from "@/features/public-api/v1/http";
import { getPublicVerifyByDomain } from "@/features/public-api/v1/queries";
import { extractDomain } from "@/features/verification/domain";

const ALLOW = "GET, POST, OPTIONS";

export function OPTIONS() {
  return apiOptions(ALLOW);
}

async function respond(raw: string) {
  const domain = raw.trim();

  if (!domain) {
    return apiError(
      "invalid_request",
      "Parameter 'domain' is required.",
      400,
    );
  }

  if (!extractDomain(domain)) {
    return apiError(
      "invalid_request",
      "Invalid domain. Pass a hostname or website URL.",
      400,
    );
  }

  return apiJson(await getPublicVerifyByDomain(domain));
}

/**
 * Trust oracle — GET /api/v1/verify?domain=
 * Public, no API key. Returns found:false with 200 when unknown.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    return await respond(url.searchParams.get("domain") ?? "");
  } catch (error) {
    console.error("[api/v1/verify] GET failed:", error);
    return apiError("internal", "Internal server error.", 500);
  }
}

/**
 * Same oracle for clients that cannot issue a GET, and so the domain stays out
 * of URLs and access logs. Body: {"domain": "example.com"}.
 */
export async function POST(request: Request) {
  let raw = "";
  try {
    const body: unknown = await request.json();
    if (body && typeof body === "object" && !Array.isArray(body)) {
      const value = (body as Record<string, unknown>).domain;
      if (typeof value === "string") raw = value;
    }
  } catch {
    return apiError(
      "invalid_request",
      "Body must be JSON: {\"domain\": \"example.com\"}.",
      400,
    );
  }

  try {
    return await respond(raw);
  } catch (error) {
    console.error("[api/v1/verify] POST failed:", error);
    return apiError("internal", "Internal server error.", 500);
  }
}

export function PUT() {
  return apiMethodNotAllowed(ALLOW);
}
export function PATCH() {
  return apiMethodNotAllowed(ALLOW);
}
export function DELETE() {
  return apiMethodNotAllowed(ALLOW);
}
