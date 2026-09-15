import { type NextRequest } from "next/server";
import { handleMcpPost, mcpGetInfo, mcpOptions } from "@/features/mcp/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Keyless public tools only — never reads Authorization. */

export async function POST(request: NextRequest) {
  return handleMcpPost(request, null);
}

export function GET() {
  return mcpGetInfo();
}

export function OPTIONS() {
  return mcpOptions();
}
