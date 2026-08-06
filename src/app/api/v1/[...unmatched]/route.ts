import { apiError, apiOptions } from "@/features/public-api/v1/http";

/**
 * Anything under /api/v1 that matches no route lands here.
 *
 * Without it, Next falls through to the app's not-found page and an API client
 * receives the full marketing HTML document — a JSON parser sees a syntax
 * error instead of a readable reason. Catch-all segments are the lowest
 * priority match, so every real endpoint still wins.
 */
export function OPTIONS() {
  return apiOptions();
}

function unmatched() {
  return apiError(
    "not_found",
    "Unknown endpoint. See /api/v1/openapi for the available routes.",
    404,
  );
}

export const GET = unmatched;
export const POST = unmatched;
export const PUT = unmatched;
export const PATCH = unmatched;
export const DELETE = unmatched;
export const HEAD = unmatched;
