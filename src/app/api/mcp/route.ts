import { type NextRequest } from "next/server";
import { liveAgentBearer } from "@/features/mcp/bearer";
import { handleMcpPost, mcpGetInfo, mcpOptions } from "@/features/mcp/http";
import { mcpUnauthorized } from "@/features/mcp/unauthorized";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Signed-in MCP connector. Claude discovers OAuth from 401 + WWW-Authenticate.
 * A valid Agent API key (hs_…) unlocks public + company tools.
 */

export async function POST(request: NextRequest) {
  const { present, key } = await liveAgentBearer(request);
  if (!key) return mcpUnauthorized(request, present);
  return handleMcpPost(request, key);
}

export function GET() {
  return mcpGetInfo();
}

export function OPTIONS() {
  return mcpOptions();
}
