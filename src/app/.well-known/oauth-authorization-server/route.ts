import { oauthOptions, oauthJson } from "@/features/oauth/cors";
import { authorizationServerMetadata } from "@/features/oauth/metadata";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  return oauthJson(authorizationServerMetadata(request), 200, {
    "Cache-Control": "public, max-age=60",
  });
}

export function OPTIONS() {
  return oauthOptions();
}
