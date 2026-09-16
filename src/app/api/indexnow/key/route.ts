import { indexNowKey } from "@/features/seo/indexnow-key";

/** Public key file for IndexNow verification (text/plain). */
export async function GET() {
  const key = indexNowKey();
  if (!key) {
    return new Response("IndexNow is not configured.\n", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  return new Response(`${key}\n`, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
