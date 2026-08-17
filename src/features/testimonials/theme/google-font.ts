/** Extract first Google Font family name for stylesheet loading. */
export function googleFontStylesheet(fontFamily: string): string | null {
  const first = fontFamily.split(",")[0]?.trim().replace(/^['"]|['"]$/g, "") ?? "";
  if (
    !first ||
    /^var\(/i.test(first) ||
    /^(Geist|Geist Mono|Inter)$/i.test(first) ||
    /system-ui|sans-serif|serif|monospace|inherit/i.test(first)
  ) {
    return null;
  }
  const family = encodeURIComponent(first).replace(/%20/g, "+");
  return `https://fonts.googleapis.com/css2?family=${family}:wght@400;500;600&display=swap`;
}
