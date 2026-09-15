import { oauthJson, oauthOptions } from "@/features/oauth/cors";
import { registerOauthClient } from "@/features/oauth/register";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const result = await registerOauthClient(request);
  const extra: Record<string, string> = {};
  if (result.status === 429 && "retryAfter" in result && result.retryAfter) {
    extra["Retry-After"] = String(result.retryAfter);
  }
  return oauthJson(result.body, result.status, extra);
}

export function OPTIONS() {
  return oauthOptions();
}
