import type { MetadataRoute } from "next";

function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Serialize Next sitemap entries to a urlset (with optional image locs). */
export function sitemapEntriesToXml(entries: MetadataRoute.Sitemap): string {
  const hasImages = entries.some(
    (e) => Array.isArray(e.images) && e.images.length > 0,
  );
  const imageNs = hasImages
    ? ` xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"`
    : "";

  const urls = entries.map((entry) => {
    const parts = [`<url>`, `<loc>${esc(entry.url)}</loc>`];
    for (const image of entry.images ?? []) {
      parts.push(
        `<image:image><image:loc>${esc(image)}</image:loc></image:image>`,
      );
    }
    if (entry.lastModified) {
      const d =
        entry.lastModified instanceof Date
          ? entry.lastModified
          : new Date(entry.lastModified);
      if (!Number.isNaN(d.getTime())) {
        parts.push(`<lastmod>${d.toISOString()}</lastmod>`);
      }
    }
    if (entry.changeFrequency) {
      parts.push(`<changefreq>${entry.changeFrequency}</changefreq>`);
    }
    if (typeof entry.priority === "number") {
      parts.push(`<priority>${entry.priority.toFixed(2)}</priority>`);
    }
    parts.push(`</url>`);
    return parts.join("");
  });

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${imageNs}>`,
    ...urls,
    `</urlset>`,
    ``,
  ].join("\n");
}
