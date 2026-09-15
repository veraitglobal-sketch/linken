"use server";

import { redirect } from "next/navigation";
import {
  loginNextForAuthorize,
  oauthRedirect,
  parseAuthorizeQuery,
} from "@/features/oauth/authorize-query";
import { getOauthClient } from "@/features/oauth/clients";
import { userCanIssueConnector } from "@/features/oauth/companies";
import { randomHex, sha256Hex } from "@/features/oauth/pkce";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function readParams(form: FormData) {
  const params = new URLSearchParams();
  for (const key of [
    "response_type",
    "client_id",
    "redirect_uri",
    "code_challenge",
    "code_challenge_method",
    "state",
    "scope",
    "resource",
  ]) {
    const value = String(form.get(key) ?? "").trim();
    if (value) params.set(key, value);
  }
  return params;
}

async function sessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function denyMcpConsent(formData: FormData) {
  const params = readParams(formData);
  const client = await getOauthClient(String(formData.get("client_id") ?? ""));
  const parsed = parseAuthorizeQuery(params, client);
  if (!parsed.ok) {
    if (parsed.kind === "redirect" && parsed.redirectUri) {
      redirect(
        oauthRedirect(parsed.redirectUri, {
          error: "access_denied",
          state: parsed.state,
        }),
      );
    }
    redirect("/oauth/authorize?issue=client");
  }
  redirect(
    oauthRedirect(parsed.query.redirectUri, {
      error: "access_denied",
      state: parsed.query.state,
    }),
  );
}

export async function allowMcpConsent(formData: FormData) {
  const user = await sessionUser();
  const params = readParams(formData);
  const login = `/login?next=${encodeURIComponent(loginNextForAuthorize(params.toString()))}`;
  if (!user) redirect(login);

  const client = await getOauthClient(String(formData.get("client_id") ?? ""));
  const parsed = parseAuthorizeQuery(params, client);
  if (!parsed.ok) {
    if (parsed.kind === "redirect" && parsed.redirectUri) {
      redirect(
        oauthRedirect(parsed.redirectUri, {
          error: "invalid_request",
          state: parsed.state,
        }),
      );
    }
    redirect("/oauth/authorize?issue=client");
  }

  const companyId = String(formData.get("company_id") ?? "").trim();
  const admin = createAdminClient();
  const back = loginNextForAuthorize(parsed.query.rawSearch);
  if (!admin || !companyId) redirect(`${back}&issue=server`);

  const allowed = await userCanIssueConnector(admin, user.id, companyId);
  if (!allowed.ok) {
    redirect(`${back}&issue=${allowed.reason === "plan" ? "pro" : "role"}`);
  }

  const code = randomHex(32);
  const { error } = await admin.rpc("oauth_create_code", {
    p_code_hash: sha256Hex(code),
    p_client_id: parsed.query.clientId,
    p_user_id: user.id,
    p_company_id: companyId,
    p_redirect_uri: parsed.query.redirectUri,
    p_code_challenge: parsed.query.codeChallenge,
    p_scope: parsed.query.scope,
  });
  if (error) redirect(`${back}&issue=server`);

  redirect(
    oauthRedirect(parsed.query.redirectUri, {
      code,
      state: parsed.query.state,
    }),
  );
}
