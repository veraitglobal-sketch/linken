import type { NextRequest } from "next/server";
import { parseJsonBody } from "@/features/agent-api/handler";

export type ParsedImage =
  | { ok: true; bytes: Uint8Array; contentType: string }
  | { ok: false; message: string };

export async function parseImageBody(req: NextRequest): Promise<ParsedImage> {
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file") ?? form.get("photo") ?? form.get("image");
    if (!(file instanceof File)) {
      return { ok: false, message: "multipart field 'file' is required." };
    }
    return {
      ok: true,
      bytes: new Uint8Array(await file.arrayBuffer()),
      contentType: file.type || "image/jpeg",
    };
  }

  const parsed = await parseJsonBody<{
    image_base64?: string;
    content_type?: string;
  }>(req);
  if (!parsed.ok) return { ok: false, message: parsed.message };

  const raw = String(parsed.data.image_base64 ?? "").replace(
    /^data:[^;]+;base64,/,
    "",
  );
  if (!raw) {
    return { ok: false, message: "image_base64 is required for JSON uploads." };
  }

  return {
    ok: true,
    bytes: Uint8Array.from(Buffer.from(raw, "base64")),
    contentType: String(parsed.data.content_type ?? "image/jpeg"),
  };
}
