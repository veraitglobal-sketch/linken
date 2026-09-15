import "server-only";
import { generateApiKey } from "@/features/agent-api/auth";
import { AGENT_SCOPE_PRESETS } from "@/features/agent-api/types";
import { getOauthClient } from "@/features/oauth/clients";
import { sha256Hex, verifyPkceS256 } from "@/features/oauth/pkce";
import { userCanIssueConnector } from "@/features/oauth/companies";
import { createAdminClient } from "@/lib/supabase/admin";

export type TokenFailure = {
  status: number;
  body: { error: string; error_description?: string };
};

export type TokenSuccess = {
  status: 200;
  body: { access_token: string; token_type: "Bearer"; scope: string };
};

function field(params: Record<string, string>, key: string) {
  return (params[key] ?? "").trim();
}

export async function exchangeAuthorizationCode(
  params: Record<string, string>,
): Promise<TokenSuccess | TokenFailure> {
  const grant = field(params, "grant_type");
  if (grant && grant !== "authorization_code") {
    return { status: 400, body: { error: "unsupported_grant_type" } };
  }
  const code = field(params, "code");
  const redirectUri = field(params, "redirect_uri");
  const clientId = field(params, "client_id");
  const verifier = field(params, "code_verifier");
  if (!grant || !code || !redirectUri || !clientId || !verifier) {
    return { status: 400, body: { error: "invalid_request" } };
  }

  const client = await getOauthClient(clientId);
  if (!client || !client.redirect_uris.includes(redirectUri)) {
    return { status: 400, body: { error: "invalid_grant" } };
  }

  const admin = createAdminClient();
  if (!admin) {
    return { status: 503, body: { error: "temporarily_unavailable" } };
  }

  const { data, error } = await admin.rpc("oauth_consume_code", {
    p_code_hash: sha256Hex(code),
    p_client_id: clientId,
    p_redirect_uri: redirectUri,
  });
  if (error || !data) {
    return { status: 400, body: { error: "invalid_grant" } };
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.code_challenge || !verifyPkceS256(verifier, row.code_challenge as string)) {
    return { status: 400, body: { error: "invalid_grant" } };
  }

  const userId = row.user_id as string;
  const companyId = row.company_id as string;
  const allowed = await userCanIssueConnector(admin, userId, companyId);
  if (!allowed.ok) {
    return { status: 400, body: { error: "invalid_grant" } };
  }

  const key = generateApiKey();
  const name = client.client_name.slice(0, 80) || "Claude connector";
  const { error: issueErr } = await admin.rpc("oauth_issue_api_key", {
    p_company_id: companyId,
    p_user_id: userId,
    p_name: name,
    p_scopes: AGENT_SCOPE_PRESETS.full_access,
    p_key_hash: key.hash,
    p_key_prefix: key.prefix,
  });
  if (issueErr) {
    return { status: 400, body: { error: "invalid_grant" } };
  }

  return {
    status: 200,
    body: {
      access_token: key.raw,
      token_type: "Bearer",
      scope: (row.scope as string) || "mcp",
    },
  };
}
