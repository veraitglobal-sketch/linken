export type EmbedTheme = "light" | "dark";

export function parseEmbedTheme(raw: string | undefined): EmbedTheme {
  return raw === "dark" ? "dark" : "light";
}

function glass(theme: EmbedTheme, sheet = false): string {
  if (sheet) {
    return theme === "dark" ? "embed-glass-sheet-dark" : "embed-glass-sheet";
  }
  return theme === "dark" ? "embed-glass-dark" : "embed-glass";
}

/**
 * Universal embed chrome — frost on the host, not a white sticker.
 * Hairline precision, no mint mesh, no hover lift (iframes shouldn't jump).
 * Hansala is recognized by the seal, not by a product card.
 */
export function embedShellClass(theme: EmbedTheme): string {
  return `rounded-xl border transition-colors duration-150 ease-out ${glass(theme)}`;
}

/** Quieter bar for free essentials — frost, almost invisible on light hosts. */
export function embedBarClass(theme: EmbedTheme): string {
  return `rounded-lg border transition-colors duration-150 ease-out ${glass(theme)}`;
}

/**
 * Record shell — a frosted sheet, not a UI card. Stronger fill than the bar
 * so captions still read; still lets the host show through.
 */
export function embedRecordShell(theme: EmbedTheme): string {
  return `rounded-xl border transition-colors duration-150 ease-out ${glass(theme, true)}`;
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
