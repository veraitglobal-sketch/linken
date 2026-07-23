import "server-only";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export type FetchedImage =
  | { ok: true; bytes: Uint8Array; contentType: string }
  | { ok: false; message: string };

function contentTypeFromUrl(url: string): string | null {
  const path = new URL(url).pathname.toLowerCase();
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".webp")) return "image/webp";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
  return null;
}

/** Fetch remote image for agent uploads (max 8MB). */
export async function fetchRemoteImage(url: string): Promise<FetchedImage> {
  const trimmed = url.trim();
  if (!trimmed) return { ok: false, message: "image_url is empty." };

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { ok: false, message: "image_url must be a valid URL." };
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { ok: false, message: "image_url must use http or https." };
  }

  const res = await fetch(trimmed, {
    headers: { Accept: "image/*" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    return { ok: false, message: `Could not fetch image_url (${res.status}).` };
  }

  const headerType = res.headers.get("content-type")?.split(";")[0]?.trim() ?? "";
  const contentType =
    (ALLOWED.has(headerType) ? headerType : null) ??
    contentTypeFromUrl(trimmed) ??
    "image/jpeg";
  if (!ALLOWED.has(contentType)) {
    return { ok: false, message: "Remote image must be JPG, PNG, or WEBP." };
  }

  const length = Number(res.headers.get("content-length") ?? 0);
  if (length > MAX_BYTES) {
    return { ok: false, message: "Remote image must be under 8MB." };
  }

  const buf = new Uint8Array(await res.arrayBuffer());
  if (buf.byteLength === 0) return { ok: false, message: "Remote image is empty." };
  if (buf.byteLength > MAX_BYTES) {
    return { ok: false, message: "Remote image must be under 8MB." };
  }

  return { ok: true, bytes: buf, contentType };
}
