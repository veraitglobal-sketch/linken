import { buildPublicOpenApi } from "@/lib/openapi/public-spec";
import { getSiteUrl } from "@/lib/site";

/** Public API OpenAPI 3.1 (no auth). */
export async function GET() {
  return Response.json(buildPublicOpenApi(getSiteUrl()), {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
