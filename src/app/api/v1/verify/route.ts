import {
  apiError,
  apiJson,
  apiOptions,
} from "@/features/public-api/v1/http";
import { getPublicVerifyByDomain } from "@/features/public-api/v1/queries";
import { extractDomain } from "@/features/verification/domain";

export function OPTIONS() {
  return apiOptions();
}

/**
 * Trust oracle — GET /api/v1/verify?domain=
 * Public, no API key. Returns found:false with 200 when unknown.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const raw = (url.searchParams.get("domain") ?? "").trim();
    if (!raw) {
      return apiError(
        "invalid_request",
        "Query parameter 'domain' is required.",
        400,
      );
    }

    if (!extractDomain(raw)) {
      return apiError(
        "invalid_request",
        "Invalid domain. Pass a hostname or website URL.",
        400,
      );
    }

    const body = await getPublicVerifyByDomain(raw);
    return apiJson(body);
  } catch (error) {
    console.error("[api/v1/verify] GET failed:", error);
    return apiError("internal", "Internal server error.", 500);
  }
}
