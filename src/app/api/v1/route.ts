import { apiError, apiOptions } from "@/features/public-api/v1/http";

/**
 * The bare /api/v1 root. The catch-all next door needs at least one segment,
 * and the optional form does not register as a route handler in this version —
 * so the root gets its own file rather than falling through to the HTML
 * not-found page.
 */
export function OPTIONS() {
  return apiOptions();
}

export function GET() {
  return apiError(
    "not_found",
    "Unknown endpoint. See /api/v1/openapi for the available routes.",
    404,
  );
}
