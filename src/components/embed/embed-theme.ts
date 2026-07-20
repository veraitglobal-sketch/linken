export type EmbedTheme = "light" | "dark";

export function parseEmbedTheme(raw: string | undefined): EmbedTheme {
  return raw === "dark" ? "dark" : "light";
}

/**
 * Shared shell — quiet mesh from our hero language, rounded-2xl, live hover.
 * Dark is designed (not inverted light); logo tiles stay white.
 */
export function embedShellClass(theme: EmbedTheme): string {
  const base =
    "rounded-2xl border transition-[transform,box-shadow,background-color] duration-150 ease-out hover:-translate-y-px";
  return theme === "dark"
    ? cnDark(base)
    : cnLight(base);
}

function cnLight(base: string): string {
  return [
    base,
    "border-line",
    "bg-[radial-gradient(ellipse_80%_70%_at_0%_0%,rgba(126, 184, 164,0.10),transparent_55%),radial-gradient(ellipse_60%_50%_at_100%_100%,rgba(31,107,92,0.06),transparent_50%),linear-gradient(180deg,#ffffff_0%,#f7faf9_100%)]",
    "hover:shadow-[0_8px_24px_rgba(10,23,20,0.08)]",
  ].join(" ");
}

function cnDark(base: string): string {
  return [
    base,
    "border-white/12",
    "bg-[radial-gradient(ellipse_80%_70%_at_8%_0%,rgba(126, 184, 164,0.14),transparent_55%),radial-gradient(ellipse_55%_45%_at_100%_100%,rgba(31,107,92,0.22),transparent_50%),linear-gradient(165deg,#081412_0%,#0e1f1c_100%)]",
    "hover:shadow-[0_10px_28px_rgba(0,0,0,0.35)]",
  ].join(" ");
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

/** Mint on both themes — our recognition color. */
export function embedAccentClass(theme: EmbedTheme): string {
  void theme;
  return "text-[#7eb8a4]";
}
