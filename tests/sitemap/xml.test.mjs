import assert from "node:assert/strict";
import test from "node:test";

function esc(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function sitemapEntriesToXml(entries) {
  const hasImages = entries.some((e) => Array.isArray(e.images) && e.images.length > 0);
  const imageNs = hasImages
    ? ` xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"`
    : "";
  const urls = entries.map((entry) => {
    const parts = [`<url>`, `<loc>${esc(entry.url)}</loc>`];
    for (const image of entry.images ?? []) {
      parts.push(`<image:image><image:loc>${esc(image)}</image:loc></image:image>`);
    }
    if (entry.lastModified) {
      const d = entry.lastModified instanceof Date ? entry.lastModified : new Date(entry.lastModified);
      parts.push(`<lastmod>${d.toISOString()}</lastmod>`);
    }
    parts.push(`</url>`);
    return parts.join("");
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${imageNs}>\n${urls.join("\n")}\n</urlset>\n`;
}

test("urlset includes loc and escapes ampersands", () => {
  const xml = sitemapEntriesToXml([
    {
      url: "https://www.hansala.com/c/a&b",
      lastModified: new Date("2026-09-16T00:00:00.000Z"),
    },
  ]);
  assert.match(xml, /<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">/);
  assert.match(xml, /<loc>https:\/\/www.hansala.com\/c\/a&amp;b<\/loc>/);
  assert.match(xml, /<lastmod>2026-09-16T00:00:00.000Z<\/lastmod>/);
  assert.doesNotMatch(xml, /sitemapindex/);
});

test("image namespace only when images present", () => {
  const xml = sitemapEntriesToXml([
    {
      url: "https://www.hansala.com/c/x",
      images: ["https://cdn.example/logo.png?v=1&x=2"],
    },
  ]);
  assert.match(xml, /xmlns:image=/);
  assert.match(xml, /logo.png\?v=1&amp;x=2/);
});
