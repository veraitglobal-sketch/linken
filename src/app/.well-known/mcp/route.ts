import { mcpCatalog, mcpDiscoveryJson, mcpDiscoveryOptions } from "@/features/mcp/discovery";

export const dynamic = "force-static";

/** Hosted MCP discovery — public + Agent endpoints. */
export function GET() {
  return mcpDiscoveryJson(mcpCatalog());
}

export function OPTIONS() {
  return mcpDiscoveryOptions();
}
