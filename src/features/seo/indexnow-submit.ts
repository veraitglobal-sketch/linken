import "server-only";

import { indexNowKey } from "@/features/seo/indexnow-key";
import { getSiteUrl } from "@/lib/site";

const ENDPOINT = "https://api.indexnow.org/indexnow";

export type IndexNowResult =
  | { ok: true; submitted: number }
  | { ok: false; error: string; skipped?: boolean };

/**
 * Tell IndexNow (Bing and partners) that these URLs are new or updated.
 * Google still primarily uses the sitemap; this speeds discovery where supported.
 */
export async function submitIndexNow(urls: string[]): Promise<IndexNowResult> {
  const key = indexNowKey();
  if (!key) return { ok: false, error: "INDEXNOW_KEY not set", skipped: true };

  const unique = [...new Set(urls.map((u) => u.trim()).filter(Boolean))];
  if (unique.length === 0) {
    return { ok: false, error: "No URLs", skipped: true };
  }

  const site = getSiteUrl().replace(/\/$/, "");
  let host: string;
  try {
    host = new URL(site).host;
  } catch {
    return { ok: false, error: "Invalid site URL" };
  }

  const keyLocation = `${site}/${key}.txt`;
  const body = {
    host,
    key,
    keyLocation,
    urlList: unique.slice(0, 100),
  };

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8_000),
    });
    // 200 / 202 accepted; 204 already submitted recently
    if (res.status === 200 || res.status === 202 || res.status === 204) {
      return { ok: true, submitted: body.urlList.length };
    }
    const text = await res.text().catch(() => "");
    return {
      ok: false,
      error: `IndexNow ${res.status}${text ? `: ${text.slice(0, 160)}` : ""}`,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
