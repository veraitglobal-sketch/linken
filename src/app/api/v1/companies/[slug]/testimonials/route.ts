import {
  apiError,
  apiJson,
  apiMethodNotAllowed,
  apiOptions,
} from "@/features/public-api/v1/http";
import { getPublicTestimonialsForSites } from "@/features/public-api/v1/testimonials-api";

type Props = { params: Promise<{ slug: string }> };

export function OPTIONS() {
  return apiOptions();
}

/**
 * Public testimonials for any host site.
 * CORS * — fetch from your domain, or use /hs-testimonials.js drop-in.
 * Query: ?preset=minimal|editorial|card|bordered|glass|dark&limit=1-50
 */
export async function GET(request: Request, { params }: Props) {
  try {
    const { slug } = await params;
    if (!slug?.trim()) {
      return apiError("invalid_request", "Company slug is required.", 400);
    }

    const url = new URL(request.url);
    const preset = url.searchParams.get("preset");
    const limitRaw = url.searchParams.get("limit");
    const limit = limitRaw ? Number(limitRaw) : null;

    const body = await getPublicTestimonialsForSites(slug.trim(), {
      preset,
      limit: Number.isFinite(limit) ? limit : null,
    });
    if (!body) {
      return apiError("not_found", "Company not found.", 404);
    }

    return apiJson(body);
  } catch (error) {
    console.error("[api/v1/companies/testimonials] GET failed:", error);
    return apiError("internal", "Internal server error.", 500);
  }
}

export function POST() {
  return apiMethodNotAllowed();
}
export function PUT() {
  return apiMethodNotAllowed();
}
export function PATCH() {
  return apiMethodNotAllowed();
}
export function DELETE() {
  return apiMethodNotAllowed();
}
