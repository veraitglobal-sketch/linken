import {
  apiError,
  apiJson,
  apiMethodNotAllowed,
  apiOptions,
} from "@/features/public-api/v1/http";
import { getPublicPartnersApi } from "@/features/public-api/v1/queries";

type Props = { params: Promise<{ slug: string }> };

export function OPTIONS() {
  return apiOptions();
}

export async function GET(_request: Request, { params }: Props) {
  try {
    const { slug } = await params;
    if (!slug?.trim()) {
      return apiError("invalid_request", "Company slug is required.", 400);
    }

    const body = await getPublicPartnersApi(slug.trim());
    if (!body) {
      return apiError("not_found", "Company not found.", 404);
    }

    return apiJson(body);
  } catch (error) {
    console.error("[api/v1/companies/partners] GET failed:", error);
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
