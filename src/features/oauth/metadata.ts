import { mcpResourceUrl, oauthIssuerOrigin } from "@/features/oauth/origin";

export function protectedResourceMetadata(request: Request) {
  const origin = oauthIssuerOrigin(request);
  return {
    resource: mcpResourceUrl(origin),
    authorization_servers: [origin],
    scopes_supported: ["mcp"],
    bearer_methods_supported: ["header"],
  };
}

export function authorizationServerMetadata(request: Request) {
  const origin = oauthIssuerOrigin(request);
  return {
    issuer: origin,
    authorization_endpoint: `${origin}/oauth/authorize`,
    token_endpoint: `${origin}/api/oauth/token`,
    registration_endpoint: `${origin}/api/oauth/register`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["none"],
    scopes_supported: ["mcp"],
  };
}
