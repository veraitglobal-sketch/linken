import type { EmbedTheme } from "@/components/embed/embed-theme";

/**
 * Pro widget shells — quiet authority, not SaaS chrome.
 * No hover lift: embeds must stay still inside host layouts.
 */
export function embedPremiumShell(
  theme: EmbedTheme,
  tier: "pro" | "signature" = "pro",
): string {
  const base = "rounded-xl border transition-colors duration-150 ease-out";

  if (theme === "dark") {
    return [
      base,
      tier === "signature"
        ? "border-white/16 bg-[#0c1412]/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
        : "border-white/12 bg-[#0c1412]/92",
    ].join(" ");
  }

  return [
    base,
    tier === "signature"
      ? "border-black/[0.09] bg-white/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
      : "border-black/[0.08] bg-white/92",
  ].join(" ");
}
