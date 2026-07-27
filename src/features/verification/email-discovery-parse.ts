const MAILTO_RE = /mailto:([^\s"'<>?#]+)/gi;
const EMAIL_RE =
  /[a-z0-9._%+-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+/gi;

export function collectMailtoEmails(html: string): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = MAILTO_RE.exec(html)) !== null) {
    const raw = decodeURIComponent((m[1] ?? "").split("?")[0] ?? "")
      .trim()
      .toLowerCase();
    if (raw.includes("@") && !out.includes(raw)) out.push(raw);
  }
  return out;
}

export function collectJsonLdEmails(html: string): string[] {
  const out: string[] = [];
  const re =
    /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      walkJsonLd(JSON.parse(m[1] ?? "") as unknown, out);
    } catch {
      /* ignore */
    }
  }
  return out;
}

function walkJsonLd(node: unknown, out: string[]) {
  if (!node) return;
  if (Array.isArray(node)) {
    for (const item of node) walkJsonLd(item, out);
    return;
  }
  if (typeof node !== "object") return;
  const o = node as Record<string, unknown>;
  if (typeof o.email === "string") pushEmail(o.email, out);
  if (o.contactPoint) walkJsonLd(o.contactPoint, out);
  if (o["@graph"]) walkJsonLd(o["@graph"], out);
  for (const v of Object.values(o)) {
    if (v && typeof v === "object") walkJsonLd(v, out);
  }
}

function pushEmail(value: string, out: string[]) {
  const email = value.trim().toLowerCase();
  if (!email.includes("@")) return;
  if (!out.includes(email)) out.push(email);
}

export function collectLooseEmails(html: string): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = EMAIL_RE.exec(html)) !== null) {
    const email = (m[0] ?? "").toLowerCase();
    if (!out.includes(email)) out.push(email);
  }
  return out;
}
