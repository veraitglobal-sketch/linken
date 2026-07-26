import "server-only";

import { getSiteUrl } from "@/lib/site";

export function calendlyOAuthConfigured(): boolean {
  return Boolean(
    process.env.CALENDLY_CLIENT_ID?.trim() &&
      process.env.CALENDLY_CLIENT_SECRET?.trim(),
  );
}

export function calendlyRedirectUri(): string {
  return `${getSiteUrl()}/api/integrations/calendly/callback`;
}

export function calendlyAuthorizeUrl(state: string): string {
  const clientId = process.env.CALENDLY_CLIENT_ID!.trim();
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: calendlyRedirectUri(),
    state,
  });
  return `https://auth.calendly.com/oauth/authorize?${params}`;
}

export async function exchangeCalendlyCode(
  code: string,
): Promise<{ accessToken: string } | { error: string }> {
  const clientId = process.env.CALENDLY_CLIENT_ID?.trim();
  const clientSecret = process.env.CALENDLY_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    return { error: "Calendly OAuth is not configured." };
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: calendlyRedirectUri(),
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch("https://auth.calendly.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    return { error: "Could not complete Calendly login." };
  }
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) return { error: "Calendly did not return a token." };
  return { accessToken: json.access_token };
}

/** Public scheduling page for the connected Calendly user. */
export async function fetchCalendlySchedulingUrl(
  accessToken: string,
): Promise<string | null> {
  const res = await fetch("https://api.calendly.com/users/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    resource?: { scheduling_url?: string };
  };
  return json.resource?.scheduling_url?.trim() || null;
}
