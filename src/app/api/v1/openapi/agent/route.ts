import { buildAgentOpenApi } from "@/lib/openapi/agent-spec";
import { getSiteUrl } from "@/lib/site";

/** Agent API OpenAPI 3.1 (Bearer hs_). */
export async function GET() {
  return Response.json(buildAgentOpenApi(getSiteUrl()), {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
