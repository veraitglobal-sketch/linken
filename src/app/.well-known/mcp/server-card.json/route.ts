import {
  mcpDiscoveryJson,
  mcpDiscoveryOptions,
  mcpServerCard,
} from "@/features/mcp/discovery";

export const dynamic = "force-static";

export function GET() {
  return mcpDiscoveryJson(mcpServerCard());
}

export function OPTIONS() {
  return mcpDiscoveryOptions();
}
