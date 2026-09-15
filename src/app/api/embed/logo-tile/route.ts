import type { NextRequest } from "next/server";
import { isAllowedLogoSource, normaliseLogo, type LogoTone } from "@/features/widgets/logo-tile";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024;

/**
 * GET /api/embed/logo-tile?src=<stored logo url>&tone=original|ink|white
 * A partner logo cut out, trimmed and sized for widgets. Sources are limited to
 * the company-logos bucket; the stored URL carries ?v=, so responses cache hard.
 */
export async function GET(request: NextRequest) {
  const src = request.nextUrl.searchParams.get("src") ?? "";
  const toneRaw = request.nextUrl.searchParams.get("tone");
  const tone: LogoTone = toneRaw === "ink" || toneRaw === "white" ? toneRaw : "original";

  if (!isAllowedLogoSource(src)) {
    return new Response("Logo source not allowed.", { status: 400 });
  }

  try {
    const res = await fetch(src, { signal: AbortSignal.timeout(20_000) });
    if (!res.ok) return new Response("Logo not found.", { status: 404 });
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength === 0 || buf.byteLength > MAX_BYTES) {
      return new Response("Logo too large.", { status: 413 });
    }
    const out = await normaliseLogo(buf, tone);
    return new Response(new Uint8Array(out), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("[logo-tile]", err instanceof Error ? err.message : err);
    return new Response("Could not process logo.", { status: 422 });
  }
}
