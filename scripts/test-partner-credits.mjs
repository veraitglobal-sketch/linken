import assert from "node:assert/strict";
import test from "node:test";

/** Mirror src/features/credits/parse.ts + snippet.ts (no TS aliases). */

function extractDomain(website) {
  const raw = website.trim().toLowerCase();
  if (!raw) return null;
  let host = raw;
  try {
    if (host.includes("://")) host = new URL(host).hostname;
    else host = (host.split("/")[0] ?? "").split("?")[0]?.split("#")[0] ?? "";
  } catch {
    return null;
  }
  host = host.replace(/\.$/, "");
  if (host.startsWith("www.")) host = host.slice(4);
  if (!host || host === "localhost") return null;
  if (!/^([a-z0-9-]+\.)+[a-z0-9-]+$/.test(host)) return null;
  return host;
}

function absoluteWebsite(website) {
  const domain = extractDomain(website);
  if (!domain) return null;
  const raw = website.trim();
  try {
    if (raw.includes("://")) {
      const url = new URL(raw);
      if (url.protocol !== "http:" && url.protocol !== "https:") return null;
      url.protocol = "https:";
      return url.toString().replace(/\/$/, "");
    }
  } catch {
    return null;
  }
  return `https://${domain}`;
}

function escapeAttr(value) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function partnerCreditSnippet(partner) {
  const href = absoluteWebsite(partner.website);
  const slug = partner.slug.trim().toLowerCase();
  if (!href || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  const name = escapeAttr(partner.name.trim() || slug);
  return `<a href="${escapeAttr(href)}" data-hansala-credit="${slug}" rel="noopener">${name}</a>`;
}

function readAttr(attrs, name) {
  const re = new RegExp(`${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i");
  const match = attrs.match(re);
  if (!match) return null;
  const raw = match[1] ?? match[2] ?? match[3] ?? "";
  return raw.replace(/&amp;/g, "&").replace(/&quot;/g, '"').trim() || null;
}

function findCreditHrefs(html) {
  const found = new Map();
  const re = /<a\b([^>]*?)>/gi;
  let match;
  while ((match = re.exec(html))) {
    const attrs = match[1] ?? "";
    const slug = readAttr(attrs, "data-hansala-credit");
    const href = readAttr(attrs, "href");
    if (!slug || !href) continue;
    found.set(slug.toLowerCase(), href);
  }
  return found;
}

test("snippet is dofollow HTML to the partner site with a credit marker", () => {
  const html = partnerCreditSnippet({
    slug: "acme-build",
    name: "Acme Build",
    website: "http://www.acme.build",
  });
  assert.equal(
    html,
    '<a href="https://www.acme.build" data-hansala-credit="acme-build" rel="noopener">Acme Build</a>',
  );
  assert.doesNotMatch(html, /nofollow/);
});

test("parser reads the marker even when href comes first", () => {
  const html =
    '<a rel="noopener" href="https://studio.example" data-hansala-credit="helix-studio">Helix</a>';
  const found = findCreditHrefs(html);
  assert.equal(found.get("helix-studio"), "https://studio.example");
});

test("skips partners without a real website", () => {
  assert.equal(
    partnerCreditSnippet({ slug: "ghost", name: "Ghost", website: "" }),
    null,
  );
});
