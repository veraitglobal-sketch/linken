import { oauthJson, oauthOptions } from "@/features/oauth/cors";
import { exchangeAuthorizationCode } from "@/features/oauth/token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function readTokenParams(request: Request): Promise<Record<string, string>> {
  const type = request.headers.get("content-type") ?? "";
  if (type.includes("application/json")) {
    const json = (await request.json()) as Record<string, unknown>;
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(json ?? {})) {
      if (typeof value === "string") out[key] = value;
    }
    return out;
  }
  const text = await request.text();
  return Object.fromEntries(new URLSearchParams(text));
}

export async function POST(request: Request) {
  let params: Record<string, string>;
  try {
    params = await readTokenParams(request);
  } catch {
    return oauthJson({ error: "invalid_request" }, 400, {
      "Cache-Control": "no-store",
      Pragma: "no-cache",
    });
  }

  const result = await exchangeAuthorizationCode(params);
  return oauthJson(result.body, result.status, {
    "Cache-Control": "no-store",
    Pragma: "no-cache",
  });
}

export function OPTIONS() {
  return oauthOptions();
}
