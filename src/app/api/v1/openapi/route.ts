import { buildAgentOpenApi } from "@/lib/openapi/agent-spec";
import { getSiteUrl } from "@/lib/site";

/** OpenAPI 3.1 discovery for Hansala Agent API v1. */
export async function GET() {
  return Response.json(buildAgentOpenApi(getSiteUrl()), {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
