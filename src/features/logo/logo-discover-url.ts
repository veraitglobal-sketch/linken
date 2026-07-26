export function absUrl(href: string, baseUrl: string): string | null {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return null;
  }
}

export function parseSizes(sizes: string | undefined): number {
  if (!sizes || sizes === "any") return 0;
  let best = 0;
  for (const part of sizes.split(/\s+/)) {
    const m = /^(\d+)x(\d+)$/i.exec(part);
    if (!m) continue;
    const area = Number(m[1]) * Number(m[2]);
    if (area > best) best = area;
  }
  return best;
}

export function formatPreferRank(href: string, typeAttr: string): number {
  const t = typeAttr.toLowerCase();
  const h = href.toLowerCase();
  if (t.includes("svg") || h.endsWith(".svg")) return 3;
  if (t.includes("png") || h.endsWith(".png")) return 2;
  if (t.includes("webp") || h.endsWith(".webp")) return 2;
  if (
    t.includes("jpeg") ||
    t.includes("jpg") ||
    h.endsWith(".jpg") ||
    h.endsWith(".jpeg")
  ) {
    return 1;
  }
  if (t.includes("icon") || h.endsWith(".ico")) return 0;
  return 1;
}

export function extFromContentType(ct: string, url: string): string {
  if (ct.includes("svg")) return "svg";
  if (ct.includes("png")) return "png";
  if (ct.includes("webp")) return "webp";
  if (ct.includes("jpeg") || ct.includes("jpg")) return "jpg";
  if (ct.includes("gif")) return "gif";
  if (ct.includes("icon") || ct.includes("x-icon")) return "ico";
  const path = url.toLowerCase().split("?")[0] ?? "";
  if (path.endsWith(".svg")) return "svg";
  if (path.endsWith(".png")) return "png";
  if (path.endsWith(".webp")) return "webp";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "jpg";
  if (path.endsWith(".gif")) return "gif";
  if (path.endsWith(".ico")) return "ico";
  return "png";
}

export function contentTypeForExt(ext: string): string {
  switch (ext) {
    case "svg":
      return "image/svg+xml";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "jpg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    case "ico":
      return "image/x-icon";
    default:
      return "application/octet-stream";
  }
}
