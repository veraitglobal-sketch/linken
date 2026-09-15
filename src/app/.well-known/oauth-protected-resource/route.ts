import { oauthOptions, oauthJson } from "@/features/oauth/cors";
import { protectedResourceMetadata } from "@/features/oauth/metadata";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return oauthJson(protectedResourceMetadata(request), 200, {
    "Cache-Control": "public, max-age=60",
  });
}

export function OPTIONS() {
  return oauthOptions();
}
