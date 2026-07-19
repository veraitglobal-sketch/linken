import {
  apiError,
  apiJson,
  apiOptions,
} from "@/features/public-api/v1/http";
import { getPublicReferencesApi } from "@/features/public-api/v1/queries";

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

    const body = await getPublicReferencesApi(slug.trim());
    if (!body) {
      return apiError("not_found", "Company not found.", 404);
    }

    return apiJson(body);
  } catch (error) {
    console.error("[api/v1/companies/references] GET failed:", error);
    return apiError("internal", "Internal server error.", 500);
  }
}
