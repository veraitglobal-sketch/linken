export type EmbedTheme = "light" | "dark";

export function parseEmbedTheme(raw: string | undefined): EmbedTheme {
  return raw === "dark" ? "dark" : "light";
}

/**
 * Universal embed chrome — fits any host site.
 * Hairline precision, no mint mesh, no hover lift (iframes shouldn't jump).
 * Hansala is recognized by the seal, not by a product card.
 */
export function embedShellClass(theme: EmbedTheme): string {
  const base =
    "rounded-xl border transition-colors duration-150 ease-out";
  return theme === "dark"
    ? `${base} border-white/14 bg-[#0c1412]/92`
    : `${base} border-black/[0.08] bg-white/92`;
}

/** Quieter bar for free essentials — almost invisible on the host page. */
export function embedBarClass(theme: EmbedTheme): string {
  const base =
    "rounded-lg border transition-colors duration-150 ease-out";
  return theme === "dark"
    ? `${base} border-white/12 bg-white/[0.04]`
    : `${base} border-black/[0.07] bg-white/80`;
}

/**
 * Record shell — a sheet, not a UI card. Stock fill rather than pure white,
 * hairline edge, no elevation: the rules inside carry the structure.
 */
export function embedRecordShell(theme: EmbedTheme): string {
  const base = "rounded-xl border transition-colors duration-150 ease-out";
  return theme === "dark"
    ? `${base} border-white/12 bg-[#0b100f]/92`
    : `${base} border-black/[0.09] bg-[#fcfcfb]/94`;
}

export function embedInkClass(theme: EmbedTheme): string {
  return theme === "dark" ? "text-white" : "text-[#0d1210]";
}

export function embedMutedClass(theme: EmbedTheme): string {
  return theme === "dark" ? "text-white/50" : "text-[#66706b]";
}

export function embedSoftClass(theme: EmbedTheme): string {
  return theme === "dark" ? "text-white/68" : "text-[#3a423e]";
}

/** Soft teal — recognition color, used sparingly. */
export function embedAccentClass(theme: EmbedTheme): string {
  return theme === "dark" ? "text-[#8fc4b3]" : "text-[#1a5c51]";
}

export function embedHairlineClass(theme: EmbedTheme): string {
  return theme === "dark" ? "border-white/12" : "border-black/[0.08]";
}
