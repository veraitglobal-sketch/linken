export const OAUTH_CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Expose-Headers": "WWW-Authenticate",
} as const;

export function oauthJson(
  body: unknown,
  status: number,
  extra?: Record<string, string>,
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...OAUTH_CORS,
      ...extra,
    },
  });
}

export function oauthOptions() {
  return new Response(null, { status: 204, headers: OAUTH_CORS });
}
