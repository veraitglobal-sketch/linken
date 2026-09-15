import { MCP_CORS } from "@/features/mcp/cors";
import {
  mcpResourceMetadataUrl,
  oauthIssuerOrigin,
} from "@/features/oauth/origin";

export function mcpUnauthorized(request: Request, invalidToken = false) {
  const metadata = mcpResourceMetadataUrl(oauthIssuerOrigin(request));
  const challenge = invalidToken
    ? `Bearer error="invalid_token", resource_metadata="${metadata}"`
    : `Bearer resource_metadata="${metadata}"`;
  const message = invalidToken
    ? "Invalid or revoked token."
    : "Authorization required.";

  return new Response(
    JSON.stringify({
      jsonrpc: "2.0",
      id: null,
      error: { code: -32001, message },
    }),
    {
      status: 401,
      headers: {
        ...MCP_CORS,
        "Content-Type": "application/json",
        "WWW-Authenticate": challenge,
      },
    },
  );
}
