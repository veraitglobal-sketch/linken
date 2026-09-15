import "server-only";
import { checkAgentRateLimit } from "@/features/agent-api/rate-limit";
import { randomHex } from "@/features/oauth/pkce";
import { parseRedirectUris } from "@/features/oauth/redirect-uri";
import { createAdminClient } from "@/lib/supabase/admin";

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || request.headers.get("x-real-ip") || "unknown";
}

function clientName(value: unknown): string | null {
  if (value == null || value === "") return "MCP client";
  if (typeof value !== "string") return null;
  const name = value.trim();
  if (!name) return "MCP client";
  if (name.length > 80) return null;
  return name;
}

export async function registerOauthClient(request: Request) {
  const retryAfter = checkAgentRateLimit(`oauth-register:${clientIp(request)}`);
  if (retryAfter != null) {
    return {
      status: 429,
      body: { error: "rate_limited", error_description: "Too many registrations." },
      retryAfter,
    };
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return { status: 400, body: { error: "invalid_client_metadata", error_description: "JSON body required." } };
  }
  if (!json || typeof json !== "object") {
    return { status: 400, body: { error: "invalid_client_metadata" } };
  }

  const body = json as Record<string, unknown>;
  const uris = parseRedirectUris(body.redirect_uris);
  if (!uris) {
    return {
      status: 400,
      body: {
        error: "invalid_redirect_uri",
        error_description: "redirect_uris must be 1–5 https (or http loopback) URIs without fragments.",
      },
    };
  }
  const name = clientName(body.client_name);
  if (name == null) {
    return {
      status: 400,
      body: { error: "invalid_client_metadata", error_description: "client_name must be at most 80 characters." },
    };
  }

  const admin = createAdminClient();
  if (!admin) {
    return { status: 503, body: { error: "temporarily_unavailable" } };
  }

  const clientId = `mcp_${randomHex(12)}`;
  const { error } = await admin.rpc("oauth_register_client", {
    p_client_id: clientId,
    p_client_name: name,
    p_redirect_uris: uris,
  });
  if (error) {
    console.error("[oauth_register_client]", error.message);
    return { status: 500, body: { error: "server_error" } };
  }

  return {
    status: 201,
    body: {
      client_id: clientId,
      client_id_issued_at: Math.floor(Date.now() / 1000),
      client_name: name,
      redirect_uris: uris,
      grant_types: ["authorization_code"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
    },
  };
}
