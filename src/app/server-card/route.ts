import {
  mcpDiscoveryJson,
  mcpDiscoveryOptions,
  mcpServerCard,
} from "@/features/mcp/discovery";

export const dynamic = "force-static";

/** SEP-2127 recommended location for the MCP Server Card. */
export function GET() {
  return mcpDiscoveryJson(mcpServerCard());
}

export function OPTIONS() {
  return mcpDiscoveryOptions();
}
