/** Pull data-hansala-credit anchors from homepage HTML. No I/O. */

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function readAttr(attrs: string, name: string): string | null {
  const re = new RegExp(
    `${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,
    "i",
  );
  const match = attrs.match(re);
  if (!match) return null;
  const raw = match[1] ?? match[2] ?? match[3] ?? "";
  return decodeHtml(raw).trim() || null;
}

export function findCreditHrefs(html: string): Map<string, string> {
  const found = new Map<string, string>();
  const re = /<a\b([^>]*?)>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const attrs = match[1] ?? "";
    const slug = readAttr(attrs, "data-hansala-credit");
    const href = readAttr(attrs, "href");
    if (!slug || !href) continue;
    found.set(slug.toLowerCase(), href);
  }
  return found;
}
