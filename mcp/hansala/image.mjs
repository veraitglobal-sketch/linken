import { readFile } from "node:fs/promises";

const MAX_BYTES = 8 * 1024 * 1024;

export async function loadImageInput(args) {
  if (args.image_base64) {
    const raw = String(args.image_base64).replace(/^data:[^;]+;base64,/, "");
    return {
      bytes: Buffer.from(raw, "base64"),
      contentType: args.content_type || "image/jpeg",
    };
  }
  if (args.image_path) {
    const bytes = await readFile(String(args.image_path));
    const ext = String(args.image_path).split(".").pop()?.toLowerCase();
    const contentType =
      args.content_type ||
      (ext === "png"
        ? "image/png"
        : ext === "webp"
          ? "image/webp"
          : ext === "svg"
            ? "image/svg+xml"
            : "image/jpeg");
    return { bytes, contentType };
  }
  if (args.image_url) {
    const res = await fetch(String(args.image_url), {
      headers: { Accept: "image/*" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`Could not fetch image_url (${res.status}).`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength === 0 || buf.byteLength > MAX_BYTES) {
      throw new Error("Remote image must be non-empty and under 8MB.");
    }
    const header = res.headers.get("content-type")?.split(";")[0]?.trim();
    const contentType = header?.startsWith("image/") ? header : "image/jpeg";
    return { bytes: buf, contentType };
  }
  throw new Error("Provide image_path, image_url, or image_base64.");
}

export async function uploadImage(agentFetch, path, args) {
  const { bytes, contentType } = await loadImageInput(args);
  return agentFetch("PUT", path, {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image_base64: bytes.toString("base64"),
      content_type: contentType,
    }),
  });
}
