import "server-only";

import { CALCOM_SCOPES } from "@/features/scheduling/calcom-scopes";
import { schedulingOAuthOrigin } from "@/features/scheduling/oauth-origin";

/** Cal.com OAuth is PKCE-only — no client secret. */
export function calcomOAuthConfigured(): boolean {
  return Boolean(process.env.CALCOM_CLIENT_ID?.trim());
}

export function calcomRedirectUri(): string {
  return `${schedulingOAuthOrigin()}/api/integrations/calcom/callback`;
}

export function calcomAuthorizeUrl(
  state: string,
  codeChallenge: string,
): string {
  const clientId = process.env.CALCOM_CLIENT_ID!.trim();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: calcomRedirectUri(),
    response_type: "code",
    state,
    scope: CALCOM_SCOPES,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
  return `https://app.cal.com/auth/oauth2/authorize?${params}`;
}

export async function exchangeCalcomCode(
  code: string,
  codeVerifier: string,
): Promise<{ accessToken: string } | { error: string }> {
  const clientId = process.env.CALCOM_CLIENT_ID?.trim();
  if (!clientId) {
    return { error: "Cal.com OAuth is not configured." };
  }

  const res = await fetch("https://api.cal.com/v2/auth/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "cal-api-version": "2024-06-14",
    },
    body: JSON.stringify({
      client_id: clientId,
      grant_type: "authorization_code",
      code,
      redirect_uri: calcomRedirectUri(),
      code_verifier: codeVerifier,
    }),
  });

  if (!res.ok) {
    return { error: "Could not complete Cal.com login." };
  }
  const json = (await res.json()) as {
    access_token?: string;
    data?: { accessToken?: string; access_token?: string };
  };
  const token =
    json.access_token ??
    json.data?.accessToken ??
    json.data?.access_token;
  if (!token) return { error: "Cal.com did not return a token." };
  return { accessToken: token };
}

/** Best-effort public booking URL after OAuth. */
export async function fetchCalcomSchedulingUrl(
  accessToken: string,
): Promise<string | null> {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "cal-api-version": "2024-06-14",
  };

  const meRes = await fetch("https://api.cal.com/v2/me", { headers });
  let username: string | null = null;
  if (meRes.ok) {
    const me = (await meRes.json()) as {
      data?: { username?: string };
      username?: string;
    };
    username = me.data?.username ?? me.username ?? null;
  }

  const etRes = await fetch("https://api.cal.com/v2/event-types", { headers });
  if (etRes.ok) {
    const et = (await etRes.json()) as {
      data?: Array<{ slug?: string; username?: string }>;
    };
    const first = et.data?.[0];
    const user = first?.username ?? username;
    const slug = first?.slug;
    if (user && slug) return `https://cal.com/${user}/${slug}`;
  }

  if (username) return `https://cal.com/${username}`;
  return null;
}
