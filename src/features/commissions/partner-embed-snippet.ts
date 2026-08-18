/** Client-safe partner embed URL + iframe snippet (no server imports). */

export function buildPartnerEmbedSrc(input: {
  siteUrl: string;
  slug: string;
  theme?: "light" | "dark";
  preview?: boolean;
}): string {
  const base = input.siteUrl.replace(/\/$/, "");
  const url = new URL(`${base}/embed/${input.slug}/partner`);
  if (input.theme === "dark") url.searchParams.set("theme", "dark");
  if (input.preview) url.searchParams.set("preview", "1");
  return url.toString();
}

export function buildPartnerEmbedSnippet(input: {
  siteUrl: string;
  slug: string;
  theme?: "light" | "dark";
}): string {
  const src = buildPartnerEmbedSrc({
    siteUrl: input.siteUrl,
    slug: input.slug,
    theme: input.theme,
  });
  return `<iframe src="${src}" width="100%" height="168" allowtransparency="true" style="border:0;width:100%;max-width:280px;background:transparent;color-scheme:normal" title="Hansala Premium Partner" loading="lazy"></iframe>`;
}
