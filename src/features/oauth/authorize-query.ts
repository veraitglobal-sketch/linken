import { isS256Challenge } from "@/features/oauth/pkce";
import { redirectUriRegistered } from "@/features/oauth/redirect-uri";
import type { OauthClient } from "@/features/oauth/clients";
import type { AuthorizeQuery } from "@/features/oauth/types";

export type { AuthorizeQuery };

export type AuthorizeParse =
  | { ok: true; query: AuthorizeQuery }
  | { ok: false; kind: "unsafe" | "redirect"; error: string; state: string | null; redirectUri?: string };

function first(params: URLSearchParams, key: string) {
  return (params.get(key) ?? "").trim();
}

export function parseAuthorizeQuery(
  params: URLSearchParams,
  client: OauthClient | null,
): AuthorizeParse {
  const clientId = first(params, "client_id");
  const redirectUri = first(params, "redirect_uri");
  const state = params.get("state");
  const rawSearch = params.toString();

  if (!client || !redirectUriRegistered(client.redirect_uris, redirectUri)) {
    return { ok: false, kind: "unsafe", error: "invalid_client", state };
  }

  const responseType = first(params, "response_type");
  const challenge = first(params, "code_challenge");
  const method = first(params, "code_challenge_method");
  const scope = first(params, "scope") || "mcp";
  const resource = params.get("resource");

  if (responseType !== "code" || method !== "S256" || !isS256Challenge(challenge)) {
    return { ok: false, kind: "redirect", error: "invalid_request", state, redirectUri };
  }
  if (scope !== "mcp") {
    return { ok: false, kind: "redirect", error: "invalid_request", state, redirectUri };
  }

  return {
    ok: true,
    query: {
      clientId,
      redirectUri,
      codeChallenge: challenge,
      state,
      scope,
      resource,
      rawSearch,
    },
  };
}

export function oauthRedirect(redirectUri: string, extra: Record<string, string | null>) {
  const url = new URL(redirectUri);
  for (const [key, value] of Object.entries(extra)) {
    if (value != null && value !== "") url.searchParams.set(key, value);
  }
  return url.toString();
}

export function loginNextForAuthorize(rawSearch: string) {
  return `/oauth/authorize?${rawSearch}`;
}
