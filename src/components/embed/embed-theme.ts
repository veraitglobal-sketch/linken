export type EmbedTheme = "light" | "dark";

export function parseEmbedTheme(raw: string | undefined): EmbedTheme {
  return raw === "dark" ? "dark" : "light";
}

/** Shared shell classes for all embed variants. */
export function embedShellClass(theme: EmbedTheme): string {
  return theme === "dark"
    ? "border-white/15 bg-[#0a1714] hover:bg-[#10231f]"
    : "border-line bg-white hover:bg-paper";
}

export function embedInkClass(theme: EmbedTheme): string {
  return theme === "dark" ? "text-white" : "text-ink";
}

export function embedMutedClass(theme: EmbedTheme): string {
  return theme === "dark" ? "text-white/55" : "text-muted";
}

export function embedSoftClass(theme: EmbedTheme): string {
  return theme === "dark" ? "text-white/70" : "text-ink-soft";
}

export function embedAccentClass(theme: EmbedTheme): string {
  return theme === "dark" ? "text-[#5ec4a8]" : "text-[#1f6b5c]";
}
